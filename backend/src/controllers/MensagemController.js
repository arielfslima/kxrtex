class MensagemController {
  static async getByBooking(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Get messages by booking endpoint - not implemented yet',
        data: []
      });
    } catch (error) {
      next(error);
    }
  }

  static async send(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Send message endpoint - not implemented yet',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Mark message as read endpoint - not implemented yet',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MensagemController;