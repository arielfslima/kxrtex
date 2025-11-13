const DemoFeatures = () => {
  const plans = [
    {
      name: 'FREE',
      price: 'Grátis',
      fee: '15%',
      color: 'gray',
      features: [
        'Perfil básico na plataforma',
        'Até 5 imagens no portfolio',
        'Chat em tempo real',
        'Sistema de reviews',
        'Pagamento seguro',
        'Suporte por email',
      ],
    },
    {
      name: 'PLUS',
      price: 'R$ 49',
      period: '/mês',
      fee: '10%',
      color: 'blue',
      featured: false,
      features: [
        'Tudo do FREE +',
        'Selo verificado',
        'Até 15 imagens no portfolio',
        'Destaque na busca',
        'Analytics básico',
        'Suporte prioritário',
      ],
    },
    {
      name: 'PRO',
      price: 'R$ 99',
      period: '/mês',
      fee: '7%',
      color: 'purple',
      featured: true,
      features: [
        'Tudo do PLUS +',
        'Portfolio ilimitado',
        'Máximo destaque na busca',
        'Analytics avançado',
        'Badge PRO exclusivo',
        'Suporte 24/7',
      ],
    },
  ];

  const platformFeatures = [
    {
      icon: '🛡️',
      title: 'Pagamento Seguro',
      description:
        'Valor retido pela plataforma até 48h após o evento, garantindo segurança para ambas as partes.',
      color: 'green',
    },
    {
      icon: '👁️',
      title: 'Anti-Circumvenção',
      description:
        'Sistema inteligente que detecta compartilhamento de contatos no chat e protege a plataforma.',
      color: 'red',
    },
    {
      icon: '📍',
      title: 'Check-in Geolocalizado',
      description:
        'Verificação de presença com GPS e foto para comprovar realização do evento.',
      color: 'blue',
    },
    {
      icon: '💰',
      title: 'Adiantamento Inteligente',
      description:
        'Para eventos com distância >200km, 50% de adiantamento com verificação de check-in.',
      color: 'yellow',
    },
    {
      icon: '⭐',
      title: 'Reviews Bilaterais',
      description:
        'Sistema de 6 critérios permite avaliação justa e detalhada de ambas as partes.',
      color: 'purple',
    },
    {
      icon: '⚡',
      title: 'Tempo Real',
      description:
        'Chat, notificações e atualizações instantâneas via Socket.IO para melhor experiência.',
      color: 'orange',
    },
  ];

  const getPlanColor = (color, type = 'bg') => {
    const colors = {
      gray: {
        bg: 'bg-gray-500',
        border: 'border-gray-500',
        text: 'text-gray-500',
      },
      blue: {
        bg: 'bg-blue-500',
        border: 'border-blue-500',
        text: 'text-blue-500',
      },
      purple: {
        bg: 'bg-purple-500',
        border: 'border-purple-500',
        text: 'text-purple-500',
      },
    };
    return colors[color][type];
  };

  const getFeatureColor = (color) => {
    const colors = {
      green: 'border-green-500/30 bg-green-500/10',
      red: 'border-red-500/30 bg-red-500/10',
      blue: 'border-blue-500/30 bg-blue-500/10',
      yellow: 'border-yellow-500/30 bg-yellow-500/10',
      purple: 'border-purple-500/30 bg-purple-500/10',
      orange: 'border-orange-500/30 bg-orange-500/10',
    };
    return colors[color];
  };

  return (
    <div className="space-y-12 animate-fade-in max-h-[70vh] overflow-y-auto pr-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Recursos da Plataforma</h2>
        <p className="text-gray-400 text-lg">
          Tudo que você precisa para conectar e fechar negócios com segurança
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Planos e Taxas
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-dark-800/50 backdrop-blur-sm border-2 rounded-2xl p-6 hover:scale-105 transition ${
                plan.featured
                  ? `${getPlanColor(plan.color, 'border')} shadow-lg shadow-${plan.color}-500/20`
                  : 'border-dark-700'
              }`}
            >
              {plan.featured && (
                <div className="text-center mb-4">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`inline-block px-4 py-1 ${getPlanColor(
                    plan.color,
                    'bg'
                  )} text-white rounded-full text-sm font-semibold mb-3`}
                >
                  {plan.name}
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {plan.price}
                  {plan.period && (
                    <span className="text-lg text-gray-400">{plan.period}</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Taxa de <span className={`font-semibold ${getPlanColor(plan.color, 'text')}`}>
                    {plan.fee}
                  </span>{' '}
                  por booking
                </div>
              </div>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full mt-6 px-4 py-2 rounded-lg font-medium transition ${
                  plan.featured
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                    : 'bg-dark-700 text-white hover:bg-dark-600'
                }`}
              >
                {plan.featured ? 'Escolher PRO' : 'Escolher Plano'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Diferenciais da Plataforma
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformFeatures.map((feature, index) => (
            <div
              key={index}
              className={`border rounded-2xl p-6 hover:scale-105 transition ${getFeatureColor(
                feature.color
              )}`}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-vibrant/20 via-pink-500/20 to-purple-500/20 border border-red-vibrant/30 rounded-2xl p-8">
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-white">
            Pronto para Conectar Underground?
          </h3>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Junte-se à maior plataforma de booking para artistas underground do Brasil.
            Milhares de eventos já foram realizados com segurança e transparência.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-lg hover:scale-105 transition font-semibold text-lg shadow-lg shadow-red-vibrant/30">
              Cadastrar como Artista
            </button>
            <button className="px-8 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition font-semibold text-lg">
              Cadastrar como Contratante
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Cadastro Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Sem Taxas Ocultas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Suporte Dedicado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          Estatísticas da Plataforma
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-vibrant mb-1">2,547</div>
            <div className="text-sm text-gray-400">Artistas Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-vibrant mb-1">8,932</div>
            <div className="text-sm text-gray-400">Bookings Realizados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-vibrant mb-1">98%</div>
            <div className="text-sm text-gray-400">Satisfação</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-vibrant mb-1">156</div>
            <div className="text-sm text-gray-400">Cidades</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoFeatures;
