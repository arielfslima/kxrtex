import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { io } from '../server.js';

const detectarContato = (texto) => {
  const patterns = {
    telefone: /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g,
    email: /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    instagram: /@[a-zA-Z0-9._]+/g,
    whatsapp: /whats?app/gi,
    telegram: /telegram/gi
  };

  for (const [tipo, pattern] of Object.entries(patterns)) {
    if (pattern.test(texto)) {
      return { detectado: true, tipo };
    }
  }

  return { detectado: false };
};

export const sendMessage = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { conteudo } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    const isArtista = req.user.tipo === 'ARTISTA' && booking.artistaId === req.user.artista.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && booking.contratanteId === req.user.contratante.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Você não tem permissão para enviar mensagens neste booking', 403);
    }

    const contatoDetectado = detectarContato(conteudo);

    if (contatoDetectado.detectado) {
      const avisoMensagem = await prisma.mensagem.create({
        data: {
          bookingId,
          remetenteId: req.user.id,
          conteudo: `⚠️ AVISO: Detectamos compartilhamento de ${contatoDetectado.tipo}. Manter negociações fora da plataforma viola nossos termos e você perde a proteção de pagamento.`,
          tipo: 'SISTEMA'
        }
      });

      io.to(`booking-${bookingId}`).emit('new-message', {
        ...avisoMensagem,
        remetente: {
          nome: 'Sistema KXRTEX',
          foto: null,
          tipo: 'SISTEMA'
        }
      });
    }

    const mensagem = await prisma.mensagem.create({
      data: {
        bookingId,
        remetenteId: req.user.id,
        conteudo,
        tipo: 'TEXTO'
      },
      include: {
        remetente: {
          select: {
            nome: true,
            foto: true,
            tipo: true
          }
        }
      }
    });

    io.to(`booking-${bookingId}`).emit('new-message', mensagem);

    res.status(201).json({
      message: 'Mensagem enviada com sucesso',
      data: mensagem
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    const isArtista = req.user.tipo === 'ARTISTA' && booking.artistaId === req.user.artista.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && booking.contratanteId === req.user.contratante.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Você não tem permissão para ver mensagens deste booking', 403);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [mensagens, total] = await Promise.all([
      prisma.mensagem.findMany({
        where: { bookingId },
        skip,
        take,
        orderBy: {
          timestamp: 'asc'
        },
        include: {
          remetente: {
            select: {
              nome: true,
              foto: true,
              tipo: true
            }
          }
        }
      }),
      prisma.mensagem.count({ where: { bookingId } })
    ]);

    res.json({
      data: mensagens,
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
