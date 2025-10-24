import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

const calcularPerfilCompleto = (artista) => {
  let pontos = 0;

  if (artista.bio && artista.bio.length >= 50) pontos += 2;
  if (artista.portfolio && artista.portfolio.length >= 3) pontos += 3;
  if (artista.portfolio && artista.portfolio.some(url => url.includes('video'))) pontos += 2;
  if (artista.redesSociais && Object.keys(artista.redesSociais).length > 0) pontos += 1;
  if (artista.statusVerificacao === 'VERIFICADO') pontos += 2;

  return pontos;
};

const calcularScoreRanking = (artista) => {
  const planoWeights = { PRO: 3, PLUS: 2, FREE: 1 };
  const perfilCompleto = calcularPerfilCompleto(artista);

  const score =
    (planoWeights[artista.plano] * 40) +
    (artista.notaMedia * 30) +
    (artista.totalBookings * 20) +
    (perfilCompleto * 10);

  return score;
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

    const artistasSemScore = artistasOrdenados.map(({ score, ...artista }) => artista);

    res.json({
      data: artistasSemScore,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
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
