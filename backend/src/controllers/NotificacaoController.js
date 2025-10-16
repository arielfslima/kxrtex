const { validationResult } = require('express-validator');
const { AppError } = require('../middlewares/errorHandler');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class NotificacaoController {
  static async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, unread_only } = req.query;

      const onlyUnread = unread_only === 'true';

      const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        onlyUnread
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        message: 'Notificação marcada como lida',
        data: notification
      });
    } catch (error) {
      if (error.message === 'Notification not found') {
        next(new AppError('Notificação não encontrada', 404, 'NOTIFICATION_NOT_FOUND'));
      } else {
        next(error);
      }
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas'
      });
    } catch (error) {
      next(error);
    }
  }

  static async subscribeToPush(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const { subscription } = req.body;
      const userId = req.user.id;

      const { User } = require('../models');
      await User.update(
        { push_subscription: JSON.stringify(subscription) },
        { where: { id: userId } }
      );

      logger.info(`Push subscription updated for user ${userId}`);

      res.json({
        success: true,
        message: 'Inscrição para notificações push atualizada'
      });
    } catch (error) {
      next(error);
    }
  }

  static async unsubscribeFromPush(req, res, next) {
    try {
      const userId = req.user.id;

      const { User } = require('../models');
      await User.update(
        { push_subscription: null },
        { where: { id: userId } }
      );

      logger.info(`Push subscription removed for user ${userId}`);

      res.json({
        success: true,
        message: 'Inscrição para notificações push removida'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user.id;
      const {
        email_bookings = true,
        email_payments = true,
        email_messages = false,
        push_bookings = true,
        push_payments = true,
        push_messages = true
      } = req.body;

      const { User } = require('../models');
      await User.update({
        notification_preferences: {
          email: {
            bookings: email_bookings,
            payments: email_payments,
            messages: email_messages
          },
          push: {
            bookings: push_bookings,
            payments: push_payments,
            messages: push_messages
          }
        }
      }, {
        where: { id: userId }
      });

      logger.info(`Notification preferences updated for user ${userId}`);

      res.json({
        success: true,
        message: 'Preferências de notificação atualizadas'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPreferences(req, res, next) {
    try {
      const userId = req.user.id;

      const { User } = require('../models');
      const user = await User.findByPk(userId, {
        attributes: ['notification_preferences']
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      const defaultPreferences = {
        email: {
          bookings: true,
          payments: true,
          messages: false
        },
        push: {
          bookings: true,
          payments: true,
          messages: true
        }
      };

      res.json({
        success: true,
        data: user.notification_preferences || defaultPreferences
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendTestNotification(req, res, next) {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('Funcionalidade não disponível em produção', 403, 'NOT_ALLOWED');
      }

      const userId = req.user.id;

      await notificationService.createNotification({
        usuarioId: userId,
        tipo: 'sistema',
        titulo: 'Notificação de Teste',
        mensagem: 'Esta é uma notificação de teste para verificar se o sistema está funcionando corretamente.',
        dadosContexto: { test: true }
      });

      res.json({
        success: true,
        message: 'Notificação de teste enviada'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { Notificacao } = require('../models');
      const notification = await Notificacao.findOne({
        where: {
          id: id,
          usuario_id: userId
        }
      });

      if (!notification) {
        throw new AppError('Notificação não encontrada', 404, 'NOTIFICATION_NOT_FOUND');
      }

      await notification.destroy();

      logger.info(`Notification ${id} deleted by user ${userId}`);

      res.json({
        success: true,
        message: 'Notificação excluída'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificacaoController;