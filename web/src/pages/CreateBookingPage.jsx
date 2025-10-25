import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artistaId = searchParams.get('artistaId');
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    dataEvento: '',
    horarioInicio: '',
    duracao: 4,
    local: '',
    descricaoEvento: '',
    valorProposto: '',
  });
  const [error, setError] = useState('');

  const { data: artist } = useQuery({
    queryKey: ['artist', artistaId],
    queryFn: async () => {
      const response = await api.get(`/artists/${artistaId}`);
      return response.data.data;
    },
    enabled: !!artistaId,
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => api.post('/bookings', data),
    onSuccess: (response) => {
      const bookingId = response.data.data.id;
      navigate(`/bookings/${bookingId}`);
    },
    onError: (err) => {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erro ao criar booking. Tente novamente.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (user?.tipo !== 'CONTRATANTE') {
      setError('Apenas contratantes podem criar bookings');
      return;
    }

    if (!artistaId) {
      setError('Artista não especificado');
      return;
    }

    // Combinar data e horário no timezone de Brasília (UTC-3)
    const dataHora = `${formData.dataEvento}T${formData.horarioInicio}:00`;
    const dataEventoISO = new Date(dataHora).toISOString();

    const dataToSend = {
      ...formData,
      artistaId,
      dataEvento: dataEventoISO,
      duracao: parseInt(formData.duracao),
    };

    if (formData.valorProposto) {
      dataToSend.valorProposto = parseFloat(formData.valorProposto);
    }

    createBookingMutation.mutate(dataToSend);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateEstimatedValue = () => {
    if (!artist || !formData.duracao) return 0;
    const valorArtista = formData.valorProposto
      ? parseFloat(formData.valorProposto)
      : artist.valorBaseHora * parseInt(formData.duracao);

    const taxas = {
      FREE: 0.15,
      PLUS: 0.10,
      PRO: 0.07
    };
    const taxaPlataforma = valorArtista * taxas[artist.plano];
    return valorArtista + taxaPlataforma;
  };

  if (!artistaId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl font-bold text-red-vibrant mb-2">
            Artista não especificado
          </div>
          <button
            onClick={() => navigate('/artists')}
            className="mt-4 px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
          >
            Buscar Artistas
          </button>
        </div>
      </div>
    );
  }

  if (user?.tipo !== 'CONTRATANTE') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <div className="text-2xl font-bold text-red-vibrant mb-2">
            Apenas contratantes podem criar bookings
          </div>
          <button
            onClick={() => navigate('/artists')}
            className="mt-4 px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/artists/${artistaId}`)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-red-vibrant via-pink-500 to-purple-600 text-transparent bg-clip-text">
            Criar Booking
          </h1>
          <p className="text-gray-400 text-lg">
            Faça uma proposta de booking para {artist?.nomeArtistico}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-vibrant/10 border border-red-vibrant/50 rounded-xl text-red-vibrant text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data do Evento *
                    </label>
                    <input
                      type="date"
                      name="dataEvento"
                      value={formData.dataEvento}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Horário de Início *
                    </label>
                    <input
                      type="time"
                      name="horarioInicio"
                      value={formData.horarioInicio}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração (horas) *
                  </label>
                  <input
                    type="number"
                    name="duracao"
                    value={formData.duracao}
                    onChange={handleChange}
                    required
                    min="1"
                    max="24"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-red-vibrant transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Local do Evento *
                  </label>
                  <input
                    type="text"
                    name="local"
                    value={formData.local}
                    onChange={handleChange}
                    required
                    placeholder="Endereço completo ou nome do local"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição do Evento *
                  </label>
                  <textarea
                    name="descricaoEvento"
                    value={formData.descricaoEvento}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Descreva o tipo de evento, público esperado, estilo musical desejado, etc."
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor Proposto (opcional)
                  </label>
                  <input
                    type="number"
                    name="valorProposto"
                    value={formData.valorProposto}
                    onChange={handleChange}
                    placeholder={`Deixe em branco para usar o valor base (R$ ${artist?.valorBaseHora}/h)`}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Se não especificar, será usado o valor base do artista multiplicado pela duração
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold text-lg rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-red-vibrant/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {createBookingMutation.isPending ? 'Criando Booking...' : 'Enviar Proposta'}
                </button>
              </form>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Artist Info */}
            {artist && (
              <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Artista</h3>
                <div className="flex flex-col items-center text-center">
                  {artist.usuario?.foto ? (
                    <img
                      src={artist.usuario.foto}
                      alt={artist.nomeArtistico}
                      className="w-20 h-20 rounded-full object-cover border-4 border-dark-700 mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-dark-700 border-4 border-dark-600 flex items-center justify-center text-3xl mb-3">
                      🎵
                    </div>
                  )}
                  <div className="text-xl font-bold text-white mb-1">
                    {artist.nomeArtistico}
                  </div>
                  <div className="text-gray-400 text-sm mb-3">
                    {artist.categoria}
                  </div>
                  <div className="text-red-vibrant font-bold">
                    R$ {artist.valorBaseHora}/hora
                  </div>
                </div>
              </div>
            )}

            {/* Price Estimate */}
            <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Estimativa de Valor</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duração</span>
                  <span className="text-white font-medium">{formData.duracao}h</span>
                </div>

                {artist && (
                  <>
                    <div className="flex justify-between text-sm pb-3 border-b border-dark-700">
                      <span className="text-gray-400">Valor do Artista</span>
                      <span className="text-white font-medium">
                        R$ {formData.valorProposto || (artist.valorBaseHora * parseInt(formData.duracao || 0)).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm pb-3 border-b border-dark-700">
                      <span className="text-gray-400">Taxa da Plataforma</span>
                      <span className="text-white font-medium">
                        {artist.plano === 'FREE' ? '15%' : artist.plano === 'PLUS' ? '10%' : '7%'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-3">
                      <span className="text-white font-bold">Valor Total</span>
                      <span className="text-red-vibrant font-bold text-xl">
                        R$ {calculateEstimatedValue().toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-xs">
                  Esta é uma estimativa. O valor final será confirmado após a negociação com o artista.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
