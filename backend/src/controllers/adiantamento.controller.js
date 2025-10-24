import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Calculate artist eligibility score for advance payment
 * Based on: total bookings, average rating, verification status
 */
const calculateArtistScore = (artista) => {
  let score = 0;

  // Base score from total completed bookings
  if (artista.totalBookings >= 10) score += 40;
  else if (artista.totalBookings >= 5) score += 30;
  else if (artista.totalBookings >= 2) score += 20;
  else if (artista.totalBookings >= 1) score += 10;

  // Score from average rating (max 30 points)
  if (artista.notaMedia > 0) {
    score += (artista.notaMedia / 5) * 30;
  }

  // Verification bonus (max 30 points)
  if (artista.statusVerificacao === 'VERIFICADO') {
    score += 30;
  }

  return Math.round(score);
};

/**
 * Check if booking is eligible for advance payment
 * PRD Rules (Section 11.4):
 * - Booking value >= R$500
 * - Different city (distance > 200km)
 * - Event at least 15 days in advance
 * - Artist document verified OR minimum score based on experience
 * - Artist account in good standing
 */
export const checkEligibility = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        artista: {
          include: {
            usuario: {
              select: {
                id: true,
                status: true
              }
            }
          }
        },
        contratante: {
          include: {
            usuario: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Verify user owns this booking
    const userId = req.user.id;
    const isArtista = booking.artista.usuario.id === userId;
    const isContratante = booking.contratante.usuario.id === userId;

    if (!isArtista && !isContratante) {
      throw new AppError('Você não tem permissão para acessar este booking', 403);
    }

    const eligibility = {
      eligible: false,
      reasons: [],
      requirements: {
        minimumValue: { met: false, required: 500, current: booking.valorArtista },
        distance: { met: false, required: 200, current: booking.distanciaKm || 0 },
        advanceTime: { met: false, required: 15, current: 0 },
        artistScore: { met: false, required: 50, current: 0 },
        artistStatus: { met: false, required: 'ATIVO', current: booking.artista.usuario.status }
      }
    };

    // Check 1: Minimum booking value (R$500)
    if (booking.valorArtista >= 500) {
      eligibility.requirements.minimumValue.met = true;
    } else {
      eligibility.reasons.push('Valor do booking deve ser no mínimo R$500');
    }

    // Check 2: Distance (>200km or different city)
    if (booking.distanciaKm && booking.distanciaKm > 200) {
      eligibility.requirements.distance.met = true;
    } else if (!booking.distanciaKm) {
      eligibility.reasons.push('Distância não calculada para este booking');
    } else {
      eligibility.reasons.push('Evento deve estar a mais de 200km de distância');
    }

    // Check 3: Advance time (at least 15 days)
    const hoje = new Date();
    const dataEvento = new Date(booking.dataEvento);
    const diasAntecedencia = Math.floor((dataEvento - hoje) / (1000 * 60 * 60 * 24));

    eligibility.requirements.advanceTime.current = diasAntecedencia;

    if (diasAntecedencia >= 15) {
      eligibility.requirements.advanceTime.met = true;
    } else {
      eligibility.reasons.push('Evento deve estar a pelo menos 15 dias de antecedência');
    }

    // Check 4: Artist score or verification
    const artistScore = calculateArtistScore(booking.artista);
    eligibility.requirements.artistScore.current = artistScore;

    if (booking.artista.statusVerificacao === 'VERIFICADO' || artistScore >= 50) {
      eligibility.requirements.artistScore.met = true;
    } else {
      eligibility.reasons.push('Artista precisa ser verificado ou ter pontuação mínima de 50 pontos (atual: ' + artistScore + ')');
    }

    // Check 5: Artist account status
    if (booking.artista.usuario.status === 'ATIVO') {
      eligibility.requirements.artistStatus.met = true;
    } else {
      eligibility.reasons.push('Conta do artista deve estar ativa');
    }

    // Overall eligibility
    const allRequirementsMet = Object.values(eligibility.requirements).every(req => req.met);
    eligibility.eligible = allRequirementsMet;

    // Calculate advance amount (50% of artist value)
    if (eligibility.eligible) {
      eligibility.advanceAmount = booking.valorArtista * 0.5;
      eligibility.remainingAmount = booking.valorArtista * 0.5;
    }

    res.json({
      data: eligibility
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Request advance payment for a booking
 * Only available after booking is in CONFIRMADO status
 */
export const requestAdvance = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (req.user.tipo !== 'ARTISTA') {
      throw new AppError('Apenas artistas podem solicitar adiantamento', 403);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        artista: {
          include: {
            usuario: true
          }
        },
        adiantamento: true
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Verify artist owns this booking
    if (booking.artista.usuario.id !== req.user.id) {
      throw new AppError('Você não tem permissão para solicitar adiantamento deste booking', 403);
    }

    // Check if booking is confirmed
    if (booking.status !== 'CONFIRMADO') {
      throw new AppError('Booking deve estar confirmado para solicitar adiantamento', 400);
    }

    // Check if advance already exists
    if (booking.adiantamento) {
      throw new AppError('Adiantamento já foi solicitado para este booking', 400);
    }

    // Check if booking is eligible
    if (!booking.precisaAdiantamento) {
      throw new AppError('Este booking não é elegível para adiantamento', 400);
    }

    // Calculate advance amount (50%)
    const valorAdiantamento = booking.valorArtista * 0.5;

    // Create advance payment record
    const adiantamento = await prisma.adiantamento.create({
      data: {
        bookingId: booking.id,
        valor: valorAdiantamento
      },
      include: {
        booking: {
          include: {
            artista: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // TODO: Create payment transaction in ASAAS
    // This will be implemented when ASAAS service is ready
    // await asaasService.createAdvancePayment(adiantamento);

    res.status(201).json({
      message: 'Solicitação de adiantamento criada com sucesso',
      data: adiantamento
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get advance payment details for a booking
 */
export const getAdvance = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const adiantamento = await prisma.adiantamento.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            artista: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    nomeArtistico: true
                  }
                }
              }
            },
            contratante: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!adiantamento) {
      throw new AppError('Adiantamento não encontrado para este booking', 404);
    }

    // Verify user has access to this advance
    const userId = req.user.id;
    const isArtista = adiantamento.booking.artista.usuario.id === userId;
    const isContratante = adiantamento.booking.contratante.usuario.id === userId;

    if (!isArtista && !isContratante) {
      throw new AppError('Você não tem permissão para acessar este adiantamento', 403);
    }

    res.json({
      data: adiantamento
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Confirm check-in for advance payment release
 * Artist must check-in at hotel/accommodation to receive advance
 */
export const confirmCheckin = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { fotoCheckinUrl } = req.body;

    if (req.user.tipo !== 'ARTISTA') {
      throw new AppError('Apenas artistas podem fazer check-in', 403);
    }

    const adiantamento = await prisma.adiantamento.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            artista: {
              include: {
                usuario: true
              }
            }
          }
        }
      }
    });

    if (!adiantamento) {
      throw new AppError('Adiantamento não encontrado', 404);
    }

    // Verify artist owns this booking
    if (adiantamento.booking.artista.usuario.id !== req.user.id) {
      throw new AppError('Você não tem permissão para fazer check-in deste booking', 403);
    }

    // Check if already checked in
    if (adiantamento.liberadoEm) {
      throw new AppError('Check-in já foi realizado para este adiantamento', 400);
    }

    if (!fotoCheckinUrl) {
      throw new AppError('Foto de check-in é obrigatória', 400);
    }

    // Update advance with check-in info
    const updatedAdiantamento = await prisma.adiantamento.update({
      where: { id: adiantamento.id },
      data: {
        fotoCheckinUrl,
        liberadoEm: new Date()
      },
      include: {
        booking: {
          include: {
            artista: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // TODO: Release payment to artist via ASAAS
    // This will be implemented when ASAAS service is ready
    // await asaasService.releaseAdvancePayment(updatedAdiantamento);

    res.json({
      message: 'Check-in confirmado e adiantamento liberado',
      data: updatedAdiantamento
    });

  } catch (error) {
    next(error);
  }
};
