const { body, param } = require('express-validator');

// Create payment validation
const createPaymentValidation = [
  param('booking_id')
    .isUUID()
    .withMessage('ID do booking deve ser um UUID válido'),

  body('metodo_pagamento')
    .isIn(['pix', 'cartao_credito'])
    .withMessage('Método de pagamento deve ser "pix" ou "cartao_credito"'),

  body('parcelas')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Número de parcelas deve ser entre 1 e 12')
    .toInt()
    .custom((value, { req }) => {
      if (req.body.metodo_pagamento === 'pix' && value > 1) {
        throw new Error('PIX não permite parcelamento');
      }
      if (req.body.metodo_pagamento === 'cartao_credito' && value > 3) {
        throw new Error('Cartão de crédito permite no máximo 3 parcelas');
      }
      return true;
    }),

  // Credit card specific validations
  body('cartao_numero')
    .if(body('metodo_pagamento').equals('cartao_credito'))
    .notEmpty()
    .withMessage('Número do cartão é obrigatório para pagamento no cartão')
    .matches(/^\d{13,19}$/)
    .withMessage('Número do cartão deve ter entre 13 e 19 dígitos')
    .custom((value) => {
      // Luhn algorithm validation
      const digits = value.split('').map(Number);
      let sum = 0;
      let isEven = false;

      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      if (sum % 10 !== 0) {
        throw new Error('Número do cartão inválido');
      }
      return true;
    }),

  body('cartao_nome')
    .if(body('metodo_pagamento').equals('cartao_credito'))
    .trim()
    .notEmpty()
    .withMessage('Nome no cartão é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome no cartão deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome no cartão deve conter apenas letras e espaços'),

  body('cartao_vencimento')
    .if(body('metodo_pagamento').equals('cartao_credito'))
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Vencimento deve estar no formato MM/YY')
    .custom((value) => {
      const [month, year] = value.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      const cardYear = parseInt(year);
      const cardMonth = parseInt(month);

      if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
        throw new Error('Cartão vencido');
      }

      if (cardYear > currentYear + 20) {
        throw new Error('Data de vencimento inválida');
      }

      return true;
    }),

  body('cartao_cvv')
    .if(body('metodo_pagamento').equals('cartao_credito'))
    .matches(/^\d{3,4}$/)
    .withMessage('CVV deve ter 3 ou 4 dígitos'),

  body('cartao_cpf')
    .if(body('metodo_pagamento').equals('cartao_credito'))
    .matches(/^\d{11}$/)
    .withMessage('CPF do cartão deve ter 11 dígitos')
    .custom((value) => {
      // CPF validation logic (same as in authValidators)
      const cpf = value;
      if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) {
        throw new Error('CPF inválido');
      }

      const cpfDigits = cpf.split('').map(el => +el);

      const rest = (count) => {
        return (cpfDigits.slice(0, count - 12)
          .reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11 % 10;
      };

      if (!(rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10])) {
        throw new Error('CPF inválido');
      }
      return true;
    })
];

// Get payment status validation
const getPaymentStatusValidation = [
  param('booking_id')
    .isUUID()
    .withMessage('ID do booking deve ser um UUID válido')
];

// Webhook validation
const webhookValidation = [
  body('event')
    .isIn([
      'PAYMENT_RECEIVED',
      'PAYMENT_CONFIRMED',
      'PAYMENT_OVERDUE',
      'PAYMENT_REFUNDED',
      'PAYMENT_DELETED',
      'PAYMENT_UPDATED'
    ])
    .withMessage('Evento de webhook inválido'),

  body('payment')
    .isObject()
    .withMessage('Dados do pagamento são obrigatórios'),

  body('payment.id')
    .notEmpty()
    .withMessage('ID do pagamento no ASAAS é obrigatório'),

  body('payment.value')
    .isFloat({ min: 0 })
    .withMessage('Valor do pagamento deve ser um número positivo')
    .toFloat(),

  body('payment.status')
    .isIn(['PENDING', 'RECEIVED', 'CONFIRMED', 'OVERDUE', 'REFUNDED', 'DELETED'])
    .withMessage('Status do pagamento inválido')
];

// Refund validation
const refundValidation = [
  param('payment_id')
    .isUUID()
    .withMessage('ID do pagamento deve ser um UUID válido'),

  body('motivo')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motivo do estorno deve ter entre 10 e 500 caracteres'),

  body('valor_estorno')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor do estorno deve ser um número positivo')
    .toFloat()
];

// Payment installments validation
const installmentsValidation = [
  body('valor_total')
    .isFloat({ min: 50, max: 100000 })
    .withMessage('Valor total deve estar entre R$ 50,00 e R$ 100.000,00')
    .toFloat(),

  body('parcelas')
    .isInt({ min: 1, max: 12 })
    .withMessage('Número de parcelas deve ser entre 1 e 12')
    .toInt(),

  body('metodo_pagamento')
    .isIn(['cartao_credito'])
    .withMessage('Parcelamento disponível apenas para cartão de crédito')
];

// Credit card brand validation
const validateCreditCardBrand = (cardNumber) => {
  const firstDigit = cardNumber.charAt(0);
  const firstTwoDigits = cardNumber.substring(0, 2);
  const firstFourDigits = cardNumber.substring(0, 4);

  // Visa
  if (firstDigit === '4') {
    return 'visa';
  }

  // MasterCard
  if (firstTwoDigits >= '51' && firstTwoDigits <= '55') {
    return 'mastercard';
  }

  // American Express
  if (firstTwoDigits === '34' || firstTwoDigits === '37') {
    return 'amex';
  }

  // Elo
  const eloRanges = [
    '401178', '401179', '438935', '457631', '457632', '431274',
    '451416', '457393', '504175', '627780', '636297', '636368'
  ];

  for (const range of eloRanges) {
    if (cardNumber.startsWith(range)) {
      return 'elo';
    }
  }

  // Hipercard
  if (firstFourDigits === '6062') {
    return 'hipercard';
  }

  return 'unknown';
};

// Add card brand validation to create payment
const validateCardBrand = body('cartao_numero')
  .if(body('metodo_pagamento').equals('cartao_credito'))
  .custom((value) => {
    const brand = validateCreditCardBrand(value);
    if (brand === 'unknown') {
      throw new Error('Bandeira do cartão não suportada');
    }
    return true;
  });

module.exports = {
  createPaymentValidation,
  getPaymentStatusValidation,
  webhookValidation,
  refundValidation,
  installmentsValidation,
  validateCardBrand,
  validateCreditCardBrand
};