const { body, param, query } = require('express-validator');

// Validation for creating a booking
const createBookingValidation = [
  body('profissional_id')
    .isUUID()
    .withMessage('ID do profissional deve ser um UUID válido'),

  body('titulo_evento')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título do evento deve ter entre 5 e 200 caracteres')
    .matches(/^[a-zA-Z0-9\s\-\_\.\,\!\?\(\)]+$/)
    .withMessage('Título contém caracteres inválidos'),

  body('descricao_evento')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição não pode exceder 1000 caracteres'),

  body('tipo_evento')
    .isIn(['festa_privada', 'evento_corporativo', 'casamento', 'aniversario', 'balada', 'festival', 'outro'])
    .withMessage('Tipo de evento inválido'),

  body('data_evento')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const eventDate = new Date(value);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (eventDate < tomorrow) {
        throw new Error('Data do evento deve ser pelo menos amanhã');
      }

      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 2);

      if (eventDate > maxDate) {
        throw new Error('Data do evento não pode ser mais de 2 anos no futuro');
      }

      return true;
    }),

  body('horario_inicio')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário de início deve estar no formato HH:MM'),

  body('horario_fim')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário de fim deve estar no formato HH:MM')
    .custom((value, { req }) => {
      if (value && req.body.horario_inicio) {
        const [startHour, startMin] = req.body.horario_inicio.split(':').map(Number);
        const [endHour, endMin] = value.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;

        // Handle overnight events
        if (endMinutes <= startMinutes) {
          endMinutes += 24 * 60; // Add 24 hours
        }

        const duration = endMinutes - startMinutes;
        if (duration > 12 * 60) { // More than 12 hours
          throw new Error('Duração do evento não pode exceder 12 horas');
        }
      }
      return true;
    }),

  body('endereco_evento')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Endereço deve ter entre 10 e 500 caracteres'),

  body('cidade_evento')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s\-\']+$/)
    .withMessage('Cidade contém caracteres inválidos'),

  body('valor_oferecido')
    .isFloat({ min: 50, max: 100000 })
    .withMessage('Valor oferecido deve estar entre R$ 50,00 e R$ 100.000,00')
    .toFloat(),

  body('observacoes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Observações não podem exceder 1000 caracteres'),

  body('requisitos_tecnicos')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Requisitos técnicos não podem exceder 1000 caracteres')
];

// Validation for booking responses (accept/reject)
const bookingResponseValidation = [
  param('id')
    .isUUID()
    .withMessage('ID do booking deve ser um UUID válido'),

  body('contra_proposta_valor')
    .optional()
    .isFloat({ min: 50, max: 100000 })
    .withMessage('Contra-proposta deve estar entre R$ 50,00 e R$ 100.000,00')
    .toFloat(),

  body('mensagem_resposta')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mensagem de resposta não pode exceder 500 caracteres'),

  body('motivo_rejeicao')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motivo da rejeição deve ter entre 10 e 500 caracteres')
];

// Validation for booking cancellation
const cancelBookingValidation = [
  param('id')
    .isUUID()
    .withMessage('ID do booking deve ser um UUID válido'),

  body('motivo_cancelamento')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motivo do cancelamento deve ter entre 10 e 500 caracteres')
];

// Validation for booking list filters
const bookingListValidation = [
  query('status')
    .optional()
    .isIn(['pendente', 'confirmado', 'rejeitado', 'cancelado', 'concluido'])
    .withMessage('Status inválido'),

  query('tipo')
    .optional()
    .isIn(['festa_privada', 'evento_corporativo', 'casamento', 'aniversario', 'balada', 'festival', 'outro'])
    .withMessage('Tipo de evento inválido'),

  query('data_inicio')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Data de início deve estar no formato ISO8601'),

  query('data_fim')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value && req.query.data_inicio) {
        const startDate = new Date(req.query.data_inicio);
        const endDate = new Date(value);

        if (endDate <= startDate) {
          throw new Error('Data fim deve ser posterior à data início');
        }

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 365) {
          throw new Error('Período de filtro não pode exceder 1 ano');
        }
      }
      return true;
    }),

  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Página deve ser um número entre 1 e 1000')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100')
    .toInt()
];

// Validation for booking details
const bookingDetailsValidation = [
  param('id')
    .isUUID()
    .withMessage('ID do booking deve ser um UUID válido')
];

module.exports = {
  createBookingValidation,
  bookingResponseValidation,
  cancelBookingValidation,
  bookingListValidation,
  bookingDetailsValidation
};