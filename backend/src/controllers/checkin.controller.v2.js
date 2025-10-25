import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { uploadImageBuffer } from '../services/cloudinary.service.js';

/**
 * Calcula distância entre dois pontos geográficos (fórmula de Haversine)
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

  return R * c; // em metros
};

/**
 * Extrai coordenadas do campo 'local' do booking
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
 * Calcula score de confiabilidade do check-in (0-100)
 */
const calcularScoreConfiabilidade = (dados) => {
  let score = 100;

  // Penaliza por distância
  if (dados.distanciaDoLocal) {
    if (dados.distanciaDoLocal > 1000) score -= 50;      // >1km = muito suspeito
    else if (dados.distanciaDoLocal > 500) score -= 30;  // >500m = suspeito
    else if (dados.distanciaDoLocal > 200) score -= 15;  // >200m = atenção
    else if (dados.distanciaDoLocal > 100) score -= 5;   // >100m = ok
  }

  // Penaliza se fora da janela de tempo
  if (!dados.dentroJanela) {
    score -= 40;
  }

  // Penaliza se não tem foto
  if (!dados.temFoto) {
    score -= 50;
  }

  // Penaliza se não tem GPS
  if (!dados.temGPS) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Artista faz check-in no evento
 * Sistema com aprovação automática em 1h se contratante não contestar
 */
export const checkIn = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    // Foto é obrigatória
    if (!req.file) {
      throw new AppError('Foto de comprovação é obrigatória para check-in', 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        artista: true,
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

    // Valida que o usuário é o artista do booking
    if (req.user.tipo !== 'ARTISTA' || booking.artistaId !== req.user.artista.id) {
      throw new AppError('Apenas o artista pode fazer check-in', 403);
    }

    // Valida que o booking está confirmado (pagamento confirmado)
    if (booking.status !== 'CONFIRMADO') {
      throw new AppError('Booking deve estar confirmado (pago) para check-in', 400);
    }

    // Verifica se já existe check-in
    const checkInExistente = await prisma.checkIn.findFirst({
      where: {
        bookingId,
        tipo: 'CHEGADA'
      }
    });

    if (checkInExistente) {
      throw new AppError('Check-in já realizado', 400);
    }

    // Valida janela de tempo (4h antes até 2h depois do início)
    const dataEvento = new Date(booking.dataEvento);
    const [horas, minutos] = booking.horarioInicio.split(':');
    const inicioEvento = new Date(dataEvento);
    inicioEvento.setHours(parseInt(horas), parseInt(minutos), 0);

    const quatroHorasAntes = new Date(inicioEvento);
    quatroHorasAntes.setHours(quatroHorasAntes.getHours() - 4);

    const duasHorasDepois = new Date(inicioEvento);
    duasHorasDepois.setHours(duasHorasDepois.getHours() + 2);

    const agora = new Date();
    const dentroJanela = agora >= quatroHorasAntes && agora <= duasHorasDepois;

    // Calcula distância do local (se coordenadas disponíveis)
    const coordenadasEvento = extrairCoordenadas(booking.local);
    let distanciaDoLocal = null;

    if (coordenadasEvento && latitude && longitude) {
      distanciaDoLocal = calcularDistancia(
        parseFloat(latitude),
        parseFloat(longitude),
        coordenadasEvento.latitude,
        coordenadasEvento.longitude
      );
    }

    // Upload da foto de comprovação
    const { url: fotoUrl } = await uploadImageBuffer(req.file.buffer, 'kxrtex/checkins');

    // Calcula score de confiabilidade
    const scoreConfiabilidade = calcularScoreConfiabilidade({
      distanciaDoLocal,
      dentroJanela,
      temFoto: true,
      temGPS: !!latitude && !!longitude
    });

    // Cria check-in com status PENDENTE
    // Será aprovado automaticamente em 1h se contratante não contestar
    const checkIn = await prisma.checkIn.create({
      data: {
        bookingId,
        tipo: 'CHEGADA',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        fotoUrl,
        status: 'PENDENTE',
        distanciaDoLocal,
        dentroJanela,
        scoreConfiabilidade
      }
    });

    // Atualiza status do booking para EM_ANDAMENTO
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'EM_ANDAMENTO' }
    });

    // Cria mensagem de sistema notificando check-in
    const mensagemConteudo = `✅ Check-in realizado pelo artista!
${distanciaDoLocal ? `📍 Distância do local: ${Math.round(distanciaDoLocal)}m` : ''}
⏰ ${dentroJanela ? 'Dentro do horário esperado' : '⚠️ Fora do horário esperado'}
🔍 Score: ${scoreConfiabilidade}/100

${scoreConfiabilidade < 70 ? '⚠️ Verifique a foto e localização' : 'Aguardando sua confirmação (auto-aprovação em 1h)'}`;

    await prisma.mensagem.create({
      data: {
        bookingId,
        remetenteId: req.user.id,
        conteudo: mensagemConteudo,
        tipo: 'SISTEMA'
      }
    });

    // TODO: Enviar notificação push/email para contratante

    res.json({
      message: 'Check-in realizado com sucesso',
      data: {
        checkInId: checkIn.id,
        status: checkIn.status,
        scoreConfiabilidade: checkIn.scoreConfiabilidade,
        distanciaDoLocal: checkIn.distanciaDoLocal,
        dentroJanela: checkIn.dentroJanela,
        aprovacaoAutomaticaEm: new Date(checkIn.timestamp.getTime() + 60 * 60 * 1000), // +1h
        mensagem: scoreConfiabilidade >= 70
          ? 'Check-in será aprovado automaticamente em 1h se não houver contestação'
          : 'Check-in com score baixo, aguardando validação do contratante'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Contratante valida check-in (aprovar ou rejeitar)
 */
export const validarCheckIn = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { aprovar, motivo } = req.body; // aprovar: true/false, motivo: string (se rejeitar)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Valida que o usuário é o contratante do booking
    if (req.user.tipo !== 'CONTRATANTE' || booking.contratanteId !== req.user.contratante.id) {
      throw new AppError('Apenas o contratante pode validar check-in', 403);
    }

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        bookingId,
        tipo: 'CHEGADA',
        status: 'PENDENTE'
      }
    });

    if (!checkIn) {
      throw new AppError('Nenhum check-in pendente encontrado', 404);
    }

    // Verifica se já passou 1h (não pode mais contestar)
    const umaHoraDepois = new Date(checkIn.timestamp.getTime() + 60 * 60 * 1000);
    if (new Date() > umaHoraDepois) {
      throw new AppError('Prazo para contestação expirou (1h). Check-in foi aprovado automaticamente.', 400);
    }

    if (aprovar) {
      // APROVAR
      await prisma.checkIn.update({
        where: { id: checkIn.id },
        data: {
          status: 'APROVADO',
          aprovadoEm: new Date(),
          validadoPor: req.user.id
        }
      });

      await prisma.mensagem.create({
        data: {
          bookingId,
          remetenteId: req.user.id,
          conteudo: '✅ Check-in aprovado pelo contratante! Evento em andamento.',
          tipo: 'SISTEMA'
        }
      });

      res.json({
        message: 'Check-in aprovado com sucesso',
        data: { status: 'APROVADO' }
      });

    } else {
      // REJEITAR
      if (!motivo) {
        throw new AppError('Motivo é obrigatório para rejeitar check-in', 400);
      }

      await prisma.checkIn.update({
        where: { id: checkIn.id },
        data: {
          status: 'REJEITADO',
          rejeitadoPor: req.user.id,
          motivoRejeicao: motivo
        }
      });

      // Volta booking para CONFIRMADO
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMADO' }
      });

      await prisma.mensagem.create({
        data: {
          bookingId,
          remetenteId: req.user.id,
          conteudo: `❌ Check-in rejeitado pelo contratante.\nMotivo: ${motivo}\n\nO caso será analisado pela plataforma.`,
          tipo: 'SISTEMA'
        }
      });

      // TODO: Notificar equipe da plataforma para análise de disputa

      res.json({
        message: 'Check-in rejeitado. Caso em análise.',
        data: { status: 'REJEITADO', motivo }
      });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Job automático para aprovar check-ins após 1h
 * Deve ser executado periodicamente (cron job ou Bull queue)
 */
export const autoAprovarCheckIns = async () => {
  try {
    const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);

    // Busca check-ins pendentes há mais de 1h
    const checkInsPendentes = await prisma.checkIn.findMany({
      where: {
        status: 'PENDENTE',
        timestamp: {
          lt: umaHoraAtras
        }
      },
      include: {
        booking: true
      }
    });

    for (const checkIn of checkInsPendentes) {
      // Auto-aprova
      await prisma.checkIn.update({
        where: { id: checkIn.id },
        data: {
          status: 'APROVADO',
          aprovadoEm: new Date(),
          validadoPor: null // null = aprovação automática
        }
      });

      // Cria mensagem informando aprovação automática
      await prisma.mensagem.create({
        data: {
          bookingId: checkIn.bookingId,
          remetenteId: checkIn.booking.artistaId,
          conteudo: '⏰ Check-in aprovado automaticamente (1h sem contestação)',
          tipo: 'SISTEMA'
        }
      });

      console.log(`Check-in ${checkIn.id} aprovado automaticamente`);
    }

    return {
      aprovados: checkInsPendentes.length
    };
  } catch (error) {
    console.error('Erro ao auto-aprovar check-ins:', error);
    throw error;
  }
};

/**
 * Check-out do artista
 */
export const checkOut = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        artista: true
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    if (req.user.tipo !== 'ARTISTA' || booking.artistaId !== req.user.artista.id) {
      throw new AppError('Apenas o artista pode fazer check-out', 403);
    }

    // Verifica se tem check-in aprovado
    const checkInAprovado = await prisma.checkIn.findFirst({
      where: {
        bookingId,
        tipo: 'CHEGADA',
        status: 'APROVADO'
      }
    });

    if (!checkInAprovado) {
      throw new AppError('Check-in não foi aprovado ainda', 400);
    }

    // Verifica se já tem check-out
    const checkOutExistente = await prisma.checkIn.findFirst({
      where: {
        bookingId,
        tipo: 'SAIDA'
      }
    });

    if (checkOutExistente) {
      throw new AppError('Check-out já realizado', 400);
    }

    // Cria check-out (não precisa de aprovação)
    await prisma.checkIn.create({
      data: {
        bookingId,
        tipo: 'SAIDA',
        fotoUrl: '', // Check-out não requer foto
        status: 'APROVADO',
        aprovadoEm: new Date()
      }
    });

    // Atualiza status do booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONCLUIDO' }
    });

    await prisma.mensagem.create({
      data: {
        bookingId,
        remetenteId: req.user.id,
        conteudo: '✅ Check-out realizado! Evento concluído.\n💰 Pagamento será liberado em 48h.',
        tipo: 'SISTEMA'
      }
    });

    res.json({
      message: 'Check-out realizado com sucesso',
      data: {
        status: 'CONCLUIDO',
        liberacaoPagamentoEm: new Date(Date.now() + 48 * 60 * 60 * 1000) // +48h
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Contratante confirma início do evento manualmente (sem check-in)
 * Útil para casos onde artista não tem celular ou problemas técnicos
 */
export const confirmarInicioEvento = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { motivo } = req.body; // Motivo da confirmação manual (opcional)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        artista: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Valida que o usuário é o contratante do booking
    if (req.user.tipo !== 'CONTRATANTE' || booking.contratanteId !== req.user.contratante.id) {
      throw new AppError('Apenas o contratante pode confirmar início do evento', 403);
    }

    // Valida que o booking está confirmado (pagamento confirmado)
    if (booking.status !== 'CONFIRMADO') {
      throw new AppError('Booking deve estar confirmado (pago) para iniciar evento', 400);
    }

    // Verifica se já existe check-in
    const checkInExistente = await prisma.checkIn.findFirst({
      where: {
        bookingId,
        tipo: 'CHEGADA'
      }
    });

    if (checkInExistente) {
      throw new AppError('Artista já fez check-in. Use a validação de check-in.', 400);
    }

    // Atualiza status do booking para EM_ANDAMENTO
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'EM_ANDAMENTO' }
    });

    // Cria mensagem de sistema notificando confirmação manual
    const mensagemConteudo = `✅ Evento iniciado por confirmação do contratante
${motivo ? `📝 Motivo: ${motivo}` : '⚠️ Sem check-in do artista'}

ℹ️ O contratante confirmou manualmente o início do evento.`;

    await prisma.mensagem.create({
      data: {
        bookingId,
        remetenteId: req.user.id,
        conteudo: mensagemConteudo,
        tipo: 'SISTEMA'
      }
    });

    // TODO: Enviar notificação push/email para artista

    res.json({
      message: 'Evento iniciado com sucesso',
      data: {
        status: 'EM_ANDAMENTO',
        confirmacaoManual: true,
        confirmarPor: req.user.nome
      }
    });
  } catch (error) {
    next(error);
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
      include: {
        checkIns: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Verifica permissão
    const isArtista = req.user.tipo === 'ARTISTA' && booking.artistaId === req.user.artista?.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && booking.contratanteId === req.user.contratante?.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Sem permissão para visualizar check-in', 403);
    }

    const checkInChegada = booking.checkIns.find(c => c.tipo === 'CHEGADA');
    const checkOutSaida = booking.checkIns.find(c => c.tipo === 'SAIDA');

    // Calcula janelas de tempo
    const dataEvento = new Date(booking.dataEvento);
    const [horas, minutos] = booking.horarioInicio.split(':');
    const inicioEvento = new Date(dataEvento);
    inicioEvento.setHours(parseInt(horas), parseInt(minutos), 0);

    const janelaCheckIn = {
      inicio: new Date(inicioEvento.getTime() - 4 * 60 * 60 * 1000), // -4h
      fim: new Date(inicioEvento.getTime() + 2 * 60 * 60 * 1000)     // +2h
    };

    const agora = new Date();

    res.json({
      data: {
        checkIn: checkInChegada ? {
          realizado: true,
          timestamp: checkInChegada.timestamp,
          latitude: checkInChegada.latitude,
          longitude: checkInChegada.longitude,
          foto: checkInChegada.fotoUrl,
          status: checkInChegada.status,
          scoreConfiabilidade: checkInChegada.scoreConfiabilidade,
          distanciaDoLocal: checkInChegada.distanciaDoLocal,
          dentroJanela: checkInChegada.dentroJanela,
          aprovadoEm: checkInChegada.aprovadoEm,
          aprovacaoAutomatica: !checkInChegada.validadoPor,
          motivoRejeicao: checkInChegada.motivoRejeicao,
          podeContestar: checkInChegada.status === 'PENDENTE' &&
                        new Date() < new Date(checkInChegada.timestamp.getTime() + 60 * 60 * 1000) &&
                        isContratante
        } : {
          realizado: false,
          podeRealizarAgora: agora >= janelaCheckIn.inicio && agora <= janelaCheckIn.fim && isArtista
        },
        checkOut: checkOutSaida ? {
          realizado: true,
          timestamp: checkOutSaida.timestamp
        } : {
          realizado: false,
          podeRealizarAgora: checkInChegada?.status === 'APROVADO' && isArtista
        },
        janelas: {
          checkIn: janelaCheckIn
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
