const express = require('express');
const { body } = require('express-validator');
const NotificacaoController = require('../controllers/NotificacaoController');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all notifications for user
router.get('/', NotificacaoController.getAll);

// Get unread count
router.get('/unread-count', NotificacaoController.getUnreadCount);

// Mark specific notification as read
router.patch('/:id/read', NotificacaoController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', NotificacaoController.markAllAsRead);

// Delete specific notification
router.delete('/:id', NotificacaoController.deleteNotification);

// Push notification subscription
router.post('/push/subscribe', [
  body('subscription')
    .notEmpty()
    .withMessage('Subscription data is required')
    .isObject()
    .withMessage('Subscription must be an object'),
  body('subscription.endpoint')
    .notEmpty()
    .withMessage('Subscription endpoint is required'),
  body('subscription.keys')
    .isObject()
    .withMessage('Subscription keys must be an object'),
  body('subscription.keys.p256dh')
    .notEmpty()
    .withMessage('p256dh key is required'),
  body('subscription.keys.auth')
    .notEmpty()
    .withMessage('auth key is required')
], NotificacaoController.subscribeToPush);

// Push notification unsubscription
router.delete('/push/unsubscribe', NotificacaoController.unsubscribeFromPush);

// Notification preferences
router.get('/preferences', NotificacaoController.getPreferences);

router.put('/preferences', [
  body('email_bookings')
    .optional()
    .isBoolean()
    .withMessage('email_bookings must be boolean'),
  body('email_payments')
    .optional()
    .isBoolean()
    .withMessage('email_payments must be boolean'),
  body('email_messages')
    .optional()
    .isBoolean()
    .withMessage('email_messages must be boolean'),
  body('push_bookings')
    .optional()
    .isBoolean()
    .withMessage('push_bookings must be boolean'),
  body('push_payments')
    .optional()
    .isBoolean()
    .withMessage('push_payments must be boolean'),
  body('push_messages')
    .optional()
    .isBoolean()
    .withMessage('push_messages must be boolean')
], NotificacaoController.updatePreferences);

// Test notification (development only)
router.post('/test', NotificacaoController.sendTestNotification);

module.exports = router;