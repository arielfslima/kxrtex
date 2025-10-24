import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Funções de API
const chatAPI = {
  getMessages: async (bookingId) => {
    const response = await api.get(`/chat/booking/${bookingId}`);
    return response.data;
  },

  sendMessage: async ({ bookingId, conteudo }) => {
    const response = await api.post(`/chat/booking/${bookingId}`, { conteudo });
    return response.data;
  },
};

// Hook para listar mensagens
export const useMessages = (bookingId, options = {}) => {
  return useQuery({
    queryKey: ['messages', bookingId],
    queryFn: () => chatAPI.getMessages(bookingId),
    enabled: !!bookingId,
    staleTime: 0, // Sempre buscar mensagens novas
    ...options,
  });
};

// Hook para enviar mensagem (fallback se Socket.IO falhar)
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (data, variables) => {
      // Invalidar cache de mensagens
      queryClient.invalidateQueries(['messages', variables.bookingId]);
    },
  });
};

export default chatAPI;
