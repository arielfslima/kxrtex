import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const RATING_LABELS = {
  profissionalismo: 'Profissionalismo',
  pontualidade: 'Pontualidade',
  performance: 'Performance/Qualidade',
  comunicacao: 'Comunicação',
  condicoes: 'Condições do Local',
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
        'Erro ao enviar avaliação. Tente novamente.'
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
      setError('Por favor, avalie todos os critérios');
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
            className={`text-3xl transition-all hover:scale-110 ${
              star <= currentValue ? 'text-yellow-400' : 'text-gray-600'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⭐</div>
          <div className="text-xl text-gray-400">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl font-bold text-red-vibrant mb-2">
            Booking não encontrado
          </div>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
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
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/bookings/${bookingId}`)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-red-vibrant via-pink-500 to-purple-600 text-transparent bg-clip-text">
            Avaliar {isArtista ? 'Contratante' : 'Artista'}
          </h1>
          <p className="text-gray-400 text-lg">
            Como foi sua experiência com {otherUser?.nome}?
          </p>
        </div>

        {/* User Card */}
        <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            {otherUser?.foto ? (
              <img
                src={otherUser.foto}
                alt={otherUser.nome}
                className="w-20 h-20 rounded-full object-cover border-4 border-dark-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-dark-700 border-4 border-dark-600 flex items-center justify-center text-4xl">
                {isArtista ? '📅' : '🎵'}
              </div>
            )}
            <div className="flex-1">
              <div className="text-2xl font-bold text-white mb-1">
                {isArtista ? otherUser?.nome : (booking.artista?.nomeArtistico || otherUser?.nome)}
              </div>
              <div className="text-gray-400">
                {new Date(booking.dataEvento).toLocaleDateString('pt-BR')} • {booking.local}
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-vibrant/10 border border-red-vibrant/50 rounded-xl text-red-vibrant text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Criteria */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Avalie os critérios</h2>

              {Object.entries(RATING_LABELS).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-lg font-medium text-gray-300">
                    {label}
                  </label>
                  {renderStarRating(key, ratings[key])}
                  {ratings[key] > 0 && (
                    <div className="text-sm text-gray-400 mt-1">
                      {ratings[key]} {ratings[key] === 1 ? 'estrela' : 'estrelas'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-lg font-medium text-gray-300 mb-3">
                Comentário (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows="5"
                placeholder="Conte mais sobre sua experiência..."
                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors resize-none"
              />
            </div>

            {/* Average Rating Display */}
            {Object.values(ratings).some(r => r > 0) && (
              <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Média Geral</span>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400 text-3xl">★</span>
                    <span className="text-3xl font-bold text-white">
                      {(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={reviewMutation.isPending || Object.values(ratings).some(r => r === 0)}
              className="w-full py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold text-lg rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-red-vibrant/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {reviewMutation.isPending ? 'Enviando Avaliação...' : 'Enviar Avaliação'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
