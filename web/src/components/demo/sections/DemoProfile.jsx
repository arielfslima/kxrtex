import { demoArtist, demoReviews } from '../../../data/demoData';

const DemoProfile = () => {
  const criteriaLabels = {
    pontualidade: 'Pontualidade',
    profissionalismo: 'Profissionalismo',
    qualidade: 'Qualidade',
    comunicacao: 'Comunicação',
    custobeneficio: 'Custo-Benefício',
    recomendacao: 'Recomendação',
  };

  return (
    <div className="space-y-8 animate-fade-in max-h-[70vh] overflow-y-auto pr-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Perfil do Artista</h2>
        <p className="text-gray-400 text-lg">
          Perfil completo com portfolio, avaliações e informações detalhadas
        </p>
      </div>

      <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-8">
        <div className="flex items-start gap-6 mb-8">
          <img
            src={demoArtist.usuario.fotoPerfil}
            alt={demoArtist.nomeArtistico}
            className="w-32 h-32 rounded-full object-cover border-4 border-red-vibrant"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-bold text-white">
                {demoArtist.nomeArtistico}
              </h3>
              {demoArtist.statusVerificacao === 'VERIFICADO' && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Verificado
                </span>
              )}
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {demoArtist.plano}
              </span>
            </div>
            <p className="text-gray-400 mb-1">{demoArtist.categoria}</p>
            <p className="text-gray-400 mb-4">
              {demoArtist.cidadeBase}, {demoArtist.estadoBase}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-vibrant">
                  {demoArtist.avaliacaoMedia}
                </div>
                <div className="text-xs text-gray-400">Avaliação</div>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-vibrant">
                  {demoArtist.totalBookings}
                </div>
                <div className="text-xs text-gray-400">Bookings</div>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-vibrant">
                  R$ {demoArtist.precoBase}
                </div>
                <div className="text-xs text-gray-400">Preço/hora</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-xl font-semibold text-white mb-3">Sobre</h4>
          <p className="text-gray-300 leading-relaxed">{demoArtist.biografia}</p>
        </div>

        <div className="mb-8">
          <h4 className="text-xl font-semibold text-white mb-3">Redes Sociais</h4>
          <div className="flex gap-4">
            <a href="#" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition">
              Instagram: {demoArtist.redesSociais.instagram}
            </a>
            <a href="#" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition">
              Spotify: {demoArtist.redesSociais.spotify}
            </a>
            <a href="#" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition">
              SoundCloud: {demoArtist.redesSociais.soundcloud}
            </a>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-xl font-semibold text-white mb-3">Portfolio</h4>
          <div className="grid grid-cols-3 gap-4">
            {demoArtist.portfolio.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Portfolio ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg hover:scale-105 transition cursor-pointer"
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold text-white mb-4">
            Avaliações ({demoReviews.length})
          </h4>
          <div className="space-y-4">
            {demoReviews.map((review) => (
              <div
                key={review.id}
                className="bg-dark-700/50 rounded-xl p-4 border border-dark-600"
              >
                <div className="flex items-start gap-4 mb-3">
                  <img
                    src={review.avaliador.fotoPerfil}
                    alt={review.avaliador.nome}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-white">
                        {review.avaliador.nome}
                      </h5>
                      <span className="text-sm text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {Object.entries(criteriaLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-1">
                          <span className="text-gray-400">{label}:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < review[key]
                                    ? 'text-yellow-500'
                                    : 'text-gray-600'
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {review.comentario && (
                  <p className="text-gray-300 text-sm italic">
                    "{review.comentario}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
        <p className="text-green-400 text-sm">
          <strong>Plano PRO:</strong> Taxa de apenas 7% + Selo verificado + Portfolio ilimitado
        </p>
      </div>
    </div>
  );
};

export default DemoProfile;
