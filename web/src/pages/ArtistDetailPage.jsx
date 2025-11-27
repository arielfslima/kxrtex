import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const PLANOS = {
  FREE: { label: 'FREE', color: 'text-chrome/50', bg: 'bg-dark-700', border: 'border-dark-600' },
  PLUS: { label: 'PLUS', color: 'text-neon-acid', bg: 'bg-neon-acid/10', border: 'border-neon-acid/30' },
  PRO: { label: 'PRO', color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30' }
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
      const response = await api.get(`/reviews/artist/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const reviews = reviewsData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-dark-800 border-2 border-dark-600 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="h-40 bg-dark-800 border-2 border-dark-600"></div>
                <div className="h-60 bg-dark-800 border-2 border-dark-600"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-dark-800 border-2 border-dark-600"></div>
                <div className="h-32 bg-dark-800 border-2 border-dark-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-red mb-4">!</div>
          <div className="text-2xl font-display tracking-wider text-chrome mb-2">
            ERRO AO CARREGAR ARTISTA
          </div>
          <div className="text-chrome/50 font-mono text-sm mb-6">{error.message}</div>
          <Link
            to="/artists"
            className="inline-block px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal-sm hover:bg-neon-acid hover:shadow-brutal-acid transition-colors"
          >
            Voltar para Artistas
          </Link>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-display text-neon-acid mb-4">?</div>
          <div className="text-2xl font-display tracking-wider text-chrome mb-2">
            ARTISTA NAO ENCONTRADO
          </div>
          <Link
            to="/artists"
            className="inline-block px-6 py-3 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider shadow-brutal-sm hover:bg-neon-acid hover:shadow-brutal-acid transition-colors"
          >
            Voltar para Artistas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void pb-20">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden bg-surface border-b-2 border-neon-red/30">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-full h-full bg-neon-red/10 rounded-full filter blur-[150px]"></div>
        </div>

        {artist.usuario?.foto && (
          <div className="absolute inset-0">
            <img
              src={artist.usuario.foto}
              alt={artist.nomeArtistico}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-transparent"></div>
          </div>
        )}

        <div className="relative h-full max-w-6xl mx-auto px-6 flex items-end pb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-3 py-1 ${PLANOS[artist.plano].bg} ${PLANOS[artist.plano].color} border ${PLANOS[artist.plano].border} font-mono text-xs uppercase tracking-wider`}>
                {PLANOS[artist.plano].label}
              </div>
              {artist.statusVerificacao === 'VERIFICADO' && (
                <div className="bg-neon-acid text-void px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold">
                  VERIFICADO
                </div>
              )}
              <div className="px-3 py-1 bg-dark-800 border border-dark-600 text-chrome/70 font-mono text-xs uppercase">
                {artist.categoria}
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-display tracking-wider text-chrome mb-4 uppercase">
              {artist.nomeArtistico}
            </h1>

            <div className="flex items-center gap-6 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="text-neon-acid font-bold">{artist.notaMedia.toFixed(1)}</span>
                <span className="text-chrome/50">({reviews.length} avaliacoes)</span>
              </div>
              <div className="text-chrome/50">
                {artist.totalBookings} SHOWS REALIZADOS
              </div>
            </div>
          </div>

          <Link
            to={`/bookings/create?artistaId=${artist.id}`}
            className="px-8 py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all glitch-hover"
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
            <div className="bg-dark-800 border-2 border-dark-600 p-8">
              <h2 className="text-3xl font-display tracking-wider mb-6 text-chrome uppercase">Sobre</h2>
              {artist.bio ? (
                <p className="text-chrome/70 font-mono text-sm leading-relaxed whitespace-pre-line">
                  {artist.bio}
                </p>
              ) : (
                <p className="text-chrome/30 font-mono text-sm italic">Sem descricao disponivel</p>
              )}
            </div>

            {/* Portfolio */}
            {artist.portfolio && artist.portfolio.length > 0 && (
              <div className="bg-dark-800 border-2 border-dark-600 p-8">
                <h2 className="text-3xl font-display tracking-wider mb-6 text-chrome uppercase">Portfolio</h2>
                <div className="grid grid-cols-2 gap-4">
                  {artist.portfolio.map((url, index) => (
                    <div key={index} className="aspect-square overflow-hidden bg-dark-700 border-2 border-dark-600 hover:border-neon-red transition-colors">
                      <img
                        src={url}
                        alt={`${artist.nomeArtistico} portfolio ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-dark-800 border-2 border-dark-600 p-8">
              <h2 className="text-3xl font-display tracking-wider mb-6 text-chrome uppercase">
                Avaliacoes {reviews.length > 0 && `(${reviews.length})`}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-chrome/30 font-mono text-sm italic">Nenhuma avaliacao ainda</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b-2 border-dark-600 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-mono text-sm text-chrome mb-1 uppercase">
                            {review.avaliador?.nome || 'Usuario'}
                          </div>
                          <div className="flex items-center gap-1 text-neon-acid font-mono text-sm">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.notaGeral ? 'text-neon-acid' : 'text-dark-600'}>
                                {i < review.notaGeral ? '|' : '|'}
                              </span>
                            ))}
                            <span className="ml-2">{review.notaGeral}/5</span>
                          </div>
                        </div>
                        <div className="font-mono text-xs text-chrome/30">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {review.comentario && (
                        <p className="text-chrome/50 font-mono text-sm leading-relaxed">{review.comentario}</p>
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
            <div className="bg-dark-800 border-2 border-dark-600 p-6">
              <h3 className="text-xl font-display tracking-wider mb-4 text-chrome uppercase">Precos</h3>
              <div className="text-5xl font-display text-neon-red mb-2">
                R$ {artist.valorBaseHora}
                <span className="text-lg text-chrome/30 font-mono">/HR</span>
              </div>
              <p className="text-chrome/30 font-mono text-xs uppercase">
                Valor base, pode variar conforme o evento
              </p>
            </div>

            {/* Info */}
            <div className="bg-dark-800 border-2 border-dark-600 p-6">
              <h3 className="text-xl font-display tracking-wider mb-4 text-chrome uppercase">Informacoes</h3>
              <div className="space-y-3">
                {artist.subcategoria && (
                  <div>
                    <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Especialidade</div>
                    <div className="text-chrome font-mono text-sm">{artist.subcategoria}</div>
                  </div>
                )}
                {artist.cidade && (
                  <div>
                    <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Localizacao</div>
                    <div className="text-chrome font-mono text-sm">{artist.cidade}</div>
                  </div>
                )}
                <div>
                  <div className="text-chrome/30 font-mono text-xs uppercase mb-1">Disponibilidade</div>
                  <div className={`font-mono text-sm ${artist.disponibilidade === 'DISPONIVEL' ? 'text-neon-acid' : 'text-neon-red'}`}>
                    {artist.disponibilidade === 'DISPONIVEL' ? 'DISPONIVEL' : 'INDISPONIVEL'}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-dark-800 border-2 border-dark-600 p-6">
              <h3 className="text-xl font-display tracking-wider mb-4 text-chrome uppercase">Estatisticas</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-chrome/50 font-mono text-xs uppercase">Qualidade</span>
                    <span className="text-neon-acid font-mono text-sm">{artist.notaMedia.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-dark-700 h-2">
                    <div
                      className="bg-neon-red h-2"
                      style={{ width: `${(artist.notaMedia / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-chrome/50 font-mono text-xs uppercase">Shows</span>
                    <span className="text-neon-acid font-mono text-sm">{artist.totalBookings}</span>
                  </div>
                  <div className="w-full bg-dark-700 h-2">
                    <div
                      className="bg-neon-pink h-2"
                      style={{ width: `${Math.min((artist.totalBookings / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              to={`/bookings/create?artistaId=${artist.id}`}
              className="block w-full px-8 py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest text-center shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all"
            >
              Solicitar Booking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
