import { useMutation, useQuery } from '@tanstack/react-query';
import api from './api';

// Funções de API
const paymentAPI = {
  createPayment: async ({ bookingId, billingType, ...paymentData }) => {
    const response = await api.post(`/payments/booking/${bookingId}`, {
      billingType,
      ...paymentData,
    });
    return response.data;
  },

  getPaymentStatus: async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  },

  requestRefund: async (bookingId) => {
    const response = await api.post(`/payments/booking/${bookingId}/refund`);
    return response.data;
  },
};

// Hook para criar pagamento
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: paymentAPI.createPayment,
  });
};

// Hook para consultar status do pagamento
export const usePaymentStatus = (bookingId, options = {}) => {
  return useQuery({
    queryKey: ['payment', bookingId],
    queryFn: () => paymentAPI.getPaymentStatus(bookingId),
    enabled: !!bookingId,
    refetchInterval: options.refetchInterval || false,
    ...options,
  });
};

// Hook para solicitar estorno
export const useRequestRefund = () => {
  return useMutation({
    mutationFn: paymentAPI.requestRefund,
  });
};

export default paymentAPI;
