import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import PortfolioUpload from '../components/PortfolioUpload';

const PLANOS = {
  FREE: { label: 'FREE', color: 'text-chrome/50', bg: 'bg-dark-700', border: 'border-dark-600' },
  PLUS: { label: 'PLUS', color: 'text-neon-acid', bg: 'bg-neon-acid/10', border: 'border-neon-acid/30' },
  PRO: { label: 'PRO', color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30' }
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    enabled: !!user?.id
  });

  const { data: artistData } = useQuery({
    queryKey: ['artist', user?.artista?.id],
    queryFn: async () => {
      const response = await api.get(`/artists/${user.artista.id}`);
      return response.data;
    },
    enabled: user?.tipo === 'ARTISTA' && !!user?.artista?.id
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isArtista = user?.tipo === 'ARTISTA';
  const artist = artistData?.data;

  const portfolioLimits = {
    FREE: 5,
    PLUS: 15,
    PRO: Infinity
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-red mb-4 animate-pulse">...</div>
          <div className="text-xl font-mono text-chrome/50 uppercase tracking-wider">Carregando perfil</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="relative overflow-hidden bg-surface border-b-2 border-neon-red/30">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-red/10 rounded-full filter blur-[150px]"></div>
        </div>

        <div className="relative py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="text-chrome/50 hover:text-neon-red mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-wider transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <div className="flex items-center justify-between">
              <h1 className="text-5xl md:text-6xl font-display tracking-wider text-chrome">
                MEU <span className="text-neon-red">PERFIL</span>
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="px-6 py-3 bg-neon-acid text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal-acid hover:bg-neon-pink hover:shadow-brutal transition-all"
                >
                  Editar Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-dark-800 text-neon-red font-bold font-mono text-sm uppercase tracking-wider border-2 border-neon-red hover:bg-neon-red hover:text-void transition-all"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* User Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-dark-800 border-2 border-dark-600 p-6">
              <h2 className="text-xl font-display tracking-wider text-chrome mb-6 uppercase flex items-center gap-2">
                <span className="text-neon-red">01</span>
                Informacoes
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Nome</div>
                  <div className="text-chrome font-mono text-sm">{userData?.data?.nome}</div>
                </div>

                {isArtista && artist?.nomeArtistico && (
                  <div>
                    <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Nome Artistico</div>
                    <div className="text-chrome font-mono text-sm">{artist.nomeArtistico}</div>
                  </div>
                )}

                <div>
                  <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Email</div>
                  <div className="text-chrome font-mono text-sm">{userData?.data?.email}</div>
                </div>

                <div>
                  <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Tipo de Conta</div>
                  <div className={`inline-block px-3 py-1 border font-mono text-xs uppercase tracking-wider ${
                    isArtista
                      ? 'bg-neon-pink/10 text-neon-pink border-neon-pink/30'
                      : 'bg-neon-acid/10 text-neon-acid border-neon-acid/30'
                  }`}>
                    {isArtista ? 'Artista' : 'Contratante'}
                  </div>
                </div>

                {isArtista && (
                  <>
                    <div>
                      <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Plano</div>
                      <div className={`inline-block px-3 py-1 border font-mono text-xs uppercase tracking-wider ${PLANOS[artist?.plano || 'FREE'].bg} ${PLANOS[artist?.plano || 'FREE'].color} ${PLANOS[artist?.plano || 'FREE'].border}`}>
                        {artist?.plano || 'FREE'}
                      </div>
                    </div>

                    {artist?.categoria && (
                      <div>
                        <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Categoria</div>
                        <div className="text-chrome font-mono text-sm">{artist.categoria}</div>
                      </div>
                    )}

                    {artist?.valorBaseHora && (
                      <div>
                        <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Valor Base</div>
                        <div className="text-neon-red font-display text-2xl">
                          R$ {artist.valorBaseHora}
                          <span className="text-chrome/30 font-mono text-xs">/HR</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {isArtista && artist?.notaMedia > 0 && (
              <div className="bg-dark-800 border-2 border-dark-600 p-6">
                <h3 className="text-lg font-display tracking-wider text-chrome mb-4 uppercase flex items-center gap-2">
                  <span className="text-neon-acid">02</span>
                  Avaliacao
                </h3>
                <div className="text-center">
                  <div className="text-5xl font-display text-neon-acid mb-2">
                    {artist.notaMedia.toFixed(1)}
                  </div>
                  <div className="text-chrome/30 font-mono text-xs uppercase">
                    {artist.totalAvaliacoes || 0} avaliacoes
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Photo */}
            <div className="bg-dark-800 border-2 border-dark-600 p-8">
              <h2 className="text-2xl font-display tracking-wider mb-6 text-chrome uppercase flex items-center gap-3">
                <span className="text-neon-red font-mono text-lg">03</span>
                Foto de Perfil
              </h2>
              <ImageUpload
                currentImage={userData?.data?.foto}
                type="profile"
              />
            </div>

            {/* Portfolio (Artists Only) */}
            {isArtista && (
              <div className="bg-dark-800 border-2 border-dark-600 p-8">
                <h2 className="text-2xl font-display tracking-wider mb-6 text-chrome uppercase flex items-center gap-3">
                  <span className="text-neon-acid font-mono text-lg">04</span>
                  Portfolio
                </h2>
                <PortfolioUpload
                  currentPortfolio={artist?.portfolio || []}
                  limit={portfolioLimits[artist?.plano || 'FREE']}
                />
              </div>
            )}

            {/* Bio (Artists Only) */}
            {isArtista && (
              <div className="bg-dark-800 border-2 border-dark-600 p-8">
                <h2 className="text-2xl font-display tracking-wider mb-4 text-chrome uppercase flex items-center gap-3">
                  <span className="text-neon-pink font-mono text-lg">05</span>
                  Bio
                </h2>
                {artist?.bio ? (
                  <p className="text-chrome/70 font-mono text-sm leading-relaxed whitespace-pre-line">{artist.bio}</p>
                ) : (
                  <p className="text-chrome/30 font-mono text-sm italic">Nenhuma bio adicionada ainda</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
