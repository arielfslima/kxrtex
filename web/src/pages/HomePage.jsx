import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-dark-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-vibrant/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo/Title */}
            <div className="mb-12 space-y-6">
              <div className="inline-block relative">
                <h1 className="text-[clamp(4rem,15vw,10rem)] font-black leading-none tracking-tighter">
                  <span className="bg-gradient-to-r from-red-vibrant via-pink-500 to-purple-600 text-transparent bg-clip-text animate-gradient bg-[length:200%_200%]">
                    KXRTEX
                  </span>
                </h1>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-vibrant to-transparent"></div>
              </div>

              <div className="space-y-3">
                <p className="text-2xl md:text-4xl text-gray-200 font-bold tracking-wide uppercase">
                  Underground Bookings
                </p>
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  A plataforma que conecta artistas autênticos da cena alternativa com eventos que buscam verdadeira identidade sonora
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-6 justify-center flex-wrap mb-20">
              <Link
                to="/artists"
                className="group relative px-10 py-5 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-110 hover:shadow-2xl hover:shadow-red-vibrant/60"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explorar Artistas
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-vibrant opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <button className="px-10 py-5 border-2 border-gray-700 text-gray-300 font-bold text-lg rounded-xl hover:border-red-vibrant hover:text-red-vibrant hover:bg-red-vibrant/10 transition-all hover:scale-110">
                Seja um Artista
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-dark-800/80 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:border-red-vibrant/50 transition-all">
                  <div className="text-5xl font-black bg-gradient-to-r from-red-vibrant to-pink-500 text-transparent bg-clip-text mb-2">500+</div>
                  <div className="text-gray-400 font-medium">Artistas</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-dark-800/80 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:border-red-vibrant/50 transition-all">
                  <div className="text-5xl font-black bg-gradient-to-r from-red-vibrant to-pink-500 text-transparent bg-clip-text mb-2">2K+</div>
                  <div className="text-gray-400 font-medium">Shows</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-dark-800/80 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:border-red-vibrant/50 transition-all">
                  <div className="text-5xl font-black bg-gradient-to-r from-red-vibrant to-pink-500 text-transparent bg-clip-text mb-2">98%</div>
                  <div className="text-gray-400 font-medium">Satisfação</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-dark-800/80 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:border-red-vibrant/50 transition-all">
                  <div className="text-5xl font-black bg-gradient-to-r from-red-vibrant to-pink-500 text-transparent bg-clip-text mb-2">24/7</div>
                  <div className="text-gray-400 font-medium">Suporte</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-800/50 to-transparent"></div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
                Por que escolher KXRTEX?
              </h2>
              <p className="text-gray-500 text-lg">A plataforma construída para a cena underground</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant to-pink-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-3xl p-10 hover:border-red-vibrant/50 transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-vibrant to-pink-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                    🎵
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Artistas Verificados</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Cada artista passa por verificação rigorosa. Perfis autênticos, portfolios reais, avaliações da comunidade.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant to-pink-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-3xl p-10 hover:border-red-vibrant/50 transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-vibrant to-pink-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                    💳
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Pagamento Protegido</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Sistema de escrow para segurança total. PIX instantâneo e cartão com proteção ao comprador e vendedor.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant to-pink-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-dark-800/50 backdrop-blur-sm border-2 border-dark-700 rounded-3xl p-10 hover:border-red-vibrant/50 transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-vibrant to-pink-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                    ⭐
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Reputação Real</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Sistema de avaliações transparente. Feedback genuíno de eventos reais para decisões informadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant via-pink-600 to-purple-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-dark-800 to-dark-900 border border-red-vibrant/30 rounded-3xl p-16 text-center">
                <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 text-transparent bg-clip-text">
                  Pronto para revolucionar seus eventos?
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                  Junte-se à maior comunidade underground de bookings do Brasil
                </p>
                <Link
                  to="/artists"
                  className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold text-xl rounded-2xl hover:scale-105 hover:shadow-2xl hover:shadow-red-vibrant/60 transition-all"
                >
                  Começar Agora
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
