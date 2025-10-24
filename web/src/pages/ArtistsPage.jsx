import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function ArtistsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const response = await api.get('/artists');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-xl text-gray-400">Carregando artistas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-xl text-red-vibrant">
          Erro ao carregar artistas: {error.message}
        </div>
        <div className="text-gray-400 mt-4">
          Certifique-se de que o backend está rodando em http://localhost:3000
        </div>
      </div>
    );
  }

  const artists = data?.data || [];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Artistas</h1>

      {artists.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-xl text-gray-400">Nenhum artista encontrado</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-red-vibrant transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{artist.nomeArtistico}</h3>
                  <div className="text-sm text-gray-400">{artist.categoria}</div>
                </div>
                {artist.statusVerificacao === 'VERIFICADO' && (
                  <div className="text-green-500 text-sm">✓ Verificado</div>
                )}
              </div>

              {artist.bio && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {artist.bio}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="text-red-vibrant font-bold">
                  R$ {artist.valorBaseHora}/hora
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>⭐ {artist.notaMedia.toFixed(1)}</span>
                  <span>• {artist.totalBookings} shows</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
