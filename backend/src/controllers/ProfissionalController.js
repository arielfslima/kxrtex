const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

const { User, Profissional, Categoria, Subcategoria, Booking } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

class ProfissionalController {
  static async list(req, res, next) {
    try {
      const {
        categoria,
        subcategorias,
        cidade,
        preco_min,
        preco_max,
        avaliacao_min,
        plano,
        verificado,
        busca,
        page = 1,
        limit = 20,
        ordem = 'relevancia'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      const userWhere = { status: 'ativo' };
      const orderBy = [];

      // Filters
      if (categoria) {
        const categoriaObj = await Categoria.findOne({ where: { slug: categoria } });
        if (categoriaObj) {
          where.categoria_id = categoriaObj.id;
        }
      }

      if (cidade) {
        where.cidades_atuacao = {
          [Op.contains]: [cidade]
        };
      }

      if (preco_min) {
        where.valor_base_hora = {
          ...where.valor_base_hora,
          [Op.gte]: parseFloat(preco_min)
        };
      }

      if (preco_max) {
        where.valor_base_hora = {
          ...where.valor_base_hora,
          [Op.lte]: parseFloat(preco_max)
        };
      }

      if (avaliacao_min) {
        where.avaliacao_media = {
          [Op.gte]: parseFloat(avaliacao_min)
        };
      }

      if (plano) {
        where.plano = plano;
      }

      if (verificado === 'true') {
        userWhere.verificado = true;
      }

      if (busca) {
        where[Op.or] = [
          { nome_artistico: { [Op.iLike]: `%${busca}%` } },
          { bio: { [Op.iLike]: `%${busca}%` } }
        ];
      }

      // Ordering
      switch (ordem) {
        case 'preco_menor':
          orderBy.push(['valor_base_hora', 'ASC']);
          break;
        case 'preco_maior':
          orderBy.push(['valor_base_hora', 'DESC']);
          break;
        case 'avaliacao':
          orderBy.push(['avaliacao_media', 'DESC']);
          break;
        case 'bookings':
          orderBy.push(['total_bookings', 'DESC']);
          break;
        case 'relevancia':
        default:
          // Priority: PRO > PLUS > FREE, then by rating
          orderBy.push([
            Profissional.sequelize.literal(`
              CASE
                WHEN plano = 'pro' THEN 3
                WHEN plano = 'plus' THEN 2
                ELSE 1
              END
            `), 'DESC'
          ]);
          orderBy.push(['avaliacao_media', 'DESC']);
          orderBy.push(['total_bookings', 'DESC']);
          break;
      }

      const profissionais = await Profissional.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'usuario',
            where: userWhere,
            attributes: ['id', 'nome', 'foto_perfil_url', 'verificado']
          },
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['id', 'nome', 'slug']
          }
        ],
        order: orderBy,
        limit: parseInt(limit),
        offset,
        distinct: true
      });

      // Cache results for 5 minutes
      const cacheKey = `search_${JSON.stringify(req.query)}`;
      await cache.set(cacheKey, profissionais, 300);

      res.json({
        success: true,
        data: {
          profissionais: profissionais.rows,
          total: profissionais.count,
          pagina_atual: parseInt(page),
          total_paginas: Math.ceil(profissionais.count / limit),
          tem_proxima: page * limit < profissionais.count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      // Try cache first
      const cacheKey = `profissional_${id}`;
      let profissional = await cache.get(cacheKey);

      if (!profissional) {
        profissional = await Profissional.findByPk(id, {
          include: [
            {
              model: User,
              as: 'usuario',
              where: { status: 'ativo' },
              attributes: ['id', 'nome', 'foto_perfil_url', 'verificado', 'score_confiabilidade']
            },
            {
              model: Categoria,
              as: 'categoria',
              include: [{
                model: Subcategoria,
                as: 'subcategorias'
              }]
            }
            // TODO: Add portfolio and followers when implemented
          ]
        });

        if (!profissional) {
          throw new AppError('Artista não encontrado', 404, 'PROFISSIONAL_NOT_FOUND');
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, profissional, 600);
      }

      // Increment view count if user is not the owner
      if (req.user && req.user.id !== profissional.usuario_id) {
        // TODO: Implement view tracking
      }

      res.json({
        success: true,
        data: profissional
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user.id;

      // Check if user is of type 'artista'
      const user = await User.findByPk(userId);
      if (!user || user.tipo !== 'artista') {
        throw new AppError('Apenas usuários do tipo artista podem criar perfil profissional', 403, 'INVALID_USER_TYPE');
      }

      // Check if user already has a professional profile
      const existingProfissional = await Profissional.findOne({
        where: { usuario_id: userId }
      });

      if (existingProfissional) {
        throw new AppError('Usuário já possui perfil profissional', 400, 'PROFILE_ALREADY_EXISTS');
      }

      const {
        nome_artistico,
        categoria_id,
        bio,
        valor_base_hora,
        valor_base_minimo,
        valor_base_maximo,
        cidades_atuacao,
        instagram_url,
        tiktok_url,
        youtube_url,
        spotify_url,
        soundcloud_url,
        website_url,
        aceita_eventos_privados,
        aceita_eventos_corporativos,
        aceita_eventos_outras_cidades,
        equipamento_proprio,
        descricao_equipamento
      } = req.body;

      // Validate categoria exists
      if (categoria_id) {
        const categoria = await Categoria.findByPk(categoria_id);
        if (!categoria) {
          throw new AppError('Categoria não encontrada', 400, 'CATEGORIA_NOT_FOUND');
        }
      }

      // Create professional profile
      const profissional = await Profissional.create({
        usuario_id: userId,
        nome_artistico,
        categoria_id,
        bio,
        valor_base_hora,
        valor_base_minimo,
        valor_base_maximo,
        cidades_atuacao: cidades_atuacao || [],
        instagram_url,
        tiktok_url,
        youtube_url,
        spotify_url,
        soundcloud_url,
        website_url,
        aceita_eventos_privados: aceita_eventos_privados !== false,
        aceita_eventos_corporativos: aceita_eventos_corporativos !== false,
        aceita_eventos_outras_cidades: aceita_eventos_outras_cidades !== false,
        equipamento_proprio: equipamento_proprio === true,
        descricao_equipamento
      });

      // Load complete profile data
      const completeProfissional = await Profissional.findByPk(profissional.id, {
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nome', 'foto_perfil_url', 'verificado']
          },
          {
            model: Categoria,
            as: 'categoria'
          }
        ]
      });

      logger.info(`Professional profile created: ${profissional.id} for user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Perfil profissional criado com sucesso!',
        data: completeProfissional
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const { id } = req.params;
      const userId = req.user.id;

      // Get professional profile
      const profissional = await Profissional.findByPk(id, {
        include: [{
          model: User,
          as: 'usuario'
        }]
      });

      if (!profissional) {
        throw new AppError('Perfil profissional não encontrado', 404, 'PROFISSIONAL_NOT_FOUND');
      }

      // Check ownership (or admin)
      if (profissional.usuario_id !== userId && req.user.tipo !== 'admin') {
        throw new AppError('Acesso negado', 403, 'ACCESS_DENIED');
      }

      const {
        nome_artistico,
        categoria_id,
        bio,
        valor_base_hora,
        valor_base_minimo,
        valor_base_maximo,
        cidades_atuacao,
        instagram_url,
        tiktok_url,
        youtube_url,
        spotify_url,
        soundcloud_url,
        website_url,
        aceita_eventos_privados,
        aceita_eventos_corporativos,
        aceita_eventos_outras_cidades,
        equipamento_proprio,
        descricao_equipamento
      } = req.body;

      // Validate categoria if provided
      if (categoria_id && categoria_id !== profissional.categoria_id) {
        const categoria = await Categoria.findByPk(categoria_id);
        if (!categoria) {
          throw new AppError('Categoria não encontrada', 400, 'CATEGORIA_NOT_FOUND');
        }
      }

      // Update profile
      await profissional.update({
        nome_artistico: nome_artistico || profissional.nome_artistico,
        categoria_id: categoria_id || profissional.categoria_id,
        bio: bio || profissional.bio,
        valor_base_hora: valor_base_hora || profissional.valor_base_hora,
        valor_base_minimo: valor_base_minimo || profissional.valor_base_minimo,
        valor_base_maximo: valor_base_maximo || profissional.valor_base_maximo,
        cidades_atuacao: cidades_atuacao || profissional.cidades_atuacao,
        instagram_url: instagram_url !== undefined ? instagram_url : profissional.instagram_url,
        tiktok_url: tiktok_url !== undefined ? tiktok_url : profissional.tiktok_url,
        youtube_url: youtube_url !== undefined ? youtube_url : profissional.youtube_url,
        spotify_url: spotify_url !== undefined ? spotify_url : profissional.spotify_url,
        soundcloud_url: soundcloud_url !== undefined ? soundcloud_url : profissional.soundcloud_url,
        website_url: website_url !== undefined ? website_url : profissional.website_url,
        aceita_eventos_privados: aceita_eventos_privados !== undefined ? aceita_eventos_privados : profissional.aceita_eventos_privados,
        aceita_eventos_corporativos: aceita_eventos_corporativos !== undefined ? aceita_eventos_corporativos : profissional.aceita_eventos_corporativos,
        aceita_eventos_outras_cidades: aceita_eventos_outras_cidades !== undefined ? aceita_eventos_outras_cidades : profissional.aceita_eventos_outras_cidades,
        equipamento_proprio: equipamento_proprio !== undefined ? equipamento_proprio : profissional.equipamento_proprio,
        descricao_equipamento: descricao_equipamento !== undefined ? descricao_equipamento : profissional.descricao_equipamento,
        ultima_alteracao_preco: valor_base_hora ? new Date() : profissional.ultima_alteracao_preco
      });

      // Clear cache
      await cache.del(`profissional_${id}`);

      // Load updated data
      const updatedProfissional = await Profissional.findByPk(id, {
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nome', 'foto_perfil_url', 'verificado']
          },
          {
            model: Categoria,
            as: 'categoria'
          }
        ]
      });

      logger.info(`Professional profile updated: ${id}`);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: updatedProfissional
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get professional profile
      const profissional = await Profissional.findByPk(id);

      if (!profissional) {
        throw new AppError('Perfil profissional não encontrado', 404, 'PROFISSIONAL_NOT_FOUND');
      }

      // Check ownership (or admin)
      if (profissional.usuario_id !== userId && req.user.tipo !== 'admin') {
        throw new AppError('Acesso negado', 403, 'ACCESS_DENIED');
      }

      // Check for active bookings
      const activeBookings = await Booking.count({
        where: {
          profissional_id: id,
          status: {
            [Op.in]: ['pendente', 'confirmado']
          }
        }
      });

      if (activeBookings > 0) {
        throw new AppError(
          'Não é possível excluir o perfil com bookings ativos. Cancele ou conclua todos os bookings primeiro.',
          400,
          'ACTIVE_BOOKINGS_EXIST'
        );
      }

      // Delete profile
      await profissional.destroy();

      // Clear cache
      await cache.del(`profissional_${id}`);

      logger.info(`Professional profile deleted: ${id}`);

      res.json({
        success: true,
        message: 'Perfil profissional excluído com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfissionalController;