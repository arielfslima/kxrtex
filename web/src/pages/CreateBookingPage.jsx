import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import LocationAutocomplete from '../components/LocationAutocomplete';

const PLANOS = {
  FREE: { label: 'FREE', color: 'text-chrome/50', bg: 'bg-dark-700', border: 'border-dark-600', taxa: '15%' },
  PLUS: { label: 'PLUS', color: 'text-neon-acid', bg: 'bg-neon-acid/10', border: 'border-neon-acid/30', taxa: '10%' },
  PRO: { label: 'PRO', color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30', taxa: '7%' }
};

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
  const [locationData, setLocationData] = useState({
    local: '',
    localEndereco: '',
    localCidade: '',
    localEstado: '',
    localCEP: '',
    localLatitude: null,
    localLongitude: null,
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
      setError('Artista nao especificado');
      return;
    }

    // Converter data de dd/mm/aaaa para ISO datetime
    const [dia, mes, ano] = formData.dataEvento.split('/');
    const dataHora = `${ano}-${mes}-${dia}T${formData.horarioInicio}:00`;
    const dataEventoISO = new Date(dataHora).toISOString();

    const dataToSend = {
      artistaId,
      dataEvento: dataEventoISO,
      horarioInicio: formData.horarioInicio,
      duracao: parseInt(formData.duracao),
      local: locationData.local || formData.local,
      localEndereco: locationData.localEndereco,
      localCidade: locationData.localCidade,
      localEstado: locationData.localEstado,
      localCEP: locationData.localCEP,
      localLatitude: locationData.localLatitude,
      localLongitude: locationData.localLongitude,
      descricaoEvento: formData.descricaoEvento,
    };

    if (formData.valorProposto) {
      dataToSend.valorProposto = parseFloat(formData.valorProposto);
    }

    console.log('Dados sendo enviados:', dataToSend);
    createBookingMutation.mutate(dataToSend);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationChange = (data) => {
    setLocationData(data);
    setFormData(prev => ({ ...prev, local: data.local }));
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
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-red mb-4">!</div>
          <div className="text-2xl font-display tracking-wider text-chrome mb-2">
            ARTISTA NAO ESPECIFICADO
          </div>
          <button
            onClick={() => navigate('/artists')}
            className="mt-6 px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all"
          >
            Buscar Artistas
          </button>
        </div>
      </div>
    );
  }

  if (user?.tipo !== 'CONTRATANTE') {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-red mb-4">X</div>
          <div className="text-2xl font-display tracking-wider text-chrome mb-2">
            APENAS CONTRATANTES PODEM CRIAR BOOKINGS
          </div>
          <button
            onClick={() => navigate('/artists')}
            className="mt-6 px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/artists/${artistaId}`)}
            className="text-chrome/50 hover:text-neon-red mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-wider transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-5xl md:text-6xl font-display tracking-wider text-chrome mb-2">
            CRIAR <span className="text-neon-red">BOOKING</span>
          </h1>
          <p className="text-chrome/50 font-mono text-sm uppercase tracking-wider">
            Faca uma proposta de booking para {artist?.nomeArtistico}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-dark-800 border-2 border-dark-600 p-8">
              {error && (
                <div className="mb-6 p-4 bg-neon-red/10 border-2 border-neon-red text-neon-red font-mono text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                      Data do Evento *
                    </label>
                    <input
                      type="text"
                      name="dataEvento"
                      value={formData.dataEvento}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) value = value.slice(0,2) + '/' + value.slice(2);
                        if (value.length >= 5) value = value.slice(0,5) + '/' + value.slice(5,9);
                        setFormData({...formData, dataEvento: value});
                      }}
                      required
                      placeholder="dd/mm/aaaa"
                      maxLength="10"
                      className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                      Horario de Inicio *
                    </label>
                    <input
                      type="time"
                      name="horarioInicio"
                      value={formData.horarioInicio}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                    Duracao (horas) *
                  </label>
                  <input
                    type="number"
                    name="duracao"
                    value={formData.duracao}
                    onChange={handleChange}
                    required
                    min="1"
                    max="24"
                    className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                    Local do Evento *
                  </label>
                  <LocationAutocomplete
                    value={locationData.local}
                    onChange={handleLocationChange}
                    placeholder="Digite o endereco do evento"
                  />
                  {locationData.localLatitude && locationData.localLongitude && (
                    <p className="text-neon-acid font-mono text-xs mt-2 uppercase">
                      Localizacao selecionada: {locationData.localLatitude.toFixed(6)}, {locationData.localLongitude.toFixed(6)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
                    Descricao do Evento *
                  </label>
                  <textarea
                    name="descricaoEvento"
                    value={formData.descricaoEvento}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Descreva o tipo de evento, publico esperado, estilo musical desejado, etc."
                    className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-chrome/70 mb-2">
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
                    className="w-full px-4 py-4 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  />
                  <p className="text-chrome/30 font-mono text-xs mt-2 uppercase">
                    Se nao especificar, sera usado o valor base do artista multiplicado pela duracao
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="w-full py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-dark-800 border-2 border-dark-600 p-6">
                <h3 className="text-lg font-display tracking-wider text-chrome mb-4 uppercase">Artista</h3>
                <div className="flex flex-col items-center text-center">
                  {artist.usuario?.foto ? (
                    <img
                      src={artist.usuario.foto}
                      alt={artist.nomeArtistico}
                      className="w-20 h-20 object-cover border-2 border-dark-600 mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-dark-700 border-2 border-dark-600 flex items-center justify-center text-3xl font-display text-neon-red/50 mb-3">
                      A
                    </div>
                  )}
                  <div className="text-xl font-display tracking-wider text-chrome mb-1 uppercase">
                    {artist.nomeArtistico}
                  </div>
                  <div className="text-chrome/50 font-mono text-xs uppercase mb-3">
                    {artist.categoria}
                  </div>
                  <div className={`px-3 py-1 border font-mono text-xs uppercase tracking-wider mb-3 ${PLANOS[artist.plano].bg} ${PLANOS[artist.plano].color} ${PLANOS[artist.plano].border}`}>
                    {artist.plano}
                  </div>
                  <div className="text-neon-red font-display text-2xl">
                    R$ {artist.valorBaseHora}
                    <span className="text-chrome/30 font-mono text-xs">/HR</span>
                  </div>
                </div>
              </div>
            )}

            {/* Price Estimate */}
            <div className="bg-dark-800 border-2 border-dark-600 p-6">
              <h3 className="text-lg font-display tracking-wider text-chrome mb-4 uppercase">Estimativa de Valor</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-chrome/50 font-mono text-xs uppercase">Duracao</span>
                  <span className="text-chrome font-mono text-sm">{formData.duracao}h</span>
                </div>

                {artist && (
                  <>
                    <div className="flex justify-between pb-3 border-b-2 border-dark-600">
                      <span className="text-chrome/50 font-mono text-xs uppercase">Valor do Artista</span>
                      <span className="text-chrome font-mono text-sm">
                        R$ {formData.valorProposto || (artist.valorBaseHora * parseInt(formData.duracao || 0)).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between pb-3 border-b-2 border-dark-600">
                      <span className="text-chrome/50 font-mono text-xs uppercase">Taxa da Plataforma</span>
                      <span className="text-chrome font-mono text-sm">
                        {PLANOS[artist.plano].taxa}
                      </span>
                    </div>

                    <div className="flex justify-between pt-3">
                      <span className="text-chrome font-display tracking-wider uppercase">Valor Total</span>
                      <span className="text-neon-red font-display text-2xl">
                        R$ {calculateEstimatedValue().toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 p-3 bg-neon-acid/10 border-2 border-neon-acid/30">
                <p className="text-neon-acid font-mono text-xs uppercase">
                  Esta e uma estimativa. O valor final sera confirmado apos a negociacao com o artista.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
