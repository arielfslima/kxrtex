import axios from 'axios';
import { AppError } from '../middlewares/errorHandler.js';

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3',
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
});

/**
 * Cria uma subconta no ASAAS para um artista
 */
export const createSubAccount = async (artistaData) => {
  try {
    const payload = {
      name: artistaData.nomeArtistico,
      email: artistaData.usuario.email,
      cpfCnpj: artistaData.usuario.cpfCnpj,
      phone: artistaData.usuario.telefone.replace(/\D/g, ''),
      mobilePhone: artistaData.usuario.telefone.replace(/\D/g, ''),
      address: artistaData.endereco?.logradouro || '',
      addressNumber: artistaData.endereco?.numero || '',
      province: artistaData.endereco?.bairro || '',
      postalCode: artistaData.endereco?.cep?.replace(/\D/g, '') || ''
    };

    const response = await asaasApi.post('/accounts', payload);

    return {
      asaasAccountId: response.data.id,
      walletId: response.data.walletId
    };
  } catch (error) {
    console.error('Erro ao criar subconta ASAAS:', error.response?.data);
    throw new AppError('Erro ao criar conta de pagamento', 500);
  }
};

/**
 * Cria uma cobrança (PIX ou Cartão de Crédito)
 */
export const createPayment = async (paymentData) => {
  try {
    const {
      customer,
      billingType, // 'PIX' ou 'CREDIT_CARD'
      value,
      dueDate,
      description,
      externalReference,
      creditCard,
      creditCardHolderInfo,
      split
    } = paymentData;

    const payload = {
      customer,
      billingType,
      value,
      dueDate,
      description,
      externalReference,
      postalService: false
    };

    // Se for cartão de crédito, adiciona dados do cartão
    if (billingType === 'CREDIT_CARD' && creditCard) {
      payload.creditCard = creditCard;
      payload.creditCardHolderInfo = creditCardHolderInfo;
    }

    // Adiciona split de pagamento (divisão entre plataforma e artista)
    if (split && split.length > 0) {
      payload.split = split;
    }

    const response = await asaasApi.post('/payments', payload);

    return {
      paymentId: response.data.id,
      invoiceUrl: response.data.invoiceUrl,
      bankSlipUrl: response.data.bankSlipUrl,
      pixQrCode: response.data.encodedImage,
      pixCopyPaste: response.data.payload,
      status: response.data.status,
      dueDate: response.data.dueDate,
      value: response.data.value
    };
  } catch (error) {
    console.error('Erro ao criar cobrança ASAAS:', error.response?.data);
    throw new AppError(error.response?.data?.errors?.[0]?.description || 'Erro ao criar cobrança', 500);
  }
};

/**
 * Cria ou busca um cliente no ASAAS
 */
export const getOrCreateCustomer = async (userData) => {
  try {
    // Primeiro tenta buscar por CPF/CNPJ
    const cpfCnpj = userData.cpfCnpj.replace(/\D/g, '');

    const searchResponse = await asaasApi.get('/customers', {
      params: { cpfCnpj }
    });

    if (searchResponse.data.data.length > 0) {
      return searchResponse.data.data[0].id;
    }

    // Se não encontrou, cria novo cliente
    const payload = {
      name: userData.nome,
      email: userData.email,
      cpfCnpj,
      phone: userData.telefone.replace(/\D/g, ''),
      mobilePhone: userData.telefone.replace(/\D/g, '')
    };

    const createResponse = await asaasApi.post('/customers', payload);

    return createResponse.data.id;
  } catch (error) {
    console.error('Erro ao buscar/criar cliente ASAAS:', error.response?.data);
    throw new AppError('Erro ao processar dados do cliente', 500);
  }
};

/**
 * Consulta status de um pagamento
 */
export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await asaasApi.get(`/payments/${paymentId}`);

    return {
      id: response.data.id,
      status: response.data.status,
      value: response.data.value,
      netValue: response.data.netValue,
      confirmedDate: response.data.confirmedDate,
      paymentDate: response.data.paymentDate
    };
  } catch (error) {
    console.error('Erro ao consultar pagamento ASAAS:', error.response?.data);
    throw new AppError('Erro ao consultar pagamento', 500);
  }
};

/**
 * Cria uma transferência para subconta (artista)
 */
export const createTransfer = async (transferData) => {
  try {
    const { walletId, value, description } = transferData;

    const payload = {
      walletId,
      value,
      description,
      operationType: 'PIX' // Transferência via PIX
    };

    const response = await asaasApi.post('/transfers', payload);

    return {
      transferId: response.data.id,
      status: response.data.status,
      value: response.data.value,
      transferDate: response.data.effectiveDate
    };
  } catch (error) {
    console.error('Erro ao criar transferência ASAAS:', error.response?.data);
    throw new AppError('Erro ao processar transferência', 500);
  }
};

/**
 * Estorna um pagamento
 */
export const refundPayment = async (paymentId, value = null) => {
  try {
    const payload = {};

    // Se value for informado, faz estorno parcial
    if (value) {
      payload.value = value;
    }

    const response = await asaasApi.post(`/payments/${paymentId}/refund`, payload);

    return {
      refundId: response.data.id,
      status: response.data.status,
      value: response.data.value
    };
  } catch (error) {
    console.error('Erro ao estornar pagamento ASAAS:', error.response?.data);
    throw new AppError('Erro ao processar estorno', 500);
  }
};

/**
 * Valida webhook do ASAAS
 */
export const validateWebhook = (payload, signature) => {
  // TODO: Implementar validação de assinatura do webhook
  // Por enquanto, aceita todos os webhooks
  return true;
};

/**
 * Calcula split de pagamento entre plataforma e artista
 */
export const calculateSplit = (valorTotal, taxaPlataforma, artistaWalletId) => {
  const valorPlataforma = valorTotal * taxaPlataforma;
  const valorArtista = valorTotal - valorPlataforma;

  return [
    {
      walletId: artistaWalletId,
      fixedValue: valorArtista,
      description: 'Pagamento ao artista'
    }
    // A plataforma fica com o restante automaticamente
  ];
};

/**
 * Create advance payment with split
 * Used when artist is eligible for 50% advance payment
 * Splits advance amount between platform and artist
 */
export const createAdvancePayment = async (advanceData) => {
  try {
    const {
      customerId,
      billingType,
      totalValue,
      artistWalletId,
      taxaPlataforma,
      dueDate,
      description,
      externalReference
    } = advanceData;

    // Calculate advance (50% of artist value after platform fee)
    const valorPlataforma = totalValue * taxaPlataforma;
    const valorArtista = totalValue - valorPlataforma;
    const advanceAmount = valorArtista * 0.5;

    // Create split for advance payment
    const split = [
      {
        walletId: artistWalletId,
        fixedValue: advanceAmount,
        description: 'Adiantamento ao artista (50%)'
      }
    ];

    const payload = {
      customer: customerId,
      billingType,
      value: totalValue,
      dueDate,
      description: description || 'Adiantamento de booking',
      externalReference,
      split
    };

    const response = await asaasApi.post('/payments', payload);

    return {
      paymentId: response.data.id,
      invoiceUrl: response.data.invoiceUrl,
      pixQrCode: response.data.encodedImage,
      pixCopyPaste: response.data.payload,
      status: response.data.status,
      advanceAmount,
      remainingAmount: valorArtista - advanceAmount,
      platformFee: valorPlataforma
    };

  } catch (error) {
    console.error('Erro ao criar pagamento de adiantamento ASAAS:', error.response?.data);
    throw new AppError('Erro ao criar pagamento de adiantamento', 500);
  }
};

/**
 * Release remaining payment to artist after event completion
 * Called 48h after event ends successfully
 */
export const releaseRemainingPayment = async (releaseData) => {
  try {
    const {
      artistWalletId,
      remainingValue,
      bookingId,
      description
    } = releaseData;

    const payload = {
      walletId: artistWalletId,
      value: remainingValue,
      description: description || `Pagamento restante do booking ${bookingId}`,
      externalReference: bookingId
    };

    const response = await asaasApi.post('/transfers', payload);

    return {
      transferId: response.data.id,
      status: response.data.status,
      value: response.data.value,
      effectiveDate: response.data.effectiveDate
    };

  } catch (error) {
    console.error('Erro ao liberar pagamento restante ASAAS:', error.response?.data);
    throw new AppError('Erro ao liberar pagamento restante', 500);
  }
};

/**
 * Cancel advance payment and process refund
 * Used when artist doesn't complete check-in or event is cancelled
 */
export const cancelAdvancePayment = async (paymentId, refundReason) => {
  try {
    // First, refund the payment
    const refundResponse = await asaasApi.post(`/payments/${paymentId}/refund`, {
      description: refundReason || 'Cancelamento de adiantamento'
    });

    return {
      refundId: refundResponse.data.id,
      status: refundResponse.data.status,
      value: refundResponse.data.value,
      refundDate: refundResponse.data.refundDate
    };

  } catch (error) {
    console.error('Erro ao cancelar adiantamento ASAAS:', error.response?.data);
    throw new AppError('Erro ao cancelar adiantamento', 500);
  }
};

/**
 * Process webhook for advance payment events
 * Handles payment confirmation, refunds, and failures
 */
export const processAdvanceWebhook = async (webhookPayload) => {
  const { event, payment } = webhookPayload;

  switch (event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      // Payment confirmed - can trigger automatic split transfer
      return {
        action: 'ADVANCE_CONFIRMED',
        paymentId: payment.id,
        value: payment.value,
        confirmedDate: payment.confirmedDate
      };

    case 'PAYMENT_REFUNDED':
      // Payment refunded - artist didn't check in or cancelled
      return {
        action: 'ADVANCE_REFUNDED',
        paymentId: payment.id,
        value: payment.value,
        refundDate: payment.refundDate
      };

    case 'PAYMENT_OVERDUE':
      // Payment overdue - contratante didn't pay
      return {
        action: 'ADVANCE_OVERDUE',
        paymentId: payment.id,
        dueDate: payment.dueDate
      };

    default:
      return {
        action: 'UNKNOWN',
        event,
        payment
      };
  }
};
