import { useState } from 'react';

const criteriaInfo = {
  pontualidade: {
    label: 'Pontualidade',
    description: 'Chegou no horário combinado?',
    icon: '⏰',
  },
  profissionalismo: {
    label: 'Profissionalismo',
    description: 'Comportamento adequado e ético?',
    icon: '💼',
  },
  qualidade: {
    label: 'Qualidade',
    description: 'Qualidade técnica da apresentação?',
    icon: '⭐',
  },
  comunicacao: {
    label: 'Comunicação',
    description: 'Comunicação clara e efetiva?',
    icon: '💬',
  },
  custobeneficio: {
    label: 'Custo-Benefício',
    description: 'Valor justo pelo serviço prestado?',
    icon: '💰',
  },
  recomendacao: {
    label: 'Recomendação',
    description: 'Contrataria novamente?',
    icon: '👍',
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
    'Excelente profissional! Superou todas as expectativas. O público adorou a apresentação e a energia que trouxe para o evento. Muito pontual, comunicativo e com equipamento de primeira qualidade. Recomendo fortemente!'
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
          <h2 className="text-4xl font-bold text-white">Avaliação Enviada!</h2>
          <p className="text-gray-400 text-lg">
            Obrigado por contribuir com a comunidade
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-8 text-center space-y-4">
            <div className="text-6xl">✓</div>
            <h3 className="text-3xl font-bold text-green-500">Avaliação Registrada</h3>
            <p className="text-gray-300">
              Sua avaliação foi publicada e já está visível no perfil do artista.
            </p>

            <div className="bg-dark-800/50 rounded-xl p-6 max-w-md mx-auto">
              <div className="text-5xl font-bold text-yellow-500 mb-2">
                {calculateAverage()}
              </div>
              <div className="text-gray-400">Nota Média</div>

              <div className="mt-4 space-y-2 text-sm text-left">
                {Object.entries(criteriaInfo).map(([key, info]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-400">
                      {info.icon} {info.label}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < ratings[key] ? 'text-yellow-500' : 'text-gray-600'
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

            <div className="pt-4">
              <h4 className="font-semibold text-white mb-2">Impacto da sua avaliação:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ Ajuda outros contratantes na escolha</li>
                <li>✓ Valoriza o trabalho do artista</li>
                <li>✓ Melhora o ranking na plataforma</li>
                <li>✓ Contribui para a transparência</li>
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
        <h2 className="text-4xl font-bold text-white">Sistema de Avaliação</h2>
        <p className="text-gray-400 text-lg">
          Avalie sua experiência em 6 critérios objetivos
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Avaliação do Artista
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {calculateAverage()}
                </div>
                <div className="text-xs text-gray-400">Média</div>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(criteriaInfo).map(([key, info]) => (
                <div
                  key={key}
                  className="bg-dark-700/50 rounded-xl p-4 hover:bg-dark-700 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <div className="font-semibold text-white">
                          {info.label}
                        </div>
                        <div className="text-sm text-gray-400">
                          {info.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-yellow-500">
                      {ratings[key]}.0
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingChange(key, value)}
                        className="group"
                      >
                        <span
                          className={`text-3xl transition ${
                            value <= ratings[key]
                              ? 'text-yellow-500'
                              : 'text-gray-600 group-hover:text-yellow-500/50'
                          }`}
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Comentário (Opcional)
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="Compartilhe mais detalhes sobre sua experiência..."
              className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:border-red-vibrant resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-400">
                {comment.length} / 1000 caracteres
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-lg hover:scale-105 transition font-semibold text-lg shadow-lg shadow-red-vibrant/30"
          >
            Enviar Avaliação
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Por que 6 critérios?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Sistema objetivo que avalia diferentes aspectos do serviço,
              proporcionando feedback detalhado e justo.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">
                  Mais preciso que nota única
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">
                  Feedback específico e útil
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">
                  Reduz avaliações injustas
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">
                  Transparente e objetivo
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-blue-400 mb-2">
              🤝 Avaliação Bilateral
            </h4>
            <p className="text-sm text-blue-300 mb-2">
              Após você avaliar, o artista também poderá avaliar você como contratante.
            </p>
            <p className="text-xs text-blue-400">
              Isso cria um ambiente de respeito mútuo e profissionalismo.
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-purple-400 mb-2">
              📊 Impacto no Ranking
            </h4>
            <p className="text-sm text-purple-300">
              Avaliações positivas:
            </p>
            <ul className="text-sm text-purple-300 space-y-1 mt-2">
              <li>• Melhoram posição na busca</li>
              <li>• Aumentam credibilidade</li>
              <li>• Atraem mais contratantes</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-400 mb-2">
              ⚖️ Sistema de Disputa
            </h4>
            <p className="text-sm text-yellow-300">
              Em caso de desacordo com avaliações, ambas as partes podem
              solicitar mediação através do sistema de disputas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoReview;
