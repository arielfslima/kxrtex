const { body } = require('express-validator');

// Brazilian CPF validation
const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) {
    return false;
  }

  const cpfDigits = cpf.split('').map(el => +el);

  const rest = (count) => {
    return (cpfDigits.slice(0, count - 12)
      .reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11 % 10;
  };

  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
};

// Brazilian CNPJ validation
const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;

  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  return resultado === parseInt(digitos.charAt(1));
};

// Phone validation for Brazilian numbers
const validatePhone = (phone) => {
  const phoneRegex = /^(?:\+55)?(?:\s)?(?:\()?(?:[1-9]{2})(?:\))?(?:\s)?(?:9)?(?:\d{4})(?:-)?(?:\d{4})$/;
  return phoneRegex.test(phone);
};

// Registration validation
const registerValidation = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email não pode exceder 255 caracteres'),

  body('senha')
    .isLength({ min: 8, max: 128 })
    .withMessage('Senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),

  body('confirmar_senha')
    .custom((value, { req }) => {
      if (value !== req.body.senha) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    }),

  body('tipo')
    .isIn(['contratante', 'artista'])
    .withMessage('Tipo deve ser "contratante" ou "artista"'),

  body('telefone')
    .trim()
    .custom((value) => {
      if (!validatePhone(value)) {
        throw new Error('Telefone deve ter um formato válido brasileiro');
      }
      return true;
    }),

  body('cpf_cnpj')
    .trim()
    .custom((value) => {
      const cleaned = value.replace(/[^\d]+/g, '');

      if (cleaned.length === 11) {
        if (!validateCPF(value)) {
          throw new Error('CPF inválido');
        }
      } else if (cleaned.length === 14) {
        if (!validateCNPJ(value)) {
          throw new Error('CNPJ inválido');
        }
      } else {
        throw new Error('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      }

      return true;
    }),

  body('data_nascimento')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 16) {
        throw new Error('Usuário deve ter pelo menos 16 anos');
      }

      if (age > 120) {
        throw new Error('Data de nascimento inválida');
      }

      return true;
    }),

  body('aceita_termos')
    .equals('true')
    .withMessage('É necessário aceitar os termos de uso'),

  body('aceita_marketing')
    .optional()
    .isBoolean()
    .withMessage('Aceita marketing deve ser verdadeiro ou falso')
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),

  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 1, max: 128 })
    .withMessage('Senha inválida')
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
];

// Reset password validation
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório')
    .isLength({ min: 10, max: 500 })
    .withMessage('Token inválido'),

  body('nova_senha')
    .isLength({ min: 8, max: 128 })
    .withMessage('Nova senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Nova senha deve conter ao menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),

  body('confirmar_nova_senha')
    .custom((value, { req }) => {
      if (value !== req.body.nova_senha) {
        throw new Error('Confirmação de nova senha não confere');
      }
      return true;
    })
];

// Change password validation
const changePasswordValidation = [
  body('senha_atual')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),

  body('nova_senha')
    .isLength({ min: 8, max: 128 })
    .withMessage('Nova senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Nova senha deve conter ao menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')
    .custom((value, { req }) => {
      if (value === req.body.senha_atual) {
        throw new Error('Nova senha deve ser diferente da senha atual');
      }
      return true;
    }),

  body('confirmar_nova_senha')
    .custom((value, { req }) => {
      if (value !== req.body.nova_senha) {
        throw new Error('Confirmação de nova senha não confere');
      }
      return true;
    })
];

// Refresh token validation
const refreshTokenValidation = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token é obrigatório')
    .isJWT()
    .withMessage('Refresh token deve ser um JWT válido')
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  refreshTokenValidation,
  validateCPF,
  validateCNPJ,
  validatePhone
};