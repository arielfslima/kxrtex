import { useState } from 'react';

const mockArtists = [
  {
    id: 1,
    nomeArtistico: 'DJ Phoenix',
    categoria: 'DJ',
    plano: 'PRO',
    precoBase: 1500,
    cidadeBase: 'São Paulo',
    avaliacaoMedia: 4.8,
    totalBookings: 147,
    fotoPerfil: 'https://i.pravatar.cc/150?img=33',
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 2,
    nomeArtistico: 'MC Flow',
    categoria: 'MC',
    plano: 'PLUS',
    precoBase: 800,
    cidadeBase: 'Rio de Janeiro',
    avaliacaoMedia: 4.6,
    totalBookings: 89,
    fotoPerfil: 'https://i.pravatar.cc/150?img=15',
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 3,
    nomeArtistico: 'DJ Nexus',
    categoria: 'DJ',
    plano: 'PLUS',
    precoBase: 900,
    cidadeBase: 'São Paulo',
    avaliacaoMedia: 4.7,
    totalBookings: 112,
    fotoPerfil: 'https://i.pravatar.cc/150?img=22',
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 4,
    nomeArtistico: 'Performer Eclipse',
    categoria: 'PERFORMER',
    plano: 'FREE',
    precoBase: 500,
    cidadeBase: 'Belo Horizonte',
    avaliacaoMedia: 4.5,
    totalBookings: 45,
    fotoPerfil: 'https://i.pravatar.cc/150?img=27',
    statusVerificacao: 'PENDENTE',
  },
  {
    id: 5,
    nomeArtistico: 'DJ Underground',
    categoria: 'DJ',
    plano: 'FREE',
    precoBase: 600,
    cidadeBase: 'Curitiba',
    avaliacaoMedia: 4.4,
    totalBookings: 67,
    fotoPerfil: 'https://i.pravatar.cc/150?img=31',
    statusVerificacao: 'PENDENTE',
  },
  {
    id: 6,
    nomeArtistico: 'MC Thunder',
    categoria: 'MC',
    plano: 'PLUS',
    precoBase: 750,
    cidadeBase: 'Porto Alegre',
    avaliacaoMedia: 4.6,
    totalBookings: 78,
    fotoPerfil: 'https://i.pravatar.cc/150?img=18',
    statusVerificacao: 'VERIFICADO',
  },
];

const DemoSearch = () => {
  const [filters, setFilters] = useState({
    categoria: '',
    plano: '',
    cidade: '',
  });

  const filteredArtists = mockArtists.filter((artist) => {
    if (filters.categoria && artist.categoria !== filters.categoria) return false;
    if (filters.plano && artist.plano !== filters.plano) return false;
    if (filters.cidade && !artist.cidadeBase.toLowerCase().includes(filters.cidade.toLowerCase())) return false;
    return true;
  });

  const getPlanoBadgeColor = (plano) => {
    switch (plano) {
      case 'PRO':
        return 'bg-purple-500';
      case 'PLUS':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Busca de Artistas</h2>
        <p className="text-gray-400 text-lg">
          Sistema avançado de busca com filtros e ranking inteligente
        </p>
      </div>

      <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoria
            </label>
            <select
              value={filters.categoria}
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
              className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
            >
              <option value="">Todas</option>
              <option value="DJ">DJ</option>
              <option value="MC">MC</option>
              <option value="PERFORMER">Performer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plano
            </label>
            <select
              value={filters.plano}
              onChange={(e) => setFilters({ ...filters, plano: e.target.value })}
              className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
            >
              <option value="">Todos</option>
              <option value="FREE">FREE</option>
              <option value="PLUS">PLUS</option>
              <option value="PRO">PRO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cidade
            </label>
            <input
              type="text"
              value={filters.cidade}
              onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
              placeholder="Digite a cidade..."
              className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{filteredArtists.length} artistas encontrados</span>
          <span>Ordenado por ranking (plano + avaliação + bookings)</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <div
            key={artist.id}
            className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:scale-105 hover:border-red-vibrant/50 transition cursor-pointer"
          >
            <div className="flex items-start gap-4 mb-4">
              <img
                src={artist.fotoPerfil}
                alt={artist.nomeArtistico}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">
                    {artist.nomeArtistico}
                  </h3>
                  {artist.statusVerificacao === 'VERIFICADO' && (
                    <span className="text-blue-500" title="Verificado">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium text-white rounded ${getPlanoBadgeColor(artist.plano)}`}>
                    {artist.plano}
                  </span>
                  <span className="text-sm text-gray-400">{artist.categoria}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Localização</span>
                <span className="text-white">{artist.cidadeBase}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Preço Base</span>
                <span className="text-white font-semibold">
                  R$ {artist.precoBase.toLocaleString('pt-BR')}/hora
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Avaliação</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-white">{artist.avaliacaoMedia}</span>
                  <span className="text-gray-500">({artist.totalBookings})</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-lg hover:scale-105 transition font-medium">
              Ver Perfil
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
        <p className="text-blue-400 text-sm">
          <strong>Algoritmo de Ranking:</strong> score = (plano × 40) + (avaliação × 30) + (bookings × 20) + (perfil_completo × 10)
        </p>
      </div>
    </div>
  );
};

export default DemoSearch;
