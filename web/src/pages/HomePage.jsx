import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-void noise-overlay">
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF003310_1px,transparent_1px),linear-gradient(to_bottom,#FF003310_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Neon Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-neon-red/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-neon-pink/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-neon-acid/5 rounded-full blur-[100px] animate-float"></div>
      </div>

      {/* Scan Lines Overlay */}
      <div className="absolute inset-0 scan-lines pointer-events-none opacity-30"></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo/Title */}
            <div className="mb-16 space-y-8">
              <div className="inline-block relative">
                <h1 className="text-[clamp(5rem,18vw,14rem)] font-logo leading-none tracking-[0.05em] text-neon-red text-glitch glitch-hover" data-text="KXRTEX">
                  KXRTEX
                </h1>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-neon-red shadow-neon"></div>
              </div>

              <div className="space-y-4">
                <p className="text-2xl md:text-4xl text-chrome font-display tracking-[0.3em] uppercase">
                  Underground Bookings
                </p>
                <p className="text-base md:text-lg text-chrome/60 max-w-2xl mx-auto leading-relaxed font-mono">
                  A plataforma que conecta artistas autenticos da cena alternativa com eventos que buscam verdadeira identidade sonora
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-6 justify-center flex-wrap mb-24">
              <Link
                to="/artists"
                className="group relative px-10 py-5 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest overflow-hidden transition-all hover:bg-neon-acid shadow-brutal hover:shadow-brutal-acid glitch-hover"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Explorar Artistas
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                to="/register"
                className="px-10 py-5 border-2 border-neon-red text-neon-red font-bold font-mono text-sm uppercase tracking-widest hover:bg-neon-red hover:text-void transition-all glitch-hover"
              >
                Seja um Artista
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="group relative bg-surface border-2 border-dark-600 p-6 hover:border-neon-red transition-all diagonal-cut-reverse">
                <div className="text-5xl font-display text-neon-red mb-1 group-hover:text-neon-acid transition-colors">500+</div>
                <div className="text-chrome/50 font-mono text-xs uppercase tracking-wider">Artistas</div>
              </div>

              <div className="group relative bg-surface border-2 border-dark-600 p-6 hover:border-neon-red transition-all">
                <div className="text-5xl font-display text-neon-red mb-1 group-hover:text-neon-acid transition-colors">2K+</div>
                <div className="text-chrome/50 font-mono text-xs uppercase tracking-wider">Shows</div>
              </div>

              <div className="group relative bg-surface border-2 border-dark-600 p-6 hover:border-neon-red transition-all">
                <div className="text-5xl font-display text-neon-red mb-1 group-hover:text-neon-acid transition-colors">98%</div>
                <div className="text-chrome/50 font-mono text-xs uppercase tracking-wider">Satisfacao</div>
              </div>

              <div className="group relative bg-surface border-2 border-dark-600 p-6 hover:border-neon-red transition-all diagonal-cut">
                <div className="text-5xl font-display text-neon-red mb-1 group-hover:text-neon-acid transition-colors">24/7</div>
                <div className="text-chrome/50 font-mono text-xs uppercase tracking-wider">Suporte</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 relative bg-surface">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#FF003305_25%,transparent_25%,transparent_75%,#FF003305_75%)] bg-[size:60px_60px]"></div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-20">
              <h2 className="text-6xl md:text-7xl font-display tracking-wider text-chrome mb-4">
                POR QUE <span className="text-neon-red">KXRTEX</span>?
              </h2>
              <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">A plataforma construida para a cena underground</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group relative bg-dark-800 border-2 border-dark-600 p-8 hover:border-neon-red transition-all hover:-translate-y-1 shadow-brutal-sm hover:shadow-brutal">
                <div className="w-16 h-16 bg-neon-red flex items-center justify-center text-void text-2xl font-display mb-6 group-hover:bg-neon-acid transition-colors">
                  01
                </div>
                <h3 className="text-2xl font-display tracking-wider text-chrome mb-4 uppercase">Artistas Verificados</h3>
                <p className="text-chrome/50 font-mono text-sm leading-relaxed">
                  Cada artista passa por verificacao rigorosa. Perfis autenticos, portfolios reais, avaliacoes da comunidade.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-dark-800 border-2 border-dark-600 p-8 hover:border-neon-acid transition-all hover:-translate-y-1 shadow-brutal-sm hover:shadow-brutal-acid">
                <div className="w-16 h-16 bg-neon-acid flex items-center justify-center text-void text-2xl font-display mb-6 group-hover:bg-neon-pink transition-colors">
                  02
                </div>
                <h3 className="text-2xl font-display tracking-wider text-chrome mb-4 uppercase">Pagamento Protegido</h3>
                <p className="text-chrome/50 font-mono text-sm leading-relaxed">
                  Sistema de escrow para seguranca total. PIX instantaneo e cartao com protecao ao comprador e vendedor.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-dark-800 border-2 border-dark-600 p-8 hover:border-neon-pink transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-neon-pink flex items-center justify-center text-void text-2xl font-display mb-6 group-hover:bg-neon-red transition-colors">
                  03
                </div>
                <h3 className="text-2xl font-display tracking-wider text-chrome mb-4 uppercase">Reputacao Real</h3>
                <p className="text-chrome/50 font-mono text-sm leading-relaxed">
                  Sistema de avaliacoes transparente. Feedback genuino de eventos reais para decisoes informadas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#FF003320_0%,transparent_70%)]"></div>

          <div className="max-w-5xl mx-auto relative">
            <div className="relative bg-dark-800 border-2 border-neon-red p-12 md:p-16 text-center shadow-brutal-lg">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-neon-acid"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-neon-acid"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-neon-acid"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-neon-acid"></div>

              <h2 className="text-4xl md:text-6xl font-display tracking-wider text-chrome mb-6">
                PRONTO PARA <span className="text-neon-red">REVOLUCIONAR</span> SEUS EVENTOS?
              </h2>
              <p className="text-chrome/50 font-mono text-sm md:text-base mb-10 max-w-2xl mx-auto">
                Junte-se a maior comunidade underground de bookings do Brasil
              </p>
              <Link
                to="/artists"
                className="inline-flex items-center gap-3 px-12 py-5 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest hover:bg-neon-acid shadow-brutal hover:shadow-brutal-acid transition-all glitch-hover"
              >
                Comecar Agora
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
