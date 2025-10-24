import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const STATUS_CONFIG = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
  ACEITO: { label: 'Aceito', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-green-500/20 text-green-400 border-green-500/50' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
  CONCLUIDO: { label: 'Concluído', color: 'bg-gray-500/20 text-gray-400 border-gray-500/50' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/50' },
  DISPUTA: { label: 'Em Disputa', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [counterOfferValue, setCounterOfferValue] = useState('');
  const [counterOfferMessage, setCounterOfferMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () => api.post(`/bookings/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', id]);
      queryClient.invalidateQueries(['bookings']);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (motivo) => api.post(`/bookings/${id}/reject`, { motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', id]);
      queryClient.invalidateQueries(['bookings']);
      setRejectReason('');
    },
  });

  const counterOfferMutation = useMutation({
    mutationFn: (data) => api.post(`/bookings/${id}/counter-offer`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', id]);
      queryClient.invalidateQueries(['bookings']);
      setCounterOfferValue('');
      setCounterOfferMessage('');
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📅</div>
          <div className="text-xl text-gray-400">Carregando booking...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl font-bold text-red-vibrant mb-2">
            Erro ao carregar booking
          </div>
          <div className="text-gray-400 mb-6">
            {error.message}
          </div>
          <button
            onClick={() => navigate('/bookings')}
            className="px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
          >
            Voltar para Bookings
          </button>
        </div>
      </div>
    );
  }

  const isArtista = user?.tipo === 'ARTISTA';
  const otherUser = isArtista ? booking.contratante?.usuario : booking.artista?.usuario;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 border-b border-dark-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-vibrant rounded-full filter blur-[100px] animate-pulse"></div>
        </div>

        <div className="relative py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate('/bookings')}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-vibrant via-pink-500 to-purple-600 text-transparent bg-clip-text">
                Detalhes do Booking
              </h1>
              <div className={`px-6 py-3 rounded-full border text-lg font-bold ${STATUS_CONFIG[booking.status].color}`}>
                {STATUS_CONFIG[booking.status].label}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Details Card */}
            <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📅</span>
                Detalhes do Evento
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-sm mb-1">Data</div>
                  <div className="text-white font-medium text-lg capitalize">
                    {formatDate(booking.dataEvento)}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 text-sm mb-1">Horário de Início</div>
                  <div className="text-white font-medium">{booking.horarioInicio}</div>
                </div>

                <div>
                  <div className="text-gray-500 text-sm mb-1">Duração</div>
                  <div className="text-white font-medium">{booking.duracao}h</div>
                </div>

                <div>
                  <div className="text-gray-500 text-sm mb-1">Local</div>
                  <div className="text-white font-medium">{booking.local}</div>
                </div>

                {booking.descricaoEvento && (
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Descrição</div>
                    <div className="text-white">{booking.descricaoEvento}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Details Card */}
            <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">💰</span>
                Valores
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-dark-700">
                  <div className="text-gray-400">Valor do Artista</div>
                  <div className="text-white font-medium text-lg">
                    R$ {booking.valorArtista?.toFixed(2)}
                  </div>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-dark-700">
                  <div className="text-gray-400">Taxa da Plataforma</div>
                  <div className="text-white font-medium">
                    R$ {booking.taxaPlataforma?.toFixed(2)}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-white font-bold text-lg">Valor Total</div>
                  <div className="text-red-vibrant font-bold text-2xl">
                    R$ {booking.valorTotal?.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Proposals History */}
            {booking.propostas && booking.propostas.length > 0 && (
              <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">💬</span>
                  Histórico de Propostas
                </h2>

                <div className="space-y-4">
                  {booking.propostas.map((proposta, index) => (
                    <div key={proposta.id} className="border-l-4 border-red-vibrant pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-gray-400 text-sm">
                          {proposta.tipo === 'INICIAL' ? 'Proposta Inicial' : 'Contra-Proposta'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatDateTime(proposta.createdAt)}
                        </div>
                      </div>
                      <div className="text-white font-bold text-lg">
                        R$ {proposta.valorProposto?.toFixed(2)}
                      </div>
                      {proposta.mensagem && (
                        <div className="text-gray-400 text-sm mt-2">
                          {proposta.mensagem}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Other User Card */}
            <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {isArtista ? 'Contratante' : 'Artista'}
              </h3>

              <div className="flex flex-col items-center text-center">
                {otherUser?.foto ? (
                  <img
                    src={otherUser.foto}
                    alt={otherUser.nome}
                    className="w-24 h-24 rounded-full object-cover border-4 border-dark-700 mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-dark-700 border-4 border-dark-600 flex items-center justify-center text-4xl mb-4">
                    {isArtista ? '📅' : '🎵'}
                  </div>
                )}

                <div className="text-xl font-bold text-white mb-1">
                  {isArtista ? otherUser?.nome : (booking.artista?.nomeArtistico || otherUser?.nome)}
                </div>

                {!isArtista && booking.artista?.categoria && (
                  <div className="text-gray-400 text-sm mb-2">
                    {booking.artista.categoria}
                  </div>
                )}

                <div className="text-gray-500 text-sm mb-4">{otherUser?.email}</div>
                {otherUser?.telefone && (
                  <div className="text-gray-400 text-sm mb-4">{otherUser.telefone}</div>
                )}
              </div>
            </div>

            {/* Review Button for Completed Bookings */}
            {booking.status === 'CONCLUIDO' && (
              <button
                onClick={() => navigate(`/bookings/${id}/review`)}
                className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-yellow-600/50 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-2xl">⭐</span>
                <span>Avaliar {isArtista ? 'Contratante' : 'Artista'}</span>
              </button>
            )}

            {/* Actions for Artist */}
            {isArtista && booking.status === 'PENDENTE' && (
              <div className="space-y-4">
                <button
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-green-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptMutation.isPending ? 'Aceitando...' : 'Aceitar Booking'}
                </button>

                {/* Counter Offer Form */}
                <div className="bg-dark-800/50 border-2 border-dark-700 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-3">Fazer Contra-Proposta</h4>
                  <input
                    type="number"
                    placeholder="Novo valor (R$)"
                    value={counterOfferValue}
                    onChange={(e) => setCounterOfferValue(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant mb-3"
                  />
                  <textarea
                    placeholder="Mensagem (opcional)"
                    value={counterOfferMessage}
                    onChange={(e) => setCounterOfferMessage(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant mb-3 resize-none"
                  />
                  <button
                    onClick={() => {
                      if (counterOfferValue) {
                        counterOfferMutation.mutate({
                          valorProposto: parseFloat(counterOfferValue),
                          mensagem: counterOfferMessage,
                        });
                      }
                    }}
                    disabled={!counterOfferValue || counterOfferMutation.isPending}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {counterOfferMutation.isPending ? 'Enviando...' : 'Enviar Contra-Proposta'}
                  </button>
                </div>

                {/* Reject Form */}
                <div className="bg-dark-800/50 border-2 border-dark-700 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-3">Recusar Booking</h4>
                  <textarea
                    placeholder="Motivo da recusa"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant mb-3 resize-none"
                  />
                  <button
                    onClick={() => rejectReason && rejectMutation.mutate(rejectReason)}
                    disabled={!rejectReason || rejectMutation.isPending}
                    className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectMutation.isPending ? 'Recusando...' : 'Recusar Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
