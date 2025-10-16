const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

const { User, Profissional, Booking, Categoria } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

class BookingController {
  static async list(req, res, next) {
    try {
      const {
        status,
        tipo,
        data_inicio,
        data_fim,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      const userId = req.user.id;

      // Filter by user role
      if (req.user.tipo === 'contratante') {
        where.contratante_id = userId;
      } else if (req.user.tipo === 'artista') {
        // Get professional profile
        const profissional = await Profissional.findOne({
          where: { usuario_id: userId }
        });

        if (profissional) {
          where.profissional_id = profissional.id;
        } else {
          // Artist without profile has no bookings
          return res.json({
            success: true,
            data: {
              bookings: [],
              total: 0,
              pagina_atual: parseInt(page),
              total_paginas: 0,
              tem_proxima: false
            }
          });
        }
      }

      // Filters
      if (status) {
        where.status = status;
      }

      if (tipo) {
        where.tipo_evento = tipo;
      }

      if (data_inicio) {
        where.data_evento = {
          ...where.data_evento,
          [Op.gte]: new Date(data_inicio)
        };
      }

      if (data_fim) {
        where.data_evento = {
          ...where.data_evento,
          [Op.lte]: new Date(data_fim)
        };
      }

      const bookings = await Booking.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'contratante',
            attributes: ['id', 'nome', 'foto_perfil_url', 'verificado']
          },
          {
            model: Profissional,
            as: 'profissional',
            attributes: ['id', 'nome_artistico', 'foto_perfil_url', 'avaliacao_media'],
            include: [
              {
                model: User,
                as: 'usuario',
                attributes: ['id', 'nome', 'foto_perfil_url', 'verificado']
              },
              {
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nome', 'slug']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset,
        distinct: true
      });

      res.json({
        success: true,
        data: {
          bookings: bookings.rows,
          total: bookings.count,
          pagina_atual: parseInt(page),
          total_paginas: Math.ceil(bookings.count / limit),
          tem_proxima: page * limit < bookings.count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: User,
            as: 'contratante',
            attributes: ['id', 'nome', 'foto_perfil_url', 'verificado', 'telefone']
          },
          {
            model: Profissional,
            as: 'profissional',
            include: [
              {
                model: User,
                as: 'usuario',
                attributes: ['id', 'nome', 'foto_perfil_url', 'verificado', 'telefone']
              },
              {
                model: Categoria,
                as: 'categoria'
              }
            ]
          }
        ]
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

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user.id;

      // Only contratantes can create bookings
      if (req.user.tipo !== 'contratante') {
        throw new AppError('Apenas contratantes podem criar bookings', 403, 'INVALID_USER_TYPE');
      }

      const {
        profissional_id,
        titulo_evento,
        descricao_evento,
        tipo_evento,
        data_evento,
        horario_inicio,
        horario_fim,
        endereco_evento,
        cidade_evento,
        estado_evento,
        valor_booking,
        mensagem_contratante,
        equipamento_fornecido,
        descricao_equipamento,
        numero_convidados,
        requer_adiantamento,
        percentual_adiantamento,
        motivo_adiantamento
      } = req.body;

      // Validate professional exists and is active
      const profissional = await Profissional.findByPk(profissional_id, {
        include: [{
          model: User,
          as: 'usuario',
          where: { status: 'ativo' }
        }]
      });

      if (!profissional) {
        throw new AppError('Artista não encontrado ou inativo', 404, 'PROFISSIONAL_NOT_FOUND');
      }

      // Calculate event duration
      const inicio = new Date(`1970-01-01T${horario_inicio}`);
      const fim = new Date(`1970-01-01T${horario_fim}`);
      let horas_evento = (fim - inicio) / (1000 * 60 * 60);

      if (horas_evento <= 0) {
        // Handle events that cross midnight
        horas_evento += 24;
      }

      // Validate minimum values
      if (valor_booking < 50) {
        throw new AppError('Valor mínimo do booking é R$ 50', 400, 'INVALID_VALUE');
      }

      if (horas_evento < 1) {
        throw new AppError('Duração mínima do evento é 1 hora', 400, 'INVALID_DURATION');
      }

      // Validate event date is in the future
      const eventDate = new Date(data_evento);
      const now = new Date();
      if (eventDate <= now) {
        throw new AppError('Data do evento deve ser no futuro', 400, 'INVALID_EVENT_DATE');
      }

      // Validate advance payment request
      if (requer_adiantamento) {
        if (!percentual_adiantamento || percentual_adiantamento < 10 || percentual_adiantamento > 40) {
          throw new AppError('Percentual de adiantamento deve estar entre 10% e 40%', 400, 'INVALID_ADVANCE_PERCENTAGE');
        }

        if (!motivo_adiantamento) {
          throw new AppError('Motivo do adiantamento é obrigatório', 400, 'ADVANCE_REASON_REQUIRED');
        }
      }

      // Set expiration date (48 hours from now)
      const expira_em = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // Create booking
      const booking = await Booking.create({
        contratante_id: userId,
        profissional_id,
        titulo_evento,
        descricao_evento,
        tipo_evento,
        data_evento: eventDate,
        horario_inicio,
        horario_fim,
        endereco_evento,
        cidade_evento,
        estado_evento,
        valor_booking,
        valor_original: valor_booking,
        horas_evento,
        mensagem_contratante,
        equipamento_fornecido: equipamento_fornecido === true,
        descricao_equipamento,
        numero_convidados,
        expira_em,
        requer_adiantamento: requer_adiantamento === true,
        percentual_adiantamento,
        motivo_adiantamento
      });

      // Load complete booking data
      const completeBooking = await Booking.findByPk(booking.id, {
        include: [
          {
            model: User,
            as: 'contratante',
            attributes: ['id', 'nome', 'foto_perfil_url']
          },
          {
            model: Profissional,
            as: 'profissional',
            include: [
              {
                model: User,
                as: 'usuario',
                attributes: ['id', 'nome', 'foto_perfil_url']
              }
            ]
          }
        ]
      });

      // Send notification to artist
      try {
        await notificationService.notifyBookingRequested(profissional.usuario_id, booking);
      } catch (notificationError) {
        logger.error('Error sending booking request notification:', notificationError);
      }

      logger.info(`Booking created: ${booking.id} by user ${userId} for professional ${profissional_id}`);

      res.status(201).json({
        success: true,
        message: 'Proposta de booking enviada com sucesso!',
        data: completeBooking
      });
    } catch (error) {
      next(error);
    }
  }

  static async accept(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { contra_proposta_valor, mensagem_resposta } = req.body;

      // Get booking
      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: Profissional,
            as: 'profissional',
            include: [{
              model: User,
              as: 'usuario'
            }]
          },
          {
            model: User,
            as: 'contratante'
          }
        ]
      });

      if (!booking) {
        throw new AppError('Booking não encontrado', 404, 'BOOKING_NOT_FOUND');
      }

      // Check if user is the artist
      if (booking.profissional.usuario_id !== userId) {
        throw new AppError('Apenas o artista pode aceitar o booking', 403, 'ACCESS_DENIED');
      }

      // Check if booking is still pending
      if (booking.status !== 'pendente') {
        throw new AppError('Booking não está mais pendente', 400, 'BOOKING_NOT_PENDING');
      }

      // Check if booking is expired
      if (booking.isExpired()) {
        await booking.update({ status: 'rejeitado' });
        throw new AppError('Booking expirado', 400, 'BOOKING_EXPIRED');
      }

      let finalValue = booking.valor_booking;

      // Handle counter-proposal
      if (contra_proposta_valor && contra_proposta_valor !== booking.valor_booking) {
        if (contra_proposta_valor < 50) {
          throw new AppError('Valor mínimo é R$ 50', 400, 'INVALID_VALUE');
        }
        finalValue = contra_proposta_valor;
      }

      // Update booking
      await booking.update({
        status: 'confirmado',
        valor_booking: finalValue,
        respondido_em: new Date(),
        confirmado_em: new Date()
      });

      // Send notification to contratante
      try {
        await notificationService.notifyBookingAccepted(booking.contratante_id, booking);
      } catch (notificationError) {
        logger.error('Error sending booking acceptance notification:', notificationError);
      }

      logger.info(`Booking accepted: ${id} by artist ${userId}`);

      // Load updated booking
      const updatedBooking = await Booking.findByPk(id, {
        include: [
          {
            model: User,
            as: 'contratante',
            attributes: ['id', 'nome', 'foto_perfil_url']
          },
          {
            model: Profissional,
            as: 'profissional',
            include: [
              {
                model: User,
                as: 'usuario',
                attributes: ['id', 'nome', 'foto_perfil_url']
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Booking aceito com sucesso!',
        data: updatedBooking
      });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { motivo_rejeicao } = req.body;

      // Get booking
      const booking = await Booking.findByPk(id, {
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

      // Check if user is the artist
      if (booking.profissional.usuario_id !== userId) {
        throw new AppError('Apenas o artista pode rejeitar o booking', 403, 'ACCESS_DENIED');
      }

      // Check if booking is still pending
      if (booking.status !== 'pendente') {
        throw new AppError('Booking não está mais pendente', 400, 'BOOKING_NOT_PENDING');
      }

      // Update booking
      await booking.update({
        status: 'rejeitado',
        respondido_em: new Date(),
        motivo_cancelamento: motivo_rejeicao || 'Rejeitado pelo artista'
      });

      // Send notification to contratante
      try {
        await notificationService.notifyBookingRejected(
          booking.contratante_id,
          booking,
          motivo_rejeicao || 'Rejeitado pelo artista'
        );
      } catch (notificationError) {
        logger.error('Error sending booking rejection notification:', notificationError);
      }

      logger.info(`Booking rejected: ${id} by artist ${userId}`);

      res.json({
        success: true,
        message: 'Booking rejeitado com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { motivo_cancelamento } = req.body;

      // Get booking
      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: Profissional,
            as: 'profissional',
            include: [{
              model: User,
              as: 'usuario'
            }]
          },
          {
            model: User,
            as: 'contratante'
          }
        ]
      });

      if (!booking) {
        throw new AppError('Booking não encontrado', 404, 'BOOKING_NOT_FOUND');
      }

      // Check if user can cancel
      const isContratante = booking.contratante_id === userId;
      const isArtista = booking.profissional.usuario_id === userId;
      const isAdmin = req.user.tipo === 'admin';

      if (!isContratante && !isArtista && !isAdmin) {
        throw new AppError('Acesso negado', 403, 'ACCESS_DENIED');
      }

      // Check if booking can be cancelled
      if (booking.status !== 'confirmado') {
        throw new AppError('Apenas bookings confirmados podem ser cancelados', 400, 'INVALID_BOOKING_STATUS');
      }

      // Check cancellation policy (24h before event)
      if (!booking.canCancel() && !isAdmin) {
        throw new AppError('Cancelamento não permitido. Deve ser feito com pelo menos 24h de antecedência.', 400, 'CANCELLATION_NOT_ALLOWED');
      }

      let quem_cancelou;
      if (isContratante) quem_cancelou = 'contratante';
      else if (isArtista) quem_cancelou = 'artista';
      else quem_cancelou = 'admin';

      // Calculate cancellation fee if applicable
      let taxa_cancelamento = 0;
      const hoursUntilEvent = (new Date(booking.data_evento) - new Date()) / (1000 * 60 * 60);

      if (hoursUntilEvent < 24 && hoursUntilEvent > 0) {
        taxa_cancelamento = 0.1; // 10% fee for last-minute cancellation
      }

      // Update booking
      await booking.update({
        status: 'cancelado',
        cancelado_em: new Date(),
        motivo_cancelamento: motivo_cancelamento || 'Cancelado',
        quem_cancelou,
        taxa_cancelamento
      });

      // TODO: Process refund/payment adjustments
      // TODO: Send notifications
      // TODO: Send Socket.io notification

      logger.info(`Booking cancelled: ${id} by ${quem_cancelou} ${userId}`);

      res.json({
        success: true,
        message: 'Booking cancelado com sucesso!',
        data: {
          taxa_cancelamento,
          valor_reembolso: booking.valor_booking * (1 - taxa_cancelamento)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookingController;