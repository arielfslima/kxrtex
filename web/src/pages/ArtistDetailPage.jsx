import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const PLANOS = {
  FREE: { label: 'Free', color: 'text-gray-400', bg: 'bg-gray-700' },
  PLUS: { label: 'Plus', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  PRO: { label: 'Pro', color: 'text-purple-400', bg: 'bg-purple-900/30' }
};

export default function ArtistDetailPage() {
  const { id } = useParams();

  const { data: artist, isLoading, error } = useQuery({
    queryKey: ['artist', id],
    queryFn: async () => {
      const response = await api.get(`/artists/${id}`);
      return response.data.data;
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['artist-reviews', id],
    queryFn: async () => {
      const response = await api.get(`/artists/${id}/reviews`);
      return response.data;
    },
    enabled: !!id,
  });

  const reviews = reviewsData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-dark-800 rounded-3xl mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="h-40 bg-dark-800 rounded-2xl"></div>
                <div className="h-60 bg-dark-800 rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-dark-800 rounded-2xl"></div>
                <div className="h-32 bg-dark-800 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl font-bold text-red-vibrant mb-2">
            Erro ao carregar artista
          </div>
          <div className="text-gray-400 mb-6">{error.message}</div>
          <Link
            to="/artists"
            className="inline-block px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
          >
            Voltar para Artistas
          </Link>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <div className="text-2xl font-bold text-gray-300 mb-2">
            Artista não encontrado
          </div>
          <Link
            to="/artists"
            className="inline-block px-6 py-3 bg-red-vibrant text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
          >
            Voltar para Artistas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-full h-full bg-red-vibrant rounded-full filter blur-[150px] animate-pulse"></div>
        </div>

        {artist.usuario?.foto && (
          <div className="absolute inset-0">
            <img
              src={artist.usuario.foto}
              alt={artist.nomeArtistico}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent"></div>
          </div>
        )}

        <div className="relative h-full max-w-6xl mx-auto px-6 flex items-end pb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-4 py-2 ${PLANOS[artist.plano].bg} ${PLANOS[artist.plano].color} rounded-full text-sm font-bold backdrop-blur-sm border border-current/20`}>
                {PLANOS[artist.plano].label}
              </div>
              {artist.statusVerificacao === 'VERIFICADO' && (
                <div className="bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm flex items-center gap-2">
                  ✓ Verificado
                </div>
              )}
              <div className="px-4 py-2 bg-dark-800/90 text-gray-300 rounded-full text-sm backdrop-blur-sm">
                {artist.categoria}
              </div>
            </div>

            <h1 className="text-6xl font-black text-white mb-4">
              {artist.nomeArtistico}
            </h1>

            <div className="flex items-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-bold">{artist.notaMedia.toFixed(1)}</span>
                <span className="text-gray-400">({reviews.length} avaliações)</span>
              </div>
              <div className="text-gray-400">
                {artist.totalBookings} shows realizados
              </div>
            </div>
          </div>

          <Link
            to={`/bookings/create?artistaId=${artist.id}`}
            className="px-10 py-5 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold text-lg rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-red-vibrant/60 transition-all"
          >
            Solicitar Booking
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Sobre</h2>
              {artist.bio ? (
                <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                  {artist.bio}
                </p>
              ) : (
                <p className="text-gray-500 italic">Sem descrição disponível</p>
              )}
            </div>

            {/* Portfolio */}
            {artist.portfolio && artist.portfolio.length > 0 && (
              <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-8">
                <h2 className="text-3xl font-bold mb-6 text-white">Portfolio</h2>
                <div className="grid grid-cols-2 gap-4">
                  {artist.portfolio.map((url, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden bg-dark-700">
                      <img
                        src={url}
                        alt={`${artist.nomeArtistico} portfolio ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">
                Avaliações {reviews.length > 0 && `(${reviews.length})`}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-gray-500 italic">Nenhuma avaliação ainda</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-dark-700 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-white mb-1">
                            {review.avaliador?.nome || 'Usuário'}
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < review.notaGeral ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {review.comentario && (
                        <p className="text-gray-300 leading-relaxed">{review.comentario}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Preços</h3>
              <div className="text-4xl font-black text-red-vibrant mb-2">
                R$ {artist.valorBaseHora}
                <span className="text-lg text-gray-500 font-normal">/hora</span>
              </div>
              <p className="text-gray-400 text-sm">
                Valor base, pode variar conforme o evento
              </p>
            </div>

            {/* Info */}
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Informações</h3>
              <div className="space-y-3 text-sm">
                {artist.subcategoria && (
                  <div>
                    <div className="text-gray-500 mb-1">Especialidade</div>
                    <div className="text-white font-medium">{artist.subcategoria}</div>
                  </div>
                )}
                {artist.cidade && (
                  <div>
                    <div className="text-gray-500 mb-1">Localização</div>
                    <div className="text-white font-medium">{artist.cidade}</div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500 mb-1">Disponibilidade</div>
                  <div className="text-white font-medium">
                    {artist.disponibilidade === 'DISPONIVEL' ? '✓ Disponível' : '✗ Indisponível'}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Estatísticas</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Qualidade</span>
                    <span className="text-white font-bold">{artist.notaMedia.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-vibrant to-pink-500 h-2 rounded-full"
                      style={{ width: `${(artist.notaMedia / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Shows</span>
                    <span className="text-white font-bold">{artist.totalBookings}</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((artist.totalBookings / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              to={`/bookings/create?artistaId=${artist.id}`}
              className="block w-full px-8 py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold text-center rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-red-vibrant/60 transition-all"
            >
              Solicitar Booking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
