import { demoArtist, demoReviews } from '../../../data/demoData';

const DemoProfile = () => {
  const criteriaLabels = {
    pontualidade: 'Pontualidade',
    profissionalismo: 'Profissionalismo',
    qualidade: 'Qualidade',
    comunicacao: 'Comunicacao',
    custobeneficio: 'Custo-Beneficio',
    recomendacao: 'Recomendacao',
  };

  return (
    <div className="space-y-8 animate-fade-in max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-dark-600">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-display text-chrome uppercase tracking-wider">
          Perfil do Artista
        </h2>
        <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">
          Perfil completo com portfolio, avaliacoes e informacoes detalhadas
        </p>
      </div>

      <div className="border-2 border-dark-600 bg-dark-900/50 p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="relative">
            <img
              src={demoArtist.usuario.fotoPerfil}
              alt={demoArtist.nomeArtistico}
              className="w-32 h-32 object-cover grayscale hover:grayscale-0 transition-all border-4 border-neon-red"
            />
            <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-neon-purple text-dark-950 font-mono text-xs font-bold">
              {demoArtist.plano}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-black font-display text-chrome">
                {demoArtist.nomeArtistico}
              </h3>
              {demoArtist.statusVerificacao === 'VERIFICADO' && (
                <span className="px-2 py-1 bg-neon-acid text-dark-950 font-mono text-xs font-bold">
                  VERIFICADO
                </span>
              )}
            </div>
            <p className="text-chrome/50 font-mono text-sm mb-1">{demoArtist.categoria}</p>
            <p className="text-chrome/50 font-mono text-sm mb-4">
              {demoArtist.cidadeBase}, {demoArtist.estadoBase}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="border-2 border-dark-600 bg-dark-800/50 p-3 text-center">
                <div className="text-2xl font-black font-mono text-neon-gold">
                  {demoArtist.avaliacaoMedia}
                </div>
                <div className="text-[10px] font-mono text-chrome/50 uppercase tracking-wider">Avaliacao</div>
              </div>
              <div className="border-2 border-dark-600 bg-dark-800/50 p-3 text-center">
                <div className="text-2xl font-black font-mono text-neon-red">
                  {demoArtist.totalBookings}
                </div>
                <div className="text-[10px] font-mono text-chrome/50 uppercase tracking-wider">Bookings</div>
              </div>
              <div className="border-2 border-dark-600 bg-dark-800/50 p-3 text-center">
                <div className="text-2xl font-black font-mono text-neon-acid">
                  R$ {demoArtist.precoBase}
                </div>
                <div className="text-[10px] font-mono text-chrome/50 uppercase tracking-wider">Preco/h</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider mb-3 border-b-2 border-dark-600 pb-2">
            [SOBRE]
          </h4>
          <p className="text-chrome/70 font-mono text-sm leading-relaxed">{demoArtist.biografia}</p>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider mb-3 border-b-2 border-dark-600 pb-2">
            [REDES SOCIAIS]
          </h4>
          <div className="flex gap-3 flex-wrap">
            <a href="#" className="px-4 py-2 border-2 border-neon-pink bg-neon-pink/10 text-neon-pink font-mono text-xs uppercase tracking-wider hover:bg-neon-pink hover:text-dark-950 transition-all">
              @{demoArtist.redesSociais.instagram}
            </a>
            <a href="#" className="px-4 py-2 border-2 border-neon-acid bg-neon-acid/10 text-neon-acid font-mono text-xs uppercase tracking-wider hover:bg-neon-acid hover:text-dark-950 transition-all">
              {demoArtist.redesSociais.spotify}
            </a>
            <a href="#" className="px-4 py-2 border-2 border-neon-orange bg-neon-orange/10 text-neon-orange font-mono text-xs uppercase tracking-wider hover:bg-neon-orange hover:text-dark-950 transition-all">
              {demoArtist.redesSociais.soundcloud}
            </a>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider mb-3 border-b-2 border-dark-600 pb-2">
            [PORTFOLIO]
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {demoArtist.portfolio.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Portfolio ${index + 1}`}
                className="w-full h-40 object-cover grayscale hover:grayscale-0 transition-all cursor-pointer border-2 border-dark-600 hover:border-neon-red"
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider mb-4 border-b-2 border-dark-600 pb-2">
            [AVALIACOES] ({demoReviews.length})
          </h4>
          <div className="space-y-4">
            {demoReviews.map((review) => (
              <div
                key={review.id}
                className="border-2 border-dark-600 bg-dark-800/30 p-4"
              >
                <div className="flex items-start gap-4 mb-3">
                  <img
                    src={review.avaliador.fotoPerfil}
                    alt={review.avaliador.nome}
                    className="w-10 h-10 object-cover grayscale border-2 border-dark-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-mono font-bold text-chrome text-sm">
                        {review.avaliador.nome}
                      </h5>
                      <span className="text-xs font-mono text-chrome/50">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                      {Object.entries(criteriaLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-1">
                          <span className="text-chrome/50">{label}:</span>
                          <span className="text-neon-gold">{review[key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {review.comentario && (
                  <p className="text-chrome/60 font-mono text-xs border-l-2 border-neon-red/30 pl-3">
                    "{review.comentario}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-2 border-neon-acid/30 bg-neon-acid/5 p-4 text-center">
        <p className="text-neon-acid font-mono text-xs uppercase tracking-wider">
          <span className="font-bold">[PLANO PRO]</span> Taxa de apenas 7% + Selo verificado + Portfolio ilimitado
        </p>
      </div>
    </div>
  );
};

export default DemoProfile;
