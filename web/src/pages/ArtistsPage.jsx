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
  FREE: { label: 'FREE', color: 'text-chrome/50', bg: 'bg-dark-700', border: 'border-dark-600' },
  PLUS: { label: 'PLUS', color: 'text-neon-acid', bg: 'bg-neon-acid/10', border: 'border-neon-acid/30' },
  PRO: { label: 'PRO', color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30' }
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
    <div className="min-h-screen bg-void">
      {/* Hero/Header */}
      <div className="relative overflow-hidden bg-surface border-b-2 border-neon-red/30 mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-red/10 rounded-full filter blur-[150px]"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-neon-pink/10 rounded-full filter blur-[100px]"></div>
        </div>

        <div className="relative py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display tracking-wider mb-4 text-chrome">
              ENCONTRE SEU <span className="text-neon-red">ARTISTA</span>
            </h1>
            <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest mb-8">
              Mais de 500 artistas verificados da cena underground
            </p>

            {/* Search Bar */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="BUSCAR POR NOME OU ESTILO..."
                  value={filters.busca}
                  onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
                  className="w-full px-6 py-4 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors uppercase tracking-wider"
                />
              </div>
              <button
                onClick={() => setFilters({ categoria: '', busca: '', minPreco: '', maxPreco: '' })}
                className="px-6 py-4 bg-dark-800 border-2 border-dark-600 text-chrome/50 font-mono text-sm uppercase tracking-wider hover:border-neon-red hover:text-neon-red transition-colors"
              >
                Limpar
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
            className="px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-neon-red transition-colors cursor-pointer"
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
              placeholder="MIN R$"
              value={filters.minPreco}
              onChange={(e) => setFilters({ ...filters, minPreco: e.target.value })}
              className="w-28 px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors uppercase"
            />
            <span className="text-chrome/30 font-mono text-sm">ATE</span>
            <input
              type="number"
              placeholder="MAX R$"
              value={filters.maxPreco}
              onChange={(e) => setFilters({ ...filters, maxPreco: e.target.value })}
              className="w-28 px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors uppercase"
            />
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="mb-6 text-chrome/50 font-mono text-sm uppercase tracking-wider">
            {artists.length} {artists.length === 1 ? 'artista encontrado' : 'artistas encontrados'}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-dark-800 border-2 border-dark-600 p-6 animate-pulse">
                <div className="w-full h-48 bg-dark-700 mb-4"></div>
                <div className="h-6 bg-dark-700 w-3/4 mb-3"></div>
                <div className="h-4 bg-dark-700 w-1/2 mb-4"></div>
                <div className="h-4 bg-dark-700 w-full mb-2"></div>
                <div className="h-4 bg-dark-700 w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="text-8xl font-display text-neon-red mb-4">!</div>
            <div className="text-2xl font-display tracking-wider text-chrome mb-2">
              ERRO AO CARREGAR ARTISTAS
            </div>
            <div className="text-chrome/50 font-mono text-sm mb-6">
              {error.message}
            </div>
            <div className="text-chrome/30 font-mono text-xs uppercase">
              Certifique-se de que o backend esta rodando em http://localhost:3000
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && artists.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl font-display text-neon-acid mb-4">0</div>
            <div className="text-2xl font-display tracking-wider text-chrome mb-2">
              NENHUM ARTISTA ENCONTRADO
            </div>
            <div className="text-chrome/50 font-mono text-sm mb-6">
              Tente ajustar os filtros para encontrar mais resultados
            </div>
            <button
              onClick={() => setFilters({ categoria: '', busca: '', minPreco: '', maxPreco: '' })}
              className="px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal-sm hover:bg-neon-acid hover:shadow-brutal-acid transition-colors"
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
                className="group relative bg-dark-800 border-2 border-dark-600 overflow-hidden hover:border-neon-red transition-all hover:-translate-y-1 shadow-brutal-sm hover:shadow-brutal"
              >
                {/* Image/Avatar */}
                <div className="relative h-48 bg-dark-700 overflow-hidden">
                  {artist.usuario?.foto ? (
                    <img
                      src={artist.usuario.foto}
                      alt={artist.nomeArtistico}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-display text-neon-red/30">{artist.nomeArtistico?.charAt(0)}</span>
                    </div>
                  )}

                  {/* Plan Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 ${PLANOS[artist.plano].bg} ${PLANOS[artist.plano].color} ${PLANOS[artist.plano].border} border text-xs font-bold font-mono uppercase tracking-wider`}>
                    {PLANOS[artist.plano].label}
                  </div>

                  {/* Verified Badge */}
                  {artist.statusVerificacao === 'VERIFICADO' && (
                    <div className="absolute top-3 right-3 bg-neon-acid text-void px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                      VERIFICADO
                    </div>
                  )}

                  {/* Diagonal overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-800 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-display tracking-wider text-chrome mb-2 group-hover:text-neon-red transition-colors uppercase">
                    {artist.nomeArtistico}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-dark-700 border border-dark-600 text-chrome/70 font-mono text-xs uppercase">
                      {artist.categoria}
                    </span>
                    {artist.subcategoria && (
                      <span className="px-3 py-1 bg-dark-700 border border-dark-600 text-chrome/50 font-mono text-xs uppercase">
                        {artist.subcategoria}
                      </span>
                    )}
                  </div>

                  {artist.bio && (
                    <p className="text-chrome/50 font-mono text-xs mb-4 line-clamp-2 leading-relaxed">
                      {artist.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t-2 border-dark-600">
                    <div className="text-neon-red font-display text-2xl">
                      R$ {artist.valorBaseHora}
                      <span className="text-chrome/30 font-mono text-xs">/HR</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs text-chrome/50 uppercase">
                      <span className="flex items-center gap-1">
                        <span className="text-neon-acid">{artist.notaMedia.toFixed(1)}</span>
                      </span>
                      <span className="text-dark-600">|</span>
                      <span>{artist.totalBookings} SHOWS</span>
                    </div>
                  </div>
                </div>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-neon-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
