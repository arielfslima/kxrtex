import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CATEGORIAS = [
  'DJ',
  'MC',
  'BANDA',
  'CANTOR',
  'PERFORMER',
  'PRODUTOR',
  'OUTRO'
];

const PLANOS = {
  FREE: { label: 'Free', color: 'text-gray-400', bg: 'bg-gray-700' },
  PLUS: { label: 'Plus', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  PRO: { label: 'Pro', color: 'text-purple-400', bg: 'bg-purple-900/30' }
};

export default function ArtistsPage() {
  const [filters, setFilters] = useState({
    categoria: '',
    busca: '',
    minPreco: '',
    maxPreco: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.busca) params.append('busca', filters.busca);
      if (filters.minPreco) params.append('minPreco', filters.minPreco);
      if (filters.maxPreco) params.append('maxPreco', filters.maxPreco);

      const response = await api.get(`/artists?${params.toString()}`);
      return response.data;
    },
  });

  const artists = data?.data || [];

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
              Encontre Seu Artista
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Mais de 500 artistas verificados da cena underground
            </p>

            {/* Search Bar */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="Buscar por nome ou estilo..."
                  value={filters.busca}
                  onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
                  className="w-full px-6 py-4 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
                />
              </div>
              <button
                onClick={() => setFilters({ categoria: '', busca: '', minPreco: '', maxPreco: '' })}
                className="px-6 py-4 bg-dark-800 border border-dark-700 text-gray-400 rounded-xl hover:border-red-vibrant hover:text-red-vibrant transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-wrap">
          {/* Category Filter */}
          <select
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-red-vibrant transition-colors"
          >
            <option value="">Todas as Categorias</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Price Range */}
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min R$"
              value={filters.minPreco}
              onChange={(e) => setFilters({ ...filters, minPreco: e.target.value })}
              className="w-28 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
            />
            <span className="text-gray-500">até</span>
            <input
              type="number"
              placeholder="Max R$"
              value={filters.maxPreco}
              onChange={(e) => setFilters({ ...filters, maxPreco: e.target.value })}
              className="w-28 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
            />
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="mb-6 text-gray-400">
            {artists.length} {artists.length === 1 ? 'artista encontrado' : 'artistas encontrados'}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-2xl p-6 animate-pulse">
                <div className="w-full h-48 bg-dark-700 rounded-xl mb-4"></div>
                <div className="h-6 bg-dark-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-dark-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-dark-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-dark-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-2xl font-bold text-red-vibrant mb-2">
              Erro ao carregar artistas
            </div>
            <div className="text-gray-400 mb-6">
              {error.message}
            </div>
            <div className="text-sm text-gray-500">
              Certifique-se de que o backend está rodando em http://localhost:3000
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && artists.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎵</div>
            <div className="text-2xl font-bold text-gray-300 mb-2">
              Nenhum artista encontrado
            </div>
            <div className="text-gray-400 mb-6">
              Tente ajustar os filtros para encontrar mais resultados
            </div>
            <button
              onClick={() => setFilters({ categoria: '', busca: '', minPreco: '', maxPreco: '' })}
              className="px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Artists Grid */}
        {!isLoading && !error && artists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                to={`/artists/${artist.id}`}
                className="group relative bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl overflow-hidden hover:border-red-vibrant/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-vibrant/20"
              >
                {/* Image/Avatar */}
                <div className="relative h-48 bg-gradient-to-br from-dark-700 to-dark-800 overflow-hidden">
                  {artist.usuario?.foto ? (
                    <img
                      src={artist.usuario.foto}
                      alt={artist.nomeArtistico}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🎵
                    </div>
                  )}

                  {/* Plan Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 ${PLANOS[artist.plano].bg} ${PLANOS[artist.plano].color} rounded-full text-xs font-bold backdrop-blur-sm border border-current/20`}>
                    {PLANOS[artist.plano].label}
                  </div>

                  {/* Verified Badge */}
                  {artist.statusVerificacao === 'VERIFICADO' && (
                    <div className="absolute top-3 right-3 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                      ✓ Verificado
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-vibrant transition-colors">
                    {artist.nomeArtistico}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-dark-700 text-gray-300 rounded-full text-sm">
                      {artist.categoria}
                    </span>
                    {artist.subcategoria && (
                      <span className="px-3 py-1 bg-dark-700 text-gray-400 rounded-full text-xs">
                        {artist.subcategoria}
                      </span>
                    )}
                  </div>

                  {artist.bio && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {artist.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                    <div className="text-red-vibrant font-bold text-lg">
                      R$ {artist.valorBaseHora}
                      <span className="text-gray-500 text-sm font-normal">/hora</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        ⭐ {artist.notaMedia.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{artist.totalBookings} shows</span>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-vibrant/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
