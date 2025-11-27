import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const RATING_LABELS = {
  profissionalismo: 'Profissionalismo',
  pontualidade: 'Pontualidade',
  performance: 'Performance/Qualidade',
  comunicacao: 'Comunicacao',
  condicoes: 'Condicoes do Local',
  respeito: 'Respeito'
};

export default function ReviewBookingPage() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [ratings, setRatings] = useState({
    profissionalismo: 0,
    pontualidade: 0,
    performance: 0,
    comunicacao: 0,
    condicoes: 0,
    respeito: 0
  });
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data) => api.post(`/reviews/${bookingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', bookingId]);
      queryClient.invalidateQueries(['bookings']);
      navigate(`/bookings/${bookingId}`);
    },
    onError: (err) => {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erro ao enviar avaliacao. Tente novamente.'
      );
    },
  });

  const handleRatingChange = (criterion, value) => {
    setRatings((prev) => ({
      ...prev,
      [criterion]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const allRatingsSet = Object.values(ratings).every(r => r > 0);
    if (!allRatingsSet) {
      setError('Por favor, avalie todos os criterios');
      return;
    }

    reviewMutation.mutate({
      ...ratings,
      comentario: comentario.trim() || null
    });
  };

  const renderStarRating = (criterion, currentValue) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(criterion, star)}
            className={`w-10 h-10 border-2 font-display text-lg transition-all hover:scale-110 ${
              star <= currentValue
                ? 'bg-neon-acid text-void border-neon-acid'
                : 'bg-dark-800 text-chrome/30 border-dark-600 hover:border-neon-acid/50'
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-acid mb-4 animate-pulse">...</div>
          <div className="text-xl font-mono text-chrome/50 uppercase tracking-wider">Carregando</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-red mb-4">!</div>
          <div className="text-2xl font-display tracking-wider text-chrome mb-2">
            BOOKING NAO ENCONTRADO
          </div>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all"
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
    <div className="min-h-screen bg-void py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/bookings/${bookingId}`)}
            className="text-chrome/50 hover:text-neon-red mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-wider transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-5xl md:text-6xl font-display tracking-wider text-chrome mb-2">
            AVALIAR <span className="text-neon-acid">{isArtista ? 'CONTRATANTE' : 'ARTISTA'}</span>
          </h1>
          <p className="text-chrome/50 font-mono text-sm uppercase tracking-wider">
            Como foi sua experiencia com {otherUser?.nome}?
          </p>
        </div>

        {/* User Card */}
        <div className="bg-dark-800 border-2 border-dark-600 p-6 mb-8">
          <div className="flex items-center gap-4">
            {otherUser?.foto ? (
              <img
                src={otherUser.foto}
                alt={otherUser.nome}
                className="w-20 h-20 object-cover border-2 border-dark-600"
              />
            ) : (
              <div className="w-20 h-20 bg-dark-700 border-2 border-dark-600 flex items-center justify-center text-4xl font-display text-neon-red/50">
                {isArtista ? 'C' : 'A'}
              </div>
            )}
            <div className="flex-1">
              <div className="text-2xl font-display tracking-wider text-chrome mb-1 uppercase">
                {isArtista ? otherUser?.nome : (booking.artista?.nomeArtistico || otherUser?.nome)}
              </div>
              <div className="text-chrome/50 font-mono text-xs uppercase">
                {new Date(booking.dataEvento).toLocaleDateString('pt-BR')} | {booking.local}
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-dark-800 border-2 border-dark-600 p-8">
          {error && (
            <div className="mb-6 p-4 bg-neon-red/10 border-2 border-neon-red text-neon-red font-mono text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Criteria */}
            <div className="space-y-6">
              <h2 className="text-2xl font-display tracking-wider text-chrome mb-6 uppercase">Avalie os Criterios</h2>

              {Object.entries(RATING_LABELS).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="block font-mono text-sm text-chrome uppercase tracking-wider">
                    {label}
                  </label>
                  {renderStarRating(key, ratings[key])}
                  {ratings[key] > 0 && (
                    <div className="text-chrome/30 font-mono text-xs mt-1 uppercase">
                      {ratings[key]} de 5
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="block font-mono text-sm text-chrome uppercase tracking-wider mb-3">
                Comentario (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows="5"
                placeholder="Conte mais sobre sua experiencia..."
                className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors resize-none"
              />
            </div>

            {/* Average Rating Display */}
            {Object.values(ratings).some(r => r > 0) && (
              <div className="p-6 bg-dark-900 border-2 border-dark-600">
                <div className="flex items-center justify-between">
                  <span className="text-chrome/50 font-mono text-xs uppercase">Media Geral</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neon-acid font-display text-4xl">
                      {(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length).toFixed(1)}
                    </span>
                    <span className="text-chrome/30 font-mono text-xs uppercase">/5</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={reviewMutation.isPending || Object.values(ratings).some(r => r === 0)}
              className="w-full py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reviewMutation.isPending ? 'Enviando Avaliacao...' : 'Enviar Avaliacao'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
