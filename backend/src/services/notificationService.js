const nodemailer = require('nodemailer');
const { Notificacao, User } = require('../models');
const logger = require('../utils/logger');
const webpush = require('web-push');

class NotificationService {
  constructor() {
    this.initializeEmailTransporter();
    this.initializePushNotifications();
  }

  initializeEmailTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      logger.info('Email transporter initialized');
    } else {
      logger.warn('Email configuration not found, email notifications disabled');
    }
  }

  initializePushNotifications() {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:noreply@kxrtex.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      logger.info('Push notifications initialized');
    } else {
      logger.warn('VAPID keys not found, push notifications disabled');
    }
  }

  async createNotification({
    usuarioId,
    tipo,
    titulo,
    mensagem,
    dadosContexto = {},
    enviarEmail = true,
    enviarPush = true
  }) {
    try {
      const notificacao = await Notificacao.create({
        usuario_id: usuarioId,
        tipo,
        titulo,
        mensagem,
        dados_contexto: dadosContexto
      });

      const user = await User.findByPk(usuarioId);
      if (!user) {
        logger.error(`User not found for notification: ${usuarioId}`);
        return notificacao;
      }

      const promises = [];

      if (enviarEmail && this.emailTransporter && user.email) {
        promises.push(this.sendEmailNotification(user, notificacao));
      }

      if (enviarPush && user.push_subscription) {
        promises.push(this.sendPushNotification(user, notificacao));
      }

      await Promise.allSettled(promises);

      // Send real-time notification via Socket.io
      if (global.io) {
        try {
          await global.io.sendNotification(usuarioId, {
            id: notificacao.id,
            tipo: notificacao.tipo,
            titulo: notificacao.titulo,
            mensagem: notificacao.mensagem,
            dados_contexto: notificacao.dados_contexto,
            created_at: notificacao.created_at
          });
        } catch (socketError) {
          logger.error('Error sending socket notification:', socketError);
        }
      }

      logger.info(`Notification created: ${notificacao.id} for user ${usuarioId}`);
      return notificacao;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendEmailNotification(user, notificacao) {
    try {
      const emailTemplate = this.getEmailTemplate(notificacao.tipo, notificacao);

      const mailOptions = {
        from: `"KXRTEX" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: notificacao.titulo,
        html: emailTemplate
      };

      await this.emailTransporter.sendMail(mailOptions);

      await notificacao.update({ enviado_email: true });
      logger.info(`Email sent for notification ${notificacao.id}`);
    } catch (error) {
      logger.error(`Error sending email for notification ${notificacao.id}:`, error);
    }
  }

  async sendPushNotification(user, notificacao) {
    try {
      const payload = JSON.stringify({
        title: notificacao.titulo,
        body: notificacao.mensagem,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        data: {
          notificationId: notificacao.id,
          type: notificacao.tipo,
          context: notificacao.dados_contexto
        }
      });

      await webpush.sendNotification(
        JSON.parse(user.push_subscription),
        payload
      );

      await notificacao.update({ enviado_push: true });
      logger.info(`Push notification sent for notification ${notificacao.id}`);
    } catch (error) {
      logger.error(`Error sending push notification for notification ${notificacao.id}:`, error);
    }
  }

  getEmailTemplate(tipo, notificacao) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notificacao.titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KXRTEX</h1>
            <h2>${notificacao.titulo}</h2>
          </div>
          <div class="content">
            <p>${notificacao.mensagem}</p>
            ${this.getTypeSpecificContent(tipo, notificacao)}
          </div>
          <div class="footer">
            <p>KXRTEX - Conectando artistas e eventos</p>
            <p>Se você não deseja mais receber esses emails, <a href="#">clique aqui</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return baseTemplate;
  }

  getTypeSpecificContent(tipo, notificacao) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    switch (tipo) {
      case 'booking_solicitado':
        return `
          <a href="${baseUrl}/bookings/${notificacao.dados_contexto.bookingId}" class="button">
            Ver Solicitação
          </a>
        `;

      case 'booking_aceito':
        return `
          <a href="${baseUrl}/bookings/${notificacao.dados_contexto.bookingId}" class="button">
            Ver Booking
          </a>
        `;

      case 'pagamento_aprovado':
        return `
          <a href="${baseUrl}/payments/${notificacao.dados_contexto.pagamentoId}" class="button">
            Ver Pagamento
          </a>
        `;

      case 'nova_mensagem':
        return `
          <a href="${baseUrl}/chat/${notificacao.dados_contexto.chatId}" class="button">
            Ver Conversa
          </a>
        `;

      default:
        return '';
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notificacao = await Notificacao.findOne({
        where: {
          id: notificationId,
          usuario_id: userId
        }
      });

      if (!notificacao) {
        throw new Error('Notification not found');
      }

      await notificacao.update({
        lida: true,
        lida_em: new Date()
      });

      return notificacao;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notificacao.update(
        {
          lida: true,
          lida_em: new Date()
        },
        {
          where: {
            usuario_id: userId,
            lida: false
          }
        }
      );

      logger.info(`All notifications marked as read for user ${userId}`);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, { page = 1, limit = 20, onlyUnread = false } = {}) {
    try {
      const where = { usuario_id: userId };
      if (onlyUnread) {
        where.lida = false;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Notificacao.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      return {
        notifications: rows,
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await Notificacao.count({
        where: {
          usuario_id: userId,
          lida: false
        }
      });

      return count;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Notification helpers for specific events
  async notifyBookingRequested(profissionalId, booking) {
    return this.createNotification({
      usuarioId: profissionalId,
      tipo: 'booking_solicitado',
      titulo: 'Nova Solicitação de Booking',
      mensagem: `Você recebeu uma nova solicitação de booking para "${booking.titulo_evento}".`,
      dadosContexto: {
        bookingId: booking.id,
        contratanteId: booking.contratante_id
      }
    });
  }

  async notifyBookingAccepted(contratanteId, booking) {
    return this.createNotification({
      usuarioId: contratanteId,
      tipo: 'booking_aceito',
      titulo: 'Booking Aceito!',
      mensagem: `Seu booking "${booking.titulo_evento}" foi aceito pelo artista.`,
      dadosContexto: {
        bookingId: booking.id,
        profissionalId: booking.profissional_id
      }
    });
  }

  async notifyBookingRejected(contratanteId, booking, motivo) {
    return this.createNotification({
      usuarioId: contratanteId,
      tipo: 'booking_rejeitado',
      titulo: 'Booking Rejeitado',
      mensagem: `Seu booking "${booking.titulo_evento}" foi rejeitado. ${motivo ? `Motivo: ${motivo}` : ''}`,
      dadosContexto: {
        bookingId: booking.id,
        profissionalId: booking.profissional_id,
        motivo
      }
    });
  }

  async notifyPaymentApproved(userId, pagamento) {
    return this.createNotification({
      usuarioId: userId,
      tipo: 'pagamento_aprovado',
      titulo: 'Pagamento Aprovado',
      mensagem: `Seu pagamento de R$ ${(pagamento.valor_total / 100).toFixed(2)} foi aprovado.`,
      dadosContexto: {
        pagamentoId: pagamento.id,
        bookingId: pagamento.booking_id
      }
    });
  }

  async notifyNewMessage(userId, message) {
    return this.createNotification({
      usuarioId: userId,
      tipo: 'nova_mensagem',
      titulo: 'Nova Mensagem',
      mensagem: 'Você recebeu uma nova mensagem.',
      dadosContexto: {
        messageId: message.id,
        chatId: message.booking_id,
        senderId: message.remetente_id
      },
      enviarPush: true,
      enviarEmail: false
    });
  }
}

module.exports = new NotificationService();