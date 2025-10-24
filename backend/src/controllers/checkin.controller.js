import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { uploadImageBuffer } from '../services/cloudinary.service.js';

/**
 * Calcula distância entre dois pontos geográficos (fórmula de Haversine)
 * Retorna distância em metros
 */
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distancia = R * c; // em metros

  return distancia;
};

/**
 * Extrai coordenadas do campo 'local' do booking
 * Formato esperado: "Nome do Local (lat,lon)" ou apenas nome
 */
const extrairCoordenadas = (local) => {
  const regex = /\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/;
  const match = local.match(regex);

  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2])
    };
  }

  return null;
};

/**
 * Artista faz check-in no evento
 */
export const checkIn = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError('Localização é obrigatória para check-in', 400);
    }

    if (!req.file) {
      throw new AppError('Foto de comprovação é obrigatória', 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        artista: true
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Valida que o usuário é o artista do booking
    if (req.user.tipo !== 'ARTISTA' || booking.artistaId !== req.user.artista.id) {
      throw new AppError('Apenas o artista pode fazer check-in', 403);
    }

    // Valida que o booking está confirmado
    if (booking.status !== 'CONFIRMADO') {
      throw new AppError('Booking deve estar confirmado para check-in', 400);
    }

    // Valida que já não foi feito check-in
    if (booking.checkInArtista) {
      throw new AppError('Check-in já realizado', 400);
    }

    // Valida janela de tempo (até 2h antes do evento até 1h depois do início)
    const dataEvento = new Date(booking.dataEvento);
    const [horas, minutos] = booking.horarioInicio.split(':');
    const inicioEvento = new Date(dataEvento);
    inicioEvento.setHours(parseInt(horas), parseInt(minutos), 0);

    const duasHorasAntes = new Date(inicioEvento);
    duasHorasAntes.setHours(duasHorasAntes.getHours() - 2);

    const umaHoraDepois = new Date(inicioEvento);
    umaHoraDepois.setHours(umaHoraDepois.getHours() + 1);

    const agora = new Date();

    if (agora < duasHorasAntes || agora > umaHoraDepois) {
      throw new AppError('Check-in só pode ser feito entre 2h antes e 1h após o início do evento', 400);
    }

    // Valida distância (se coordenadas estiverem disponíveis)
    const coordenadasEvento = extrairCoordenadas(booking.local);

    if (coordenadasEvento) {
      const distancia = calcularDistancia(
        latitude,
        longitude,
        coordenadasEvento.latitude,
        coordenadasEvento.longitude
      );

      const DISTANCIA_MAXIMA = 500; // 500 metros

      if (distancia > DISTANCIA_MAXIMA) {
        throw new AppError(
          `Você está a ${Math.round(distancia)}m do local. Check-in só pode ser feito a até ${DISTANCIA_MAXIMA}m`,
          400
        );
      }
    }

    // Upload da foto de comprovação
    const { url: fotoUrl } = await uploadImageBuffer(req.file.buffer, 'kxrtex/checkins');

    // Atualiza booking com check-in
    const bookingAtualizado = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        checkInArtista: new Date(),
        checkInLatitude: latitude,
        checkInLongitude: longitude,
        checkInFoto: fotoUrl,
        status: 'EM_ANDAMENTO'
      }
    });

    // Cria mensagem de sistema
    await prisma.mensagem.create({
      data: {
        bookingId,
        remetenteId: req.user.id,
        conteudo: `✅ Check-in realizado! O artista está no local. ${coordenadasEvento ? `Distância: ${Math.round(calcularDistancia(latitude, longitude, coordenadasEvento.latitude, coordenadasEvento.longitude))}m` : ''}`,
        tipo: 'SISTEMA'
      }
    });

    // Libera 50% do pagamento para o artista
    const pagamento = await prisma.pagamento.findFirst({
      where: {
        bookingId,
        status: 'CONFIRMED'
      }
    });

    if (pagamento && !pagamento.adiantamentoLiberado) {
      const valorAdiantamento = pagamento.valorArtista * 0.5;

      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: {
          adiantamentoLiberado: true,
          valorAdiantamento,
          dataAdiantamento: new Date()
        }
      });

      await prisma.mensagem.create({
        data: {
          bookingId,
          remetenteId: req.user.id,
          conteudo: `💰 Adiantamento de 50% (R$ ${valorAdiantamento.toFixed(2)}) liberado após check-in`,
          tipo: 'SISTEMA'
        }
      });
    }

    res.json({
      message: 'Check-in realizado com sucesso',
      data: {
        checkIn: bookingAtualizado.checkInArtista,
        status: bookingAtualizado.status,
        adiantamentoLiberado: pagamento?.adiantamentoLiberado || false,
        valorAdiantamento: pagamento?.valorAdiantamento || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Artista faz check-out do evento
 */
export const checkOut = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        artista: true
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Valida que o usuário é o artista do booking
    if (req.user.tipo !== 'ARTISTA' || booking.artistaId !== req.user.artista.id) {
      throw new AppError('Apenas o artista pode fazer check-out', 403);
    }

    // Valida que foi feito check-in
    if (!booking.checkInArtista) {
      throw new AppError('Check-in não foi realizado', 400);
    }

    // Valida que já não foi feito check-out
    if (booking.checkOutArtista) {
      throw new AppError('Check-out já realizado', 400);
    }

    // Valida que está dentro do período do evento ou até 1h depois
    const dataEvento = new Date(booking.dataEvento);
    const [horas, minutos] = booking.horarioInicio.split(':');
    const inicioEvento = new Date(dataEvento);
    inicioEvento.setHours(parseInt(horas), parseInt(minutos), 0);

    const fimEvento = new Date(inicioEvento);
    fimEvento.setHours(fimEvento.getHours() + booking.duracao);

    const umaHoraAposFim = new Date(fimEvento);
    umaHoraAposFim.setHours(umaHoraAposFim.getHours() + 1);

    const agora = new Date();

    if (agora > umaHoraAposFim) {
      // Check-out automático
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          checkOutArtista: fimEvento,
          checkOutLatitude: booking.checkInLatitude,
          checkOutLongitude: booking.checkInLongitude,
          status: 'CONCLUIDO'
        }
      });

      throw new AppError('Check-out automático já foi realizado', 400);
    }

    // Atualiza booking com check-out
    const bookingAtualizado = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        checkOutArtista: new Date(),
        checkOutLatitude: latitude,
        checkOutLongitude: longitude,
        status: 'CONCLUIDO'
      }
    });

    // Cria mensagem de sistema
    await prisma.mensagem.create({
      data: {
        bookingId,
        remetenteId: req.user.id,
        conteudo: '✅ Check-out realizado! Evento concluído. O pagamento será liberado em 48h.',
        tipo: 'SISTEMA'
      }
    });

    res.json({
      message: 'Check-out realizado com sucesso',
      data: {
        checkOut: bookingAtualizado.checkOutArtista,
        status: bookingAtualizado.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Job automático para fazer check-out após fim do evento
 * Deve ser executado periodicamente (cron job)
 */
export const autoCheckOut = async () => {
  try {
    const agora = new Date();

    // Busca bookings que deveriam ter check-out mas não têm
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'EM_ANDAMENTO',
        checkInArtista: { not: null },
        checkOutArtista: null
      }
    });

    for (const booking of bookings) {
      const dataEvento = new Date(booking.dataEvento);
      const [horas, minutos] = booking.horarioInicio.split(':');
      const inicioEvento = new Date(dataEvento);
      inicioEvento.setHours(parseInt(horas), parseInt(minutos), 0);

      const fimEvento = new Date(inicioEvento);
      fimEvento.setHours(fimEvento.getHours() + booking.duracao);

      const umaHoraAposFim = new Date(fimEvento);
      umaHoraAposFim.setHours(umaHoraAposFim.getHours() + 1);

      // Se passou 1h após o fim do evento, faz check-out automático
      if (agora > umaHoraAposFim) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            checkOutArtista: fimEvento,
            checkOutLatitude: booking.checkInLatitude,
            checkOutLongitude: booking.checkInLongitude,
            status: 'CONCLUIDO'
          }
        });

        await prisma.mensagem.create({
          data: {
            bookingId: booking.id,
            remetenteId: booking.artistaId,
            conteudo: '⏰ Check-out automático realizado. O pagamento será liberado em 48h.',
            tipo: 'SISTEMA'
          }
        });

        console.log(`Check-out automático realizado para booking ${booking.id}`);
      }
    }
  } catch (error) {
    console.error('Erro no auto check-out:', error);
  }
};

/**
 * Consulta status de check-in/check-out
 */
export const getCheckInStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        checkInArtista: true,
        checkInLatitude: true,
        checkInLongitude: true,
        checkInFoto: true,
        checkOutArtista: true,
        checkOutLatitude: true,
        checkOutLongitude: true,
        dataEvento: true,
        horarioInicio: true,
        duracao: true,
        local: true
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Verifica permissão
    const bookingCompleto = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    const isArtista = req.user.tipo === 'ARTISTA' && bookingCompleto.artistaId === req.user.artista?.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && bookingCompleto.contratanteId === req.user.contratante?.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Sem permissão para visualizar check-in', 403);
    }

    // Calcula janelas de tempo
    const dataEvento = new Date(booking.dataEvento);
    const [horas, minutos] = booking.horarioInicio.split(':');
    const inicioEvento = new Date(dataEvento);
    inicioEvento.setHours(parseInt(horas), parseInt(minutos), 0);

    const janelaCheckIn = {
      inicio: new Date(inicioEvento.getTime() - 2 * 60 * 60 * 1000),
      fim: new Date(inicioEvento.getTime() + 1 * 60 * 60 * 1000)
    };

    const fimEvento = new Date(inicioEvento);
    fimEvento.setHours(fimEvento.getHours() + booking.duracao);

    const janelaCheckOut = {
      inicio: inicioEvento,
      fim: new Date(fimEvento.getTime() + 1 * 60 * 60 * 1000)
    };

    const agora = new Date();

    res.json({
      data: {
        checkIn: {
          realizado: !!booking.checkInArtista,
          timestamp: booking.checkInArtista,
          latitude: booking.checkInLatitude,
          longitude: booking.checkInLongitude,
          foto: booking.checkInFoto,
          podeRealizarAgora: agora >= janelaCheckIn.inicio && agora <= janelaCheckIn.fim && !booking.checkInArtista
        },
        checkOut: {
          realizado: !!booking.checkOutArtista,
          timestamp: booking.checkOutArtista,
          latitude: booking.checkOutLatitude,
          longitude: booking.checkOutLongitude,
          podeRealizarAgora: agora >= janelaCheckOut.inicio && agora <= janelaCheckOut.fim && !!booking.checkInArtista && !booking.checkOutArtista
        },
        coordenadasEvento: extrairCoordenadas(booking.local),
        janelas: {
          checkIn: janelaCheckIn,
          checkOut: janelaCheckOut
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
