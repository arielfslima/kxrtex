const { body, query } = require('express-validator');
const { validateCPF, validateCNPJ, validatePhone } = require('./authValidators');

// Profile update validation
const updateProfileValidation = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('telefone')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !validatePhone(value)) {
        throw new Error('Telefone deve ter um formato válido brasileiro');
      }
      return true;
    }),

  body('data_nascimento')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value) {
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 16) {
          throw new Error('Usuário deve ter pelo menos 16 anos');
        }

        if (age > 120) {
          throw new Error('Data de nascimento inválida');
        }
      }
      return true;
    }),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio não pode exceder 500 caracteres'),

  body('cidade')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s\-\']+$/)
    .withMessage('Cidade contém caracteres inválidos'),

  body('estado')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres (UF)')
    .matches(/^[A-Z]{2}$/)
    .withMessage('Estado deve estar no formato UF (ex: SP, RJ)'),

  body('site_url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('URL do site deve ser válida')
    .isLength({ max: 255 })
    .withMessage('URL do site não pode exceder 255 caracteres'),

  body('instagram_url')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/)
    .withMessage('URL do Instagram deve ser válida')
    .isLength({ max: 255 })
    .withMessage('URL do Instagram não pode exceder 255 caracteres'),

  body('youtube_url')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?(youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/user\/|youtu\.be\/)[a-zA-Z0-9_-]+\/?$/)
    .withMessage('URL do YouTube deve ser válida')
    .isLength({ max: 255 })
    .withMessage('URL do YouTube não pode exceder 255 caracteres'),

  body('soundcloud_url')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/?$/)
    .withMessage('URL do SoundCloud deve ser válida')
    .isLength({ max: 255 })
    .withMessage('URL do SoundCloud não pode exceder 255 caracteres')
];

// Professional profile creation/update validation
const professionalProfileValidation = [
  body('nome_artistico')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome artístico deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\_\.]+$/)
    .withMessage('Nome artístico contém caracteres inválidos'),

  body('categoria_id')
    .isUUID()
    .withMessage('ID da categoria deve ser um UUID válido'),

  body('subcategorias')
    .isArray({ min: 1, max: 5 })
    .withMessage('Deve selecionar entre 1 e 5 subcategorias')
    .custom((subcategorias) => {
      // Check if all subcategories are UUIDs
      const allUUIDs = subcategorias.every(id =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      );
      if (!allUUIDs) {
        throw new Error('Todas as subcategorias devem ser UUIDs válidos');
      }
      return true;
    }),

  body('descricao')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Descrição deve ter entre 50 e 2000 caracteres'),

  body('experiencia_anos')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experiência deve ser entre 0 e 50 anos')
    .toInt(),

  body('valor_minimo')
    .isFloat({ min: 50, max: 100000 })
    .withMessage('Valor mínimo deve estar entre R$ 50,00 e R$ 100.000,00')
    .toFloat(),

  body('area_atendimento')
    .isArray({ min: 1, max: 10 })
    .withMessage('Deve informar entre 1 e 10 cidades de atendimento')
    .custom((areas) => {
      const validAreas = areas.every(area =>
        typeof area === 'string' &&
        area.trim().length >= 2 &&
        area.trim().length <= 100 &&
        /^[a-zA-ZÀ-ÿ\s\-\']+$/.test(area.trim())
      );
      if (!validAreas) {
        throw new Error('Todas as áreas de atendimento devem ser cidades válidas');
      }
      return true;
    }),

  body('disponibilidade')
    .isObject()
    .withMessage('Disponibilidade deve ser um objeto')
    .custom((disponibilidade) => {
      const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

      for (const dia of dias) {
        if (disponibilidade[dia] !== undefined) {
          if (typeof disponibilidade[dia] !== 'boolean') {
            throw new Error(`Disponibilidade para ${dia} deve ser verdadeiro ou falso`);
          }
        }
      }
      return true;
    }),

  body('equipamentos')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Equipamentos não podem exceder 1000 caracteres'),

  body('aceita_viagens')
    .isBoolean()
    .withMessage('Aceita viagens deve ser verdadeiro ou falso'),

  body('distancia_maxima')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Distância máxima deve ser entre 0 e 1000 km')
    .toInt(),

  body('plano')
    .isIn(['free', 'plus', 'pro'])
    .withMessage('Plano deve ser "free", "plus" ou "pro"')
];

// Search professionals validation
const searchProfessionalsValidation = [
  query('categoria')
    .optional()
    .isUUID()
    .withMessage('Categoria deve ser um UUID válido'),

  query('subcategoria')
    .optional()
    .isUUID()
    .withMessage('Subcategoria deve ser um UUID válido'),

  query('cidade')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres'),

  query('valor_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor mínimo deve ser um número positivo')
    .toFloat(),

  query('valor_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor máximo deve ser um número positivo')
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.valor_min && value < parseFloat(req.query.valor_min)) {
        throw new Error('Valor máximo deve ser maior que valor mínimo');
      }
      return true;
    }),

  query('experiencia_min')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experiência mínima deve ser entre 0 e 50 anos')
    .toInt(),

  query('disponibilidade')
    .optional()
    .isIn(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'])
    .withMessage('Disponibilidade deve ser um dia da semana válido'),

  query('aceita_viagens')
    .optional()
    .isBoolean()
    .withMessage('Aceita viagens deve ser verdadeiro ou falso'),

  query('ordenar_por')
    .optional()
    .isIn(['relevancia', 'preco_asc', 'preco_desc', 'experiencia', 'avaliacao', 'mais_recente'])
    .withMessage('Ordenação inválida'),

  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Página deve ser um número entre 1 e 1000')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite deve ser um número entre 1 e 50')
    .toInt(),

  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Termo de busca deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\_\.]+$/)
    .withMessage('Termo de busca contém caracteres inválidos')
];

// Notification preferences validation
const notificationPreferencesValidation = [
  body('email_bookings')
    .optional()
    .isBoolean()
    .withMessage('Preferência de email para bookings deve ser verdadeiro ou falso'),

  body('email_payments')
    .optional()
    .isBoolean()
    .withMessage('Preferência de email para pagamentos deve ser verdadeiro ou falso'),

  body('email_messages')
    .optional()
    .isBoolean()
    .withMessage('Preferência de email para mensagens deve ser verdadeiro ou falso'),

  body('push_bookings')
    .optional()
    .isBoolean()
    .withMessage('Preferência de push para bookings deve ser verdadeiro ou falso'),

  body('push_payments')
    .optional()
    .isBoolean()
    .withMessage('Preferência de push para pagamentos deve ser verdadeiro ou falso'),

  body('push_messages')
    .optional()
    .isBoolean()
    .withMessage('Preferência de push para mensagens deve ser verdadeiro ou falso')
];

module.exports = {
  updateProfileValidation,
  professionalProfileValidation,
  searchProfessionalsValidation,
  notificationPreferencesValidation
};