import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import ChatBox from '../components/ChatBox';
import PaymentModal from '../components/PaymentModal';
import CheckInModal from '../components/CheckInModal';

const STATUS_CONFIG = {
  PENDENTE: { label: 'PENDENTE', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  ACEITO: { label: 'ACEITO', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  CONFIRMADO: { label: 'CONFIRMADO', color: 'bg-neon-acid/10 text-neon-acid border-neon-acid/30' },
  EM_ANDAMENTO: { label: 'EM ANDAMENTO', color: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30' },
  CONCLUIDO: { label: 'CONCLUIDO', color: 'bg-chrome/10 text-chrome/50 border-chrome/30' },
  CANCELADO: { label: 'CANCELADO', color: 'bg-neon-red/10 text-neon-red border-neon-red/30' },
  DISPUTA: { label: 'DISPUTA', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [counterOfferValue, setCounterOfferValue] = useState('');
  const [counterOfferMessage, setCounterOfferMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkInModalType, setCheckInModalType] = useState(null);

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () => api.patch(`/bookings/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', id]);
      queryClient.invalidateQueries(['bookings']);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (motivo) => api.patch(`/bookings/${id}/reject`, { motivo }),
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
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-red mb-4 animate-pulse">...</div>
          <div className="text-xl font-mono text-chrome/50 uppercase tracking-wider">Carregando booking</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-red mb-4">!</div>
          <div className="text-2xl font-display tracking-wider text-chrome mb-2">
            ERRO AO CARREGAR BOOKING
          </div>
          <div className="text-chrome/50 font-mono text-sm mb-6">
            {error.message}
          </div>
          <button
            onClick={() => navigate('/bookings')}
            className="px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all"
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
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="relative overflow-hidden bg-surface border-b-2 border-neon-red/30">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-red/10 rounded-full filter blur-[150px]"></div>
        </div>

        <div className="relative py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate('/bookings')}
              className="text-chrome/50 hover:text-neon-red mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-wider transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <div className="flex items-center justify-between">
              <h1 className="text-5xl md:text-6xl font-display tracking-wider text-chrome">
                DETALHES DO <span className="text-neon-red">BOOKING</span>
              </h1>
              <div className={`px-4 py-2 border-2 font-mono text-sm uppercase tracking-wider ${STATUS_CONFIG[booking.status].color}`}>
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
            <div className="bg-dark-800 border-2 border-dark-600 p-8">
              <h2 className="text-2xl font-display tracking-wider text-chrome mb-6 uppercase flex items-center gap-3">
                <span className="text-neon-red font-mono text-lg">01</span>
                Detalhes do Evento
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Data</div>
                  <div className="text-chrome font-mono text-sm capitalize">
                    {formatDate(booking.dataEvento)}
                  </div>
                </div>

                <div>
                  <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Horario de Inicio</div>
                  <div className="text-chrome font-mono text-sm">{booking.horarioInicio}</div>
                </div>

                <div>
                  <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Duracao</div>
                  <div className="text-chrome font-mono text-sm">{booking.duracao}h</div>
                </div>

                <div>
                  <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Local</div>
                  <div className="text-chrome font-mono text-sm">{booking.local}</div>
                </div>

                {booking.descricaoEvento && (
                  <div>
                    <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Descricao</div>
                    <div className="text-chrome/70 font-mono text-sm">{booking.descricaoEvento}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Details Card */}
            <div className="bg-dark-800 border-2 border-dark-600 p-8">
              <h2 className="text-2xl font-display tracking-wider text-chrome mb-6 uppercase flex items-center gap-3">
                <span className="text-neon-acid font-mono text-lg">02</span>
                Valores
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b-2 border-dark-600">
                  <div className="text-chrome/50 font-mono text-xs uppercase">Valor do Artista</div>
                  <div className="text-chrome font-mono text-sm">
                    R$ {booking.valorArtista?.toFixed(2)}
                  </div>
                </div>

                <div className="flex justify-between items-center pb-4 border-b-2 border-dark-600">
                  <div className="text-chrome/50 font-mono text-xs uppercase">Taxa da Plataforma</div>
                  <div className="text-chrome font-mono text-sm">
                    R$ {booking.taxaPlataforma?.toFixed(2)}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-chrome font-display tracking-wider uppercase">Valor Total</div>
                  <div className="text-neon-red font-display text-3xl">
                    R$ {booking.valorTotal?.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Proposals History */}
            {booking.propostas && booking.propostas.length > 0 && (
              <div className="bg-dark-800 border-2 border-dark-600 p-8">
                <h2 className="text-2xl font-display tracking-wider text-chrome mb-6 uppercase flex items-center gap-3">
                  <span className="text-neon-pink font-mono text-lg">03</span>
                  Historico de Propostas
                </h2>

                <div className="space-y-4">
                  {booking.propostas.map((proposta, index) => (
                    <div key={proposta.id} className="border-l-4 border-neon-red pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-chrome/50 font-mono text-xs uppercase">
                          {proposta.tipo === 'INICIAL' ? 'Proposta Inicial' : 'Contra-Proposta'}
                        </div>
                        <div className="text-chrome/30 font-mono text-xs">
                          {formatDateTime(proposta.createdAt)}
                        </div>
                      </div>
                      <div className="text-neon-red font-display text-2xl">
                        R$ {proposta.valorProposto?.toFixed(2)}
                      </div>
                      {proposta.mensagem && (
                        <div className="text-chrome/50 font-mono text-sm mt-2">
                          {proposta.mensagem}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Box */}
            <ChatBox bookingId={id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Other User Card */}
            <div className="bg-dark-800 border-2 border-dark-600 p-6">
              <h3 className="text-lg font-display tracking-wider text-chrome mb-4 uppercase">
                {isArtista ? 'Contratante' : 'Artista'}
              </h3>

              <div className="flex flex-col items-center text-center">
                {otherUser?.foto ? (
                  <img
                    src={otherUser.foto}
                    alt={otherUser.nome}
                    className="w-24 h-24 object-cover border-2 border-dark-600 mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-dark-700 border-2 border-dark-600 flex items-center justify-center text-4xl font-display text-neon-red/50 mb-4">
                    {isArtista ? 'C' : 'A'}
                  </div>
                )}

                <div className="text-xl font-display tracking-wider text-chrome mb-1 uppercase">
                  {isArtista ? otherUser?.nome : (booking.artista?.nomeArtistico || otherUser?.nome)}
                </div>

                {!isArtista && booking.artista?.categoria && (
                  <div className="text-chrome/50 font-mono text-xs uppercase mb-2">
                    {booking.artista.categoria}
                  </div>
                )}

                <div className="text-chrome/30 font-mono text-xs mb-4">{otherUser?.email}</div>
                {otherUser?.telefone && (
                  <div className="text-chrome/50 font-mono text-xs mb-4">{otherUser.telefone}</div>
                )}
              </div>
            </div>

            {/* Payment Button for Accepted Bookings (Contratante only) */}
            {!isArtista && booking.status === 'ACEITO' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-4 bg-neon-acid text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal-acid hover:bg-neon-pink hover:shadow-brutal transition-all flex items-center justify-center gap-2"
              >
                Realizar Pagamento
              </button>
            )}

            {/* Check-in Button for Confirmed Bookings (Artist only) */}
            {isArtista && booking.status === 'CONFIRMADO' && !booking.checkInArtista && (
              <button
                onClick={() => setCheckInModalType('checkin')}
                className="w-full py-4 bg-neon-pink text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all flex items-center justify-center gap-2"
              >
                Fazer Check-in
              </button>
            )}

            {/* Check-out Button for In Progress Bookings (Artist only) */}
            {isArtista && booking.status === 'EM_ANDAMENTO' && booking.checkInArtista && !booking.checkOutArtista && (
              <button
                onClick={() => setCheckInModalType('checkout')}
                className="w-full py-4 bg-neon-acid text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal-acid hover:bg-neon-pink hover:shadow-brutal transition-all flex items-center justify-center gap-2"
              >
                Fazer Check-out
              </button>
            )}

            {/* Check-in Status Display */}
            {(booking.checkInArtista || booking.checkOutArtista) && (
              <div className="bg-dark-800 border-2 border-dark-600 p-4 space-y-3">
                <h4 className="text-chrome font-display tracking-wider uppercase flex items-center gap-2">
                  Status de Presenca
                </h4>

                {booking.checkInArtista && (
                  <div className="bg-neon-acid/10 border-2 border-neon-acid/30 p-3">
                    <div className="text-neon-acid font-mono text-xs uppercase mb-1 flex items-center gap-2">
                      Check-in realizado
                    </div>
                    <div className="text-chrome/50 font-mono text-xs">
                      {new Date(booking.checkInArtista).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}

                {booking.checkOutArtista && (
                  <div className="bg-neon-pink/10 border-2 border-neon-pink/30 p-3">
                    <div className="text-neon-pink font-mono text-xs uppercase mb-1 flex items-center gap-2">
                      Check-out realizado
                    </div>
                    <div className="text-chrome/50 font-mono text-xs">
                      {new Date(booking.checkOutArtista).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Review Button for Completed Bookings */}
            {booking.status === 'CONCLUIDO' && (
              <button
                onClick={() => navigate(`/bookings/${id}/review`)}
                className="w-full py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all flex items-center justify-center gap-2"
              >
                Avaliar {isArtista ? 'Contratante' : 'Artista'}
              </button>
            )}

            {/* Actions for Artist */}
            {isArtista && booking.status === 'PENDENTE' && (
              <div className="space-y-4">
                <button
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending}
                  className="w-full py-4 bg-neon-acid text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal-acid hover:bg-neon-pink hover:shadow-brutal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptMutation.isPending ? 'Aceitando...' : 'Aceitar Booking'}
                </button>

                {/* Counter Offer Form */}
                <div className="bg-dark-800 border-2 border-dark-600 p-4">
                  <h4 className="text-chrome font-display tracking-wider uppercase mb-3">Fazer Contra-Proposta</h4>
                  <input
                    type="number"
                    placeholder="Novo valor (R$)"
                    value={counterOfferValue}
                    onChange={(e) => setCounterOfferValue(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red mb-3 transition-colors"
                  />
                  <textarea
                    placeholder="Mensagem (opcional)"
                    value={counterOfferMessage}
                    onChange={(e) => setCounterOfferMessage(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red mb-3 resize-none transition-colors"
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
                    className="w-full py-3 bg-neon-pink text-void font-bold font-mono text-sm uppercase tracking-wider hover:bg-neon-acid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {counterOfferMutation.isPending ? 'Enviando...' : 'Enviar Contra-Proposta'}
                  </button>
                </div>

                {/* Reject Form */}
                <div className="bg-dark-800 border-2 border-dark-600 p-4">
                  <h4 className="text-chrome font-display tracking-wider uppercase mb-3">Recusar Booking</h4>
                  <textarea
                    placeholder="Motivo da recusa"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red mb-3 resize-none transition-colors"
                  />
                  <button
                    onClick={() => rejectReason && rejectMutation.mutate(rejectReason)}
                    disabled={!rejectReason || rejectMutation.isPending}
                    className="w-full py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider hover:bg-neon-acid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectMutation.isPending ? 'Recusando...' : 'Recusar Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          bookingId={id}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            queryClient.invalidateQueries(['booking', id]);
          }}
        />
      )}

      {/* Check-in/Check-out Modal */}
      {checkInModalType && (
        <CheckInModal
          bookingId={id}
          type={checkInModalType}
          onClose={() => setCheckInModalType(null)}
          onSuccess={() => {
            setCheckInModalType(null);
            queryClient.invalidateQueries(['booking', id]);
          }}
        />
      )}
    </div>
  );
}
