const { validationResult } = require('express-validator');

const { User, Profissional, Booking } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const asaasService = require('../services/asaasService');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

class PagamentoController {
  static async create(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const { booking_id } = req.params;
      const { metodo_pagamento, parcelas = 1 } = req.body;
      const userId = req.user.id;

      // Get booking with all necessary data
      const booking = await Booking.findByPk(booking_id, {
        include: [
          {
            model: User,
            as: 'contratante'
          },
          {
            model: Profissional,
            as: 'profissional',
            include: [{
              model: User,
              as: 'usuario'
            }]
          }
        ]
      });

      if (!booking) {
        throw new AppError('Booking não encontrado', 404, 'BOOKING_NOT_FOUND');
      }

      // Check if user is the contratante
      if (booking.contratante_id !== userId) {
        throw new AppError('Apenas o contratante pode criar o pagamento', 403, 'ACCESS_DENIED');
      }

      // Check if booking is confirmed
      if (booking.status !== 'confirmado') {
        throw new AppError('Booking deve estar confirmado para criar pagamento', 400, 'BOOKING_NOT_CONFIRMED');
      }

      // Check if payment already exists
      const { Pagamento } = require('../models');
      const existingPayment = await Pagamento.findOne({
        where: { booking_id: booking_id }
      });

      if (existingPayment) {
        throw new AppError('Pagamento já foi criado para este booking', 400, 'PAYMENT_ALREADY_EXISTS');
      }

      // Validate payment method
      if (!['pix', 'cartao_credito'].includes(metodo_pagamento)) {
        throw new AppError('Método de pagamento inválido', 400, 'INVALID_PAYMENT_METHOD');
      }

      // Validate installments for credit card
      if (metodo_pagamento === 'cartao_credito' && (parcelas < 1 || parcelas > 3)) {
        throw new AppError('Número de parcelas deve ser entre 1 e 3', 400, 'INVALID_INSTALLMENTS');
      }

      // Calculate platform fee
      const taxaPlataforma = booking.profissional.getTaxaPlataforma();
      const valorArtista = booking.valor_booking;
      const valorTaxa = Math.round(valorArtista * taxaPlataforma);
      const valorTotal = valorArtista + valorTaxa;

      // Create customer in ASAAS if not exists
      let asaasCustomer;
      try {
        asaasCustomer = await asaasService.createCustomer(booking.contratante);
      } catch (error) {
        // Customer might already exist, try to update instead
        logger.warn('Customer creation failed, attempting update:', error.message);
      }

      // Prepare payment data for ASAAS
      const paymentData = {
        customerId: asaasCustomer?.id || booking.contratante.id,
        billingType: metodo_pagamento === 'pix' ? 'PIX' : 'CREDIT_CARD',
        value: parseFloat((valorTotal / 100).toFixed(2)),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        description: `Booking #${booking.id.slice(0, 8)} - ${booking.titulo_evento}`,
        externalReference: booking_id,
        installmentCount: metodo_pagamento === 'cartao_credito' ? parcelas : 1
      };

      // Create payment in ASAAS
      const asaasPayment = await asaasService.createPayment(paymentData);

      // Create payment record in database
      const pagamento = await Pagamento.create({
        booking_id: booking_id,
        valor_total: valorTotal,
        valor_artista: valorArtista,
        taxa_plataforma: valorTaxa,
        metodo_pagamento,
        parcelas,
        asaas_payment_id: asaasPayment.id,
        asaas_invoice_url: asaasPayment.invoiceUrl
      });

      // Prepare response data
      const responseData = {
        id: pagamento.id,
        valor_total: valorTotal,
        valor_artista: valorArtista,
        taxa_plataforma: valorTaxa,
        status: 'pendente',
        metodo_pagamento,
        asaas_payment_id: asaasPayment.id
      };

      // Add payment method specific data
      if (metodo_pagamento === 'pix') {
        try {
          const pixData = await asaasService.getPixQrCode(asaasPayment.id);

          responseData.pix = {
            qrcode: pixData.payload,
            qrcode_image_url: pixData.encodedImage,
            payload: pixData.payload,
            expira_em: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
          };

          // Update payment with PIX data
          await pagamento.update({
            pix_qrcode: pixData.payload,
            pix_qrcode_image_url: pixData.encodedImage,
            pix_payload: pixData.payload,
            pix_expira_em: responseData.pix.expira_em
          });
        } catch (error) {
          logger.error('Error getting PIX QR Code:', error);
          throw new AppError('Erro ao gerar QR Code PIX', 500, 'PIX_GENERATION_ERROR');
        }
      }

      if (metodo_pagamento === 'cartao_credito') {
        responseData.cartao = {
          invoice_url: asaasPayment.invoiceUrl
        };
      }

      logger.info(`Payment created: ${pagamento.id} for booking ${booking_id}`);

      res.status(201).json({
        success: true,
        message: 'Pagamento criado com sucesso!',
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req, res, next) {
    try {
      const { booking_id } = req.params;
      const userId = req.user.id;

      // Get booking to check access
      const booking = await Booking.findByPk(booking_id, {
        include: [{
          model: Profissional,
          as: 'profissional',
          include: [{
            model: User,
            as: 'usuario'
          }]
        }]
      });

      if (!booking) {
        throw new AppError('Booking não encontrado', 404, 'BOOKING_NOT_FOUND');
      }

      // Check access permission
      const hasAccess = (
        booking.contratante_id === userId ||
        booking.profissional.usuario_id === userId ||
        req.user.tipo === 'admin'
      );

      if (!hasAccess) {
        throw new AppError('Acesso negado', 403, 'ACCESS_DENIED');
      }

      // Get payment
      const { Pagamento } = require('../models');
      const pagamento = await Pagamento.findOne({
        where: { booking_id: booking_id }
      });

      if (!pagamento) {
        throw new AppError('Pagamento não encontrado', 404, 'PAYMENT_NOT_FOUND');
      }

      // Sync status with ASAAS
      if (pagamento.asaas_payment_id && pagamento.status === 'pendente') {
        try {
          const asaasPayment = await asaasService.getPayment(pagamento.asaas_payment_id);

          let newStatus = 'pendente';
          switch (asaasPayment.status) {
            case 'RECEIVED':
            case 'CONFIRMED':
              newStatus = 'aprovado';
              break;
            case 'OVERDUE':
              newStatus = 'rejeitado';
              break;
            case 'REFUNDED':
              newStatus = 'estornado';
              break;
          }

          if (newStatus !== pagamento.status) {
            await pagamento.update({
              status: newStatus,
              pago_em: newStatus === 'aprovado' ? new Date() : null,
              valor_pago: newStatus === 'aprovado' ? pagamento.valor_total : null
            });
          }
        } catch (error) {
          logger.error('Error syncing payment status with ASAAS:', error);
          // Continue with cached status
        }
      }

      res.json({
        success: true,
        data: {
          id: pagamento.id,
          booking_id: pagamento.booking_id,
          valor_total: pagamento.valor_total,
          valor_artista: pagamento.valor_artista,
          taxa_plataforma: pagamento.taxa_plataforma,
          status: pagamento.status,
          metodo_pagamento: pagamento.metodo_pagamento,
          pago_em: pagamento.pago_em,
          liberado_em: pagamento.liberado_em
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req, res, next) {
    try {
      const signature = req.headers['asaas-signature'];
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (!asaasService.verifyWebhook(signature, payload)) {
        logger.warn('Invalid webhook signature received');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const { event, payment } = req.body;

      if (!payment || !payment.id) {
        logger.warn('Webhook received without payment data');
        return res.status(400).json({ error: 'Invalid payload' });
      }

      // Find payment by ASAAS ID
      const { Pagamento } = require('../models');
      const pagamento = await Pagamento.findOne({
        where: { asaas_payment_id: payment.id },
        include: [{
          model: Booking,
          as: 'booking',
          include: [
            {
              model: User,
              as: 'contratante'
            },
            {
              model: Profissional,
              as: 'profissional',
              include: [{
                model: User,
                as: 'usuario'
              }]
            }
          ]
        }]
      });

      if (!pagamento) {
        logger.warn(`Payment not found for ASAAS ID: ${payment.id}`);
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Process webhook events
      let newStatus = pagamento.status;
      let updateData = {
        webhook_events: [...(pagamento.webhook_events || []), { event, timestamp: new Date() }]
      };

      switch (event) {
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRMED':
          newStatus = 'aprovado';
          updateData.pago_em = new Date();
          updateData.valor_pago = payment.value * 100; // Convert to cents
          break;

        case 'PAYMENT_OVERDUE':
          newStatus = 'rejeitado';
          break;

        case 'PAYMENT_REFUNDED':
          newStatus = 'estornado';
          updateData.estornado_em = new Date();
          updateData.valor_estornado = payment.value * 100;
          break;

        case 'PAYMENT_DELETED':
          newStatus = 'cancelado';
          break;
      }

      // Update payment status
      if (newStatus !== pagamento.status) {
        updateData.status = newStatus;
        await pagamento.update(updateData);

        logger.info(`Payment ${pagamento.id} status updated to ${newStatus} via webhook`);

        // Send notifications
        try {
          if (newStatus === 'aprovado') {
            await notificationService.notifyPaymentApproved(pagamento.booking.contratante_id, pagamento);
          }
        } catch (notificationError) {
          logger.error('Error sending payment notification:', notificationError);
        }
      }

      res.json({ success: true });
    } catch (error) {
      logger.error('Webhook processing error:', error);
      next(error);
    }
  }
}

module.exports = PagamentoController;