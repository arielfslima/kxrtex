import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen">
      {/* Hero/Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 border-b border-dark-700 mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-vibrant rounded-full filter blur-[100px] animate-pulse"></div>
        </div>

        <div className="relative py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-red-vibrant via-pink-500 to-purple-600 text-transparent bg-clip-text">
              Meus Bookings
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Gerencie seus agendamentos e propostas
            </p>

            {/* Status Filter */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  statusFilter === ''
                    ? 'bg-red-vibrant text-white shadow-lg shadow-red-vibrant/50'
                    : 'bg-dark-800 text-gray-400 border border-dark-700 hover:border-red-vibrant/50'
                }`}
              >
                Todos
              </button>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    statusFilter === status
                      ? `${config.color} border`
                      : 'bg-dark-800 text-gray-400 border border-dark-700 hover:border-red-vibrant/50'
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
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-dark-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-dark-700 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-dark-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-2xl font-bold text-red-vibrant mb-2">
              Erro ao carregar bookings
            </div>
            <div className="text-gray-400 mb-6">
              {error.message}
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <div className="text-2xl font-bold text-gray-300 mb-2">
              Nenhum booking encontrado
            </div>
            <div className="text-gray-400 mb-6">
              {statusFilter
                ? 'Nenhum booking com este status'
                : user?.tipo === 'CONTRATANTE'
                ? 'Comece contratando um artista'
                : 'Aguarde propostas de contratantes'}
            </div>
            {user?.tipo === 'CONTRATANTE' && !statusFilter && (
              <Link
                to="/artists"
                className="inline-block px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
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
                  className="block group relative bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-6 hover:border-red-vibrant/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-vibrant/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {otherUser?.foto ? (
                        <img
                          src={otherUser.foto}
                          alt={otherUser.nome}
                          className="w-16 h-16 rounded-full object-cover border-2 border-dark-700 group-hover:border-red-vibrant transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-dark-700 border-2 border-dark-700 group-hover:border-red-vibrant flex items-center justify-center text-2xl transition-colors">
                          {user?.tipo === 'CONTRATANTE' ? '🎵' : '📅'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-red-vibrant transition-colors">
                          {user?.tipo === 'CONTRATANTE'
                            ? booking.artista?.nomeArtistico || otherUser?.nome
                            : otherUser?.nome}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {user?.tipo === 'CONTRATANTE' ? 'Artista' : 'Contratante'}
                        </p>
                      </div>
                    </div>

                    <div className={`px-4 py-2 rounded-full border text-sm font-bold ${STATUS_CONFIG[booking.status].color}`}>
                      {STATUS_CONFIG[booking.status].label}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Data do Evento</div>
                      <div className="text-white font-medium">
                        {formatDate(booking.dataEvento)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Local</div>
                      <div className="text-white font-medium truncate">
                        {booking.local}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Valor Total</div>
                      <div className="text-red-vibrant font-bold text-lg">
                        R$ {booking.valorTotal?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {booking.descricaoEvento && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {booking.descricaoEvento}
                    </p>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"></div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
