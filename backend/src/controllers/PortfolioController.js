const { validationResult } = require('express-validator');

const { User, Profissional } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { uploadHelpers } = require('../config/cloudinary');
const logger = require('../utils/logger');

class PortfolioController {
  static async upload(req, res, next) {
    try {
      const userId = req.user.id;

      if (!req.files || req.files.length === 0) {
        throw new AppError('Nenhum arquivo foi enviado', 400, 'NO_FILES_UPLOADED');
      }

      // Get professional profile
      const profissional = await Profissional.findOne({
        where: { usuario_id: userId },
        include: [{
          model: User,
          as: 'usuario'
        }]
      });

      if (!profissional) {
        throw new AppError('Perfil profissional não encontrado', 404, 'PROFISSIONAL_NOT_FOUND');
      }

      const { Portfolio } = require('../models');
      const uploadedFiles = [];

      // Process each uploaded file
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video/');
        let thumbnailUrl = null;

        // Generate thumbnail for videos
        if (isVideo) {
          const publicId = uploadHelpers.extractPublicId(file.path);
          thumbnailUrl = uploadHelpers.getVideoThumbnail(publicId);
        }

        // Create portfolio entry
        const portfolioItem = await Portfolio.create({
          profissional_id: profissional.id,
          tipo: isVideo ? 'video' : 'foto',
          titulo: req.body.titulo || `${isVideo ? 'Vídeo' : 'Foto'} ${new Date().toLocaleDateString()}`,
          descricao: req.body.descricao,
          arquivo_url: file.path,
          arquivo_nome: file.originalname,
          arquivo_tamanho: file.size,
          thumbnail_url: thumbnailUrl
        });

        uploadedFiles.push(portfolioItem);
      }

      logger.info(`Portfolio files uploaded: ${uploadedFiles.length} files for professional ${profissional.id}`);

      res.status(201).json({
        success: true,
        message: `${uploadedFiles.length} arquivo(s) adicionado(s) ao portfolio com sucesso!`,
        data: uploadedFiles
      });
    } catch (error) {
      // Clean up uploaded files on error
      if (req.files) {
        for (const file of req.files) {
          const publicId = uploadHelpers.extractPublicId(file.path);
          if (publicId) {
            uploadHelpers.deleteFile(publicId);
          }
        }
      }
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const { profissional_id } = req.params;
      const { tipo, page = 1, limit = 20 } = req.query;

      const offset = (page - 1) * limit;
      const where = { profissional_id };

      if (tipo) {
        where.tipo = tipo;
      }

      const { Portfolio } = require('../models');
      const portfolioItems = await Portfolio.findAndCountAll({
        where,
        order: [['ordem', 'ASC'], ['created_at', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          portfolio: portfolioItems.rows,
          total: portfolioItems.count,
          pagina_atual: parseInt(page),
          total_paginas: Math.ceil(portfolioItems.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { titulo, descricao, ordem } = req.body;

      const { Portfolio } = require('../models');
      const portfolioItem = await Portfolio.findByPk(id, {
        include: [{
          model: Profissional,
          as: 'profissional',
          include: [{
            model: User,
            as: 'usuario'
          }]
        }]
      });

      if (!portfolioItem) {
        throw new AppError('Item do portfolio não encontrado', 404, 'PORTFOLIO_ITEM_NOT_FOUND');
      }

      // Check ownership
      if (portfolioItem.profissional.usuario_id !== userId) {
        throw new AppError('Acesso negado', 403, 'ACCESS_DENIED');
      }

      // Update portfolio item
      await portfolioItem.update({
        titulo: titulo || portfolioItem.titulo,
        descricao: descricao !== undefined ? descricao : portfolioItem.descricao,
        ordem: ordem !== undefined ? ordem : portfolioItem.ordem
      });

      logger.info(`Portfolio item updated: ${id} by user ${userId}`);

      res.json({
        success: true,
        message: 'Item do portfolio atualizado com sucesso!',
        data: portfolioItem
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { Portfolio } = require('../models');
      const portfolioItem = await Portfolio.findByPk(id, {
        include: [{
          model: Profissional,
          as: 'profissional',
          include: [{
            model: User,
            as: 'usuario'
          }]
        }]
      });

      if (!portfolioItem) {
        throw new AppError('Item do portfolio não encontrado', 404, 'PORTFOLIO_ITEM_NOT_FOUND');
      }

      // Check ownership
      if (portfolioItem.profissional.usuario_id !== userId) {
        throw new AppError('Acesso negado', 403, 'ACCESS_DENIED');
      }

      // Delete file from Cloudinary
      const publicId = uploadHelpers.extractPublicId(portfolioItem.arquivo_url);
      if (publicId) {
        await uploadHelpers.deleteFile(publicId);
      }

      // Delete portfolio item
      await portfolioItem.destroy();

      logger.info(`Portfolio item deleted: ${id} by user ${userId}`);

      res.json({
        success: true,
        message: 'Item do portfolio removido com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }

  static async reorder(req, res, next) {
    try {
      const userId = req.user.id;
      const { items } = req.body; // Array of { id, ordem }

      if (!items || !Array.isArray(items)) {
        throw new AppError('Lista de itens é obrigatória', 400, 'ITEMS_REQUIRED');
      }

      // Get professional profile
      const profissional = await Profissional.findOne({
        where: { usuario_id: userId }
      });

      if (!profissional) {
        throw new AppError('Perfil profissional não encontrado', 404, 'PROFISSIONAL_NOT_FOUND');
      }

      const { Portfolio } = require('../models');

      // Update order for each item
      for (const item of items) {
        if (!item.id || item.ordem === undefined) {
          continue;
        }

        await Portfolio.update(
          { ordem: item.ordem },
          {
            where: {
              id: item.id,
              profissional_id: profissional.id
            }
          }
        );
      }

      logger.info(`Portfolio reordered for professional ${profissional.id}`);

      res.json({
        success: true,
        message: 'Portfolio reordenado com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PortfolioController;