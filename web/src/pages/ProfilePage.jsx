import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import PortfolioUpload from '../components/PortfolioUpload';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">👤</div>
          <div className="text-xl text-gray-400">Carregando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 border-b border-dark-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-vibrant rounded-full filter blur-[100px] animate-pulse"></div>
        </div>

        <div className="relative py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-vibrant via-pink-500 to-purple-600 text-transparent bg-clip-text">
                Meu Perfil
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
                >
                  Editar Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors"
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
            <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Informações
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-sm mb-1">Nome</div>
                  <div className="text-white font-medium">{userData?.data?.nome}</div>
                </div>

                {isArtista && artist?.nomeArtistico && (
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Nome Artístico</div>
                    <div className="text-white font-medium">{artist.nomeArtistico}</div>
                  </div>
                )}

                <div>
                  <div className="text-gray-500 text-sm mb-1">Email</div>
                  <div className="text-white font-medium">{userData?.data?.email}</div>
                </div>

                <div>
                  <div className="text-gray-500 text-sm mb-1">Tipo de Conta</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    isArtista
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {isArtista ? 'Artista' : 'Contratante'}
                  </div>
                </div>

                {isArtista && (
                  <>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Plano</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        artist?.plano === 'PRO'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                          : artist?.plano === 'PLUS'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {artist?.plano || 'FREE'}
                      </div>
                    </div>

                    {artist?.categoria && (
                      <div>
                        <div className="text-gray-500 text-sm mb-1">Categoria</div>
                        <div className="text-white font-medium">{artist.categoria}</div>
                      </div>
                    )}

                    {artist?.valorBase && (
                      <div>
                        <div className="text-gray-500 text-sm mb-1">Valor Base</div>
                        <div className="text-white font-medium">
                          R$ {artist.valorBase.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {isArtista && artist?.avaliacaoMedia > 0 && (
              <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  Avaliação
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-black text-yellow-400 mb-2">
                    {artist.avaliacaoMedia.toFixed(1)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {artist.totalAvaliacoes} avaliações
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Photo */}
            <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📸</span>
                Foto de Perfil
              </h2>
              <ImageUpload
                currentImage={userData?.data?.foto}
                type="profile"
              />
            </div>

            {/* Portfolio (Artists Only) */}
            {isArtista && (
              <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">🎨</span>
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
              <div className="bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  Bio
                </h2>
                {artist?.bio ? (
                  <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">Nenhuma bio adicionada ainda</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
