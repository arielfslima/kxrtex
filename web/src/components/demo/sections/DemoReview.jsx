import { useState } from 'react';

const criteriaInfo = {
  pontualidade: {
    label: 'Pontualidade',
    description: 'Chegou no horario combinado?',
  },
  profissionalismo: {
    label: 'Profissionalismo',
    description: 'Comportamento adequado e etico?',
  },
  qualidade: {
    label: 'Qualidade',
    description: 'Qualidade tecnica da apresentacao?',
  },
  comunicacao: {
    label: 'Comunicacao',
    description: 'Comunicacao clara e efetiva?',
  },
  custobeneficio: {
    label: 'Custo-Beneficio',
    description: 'Valor justo pelo servico prestado?',
  },
  recomendacao: {
    label: 'Recomendacao',
    description: 'Contrataria novamente?',
  },
};

const DemoReview = () => {
  const [ratings, setRatings] = useState({
    pontualidade: 5,
    profissionalismo: 5,
    qualidade: 5,
    comunicacao: 5,
    custobeneficio: 4,
    recomendacao: 5,
  });
  const [comment, setComment] = useState(
    'Excelente profissional! Superou todas as expectativas. O publico adorou a apresentacao e a energia que trouxe para o evento. Muito pontual, comunicativo e com equipamento de primeira qualidade. Recomendo fortemente!'
  );
  const [submitted, setSubmitted] = useState(false);

  const calculateAverage = () => {
    const values = Object.values(ratings);
    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length).toFixed(1);
  };

  const handleRatingChange = (criterion, value) => {
    setRatings((prev) => ({
      ...prev,
      [criterion]: value,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black font-display text-chrome uppercase tracking-wider">
            Avaliacao Enviada!
          </h2>
          <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">
            Obrigado por contribuir com a comunidade
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="border-4 border-neon-acid bg-neon-acid/10 p-8 text-center space-y-4">
            <div className="text-6xl font-mono text-neon-acid">[OK]</div>
            <h3 className="text-3xl font-black font-display text-neon-acid">AVALIACAO REGISTRADA</h3>
            <p className="text-chrome/70 font-mono text-sm">
              Sua avaliacao foi publicada e ja esta visivel no perfil do artista.
            </p>

            <div className="border-2 border-dark-600 bg-dark-900/50 p-6 max-w-md mx-auto">
              <div className="text-5xl font-black font-mono text-neon-gold mb-2">
                {calculateAverage()}
              </div>
              <div className="text-xs font-mono text-chrome/50 uppercase tracking-wider">Nota Media</div>

              <div className="mt-4 space-y-2 text-xs font-mono text-left">
                {Object.entries(criteriaInfo).map(([key, info]) => (
                  <div key={key} className="flex items-center justify-between border-b border-dark-700 pb-1">
                    <span className="text-chrome/50">{info.label}</span>
                    <span className="text-neon-gold font-bold">{ratings[key]}.0</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <h4 className="font-mono font-bold text-chrome text-xs uppercase tracking-wider mb-3">
                [IMPACTO DA SUA AVALIACAO]
              </h4>
              <ul className="text-xs font-mono text-chrome/70 space-y-1">
                <li className="flex items-center gap-2 justify-center">
                  <span className="text-neon-acid">[OK]</span>
                  <span>Ajuda outros contratantes na escolha</span>
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <span className="text-neon-acid">[OK]</span>
                  <span>Valoriza o trabalho do artista</span>
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <span className="text-neon-acid">[OK]</span>
                  <span>Melhora o ranking na plataforma</span>
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <span className="text-neon-acid">[OK]</span>
                  <span>Contribui para a transparencia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-display text-chrome uppercase tracking-wider">
          Sistema de Avaliacao
        </h2>
        <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">
          Avalie sua experiencia em 6 criterios objetivos
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
            <div className="flex items-center justify-between mb-6 border-b-2 border-dark-600 pb-3">
              <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider">
                [AVALIACAO DO ARTISTA]
              </h3>
              <div className="text-center">
                <div className="text-3xl font-black font-mono text-neon-gold">
                  {calculateAverage()}
                </div>
                <div className="text-[10px] font-mono text-chrome/50 uppercase">Media</div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(criteriaInfo).map(([key, info]) => (
                <div
                  key={key}
                  className="border-2 border-dark-600 bg-dark-800/50 p-4 hover:border-dark-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-mono font-bold text-chrome text-sm uppercase tracking-wider">
                        {info.label}
                      </div>
                      <div className="text-xs font-mono text-chrome/50">
                        {info.description}
                      </div>
                    </div>
                    <div className="text-xl font-black font-mono text-neon-gold">
                      {ratings[key]}.0
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingChange(key, value)}
                        className={`w-10 h-10 border-2 font-mono font-bold text-sm transition-all ${
                          value <= ratings[key]
                            ? 'border-neon-gold bg-neon-gold text-dark-950'
                            : 'border-dark-600 text-chrome/30 hover:border-neon-gold/50 hover:text-neon-gold/50'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
            <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider border-b-2 border-dark-600 pb-2 mb-4">
              [COMENTARIO] (Opcional)
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="Compartilhe mais detalhes sobre sua experiencia..."
              className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs font-mono text-chrome/50">
                {comment.length} / 1000 caracteres
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-6 py-4 border-2 border-neon-red bg-neon-red text-dark-950 font-mono font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(255,0,68,0.5)] transition-all"
          >
            ENVIAR AVALIACAO
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
            <h3 className="text-sm font-mono font-bold text-chrome uppercase tracking-wider border-b-2 border-dark-600 pb-2 mb-4">
              [POR QUE 6 CRITERIOS?]
            </h3>
            <p className="text-xs font-mono text-chrome/50 mb-4">
              Sistema objetivo que avalia diferentes aspectos do servico,
              proporcionando feedback detalhado e justo.
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-start gap-2">
                <span className="text-neon-acid">[OK]</span>
                <span className="text-chrome/70">Mais preciso que nota unica</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neon-acid">[OK]</span>
                <span className="text-chrome/70">Feedback especifico e util</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neon-acid">[OK]</span>
                <span className="text-chrome/70">Reduz avaliacoes injustas</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neon-acid">[OK]</span>
                <span className="text-chrome/70">Transparente e objetivo</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-neon-cyan/30 bg-neon-cyan/5 p-4">
            <h4 className="font-mono font-bold text-neon-cyan text-xs uppercase tracking-wider mb-2">
              [INFO] AVALIACAO BILATERAL
            </h4>
            <p className="text-xs font-mono text-neon-cyan/80 mb-2">
              Apos voce avaliar, o artista tambem podera avaliar voce como contratante.
            </p>
            <p className="text-[10px] font-mono text-neon-cyan/60 uppercase">
              Isso cria um ambiente de respeito mutuo e profissionalismo.
            </p>
          </div>

          <div className="border-2 border-neon-purple/30 bg-neon-purple/5 p-4">
            <h4 className="font-mono font-bold text-neon-purple text-xs uppercase tracking-wider mb-2">
              [STATS] IMPACTO NO RANKING
            </h4>
            <p className="text-xs font-mono text-neon-purple/80">
              Avaliacoes positivas:
            </p>
            <ul className="text-xs font-mono text-neon-purple/70 space-y-1 mt-2">
              <li>- Melhoram posicao na busca</li>
              <li>- Aumentam credibilidade</li>
              <li>- Atraem mais contratantes</li>
            </ul>
          </div>

          <div className="border-2 border-neon-gold/30 bg-neon-gold/5 p-4">
            <h4 className="font-mono font-bold text-neon-gold text-xs uppercase tracking-wider mb-2">
              [LEGAL] SISTEMA DE DISPUTA
            </h4>
            <p className="text-xs font-mono text-neon-gold/80">
              Em caso de desacordo com avaliacoes, ambas as partes podem
              solicitar mediacao atraves do sistema de disputas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoReview;
