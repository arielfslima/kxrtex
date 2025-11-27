const DemoFeatures = () => {
  const plans = [
    {
      name: 'FREE',
      price: 'Gratis',
      fee: '15%',
      color: 'chrome',
      features: [
        'Perfil basico na plataforma',
        'Ate 5 imagens no portfolio',
        'Chat em tempo real',
        'Sistema de reviews',
        'Pagamento seguro',
        'Suporte por email',
      ],
    },
    {
      name: 'PLUS',
      price: 'R$ 49',
      period: '/mes',
      fee: '10%',
      color: 'cyan',
      featured: false,
      features: [
        'Tudo do FREE +',
        'Selo verificado',
        'Ate 15 imagens no portfolio',
        'Destaque na busca',
        'Analytics basico',
        'Suporte prioritario',
      ],
    },
    {
      name: 'PRO',
      price: 'R$ 99',
      period: '/mes',
      fee: '7%',
      color: 'purple',
      featured: true,
      features: [
        'Tudo do PLUS +',
        'Portfolio ilimitado',
        'Maximo destaque na busca',
        'Analytics avancado',
        'Badge PRO exclusivo',
        'Suporte 24/7',
      ],
    },
  ];

  const platformFeatures = [
    {
      icon: '[S]',
      title: 'Pagamento Seguro',
      description:
        'Valor retido pela plataforma ate 48h apos o evento, garantindo seguranca para ambas as partes.',
      color: 'acid',
    },
    {
      icon: '[!]',
      title: 'Anti-Circumvencao',
      description:
        'Sistema inteligente que detecta compartilhamento de contatos no chat e protege a plataforma.',
      color: 'red',
    },
    {
      icon: '[G]',
      title: 'Check-in Geolocalizado',
      description:
        'Verificacao de presenca com GPS e foto para comprovar realizacao do evento.',
      color: 'cyan',
    },
    {
      icon: '[A]',
      title: 'Adiantamento Inteligente',
      description:
        'Para eventos com distancia >200km, 50% de adiantamento com verificacao de check-in.',
      color: 'gold',
    },
    {
      icon: '[R]',
      title: 'Reviews Bilaterais',
      description:
        'Sistema de 6 criterios permite avaliacao justa e detalhada de ambas as partes.',
      color: 'purple',
    },
    {
      icon: '[RT]',
      title: 'Tempo Real',
      description:
        'Chat, notificacoes e atualizacoes instantaneas via Socket.IO para melhor experiencia.',
      color: 'orange',
    },
  ];

  const getPlanColor = (color) => {
    const colors = {
      chrome: {
        border: 'border-chrome/30',
        bg: 'bg-transparent',
        text: 'text-chrome',
      },
      cyan: {
        border: 'border-neon-cyan',
        bg: 'bg-neon-cyan',
        text: 'text-neon-cyan',
      },
      purple: {
        border: 'border-neon-purple',
        bg: 'bg-neon-purple',
        text: 'text-neon-purple',
      },
    };
    return colors[color];
  };

  const getFeatureColor = (color) => {
    const colors = {
      acid: 'border-neon-acid/30 bg-neon-acid/5',
      red: 'border-neon-red/30 bg-neon-red/5',
      cyan: 'border-neon-cyan/30 bg-neon-cyan/5',
      gold: 'border-neon-gold/30 bg-neon-gold/5',
      purple: 'border-neon-purple/30 bg-neon-purple/5',
      orange: 'border-neon-orange/30 bg-neon-orange/5',
    };
    return colors[color];
  };

  const getFeatureTextColor = (color) => {
    const colors = {
      acid: 'text-neon-acid',
      red: 'text-neon-red',
      cyan: 'text-neon-cyan',
      gold: 'text-neon-gold',
      purple: 'text-neon-purple',
      orange: 'text-neon-orange',
    };
    return colors[color];
  };

  return (
    <div className="space-y-12 animate-fade-in max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-dark-600">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-display text-chrome uppercase tracking-wider">
          Recursos da Plataforma
        </h2>
        <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">
          Tudo que voce precisa para conectar e fechar negocios com seguranca
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-black font-display text-chrome mb-6 text-center uppercase tracking-wider">
          [PLANOS E TAXAS]
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const colors = getPlanColor(plan.color);
            return (
              <div
                key={plan.name}
                className={`border-2 bg-dark-900/50 p-6 hover:shadow-[0_0_30px_rgba(255,0,68,0.1)] transition-all ${
                  plan.featured
                    ? `${colors.border} shadow-[0_0_20px_rgba(163,0,245,0.2)]`
                    : 'border-dark-600'
                }`}
              >
                {plan.featured && (
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 bg-neon-purple text-dark-950 font-mono text-[10px] font-bold uppercase tracking-wider">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`inline-block px-3 py-1 border-2 font-mono text-xs font-bold uppercase tracking-wider mb-3 ${colors.border} ${colors.text}`}
                  >
                    {plan.name}
                  </div>
                  <div className="text-3xl font-black font-mono text-chrome mb-1">
                    {plan.price}
                    {plan.period && (
                      <span className="text-lg text-chrome/50">{plan.period}</span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-chrome/50">
                    Taxa de <span className={`font-bold ${colors.text}`}>{plan.fee}</span> por booking
                  </div>
                </div>

                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs font-mono">
                      <span className="text-neon-acid">[OK]</span>
                      <span className="text-chrome/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full mt-6 px-4 py-3 border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                    plan.featured
                      ? 'border-neon-purple bg-neon-purple text-dark-950 hover:shadow-[0_0_20px_rgba(163,0,245,0.5)]'
                      : 'border-chrome/30 text-chrome hover:border-chrome hover:bg-chrome/5'
                  }`}
                >
                  {plan.featured ? 'ESCOLHER PRO' : 'ESCOLHER PLANO'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black font-display text-chrome mb-6 text-center uppercase tracking-wider">
          [DIFERENCIAIS]
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformFeatures.map((feature, index) => (
            <div
              key={index}
              className={`border-2 p-6 hover:shadow-[0_0_20px_rgba(255,0,68,0.1)] transition-all ${getFeatureColor(
                feature.color
              )}`}
            >
              <div className={`text-3xl font-mono font-bold mb-4 ${getFeatureTextColor(feature.color)}`}>
                {feature.icon}
              </div>
              <h4 className="text-base font-mono font-bold text-chrome uppercase tracking-wider mb-2">
                {feature.title}
              </h4>
              <p className="text-chrome/60 font-mono text-xs">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-2 border-neon-red/30 bg-neon-red/5 p-8">
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-black font-display text-chrome uppercase tracking-wider">
            Pronto para Conectar Underground?
          </h3>
          <p className="text-chrome/60 font-mono text-sm max-w-2xl mx-auto">
            Junte-se a maior plataforma de booking para artistas underground do Brasil.
            Milhares de eventos ja foram realizados com seguranca e transparencia.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-8 py-4 border-2 border-neon-red bg-neon-red text-dark-950 font-mono font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(255,0,68,0.5)] transition-all">
              CADASTRAR COMO ARTISTA
            </button>
            <button className="px-8 py-4 border-2 border-chrome/30 text-chrome font-mono font-bold text-sm uppercase tracking-wider hover:border-chrome hover:bg-chrome/5 transition-all">
              CADASTRAR COMO CONTRATANTE
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs font-mono text-chrome/50 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-neon-acid">[OK]</span>
              <span>Cadastro Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neon-acid">[OK]</span>
              <span>Sem Taxas Ocultas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neon-acid">[OK]</span>
              <span>Suporte Dedicado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
        <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider mb-4 text-center border-b-2 border-dark-600 pb-3">
          [ESTATISTICAS DA PLATAFORMA]
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-black font-mono text-neon-red mb-1">2,547</div>
            <div className="text-xs font-mono text-chrome/50 uppercase tracking-wider">Artistas Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black font-mono text-neon-red mb-1">8,932</div>
            <div className="text-xs font-mono text-chrome/50 uppercase tracking-wider">Bookings Realizados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black font-mono text-neon-acid mb-1">98%</div>
            <div className="text-xs font-mono text-chrome/50 uppercase tracking-wider">Satisfacao</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black font-mono text-neon-cyan mb-1">156</div>
            <div className="text-xs font-mono text-chrome/50 uppercase tracking-wider">Cidades</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoFeatures;
