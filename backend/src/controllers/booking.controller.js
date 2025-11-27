import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { getSocketInstance } from '../utils/socket.js';
import emailService from '../services/email.service.js';
import notificationService from '../services/notification.service.js';

const calcularTaxaPlataforma = (valorArtista, planoArtista) => {
  const taxas = {
    FREE: 0.15,
    PLUS: 0.10,
    PRO: 0.07
  };
  return valorArtista * taxas[planoArtista];
};

export const createBooking = async (req, res, next) => {
  try {
    const {
      artistaId,
      dataEvento,
      horarioInicio,
      duracao,
      local,
      localEndereco,
      localCidade,
      localEstado,
      localCEP,
      localLatitude,
      localLongitude,
      descricaoEvento,
      valorProposto
    } = req.body;

    if (req.user.tipo !== 'CONTRATANTE') {
      throw new AppError('Apenas contratantes podem criar bookings', 403);
    }

    const artista = await prisma.artista.findUnique({
      where: { id: artistaId },
      include: {
        usuario: {
          select: {
            status: true
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

    const dataEventoDate = new Date(dataEvento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataEventoDate < hoje) {
      throw new AppError('Data do evento não pode ser no passado', 400);
    }

    const valorArtista = valorProposto || artista.valorBaseHora * duracao;
    const taxaPlataforma = calcularTaxaPlataforma(valorArtista, artista.plano);
    const valorTotal = valorArtista + taxaPlataforma;

    const booking = await prisma.booking.create({
      data: {
        artistaId,
        contratanteId: req.user.contratante.id,
        dataEvento: dataEventoDate,
        horarioInicio,
        duracao,
        local,
        localEndereco,
        localCidade,
        localEstado,
        localCEP,
        localLatitude,
        localLongitude,
        descricaoEvento,
        valorArtista,
        taxaPlataforma,
        valorTotal,
        status: 'PENDENTE',
        propostas: {
          create: {
            tipo: 'INICIAL',
            valorProposto: valorArtista,
            mensagem: descricaoEvento
          }
        }
      },
      include: {
        artista: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto: true
              }
            }
          }
        },
        contratante: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto: true
              }
            }
          }
        },
        propostas: true
      }
    });

    // Emitir evento Socket.IO para o artista
    const io = getSocketInstance();
    if (io) {
      io.to(`user-${booking.artista.usuario.id}`).emit('new-booking-request', {
        bookingId: booking.id,
        contratante: {
          nome: booking.contratante.usuario.nome,
          foto: booking.contratante.usuario.foto
        },
        dataEvento: booking.dataEvento,
        valorProposto: booking.valorArtista,
        local: booking.local
      });

      console.log(`Socket.IO: Emitido new-booking-request para user-${booking.artista.usuario.id}`);
    }

    // Enviar notificações (email + push) - async, não bloqueia resposta
    emailService.sendNewBookingRequestEmail(booking.artista, booking, booking.contratante).catch(err =>
      console.error('[EMAIL] Erro ao enviar nova solicitação:', err)
    );

    notificationService.notifyNewBooking(
      booking.artista.usuario.id,
      booking
    ).catch(err =>
      console.error('[PUSH] Erro ao enviar notificação:', err)
    );

    res.status(201).json({
      message: 'Proposta de booking criada com sucesso',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const listBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};

    if (req.user.tipo === 'ARTISTA') {
      where.artistaId = req.user.artista.id;
    } else if (req.user.tipo === 'CONTRATANTE') {
      where.contratanteId = req.user.contratante.id;
    }

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          artista: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  foto: true
                }
              }
            }
          },
          contratante: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  foto: true
                }
              }
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      data: bookings,
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

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artista: {
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
        },
        contratante: {
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
        },
        propostas: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        mensagens: {
          orderBy: {
            timestamp: 'asc'
          },
          take: 50
        },
        checkIns: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    const isArtista = req.user.tipo === 'ARTISTA' && booking.artistaId === req.user.artista.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && booking.contratanteId === req.user.contratante.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Você não tem permissão para ver este booking', 403);
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.tipo !== 'ARTISTA') {
      throw new AppError('Apenas artistas podem aceitar bookings', 403);
    }

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    if (booking.artistaId !== req.user.artista.id) {
      throw new AppError('Você não tem permissão para aceitar este booking', 403);
    }

    if (booking.status !== 'PENDENTE') {
      throw new AppError('Apenas bookings pendentes podem ser aceitos', 400);
    }

    const bookingAtualizado = await prisma.booking.update({
      where: { id },
      data: {
        status: 'ACEITO',
        updatedAt: new Date()
      },
      include: {
        artista: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto: true
              }
            }
          }
        },
        contratante: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto: true
              }
            }
          }
        }
      }
    });

    // Emitir evento Socket.IO para o contratante
    const io = getSocketInstance();
    if (io) {
      io.to(`user-${bookingAtualizado.contratante.usuario.id}`).emit('booking-accepted', {
        bookingId: bookingAtualizado.id,
        artista: {
          nome: bookingAtualizado.artista.usuario.nome,
          foto: bookingAtualizado.artista.usuario.foto
        },
        dataEvento: bookingAtualizado.dataEvento,
        status: bookingAtualizado.status
      });

      console.log(`Socket.IO: Emitido booking-accepted para user-${bookingAtualizado.contratante.usuario.id}`);
    }

    // Enviar notificações (email + push) - async, não bloqueia resposta
    emailService.sendBookingAcceptedEmail(
      bookingAtualizado.contratante,
      bookingAtualizado,
      bookingAtualizado.artista
    ).catch(err =>
      console.error('[EMAIL] Erro ao enviar booking aceito:', err)
    );

    notificationService.notifyBookingAccepted(
      bookingAtualizado.contratante.usuario.id,
      bookingAtualizado,
      bookingAtualizado.artista
    ).catch(err =>
      console.error('[PUSH] Erro ao enviar notificação:', err)
    );

    res.json({
      message: 'Booking aceito com sucesso',
      data: bookingAtualizado
    });
  } catch (error) {
    next(error);
  }
};

export const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (req.user.tipo !== 'ARTISTA') {
      throw new AppError('Apenas artistas podem recusar bookings', 403);
    }

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    if (booking.artistaId !== req.user.artista.id) {
      throw new AppError('Você não tem permissão para recusar este booking', 403);
    }

    if (booking.status !== 'PENDENTE') {
      throw new AppError('Apenas bookings pendentes podem ser recusados', 400);
    }

    const bookingAtualizado = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELADO',
        updatedAt: new Date()
      },
      include: {
        artista: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto: true
              }
            }
          }
        },
        contratante: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto: true
              }
            }
          }
        }
      }
    });

    if (motivo) {
      await prisma.mensagem.create({
        data: {
          bookingId: id,
          remetenteId: req.user.id,
          conteudo: `Booking recusado. Motivo: ${motivo}`,
          tipo: 'SISTEMA'
        }
      });
    }

    res.json({
      message: 'Booking recusado com sucesso',
      data: bookingAtualizado
    });
  } catch (error) {
    next(error);
  }
};

export const counterOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { valorProposto, mensagem } = req.body;

    if (req.user.tipo !== 'ARTISTA') {
      throw new AppError('Apenas artistas podem fazer contra-propostas', 403);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artista: true
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    if (booking.artistaId !== req.user.artista.id) {
      throw new AppError('Você não tem permissão para fazer contra-proposta neste booking', 403);
    }

    if (booking.status !== 'PENDENTE') {
      throw new AppError('Apenas bookings pendentes podem receber contra-propostas', 400);
    }

    const taxaPlataforma = calcularTaxaPlataforma(valorProposto, booking.artista.plano);
    const valorTotal = valorProposto + taxaPlataforma;

    const [bookingAtualizado, proposta] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: {
          valorArtista: valorProposto,
          taxaPlataforma,
          valorTotal,
          updatedAt: new Date()
        }
      }),
      prisma.proposta.create({
        data: {
          bookingId: id,
          tipo: 'CONTRA_PROPOSTA',
          valorProposto,
          mensagem
        }
      })
    ]);

    await prisma.mensagem.create({
      data: {
        bookingId: id,
        remetenteId: req.user.id,
        conteudo: `Contra-proposta enviada: R$ ${valorProposto.toFixed(2)}${mensagem ? ` - ${mensagem}` : ''}`,
        tipo: 'SISTEMA'
      }
    });

    res.json({
      message: 'Contra-proposta enviada com sucesso',
      data: {
        booking: bookingAtualizado,
        proposta
      }
    });
  } catch (error) {
    next(error);
  }
};
