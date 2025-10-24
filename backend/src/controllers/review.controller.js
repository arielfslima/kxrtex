import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

const calcularMedia = (avaliacoes) => {
  if (avaliacoes.length === 0) return 0;

  const soma = avaliacoes.reduce((acc, av) => {
    const criterios = [
      av.profissionalismo,
      av.pontualidade,
      av.comunicacao,
      av.performance,
      av.condicoes,
      av.respeito
    ].filter(c => c !== null);

    const mediaAvaliacao = criterios.reduce((sum, c) => sum + c, 0) / criterios.length;
    return acc + mediaAvaliacao;
  }, 0);

  return soma / avaliacoes.length;
};

export const createReview = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const {
      profissionalismo,
      pontualidade,
      performance,
      comunicacao,
      condicoes,
      respeito,
      comentario
    } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        artista: {
          include: {
            usuario: true
          }
        },
        contratante: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    if (booking.status !== 'CONCLUIDO') {
      throw new AppError('Apenas bookings concluídos podem ser avaliados', 400);
    }

    const isArtista = req.user.tipo === 'ARTISTA' && booking.artistaId === req.user.artista.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && booking.contratanteId === req.user.contratante.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Você não participou deste booking', 403);
    }

    const avaliacaoExistente = await prisma.avaliacao.findFirst({
      where: {
        bookingId,
        avaliadorId: req.user.id
      }
    });

    if (avaliacaoExistente) {
      throw new AppError('Você já avaliou este booking', 400);
    }

    let avaliadoId;
    if (req.user.tipo === 'ARTISTA') {
      avaliadoId = booking.contratante.usuarioId;
    } else {
      avaliadoId = booking.artista.usuarioId;
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        bookingId,
        avaliadorId: req.user.id,
        avaliadoId,
        profissionalismo,
        pontualidade,
        performance,
        comunicacao,
        condicoes,
        respeito,
        comentario
      },
      include: {
        avaliador: {
          select: {
            nome: true,
            foto: true,
            tipo: true
          }
        }
      }
    });

    if (req.user.tipo === 'CONTRATANTE') {
      const todasAvaliacoes = await prisma.avaliacao.findMany({
        where: {
          avaliadoId: booking.artista.usuarioId
        }
      });

      const novaMedia = calcularMedia(todasAvaliacoes);

      await prisma.artista.update({
        where: { id: booking.artistaId },
        data: {
          notaMedia: novaMedia
        }
      });
    }

    res.status(201).json({
      message: 'Avaliação criada com sucesso',
      data: avaliacao
    });
  } catch (error) {
    next(error);
  }
};

export const listReviews = async (req, res, next) => {
  try {
    const { artistaId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const artista = await prisma.artista.findUnique({
      where: { id: artistaId }
    });

    if (!artista) {
      throw new AppError('Artista não encontrado', 404);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [avaliacoes, total] = await Promise.all([
      prisma.avaliacao.findMany({
        where: {
          avaliadoId: artista.usuarioId
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          avaliador: {
            select: {
              nome: true,
              foto: true,
              tipo: true
            }
          },
          booking: {
            select: {
              dataEvento: true,
              local: true
            }
          }
        }
      }),
      prisma.avaliacao.count({
        where: {
          avaliadoId: artista.usuarioId
        }
      })
    ]);

    res.json({
      data: avaliacoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      notaMedia: artista.notaMedia
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingReviews = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    const isArtista = req.user.tipo === 'ARTISTA' && booking.artistaId === req.user.artista.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && booking.contratanteId === req.user.contratante.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Você não tem permissão para ver avaliações deste booking', 403);
    }

    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        bookingId
      },
      include: {
        avaliador: {
          select: {
            nome: true,
            foto: true,
            tipo: true
          }
        },
        avaliado: {
          select: {
            nome: true,
            foto: true,
            tipo: true
          }
        }
      }
    });

    res.json({
      data: avaliacoes
    });
  } catch (error) {
    next(error);
  }
};
