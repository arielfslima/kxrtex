import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import useAuthStore from '../store/authStore';

export default function ChatBox({ bookingId }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { socket } = useSocket();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn: async () => {
      const response = await api.get(`/chat/booking/${bookingId}`);
      return response.data;
    },
    refetchInterval: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content) => api.post(`/chat/booking/${bookingId}`, { conteudo: content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', bookingId]);
      setMessage('');
    },
  });

  useEffect(() => {
    if (socket && bookingId) {
      socket.emit('join-booking', bookingId);

      socket.on('new-message', (newMessage) => {
        queryClient.setQueryData(['messages', bookingId], (old) => {
          if (!old) return { data: [newMessage] };
          const exists = old.data.some(msg => msg.id === newMessage.id);
          if (exists) return old;
          return {
            ...old,
            data: [...old.data, newMessage]
          };
        });
      });

      socket.on('user-typing', (data) => {
        if (data.userId !== user?.id) {
          setTypingUser(data.nome);
        }
      });

      socket.on('user-stop-typing', () => {
        setTypingUser(null);
      });

      return () => {
        socket.emit('leave-booking', bookingId);
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [socket, bookingId, queryClient, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.data]);

  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing', {
        bookingId,
        userId: user?.id,
        nome: user?.nome
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('stop-typing', {
          bookingId,
          userId: user?.id
        });
      }
    }, 1000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
      if (socket) {
        socket.emit('stop-typing', { bookingId, userId: user?.id });
      }
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const messages = messagesData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Carregando mensagens...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark-700 bg-dark-800/80">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">💬</span>
          Chat do Booking
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Negocie diretamente com {user?.tipo === 'ARTISTA' ? 'o contratante' : 'o artista'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <div>Nenhuma mensagem ainda</div>
            <div className="text-sm mt-1">Comece a conversa!</div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.remetenteId === user?.id;
            const isSystem = msg.tipo === 'SISTEMA';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="max-w-md px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm text-center">
                    {msg.conteudo}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && (
                    <div className="text-xs text-gray-500 mb-1 px-3">
                      {msg.remetente?.nome}
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-br-none'
                        : 'bg-dark-700 text-white rounded-bl-none'
                    }`}
                  >
                    <div className="break-words">{msg.conteudo}</div>
                    <div
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUser && (
        <div className="px-6 py-2 text-sm text-gray-400 italic">
          {typingUser} está digitando...
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="px-6 py-4 border-t border-dark-700 bg-dark-800/80">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-red-vibrant/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {sendMessageMutation.isPending ? '...' : 'Enviar'}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          ⚠️ Não compartilhe telefone, email ou redes sociais. Mantenha a negociação na plataforma para sua proteção.
        </div>
      </form>
    </div>
  );
}
