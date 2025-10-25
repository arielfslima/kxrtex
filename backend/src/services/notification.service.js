import admin from 'firebase-admin';

// Inicializar Firebase Admin (se credenciais estiverem configuradas)
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return true;

  try {
    // Verificar se as credenciais do Firebase estão configuradas
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
      return true;
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
      return true;
    } else {
      console.warn('⚠️  Firebase credentials not configured. Push notifications will be disabled.');
      return false;
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    return false;
  }
};

// Inicializar ao carregar o módulo
initializeFirebase();

/**
 * Envia notificação push para um usuário específico
 * @param {string} token - FCM token do dispositivo
 * @param {object} notification - Dados da notificação
 * @param {string} notification.title - Título da notificação
 * @param {string} notification.body - Corpo da notificação
 * @param {object} data - Dados adicionais (opcional)
 */
export const sendPushNotification = async (token, notification, data = {}) => {
  if (!firebaseInitialized) {
    console.warn('Firebase not initialized. Skipping push notification.');
    return null;
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      token,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'kxrtex_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
};

/**
 * Envia notificação push para múltiplos dispositivos
 * @param {string[]} tokens - Array de FCM tokens
 * @param {object} notification - Dados da notificação
 * @param {object} data - Dados adicionais (opcional)
 */
export const sendMulticastNotification = async (tokens, notification, data = {}) => {
  if (!firebaseInitialized) {
    console.warn('Firebase not initialized. Skipping multicast notification.');
    return null;
  }

  if (!tokens || tokens.length === 0) {
    console.warn('No tokens provided for multicast notification.');
    return null;
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      tokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'kxrtex_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Sent ${response.successCount}/${tokens.length} notifications`);

    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('❌ Error sending multicast notification:', error);
    throw error;
  }
};

/**
 * Notificações específicas por evento
 */

// Novo booking recebido (para artista)
export const notifyNewBooking = async (artistaTokens, booking) => {
  const notification = {
    title: '🎵 Novo Pedido de Booking',
    body: `${booking.contratante.usuario.nome} enviou um pedido para ${booking.dataEvento}`,
  };

  const data = {
    type: 'NEW_BOOKING',
    bookingId: booking.id,
    screen: 'BookingDetail',
  };

  return sendMulticastNotification(artistaTokens, notification, data);
};

// Booking aceito (para contratante)
export const notifyBookingAccepted = async (contratanteTokens, booking) => {
  const notification = {
    title: '✅ Booking Aceito',
    body: `${booking.artista.nomeArtistico} aceitou seu pedido!`,
  };

  const data = {
    type: 'BOOKING_ACCEPTED',
    bookingId: booking.id,
    screen: 'BookingDetail',
  };

  return sendMulticastNotification(contratanteTokens, notification, data);
};

// Pagamento confirmado
export const notifyPaymentConfirmed = async (userTokens, booking) => {
  const notification = {
    title: '💰 Pagamento Confirmado',
    body: `O pagamento do booking foi confirmado!`,
  };

  const data = {
    type: 'PAYMENT_CONFIRMED',
    bookingId: booking.id,
    screen: 'BookingDetail',
  };

  return sendMulticastNotification(userTokens, notification, data);
};

// Nova mensagem
export const notifyNewMessage = async (userTokens, sender, booking) => {
  const notification = {
    title: `💬 Nova Mensagem de ${sender.nome}`,
    body: 'Você recebeu uma nova mensagem',
  };

  const data = {
    type: 'NEW_MESSAGE',
    bookingId: booking.id,
    senderId: sender.id,
    screen: 'Chat',
  };

  return sendMulticastNotification(userTokens, notification, data);
};

// Lembrete de avaliação
export const notifyReviewReminder = async (userTokens, booking) => {
  const notification = {
    title: '⭐ Avalie o Booking',
    body: 'Não esqueça de avaliar sua experiência!',
  };

  const data = {
    type: 'REVIEW_REMINDER',
    bookingId: booking.id,
    screen: 'ReviewBooking',
  };

  return sendMulticastNotification(userTokens, notification, data);
};

// Lembrete de check-in
export const notifyCheckInReminder = async (artistaTokens, booking) => {
  const notification = {
    title: '📍 Hora do Check-in',
    body: 'Seu evento está próximo. Não esqueça de fazer o check-in!',
  };

  const data = {
    type: 'CHECKIN_REMINDER',
    bookingId: booking.id,
    screen: 'BookingDetail',
  };

  return sendMulticastNotification(artistaTokens, notification, data);
};

// Status do booking alterado
export const notifyBookingStatusChanged = async (userTokens, booking, newStatus) => {
  const statusMessages = {
    CONFIRMADO: '✅ Booking confirmado! Aguardando o evento.',
    EM_ANDAMENTO: '🎵 Evento em andamento!',
    CONCLUIDO: '🎉 Booking concluído com sucesso!',
    CANCELADO: '❌ Booking cancelado.',
  };

  const notification = {
    title: 'Status do Booking Atualizado',
    body: statusMessages[newStatus] || `Status atualizado para ${newStatus}`,
  };

  const data = {
    type: 'BOOKING_STATUS_CHANGED',
    bookingId: booking.id,
    newStatus,
    screen: 'BookingDetail',
  };

  return sendMulticastNotification(userTokens, notification, data);
};

export default {
  sendPushNotification,
  sendMulticastNotification,
  notifyNewBooking,
  notifyBookingAccepted,
  notifyPaymentConfirmed,
  notifyNewMessage,
  notifyReviewReminder,
  notifyCheckInReminder,
  notifyBookingStatusChanged,
};
