import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const STATUS_CONFIG = {
  PENDENTE: { label: 'PENDENTE', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  ACEITO: { label: 'ACEITO', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  CONFIRMADO: { label: 'CONFIRMADO', color: 'bg-neon-acid/10 text-neon-acid border-neon-acid/30' },
  EM_ANDAMENTO: { label: 'EM ANDAMENTO', color: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30' },
  CONCLUIDO: { label: 'CONCLUIDO', color: 'bg-chrome/10 text-chrome/50 border-chrome/30' },
  CANCELADO: { label: 'CANCELADO', color: 'bg-neon-red/10 text-neon-red border-neon-red/30' },
  DISPUTA: { label: 'DISPUTA', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

export default function BookingsPage() {
  const user = useAuthStore((state) => state.user);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/bookings?${params.toString()}`);
      return response.data;
    },
  });

  const bookings = data?.data || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Hero/Header */}
      <div className="relative overflow-hidden bg-surface border-b-2 border-neon-red/30 mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-red/10 rounded-full filter blur-[150px]"></div>
        </div>

        <div className="relative py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display tracking-wider mb-4 text-chrome">
              MEUS <span className="text-neon-red">BOOKINGS</span>
            </h1>
            <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest mb-8">
              Gerencie seus agendamentos e propostas
            </p>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                  statusFilter === ''
                    ? 'bg-neon-red text-void shadow-brutal-sm'
                    : 'bg-dark-800 text-chrome/50 border-2 border-dark-600 hover:border-neon-red/50'
                }`}
              >
                Todos
              </button>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border-2 transition-all ${
                    statusFilter === status
                      ? config.color
                      : 'bg-dark-800 text-chrome/50 border-dark-600 hover:border-neon-red/50'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-800 border-2 border-dark-600 p-6 animate-pulse">
                <div className="h-6 bg-dark-700 w-1/3 mb-4"></div>
                <div className="h-4 bg-dark-700 w-1/2 mb-3"></div>
                <div className="h-4 bg-dark-700 w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="text-8xl font-display text-neon-red mb-4">!</div>
            <div className="text-2xl font-display tracking-wider text-chrome mb-2">
              ERRO AO CARREGAR BOOKINGS
            </div>
            <div className="text-chrome/50 font-mono text-sm mb-6">
              {error.message}
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal-sm hover:bg-neon-acid hover:shadow-brutal-acid transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl font-display text-neon-acid mb-4">0</div>
            <div className="text-2xl font-display tracking-wider text-chrome mb-2">
              NENHUM BOOKING ENCONTRADO
            </div>
            <div className="text-chrome/50 font-mono text-sm mb-6">
              {statusFilter
                ? 'Nenhum booking com este status'
                : user?.tipo === 'CONTRATANTE'
                ? 'Comece contratando um artista'
                : 'Aguarde propostas de contratantes'}
            </div>
            {user?.tipo === 'CONTRATANTE' && !statusFilter && (
              <Link
                to="/artists"
                className="inline-block px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal-sm hover:bg-neon-acid hover:shadow-brutal-acid transition-colors"
              >
                Buscar Artistas
              </Link>
            )}
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const otherUser = user?.tipo === 'CONTRATANTE'
                ? booking.artista?.usuario
                : booking.contratante?.usuario;

              return (
                <Link
                  key={booking.id}
                  to={`/bookings/${booking.id}`}
                  className="block group relative bg-dark-800 border-2 border-dark-600 p-6 hover:border-neon-red transition-all hover:-translate-y-1 shadow-brutal-sm hover:shadow-brutal"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {otherUser?.foto ? (
                        <img
                          src={otherUser.foto}
                          alt={otherUser.nome}
                          className="w-16 h-16 object-cover border-2 border-dark-600 group-hover:border-neon-red transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-dark-700 border-2 border-dark-600 group-hover:border-neon-red flex items-center justify-center text-2xl font-display text-neon-red/50 transition-colors">
                          {user?.tipo === 'CONTRATANTE' ? 'A' : 'C'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-display tracking-wider text-chrome group-hover:text-neon-red transition-colors uppercase">
                          {user?.tipo === 'CONTRATANTE'
                            ? booking.artista?.nomeArtistico || otherUser?.nome
                            : otherUser?.nome}
                        </h3>
                        <p className="text-chrome/50 font-mono text-xs uppercase">
                          {user?.tipo === 'CONTRATANTE' ? 'Artista' : 'Contratante'}
                        </p>
                      </div>
                    </div>

                    <div className={`px-3 py-1 border font-mono text-xs uppercase tracking-wider ${STATUS_CONFIG[booking.status].color}`}>
                      {STATUS_CONFIG[booking.status].label}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Data do Evento</div>
                      <div className="text-chrome font-mono text-sm">
                        {formatDate(booking.dataEvento)}
                      </div>
                    </div>
                    <div>
                      <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Local</div>
                      <div className="text-chrome font-mono text-sm truncate">
                        {booking.local}
                      </div>
                    </div>
                    <div>
                      <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Valor Total</div>
                      <div className="text-neon-red font-display text-2xl">
                        R$ {booking.valorTotal?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {booking.descricaoEvento && (
                    <p className="text-chrome/50 font-mono text-xs line-clamp-2">
                      {booking.descricaoEvento}
                    </p>
                  )}

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-neon-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
