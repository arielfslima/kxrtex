import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Criar booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/bookings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Listar bookings do usuário
export const useBookings = (filters = {}) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/bookings?${params.toString()}`);
      return response.data;
    },
  });
};

// Detalhes de um booking
export const useBooking = (bookingId) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data.data;
    },
    enabled: !!bookingId,
  });
};

// Aceitar booking (artista)
export const useAcceptBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await api.put(`/bookings/${bookingId}/accept`);
      return response.data;
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Recusar booking (artista)
export const useRejectBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, motivo }) => {
      const response = await api.put(`/bookings/${bookingId}/reject`, { motivo });
      return response.data;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Contra-proposta (artista)
export const useCounterOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, valorProposto, mensagem }) => {
      const response = await api.post(`/bookings/${bookingId}/counter-offer`, {
        valorProposto,
        mensagem,
      });
      return response.data;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
