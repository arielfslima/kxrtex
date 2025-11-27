import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Calcula score de perfil completo (0-10 pontos)
 * Critérios do PRD:
 * - Bio (min 50 chars): 2 pontos
 * - Portfolio (3+ fotos): 3 pontos
 * - Vídeos no portfolio: 2 pontos
 * - Redes sociais preenchidas: 1 ponto
 * - Verificado: 2 pontos
 */
const calcularPerfilCompleto = (artista) => {
  let pontos = 0;

  // Bio completa (mínimo 50 caracteres)
  if (artista.bio && artista.bio.length >= 50) {
    pontos += 2;
  }

  // Portfolio com 3 ou mais itens
  if (artista.portfolio && artista.portfolio.length >= 3) {
    pontos += 3;
  }

  // Tem vídeos no portfolio
  if (artista.portfolio && artista.portfolio.some(url =>
    url.includes('video') || url.includes('.mp4') || url.includes('.mov')
  )) {
    pontos += 2;
  }

  // Redes sociais configuradas
  if (artista.redesSociais && typeof artista.redesSociais === 'object') {
    const redes = Object.keys(artista.redesSociais).filter(key => artista.redesSociais[key]);
    if (redes.length > 0) {
      pontos += 1;
    }
  }

  // Status verificado
  if (artista.statusVerificacao === 'VERIFICADO') {
    pontos += 2;
  }

  return pontos; // Máximo: 10 pontos
};

/**
 * Calcula score de ranking do artista (0-400+ pontos)
 * Fórmula do PRD:
 * score = (plano_weight * 40) + (avaliacao * 30) + (bookings_completos * 20) + (perfil_completo * 10)
 *
 * Distribuição de pesos:
 * - Plano: 40% (PRO=120, PLUS=80, FREE=40)
 * - Avaliação: 30% (0-150 pontos, baseado em nota 0-5)
 * - Bookings completos: 20% (0-200+ pontos)
 * - Perfil completo: 10% (0-100 pontos)
 *
 * @param {Object} artista - Objeto do artista do Prisma
 * @returns {Number} Score de ranking (maior = melhor)
 */
const calcularScoreRanking = (artista) => {
  // Pesos dos planos (PRO tem 3x o peso do FREE)
  const planoWeights = { PRO: 3, PLUS: 2, FREE: 1 };

  // Calcula pontos de perfil completo (0-10)
  const perfilCompleto = calcularPerfilCompleto(artista);

  // Aplica fórmula do PRD
  const score =
    (planoWeights[artista.plano] * 40) +       // 40-120 pontos
    ((artista.notaMedia || 0) * 30) +           // 0-150 pontos (5 estrelas * 30)
    ((artista.totalBookings || 0) * 20) +       // 0-infinito (20 pontos por booking)
    (perfilCompleto * 10);                      // 0-100 pontos (10 pts * 10)

  return Math.round(score); // Arredonda para inteiro
};

export const listArtists = async (req, res, next) => {
  try {
    const {
      categoria,
      subcategoria,
      cidade,
      precoMin,
      precoMax,
      avaliacaoMin,
      plano,
      verificado,
      page = 1,
      limit = 20,
      orderBy = 'relevancia'
    } = req.query;

    const where = {};

    if (categoria) {
      where.categoria = categoria;
    }

    if (subcategoria) {
      where.subcategorias = {
        has: subcategoria
      };
    }

    if (cidade) {
      where.cidadesAtuacao = {
        has: cidade
      };
    }

    if (precoMin || precoMax) {
      where.valorBaseHora = {};
      if (precoMin) where.valorBaseHora.gte = parseFloat(precoMin);
      if (precoMax) where.valorBaseHora.lte = parseFloat(precoMax);
    }

    if (avaliacaoMin) {
      where.notaMedia = {
        gte: parseFloat(avaliacaoMin)
      };
    }

    if (plano) {
      where.plano = plano;
    }

    if (verificado === 'true') {
      where.statusVerificacao = 'VERIFICADO';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [artistas, total] = await Promise.all([
      prisma.artista.findMany({
        where,
        skip,
        take,
        include: {
          usuario: {
            select: {
              nome: true,
              foto: true,
              status: true
            }
          }
        }
      }),
      prisma.artista.count({ where })
    ]);

    const artistasComScore = artistas.map(artista => ({
      ...artista,
      score: calcularScoreRanking(artista)
    }));

    let artistasOrdenados = artistasComScore;

    if (orderBy === 'relevancia') {
      artistasOrdenados = artistasComScore.sort((a, b) => b.score - a.score);
    } else if (orderBy === 'preco_asc') {
      artistasOrdenados = artistasComScore.sort((a, b) => a.valorBaseHora - b.valorBaseHora);
    } else if (orderBy === 'preco_desc') {
      artistasOrdenados = artistasComScore.sort((a, b) => b.valorBaseHora - a.valorBaseHora);
    } else if (orderBy === 'avaliacao') {
      artistasOrdenados = artistasComScore.sort((a, b) => b.notaMedia - a.notaMedia);
    } else if (orderBy === 'recentes') {
      artistasOrdenados = artistasComScore.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    // Incluir score no response se em modo debug
    const includeScore = req.query.debug === 'true';

    const artistasResponse = includeScore
      ? artistasOrdenados.map(artista => ({
          ...artista,
          _debug: {
            score: artista.score,
            perfilCompleto: calcularPerfilCompleto(artista),
            planoWeight: { PRO: 3, PLUS: 2, FREE: 1 }[artista.plano],
            breakdown: {
              plano: { PRO: 3, PLUS: 2, FREE: 1 }[artista.plano] * 40,
              avaliacao: (artista.notaMedia || 0) * 30,
              bookings: (artista.totalBookings || 0) * 20,
              perfil: calcularPerfilCompleto(artista) * 10
            }
          }
        }))
      : artistasOrdenados.map(({ score, ...artista }) => artista);

    res.json({
      data: artistasResponse,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      meta: includeScore ? {
        orderBy,
        debug: 'Score calculation enabled. Remove ?debug=true for production.'
      } : undefined
    });
  } catch (error) {
    next(error);
  }
};

export const getArtistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const artista = await prisma.artista.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            nome: true,
            foto: true,
            telefone: true,
            status: true
          }
        },
        seguidores: {
          select: {
            id: true
          }
        }
      }
    });

    if (!artista) {
      throw new AppError('Artista não encontrado', 404);
    }

    if (artista.usuario.status !== 'ATIVO') {
      throw new AppError('Artista não está ativo', 403);
    }

    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        avaliadoId: artista.usuarioId
      },
      include: {
        avaliador: {
          select: {
            nome: true,
            foto: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const totalAvaliacoes = await prisma.avaliacao.count({
      where: {
        avaliadoId: artista.usuarioId
      }
    });

    const response = {
      ...artista,
      totalSeguidores: artista.seguidores.length,
      avaliacoes: {
        data: avaliacoes,
        total: totalAvaliacoes
      }
    };

    delete response.seguidores;

    res.json({ data: response });
  } catch (error) {
    next(error);
  }
};

export const updateArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const artista = await prisma.artista.findUnique({
      where: { id }
    });

    if (!artista) {
      throw new AppError('Artista não encontrado', 404);
    }

    if (artista.usuarioId !== req.user.id) {
      throw new AppError('Você não tem permissão para editar este perfil', 403);
    }

    const artistaAtualizado = await prisma.artista.update({
      where: { id },
      data: updateData,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true,
            telefone: true,
            foto: true
          }
        }
      }
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      data: artistaAtualizado
    });
  } catch (error) {
    next(error);
  }
};
