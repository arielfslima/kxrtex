import { useState } from 'react';

const mockArtists = [
  {
    id: 1,
    nomeArtistico: 'DJ Phoenix',
    categoria: 'DJ',
    plano: 'PRO',
    precoBase: 1500,
    cidadeBase: 'Sao Paulo',
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
    cidadeBase: 'Sao Paulo',
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

  const getPlanoBadge = (plano) => {
    switch (plano) {
      case 'PRO':
        return 'border-neon-purple bg-neon-purple text-dark-950';
      case 'PLUS':
        return 'border-neon-cyan bg-neon-cyan text-dark-950';
      default:
        return 'border-chrome/30 bg-transparent text-chrome';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-display text-chrome uppercase tracking-wider">
          Busca de Artistas
        </h2>
        <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">
          Sistema avancado de busca com filtros e ranking inteligente
        </p>
      </div>

      <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
              Categoria
            </label>
            <select
              value={filters.categoria}
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
              className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
            >
              <option value="">Todas</option>
              <option value="DJ">DJ</option>
              <option value="MC">MC</option>
              <option value="PERFORMER">Performer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
              Plano
            </label>
            <select
              value={filters.plano}
              onChange={(e) => setFilters({ ...filters, plano: e.target.value })}
              className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
            >
              <option value="">Todos</option>
              <option value="FREE">FREE</option>
              <option value="PLUS">PLUS</option>
              <option value="PRO">PRO</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
              Cidade
            </label>
            <input
              type="text"
              value={filters.cidade}
              onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
              placeholder="Digite a cidade..."
              className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-chrome/50 border-t-2 border-dark-700 pt-4">
          <span>[{filteredArtists.length}] ARTISTAS ENCONTRADOS</span>
          <span>ORDENADO POR RANKING (PLANO + AVALIACAO + BOOKINGS)</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map((artist) => (
          <div
            key={artist.id}
            className="border-2 border-dark-600 bg-dark-900/50 p-5 hover:border-neon-red/50 hover:shadow-[0_0_30px_rgba(255,0,68,0.1)] transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4 mb-4">
              <img
                src={artist.fotoPerfil}
                alt={artist.nomeArtistico}
                className="w-14 h-14 object-cover grayscale group-hover:grayscale-0 transition-all border-2 border-dark-600"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-mono font-bold text-chrome truncate">
                    {artist.nomeArtistico}
                  </h3>
                  {artist.statusVerificacao === 'VERIFICADO' && (
                    <span className="text-neon-acid text-xs">[V]</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${getPlanoBadge(artist.plano)}`}>
                    {artist.plano}
                  </span>
                  <span className="text-xs font-mono text-chrome/50">{artist.categoria}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-dark-700 pb-2">
                <span className="text-chrome/50">LOCAL</span>
                <span className="text-chrome">{artist.cidadeBase}</span>
              </div>
              <div className="flex items-center justify-between border-b border-dark-700 pb-2">
                <span className="text-chrome/50">PRECO BASE</span>
                <span className="text-neon-acid font-bold">
                  R$ {artist.precoBase.toLocaleString('pt-BR')}/h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-chrome/50">RATING</span>
                <div className="flex items-center gap-1">
                  <span className="text-neon-gold">{artist.avaliacaoMedia}</span>
                  <span className="text-chrome/30">({artist.totalBookings})</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 border-2 border-neon-red bg-neon-red/10 text-neon-red font-mono text-xs uppercase tracking-wider hover:bg-neon-red hover:text-dark-950 transition-all">
              VER PERFIL
            </button>
          </div>
        ))}
      </div>

      <div className="border-2 border-neon-cyan/30 bg-neon-cyan/5 p-4 text-center">
        <p className="text-neon-cyan font-mono text-xs uppercase tracking-wider">
          <span className="font-bold">[ALGORITMO]</span> score = (plano x 40) + (avaliacao x 30) + (bookings x 20) + (perfil_completo x 10)
        </p>
      </div>
    </div>
  );
};

export default DemoSearch;
