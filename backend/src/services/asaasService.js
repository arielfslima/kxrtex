const axios = require('axios');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

class AsaasService {
  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY;
    this.apiUrl = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'access_token': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('ASAAS Request:', {
          method: config.method,
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('ASAAS Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('ASAAS Response:', {
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('ASAAS Response Error:', {
          status: error.response?.status,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  // Create customer
  async createCustomer(userData) {
    try {
      const customerData = {
        name: userData.nome,
        email: userData.email,
        phone: userData.telefone,
        cpfCnpj: userData.cpf_cnpj,
        externalReference: userData.id
      };

      const response = await this.client.post('/customers', customerData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar cliente no ASAAS');
    }
  }

  // Update customer
  async updateCustomer(customerId, userData) {
    try {
      const customerData = {
        name: userData.nome,
        email: userData.email,
        phone: userData.telefone,
        cpfCnpj: userData.cpf_cnpj
      };

      const response = await this.client.post(`/customers/${customerId}`, customerData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao atualizar cliente no ASAAS');
    }
  }

  // Create payment
  async createPayment(paymentData) {
    try {
      const payment = {
        customer: paymentData.customerId,
        billingType: paymentData.billingType, // 'PIX', 'CREDIT_CARD', 'BOLETO'
        value: paymentData.value,
        dueDate: paymentData.dueDate,
        description: paymentData.description,
        externalReference: paymentData.externalReference,
        installmentCount: paymentData.installmentCount || 1,
        installmentValue: paymentData.installmentValue,
        callback: {
          successUrl: paymentData.successUrl,
          autoRedirect: false
        },
        split: paymentData.split || [],
        discount: paymentData.discount,
        interest: paymentData.interest,
        fine: paymentData.fine
      };

      // Add PIX specific configuration
      if (paymentData.billingType === 'PIX') {
        payment.pixAddressKey = paymentData.pixAddressKey;
      }

      // Add credit card specific configuration
      if (paymentData.billingType === 'CREDIT_CARD') {
        payment.creditCard = paymentData.creditCard;
        payment.creditCardHolderInfo = paymentData.creditCardHolderInfo;
      }

      const response = await this.client.post('/payments', payment);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar cobrança no ASAAS');
    }
  }

  // Get payment details
  async getPayment(paymentId) {
    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao buscar cobrança no ASAAS');
    }
  }

  // Get PIX QR Code
  async getPixQrCode(paymentId) {
    try {
      const response = await this.client.get(`/payments/${paymentId}/pixQrCode`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao buscar QR Code PIX no ASAAS');
    }
  }

  // Cancel payment
  async cancelPayment(paymentId) {
    try {
      const response = await this.client.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao cancelar cobrança no ASAAS');
    }
  }

  // Create payment split (for platform fees)
  async createSplit(paymentId, splitData) {
    try {
      const split = {
        walletId: splitData.walletId,
        fixedValue: splitData.fixedValue,
        percentualValue: splitData.percentualValue,
        totalValue: splitData.totalValue
      };

      const response = await this.client.post(`/payments/${paymentId}/split`, split);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar split de pagamento no ASAAS');
    }
  }

  // Create transfer
  async createTransfer(transferData) {
    try {
      const transfer = {
        value: transferData.value,
        bankAccount: transferData.bankAccount,
        operationType: transferData.operationType || 'PIX',
        pixAddressKey: transferData.pixAddressKey,
        pixAddressKeyType: transferData.pixAddressKeyType,
        description: transferData.description,
        scheduleDate: transferData.scheduleDate
      };

      const response = await this.client.post('/transfers', transfer);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar transferência no ASAAS');
    }
  }

  // Get account balance
  async getBalance() {
    try {
      const response = await this.client.get('/finance/balance');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao buscar saldo no ASAAS');
    }
  }

  // Webhook verification
  verifyWebhook(signature, payload) {
    const crypto = require('crypto');
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;

    if (!webhookToken) {
      logger.warn('ASAAS webhook token not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookToken)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  // Helper method to handle errors
  handleError(error, defaultMessage) {
    if (error.response?.data) {
      const asaasError = error.response.data;
      let message = defaultMessage;

      if (asaasError.errors && asaasError.errors.length > 0) {
        message = asaasError.errors[0].description || asaasError.errors[0].code;
      } else if (asaasError.message) {
        message = asaasError.message;
      }

      throw new AppError(message, error.response.status || 400, 'ASAAS_ERROR');
    }

    throw new AppError(defaultMessage, 500, 'ASAAS_CONNECTION_ERROR');
  }

  // Format currency value (from cents to decimal)
  static formatValue(valueInCents) {
    return (valueInCents / 100).toFixed(2);
  }

  // Parse currency value (from decimal to cents)
  static parseValue(valueInReais) {
    return Math.round(parseFloat(valueInReais) * 100);
  }
}

module.exports = new AsaasService();