import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import {
  createPayment,
  getOrCreateCustomer,
  calculateSplit,
  getPaymentStatus,
  refundPayment
} from '../services/asaas.service.js';

/**
 * Cria um pagamento para um booking
 */
export const createBookingPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { billingType, creditCard, creditCardHolderInfo } = req.body;

    // Busca o booking com todas as informações necessárias
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        contratante: {
          include: {
            usuario: true
          }
        },
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

    // Valida que o usuário é o contratante
    if (req.user.tipo !== 'CONTRATANTE' || booking.contratante.usuarioId !== req.user.id) {
      throw new AppError('Apenas o contratante pode realizar o pagamento', 403);
    }

    // Valida que o booking está no status ACEITO
    if (booking.status !== 'ACEITO') {
      throw new AppError('Booking deve estar no status ACEITO para pagamento', 400);
    }

    // Valida que não existe pagamento pendente
    const pagamentoExistente = await prisma.pagamento.findFirst({
      where: {
        bookingId,
        status: { in: ['PENDING', 'CONFIRMED', 'RECEIVED'] }
      }
    });

    if (pagamentoExistente) {
      throw new AppError('Já existe um pagamento ativo para este booking', 400);
    }

    // Busca ou cria cliente no ASAAS
    const customerId = await getOrCreateCustomer(booking.contratante.usuario);

    // Calcula split de pagamento
    let split = null;
    if (booking.artista.asaasWalletId) {
      const taxas = { FREE: 0.15, PLUS: 0.10, PRO: 0.07 };
      const taxaPlataforma = taxas[booking.artista.plano];
      split = calculateSplit(booking.valorTotal, taxaPlataforma, booking.artista.asaasWalletId);
    }

    // Define data de vencimento (3 dias úteis)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    // Cria pagamento no ASAAS
    const paymentData = {
      customer: customerId,
      billingType,
      value: booking.valorTotal,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Booking #${booking.id.substring(0, 8)} - ${booking.artista.nomeArtistico}`,
      externalReference: bookingId,
      creditCard,
      creditCardHolderInfo,
      split
    };

    const asaasPayment = await createPayment(paymentData);

    // Salva pagamento no banco de dados
    const pagamento = await prisma.pagamento.create({
      data: {
        bookingId,
        asaasPaymentId: asaasPayment.paymentId,
        valor: booking.valorTotal,
        valorArtista: booking.valorArtista,
        taxaPlataforma: booking.taxaPlataforma,
        metodoPagamento: billingType,
        status: asaasPayment.status,
        dataVencimento: new Date(asaasPayment.dueDate),
        pixQrCode: asaasPayment.pixQrCode,
        pixCopyPaste: asaasPayment.pixCopyPaste
      }
    });

    res.status(201).json({
      message: 'Pagamento criado com sucesso',
      data: {
        pagamento,
        invoiceUrl: asaasPayment.invoiceUrl,
        pixQrCode: asaasPayment.pixQrCode,
        pixCopyPaste: asaasPayment.pixCopyPaste
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Consulta status de pagamento
 */
export const getPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Valida permissão
    const isArtista = req.user.tipo === 'ARTISTA' && booking.artistaId === req.user.artista?.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && booking.contratanteId === req.user.contratante?.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Sem permissão para visualizar este pagamento', 403);
    }

    const pagamento = await prisma.pagamento.findFirst({
      where: { bookingId },
      orderBy: { criadoEm: 'desc' }
    });

    if (!pagamento) {
      throw new AppError('Pagamento não encontrado', 404);
    }

    // Atualiza status do ASAAS
    const asaasStatus = await getPaymentStatus(pagamento.asaasPaymentId);

    // Se status mudou, atualiza no banco
    if (asaasStatus.status !== pagamento.status) {
      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: {
          status: asaasStatus.status,
          dataPagamento: asaasStatus.confirmedDate ? new Date(asaasStatus.confirmedDate) : null
        }
      });

      // Se foi confirmado, atualiza status do booking
      if (asaasStatus.status === 'CONFIRMED' || asaasStatus.status === 'RECEIVED') {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMADO' }
        });
      }
    }

    res.json({
      data: {
        ...pagamento,
        status: asaasStatus.status,
        dataPagamento: asaasStatus.confirmedDate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook do ASAAS para notificações de pagamento
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const { event, payment } = req.body;

    console.log('Webhook ASAAS recebido:', event, payment.id);

    // Busca pagamento pelo asaasPaymentId
    const pagamento = await prisma.pagamento.findFirst({
      where: { asaasPaymentId: payment.id },
      include: {
        booking: {
          include: {
            artista: true,
            contratante: true
          }
        }
      }
    });

    if (!pagamento) {
      console.log('Pagamento não encontrado:', payment.id);
      return res.status(200).json({ received: true });
    }

    // Processa eventos
    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        // Atualiza status do pagamento
        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: {
            status: 'CONFIRMED',
            dataPagamento: new Date()
          }
        });

        // Atualiza status do booking para CONFIRMADO
        await prisma.booking.update({
          where: { id: pagamento.bookingId },
          data: { status: 'CONFIRMADO' }
        });

        // Cria mensagem de sistema
        await prisma.mensagem.create({
          data: {
            bookingId: pagamento.bookingId,
            remetenteId: pagamento.booking.contratante.usuarioId,
            conteudo: '✅ Pagamento confirmado! O evento está confirmado e o artista será notificado.',
            tipo: 'SISTEMA'
          }
        });

        console.log('Pagamento confirmado:', pagamento.id);
        break;

      case 'PAYMENT_OVERDUE':
        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: { status: 'OVERDUE' }
        });

        console.log('Pagamento vencido:', pagamento.id);
        break;

      case 'PAYMENT_REFUNDED':
        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: { status: 'REFUNDED' }
        });

        await prisma.booking.update({
          where: { id: pagamento.bookingId },
          data: { status: 'CANCELADO' }
        });

        console.log('Pagamento estornado:', pagamento.id);
        break;

      default:
        console.log('Evento não tratado:', event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    next(error);
  }
};

/**
 * Solicita estorno de pagamento
 */
export const requestRefund = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { motivo, valorParcial } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        contratante: true,
        artista: true
      }
    });

    if (!booking) {
      throw new AppError('Booking não encontrado', 404);
    }

    // Apenas contratante ou artista podem solicitar estorno
    const isArtista = req.user.tipo === 'ARTISTA' && booking.artistaId === req.user.artista?.id;
    const isContratante = req.user.tipo === 'CONTRATANTE' && booking.contratanteId === req.user.contratante?.id;

    if (!isArtista && !isContratante) {
      throw new AppError('Sem permissão para solicitar estorno', 403);
    }

    const pagamento = await prisma.pagamento.findFirst({
      where: {
        bookingId,
        status: { in: ['CONFIRMED', 'RECEIVED'] }
      }
    });

    if (!pagamento) {
      throw new AppError('Pagamento não encontrado ou não confirmado', 404);
    }

    // Processa estorno no ASAAS
    const refund = await refundPayment(pagamento.asaasPaymentId, valorParcial);

    // Atualiza status
    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: { status: 'REFUNDED' }
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELADO' }
    });

    // Cria mensagem de sistema
    await prisma.mensagem.create({
      data: {
        bookingId,
        remetenteId: req.user.id,
        conteudo: `🔄 Estorno solicitado. Motivo: ${motivo || 'Não informado'}`,
        tipo: 'SISTEMA'
      }
    });

    res.json({
      message: 'Estorno processado com sucesso',
      data: refund
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Libera pagamento para artista (após 48h do evento concluído)
 */
export const releasePayment = async (req, res, next) => {
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

    // Valida que o booking está concluído
    if (booking.status !== 'CONCLUIDO') {
      throw new AppError('Booking deve estar concluído para liberação', 400);
    }

    // Valida que passaram 48h
    const dataEvento = new Date(booking.dataEvento);
    const horasFim = new Date(dataEvento);
    horasFim.setHours(horasFim.getHours() + booking.duracao);

    const horas48Depois = new Date(horasFim);
    horas48Depois.setHours(horas48Depois.getHours() + 48);

    if (new Date() < horas48Depois) {
      throw new AppError('Pagamento só pode ser liberado 48h após conclusão do evento', 400);
    }

    const pagamento = await prisma.pagamento.findFirst({
      where: {
        bookingId,
        status: 'CONFIRMED'
      }
    });

    if (!pagamento) {
      throw new AppError('Pagamento não encontrado', 404);
    }

    // Se tiver split configurado, o ASAAS já transferiu automaticamente
    // Apenas atualiza status
    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: {
        status: 'RELEASED',
        dataLiberacao: new Date()
      }
    });

    res.json({
      message: 'Pagamento liberado com sucesso',
      data: {
        valor: pagamento.valorArtista,
        dataLiberacao: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};
