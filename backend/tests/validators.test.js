const { validateCPF, validateCNPJ, validatePhone } = require('../src/validators/authValidators');
const { validateCreditCardBrand } = require('../src/validators/paymentValidators');

describe('Validators', () => {
  describe('CPF Validation', () => {
    it('should validate correct CPF', () => {
      expect(validateCPF('11144477735')).toBe(true);
      expect(validateCPF('111.444.777-35')).toBe(true);
    });

    it('should reject invalid CPF', () => {
      expect(validateCPF('12345678901')).toBe(false);
      expect(validateCPF('11111111111')).toBe(false);
      expect(validateCPF('123')).toBe(false);
      expect(validateCPF('')).toBe(false);
    });
  });

  describe('CNPJ Validation', () => {
    it('should validate correct CNPJ', () => {
      expect(validateCNPJ('11444777000161')).toBe(true);
      expect(validateCNPJ('11.444.777/0001-61')).toBe(true);
    });

    it('should reject invalid CNPJ', () => {
      expect(validateCNPJ('12345678901234')).toBe(false);
      expect(validateCNPJ('11111111111111')).toBe(false);
      expect(validateCNPJ('123')).toBe(false);
      expect(validateCNPJ('')).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should validate Brazilian phone numbers', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true);
      expect(validatePhone('11999999999')).toBe(true);
      expect(validatePhone('+55 11 99999-9999')).toBe(true);
      expect(validatePhone('+5511999999999')).toBe(true);
      expect(validatePhone('(21) 98888-7777')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('(00) 99999-9999')).toBe(false);
      expect(validatePhone('11 12345')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('Credit Card Brand Validation', () => {
    it('should identify Visa cards', () => {
      expect(validateCreditCardBrand('4111111111111111')).toBe('visa');
      expect(validateCreditCardBrand('4000000000000002')).toBe('visa');
    });

    it('should identify MasterCard cards', () => {
      expect(validateCreditCardBrand('5555555555554444')).toBe('mastercard');
      expect(validateCreditCardBrand('5105105105105100')).toBe('mastercard');
    });

    it('should identify American Express cards', () => {
      expect(validateCreditCardBrand('378282246310005')).toBe('amex');
      expect(validateCreditCardBrand('371449635398431')).toBe('amex');
    });

    it('should return unknown for unrecognized cards', () => {
      expect(validateCreditCardBrand('1234567890123456')).toBe('unknown');
      expect(validateCreditCardBrand('9999999999999999')).toBe('unknown');
    });
  });
});

describe('Validation Middlewares', () => {
  const { validationResult } = require('express-validator');
  const { registerValidation } = require('../src/validators/authValidators');

  // Mock request and response objects
  const mockRequest = (body = {}) => ({
    body,
    query: {},
    params: {}
  });

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
  });

  describe('Registration Validation', () => {
    it('should pass valid registration data', async () => {
      const req = mockRequest({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'MinhaSenh@123',
        confirmar_senha: 'MinhaSenh@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: '11144477735',
        aceita_termos: 'true'
      });

      // Run all validation middleware
      for (const validation of registerValidation) {
        await validation(req, mockResponse(), mockNext);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const req = mockRequest({
        nome: 'João Silva',
        email: 'invalid-email',
        senha: 'MinhaSenh@123',
        confirmar_senha: 'MinhaSenh@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: '11144477735',
        aceita_termos: 'true'
      });

      // Run all validation middleware
      for (const validation of registerValidation) {
        await validation(req, mockResponse(), mockNext);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'email'
          })
        ])
      );
    });

    it('should fail with weak password', async () => {
      const req = mockRequest({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: '123456',
        confirmar_senha: '123456',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: '11144477735',
        aceita_termos: 'true'
      });

      // Run all validation middleware
      for (const validation of registerValidation) {
        await validation(req, mockResponse(), mockNext);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'senha'
          })
        ])
      );
    });

    it('should fail when passwords do not match', async () => {
      const req = mockRequest({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'MinhaSenh@123',
        confirmar_senha: 'DifferentPassword@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: '11144477735',
        aceita_termos: 'true'
      });

      // Run all validation middleware
      for (const validation of registerValidation) {
        await validation(req, mockResponse(), mockNext);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'confirmar_senha'
          })
        ])
      );
    });

    it('should fail with invalid CPF', async () => {
      const req = mockRequest({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'MinhaSenh@123',
        confirmar_senha: 'MinhaSenh@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: '12345678901', // Invalid CPF
        aceita_termos: 'true'
      });

      // Run all validation middleware
      for (const validation of registerValidation) {
        await validation(req, mockResponse(), mockNext);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'cpf_cnpj'
          })
        ])
      );
    });

    it('should fail when terms are not accepted', async () => {
      const req = mockRequest({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'MinhaSenh@123',
        confirmar_senha: 'MinhaSenh@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: '11144477735',
        aceita_termos: 'false'
      });

      // Run all validation middleware
      for (const validation of registerValidation) {
        await validation(req, mockResponse(), mockNext);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'aceita_termos'
          })
        ])
      );
    });
  });
});