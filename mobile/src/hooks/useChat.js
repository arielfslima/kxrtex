import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';
import { useMessages, useSendMessage } from '../services/chatService';
import { useAuthStore } from '../store/authStore';

export const useChat = (bookingId) => {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Carregar histórico de mensagens
  const { data: initialMessages, isLoading } = useMessages(bookingId);
  const sendMessageMutation = useSendMessage();

  // Inicializar mensagens
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Conectar Socket.IO
  useEffect(() => {
    if (!token || !bookingId) return;

    socketService.connect(token);
    socketService.joinBooking(bookingId);

    // Atualizar estado inicial de conexão
    setIsConnected(socketService.isConnected());

    // Listener para conexão
    const handleConnect = () => {
      setIsConnected(true);
    };

    // Listener para desconexão
    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Listener para novas mensagens
    socketService.onNewMessage((message) => {
      setMessages((prev) => {
        // Evitar duplicatas
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Listener para typing
    socketService.onUserTyping(({ userId, nome }) => {
      if (userId !== user?.id) {
        setTypingUsers((prev) => {
          if (!prev.find((u) => u.userId === userId)) {
            return [...prev, { userId, nome }];
          }
          return prev;
        });
      }
    });

    // Listener para stop typing
    socketService.onUserStopTyping(({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    // Registrar listeners de conexão no socket service
    if (socketService.socket) {
      socketService.socket.on('connect', handleConnect);
      socketService.socket.on('disconnect', handleDisconnect);
    }

    // Cleanup
    return () => {
      if (socketService.socket) {
        socketService.socket.off('connect', handleConnect);
        socketService.socket.off('disconnect', handleDisconnect);
      }
      socketService.leaveBooking(bookingId);
      socketService.offNewMessage();
      socketService.offUserTyping();
      socketService.offUserStopTyping();
    };
  }, [bookingId, token, user?.id]);

  // Enviar mensagem via Socket.IO (com fallback REST)
  const sendMessage = async (conteudo) => {
    if (!conteudo.trim()) return;

    try {
      // Tentar via Socket.IO primeiro
      if (socketService.isConnected()) {
        socketService.sendMessage(bookingId, conteudo);
      } else {
        // Fallback para REST API
        await sendMessageMutation.mutateAsync({ bookingId, conteudo });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Indicar que está digitando
  const startTyping = () => {
    if (socketService.isConnected()) {
      socketService.startTyping(bookingId, user?.id, user?.nome);

      // Limpar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Parar de indicar após 3 segundos de inatividade
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  };

  // Parar de indicar digitação
  const stopTyping = () => {
    if (socketService.isConnected()) {
      socketService.stopTyping(bookingId, user?.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  return {
    messages,
    typingUsers,
    isLoading,
    sendMessage,
    startTyping,
    stopTyping,
    isConnected, // Agora é reativo!
  };
};
