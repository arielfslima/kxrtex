class AvaliacaoController {
  static async create(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Create avaliacao endpoint - not implemented yet',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByProfissional(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Get avaliacoes by profissional endpoint - not implemented yet',
        data: []
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AvaliacaoController;