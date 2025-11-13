import { demoStats } from '../../../data/demoData';

const DemoIntro = () => {
  return (
    <div className="text-center space-y-12 animate-fade-in">
      <div className="space-y-6">
        <h1 className="text-7xl font-bold bg-gradient-to-r from-red-vibrant via-pink-500 to-purple-500 text-transparent bg-clip-text">
          KXRTEX
        </h1>
        <p className="text-3xl text-gray-300 font-light">
          A Plataforma que Conecta Underground
        </p>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Conectamos contratantes com artistas underground (DJs, MCs, Performers)
          através de uma plataforma segura, transparente e inovadora.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:scale-105 transition">
          <div className="text-4xl font-bold text-red-vibrant mb-2">
            {demoStats.totalArtists}
          </div>
          <div className="text-gray-400">Artistas</div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:scale-105 transition">
          <div className="text-4xl font-bold text-red-vibrant mb-2">
            {demoStats.totalBookings}
          </div>
          <div className="text-gray-400">Bookings</div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:scale-105 transition">
          <div className="text-4xl font-bold text-red-vibrant mb-2">
            {demoStats.totalContratantes}
          </div>
          <div className="text-gray-400">Contratantes</div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:scale-105 transition">
          <div className="text-4xl font-bold text-green-500 mb-2">
            {demoStats.satisfactionRate}
          </div>
          <div className="text-gray-400">Satisfação</div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:scale-105 transition">
          <div className="text-4xl font-bold text-yellow-500 mb-2">
            {demoStats.averageRating}
          </div>
          <div className="text-gray-400">Avaliação Média</div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:scale-105 transition">
          <div className="text-4xl font-bold text-blue-500 mb-2">
            {demoStats.citiesCovered}
          </div>
          <div className="text-gray-400">Cidades</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-8">
        <div className="space-y-3">
          <div className="text-5xl">🛡️</div>
          <h3 className="text-xl font-semibold text-white">Segurança</h3>
          <p className="text-gray-400">
            Pagamentos retidos até 48h após o evento para garantir segurança
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-5xl">⚡</div>
          <h3 className="text-xl font-semibold text-white">Transparência</h3>
          <p className="text-gray-400">
            Taxas claras por plano: FREE (15%), PLUS (10%), PRO (7%)
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-5xl">🎵</div>
          <h3 className="text-xl font-semibold text-white">Underground</h3>
          <p className="text-gray-400">
            Foco exclusivo em artistas e eventos underground
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoIntro;
