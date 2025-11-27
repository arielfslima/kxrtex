import { demoStats } from '../../../data/demoData';

const DemoIntro = () => {
  return (
    <div className="text-center space-y-12 animate-fade-in">
      <div className="space-y-6">
        <div className="inline-block">
          <h1 className="text-8xl font-black font-display tracking-tighter text-chrome glitch-text">
            KXRTEX
          </h1>
          <div className="h-1 bg-neon-red mt-2 animate-pulse" />
        </div>
        <p className="text-2xl text-chrome font-mono uppercase tracking-[0.3em]">
          A Plataforma que Conecta Underground
        </p>
        <p className="text-lg text-chrome/60 max-w-3xl mx-auto font-mono leading-relaxed">
          Conectamos contratantes com artistas underground (DJs, MCs, Performers)
          atraves de uma plataforma segura, transparente e inovadora.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        <div className="border-2 border-neon-red/30 bg-dark-900/50 p-6 hover:border-neon-red hover:shadow-[0_0_30px_rgba(255,0,68,0.2)] transition-all group">
          <div className="text-4xl font-black font-mono text-neon-red group-hover:animate-pulse">
            {demoStats.totalArtists}
          </div>
          <div className="text-chrome/50 font-mono text-sm uppercase tracking-wider mt-2">Artistas</div>
        </div>

        <div className="border-2 border-neon-red/30 bg-dark-900/50 p-6 hover:border-neon-red hover:shadow-[0_0_30px_rgba(255,0,68,0.2)] transition-all group">
          <div className="text-4xl font-black font-mono text-neon-red group-hover:animate-pulse">
            {demoStats.totalBookings}
          </div>
          <div className="text-chrome/50 font-mono text-sm uppercase tracking-wider mt-2">Bookings</div>
        </div>

        <div className="border-2 border-neon-red/30 bg-dark-900/50 p-6 hover:border-neon-red hover:shadow-[0_0_30px_rgba(255,0,68,0.2)] transition-all group">
          <div className="text-4xl font-black font-mono text-neon-red group-hover:animate-pulse">
            {demoStats.totalContratantes}
          </div>
          <div className="text-chrome/50 font-mono text-sm uppercase tracking-wider mt-2">Contratantes</div>
        </div>

        <div className="border-2 border-neon-acid/30 bg-dark-900/50 p-6 hover:border-neon-acid hover:shadow-[0_0_30px_rgba(57,255,20,0.2)] transition-all group">
          <div className="text-4xl font-black font-mono text-neon-acid group-hover:animate-pulse">
            {demoStats.satisfactionRate}
          </div>
          <div className="text-chrome/50 font-mono text-sm uppercase tracking-wider mt-2">Satisfacao</div>
        </div>

        <div className="border-2 border-neon-gold/30 bg-dark-900/50 p-6 hover:border-neon-gold hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all group">
          <div className="text-4xl font-black font-mono text-neon-gold group-hover:animate-pulse">
            {demoStats.averageRating}
          </div>
          <div className="text-chrome/50 font-mono text-sm uppercase tracking-wider mt-2">Avaliacao Media</div>
        </div>

        <div className="border-2 border-neon-cyan/30 bg-dark-900/50 p-6 hover:border-neon-cyan hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all group">
          <div className="text-4xl font-black font-mono text-neon-cyan group-hover:animate-pulse">
            {demoStats.citiesCovered}
          </div>
          <div className="text-chrome/50 font-mono text-sm uppercase tracking-wider mt-2">Cidades</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-8">
        <div className="border-2 border-dark-600 bg-dark-900/30 p-6 hover:border-neon-acid/50 transition-all">
          <div className="text-4xl mb-4 grayscale hover:grayscale-0 transition-all">[S]</div>
          <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider">Seguranca</h3>
          <p className="text-chrome/50 font-mono text-sm mt-2">
            Pagamentos retidos ate 48h apos o evento para garantir seguranca
          </p>
        </div>

        <div className="border-2 border-dark-600 bg-dark-900/30 p-6 hover:border-neon-acid/50 transition-all">
          <div className="text-4xl mb-4 grayscale hover:grayscale-0 transition-all">[T]</div>
          <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider">Transparencia</h3>
          <p className="text-chrome/50 font-mono text-sm mt-2">
            Taxas claras por plano: FREE (15%), PLUS (10%), PRO (7%)
          </p>
        </div>

        <div className="border-2 border-dark-600 bg-dark-900/30 p-6 hover:border-neon-acid/50 transition-all">
          <div className="text-4xl mb-4 grayscale hover:grayscale-0 transition-all">[U]</div>
          <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider">Underground</h3>
          <p className="text-chrome/50 font-mono text-sm mt-2">
            Foco exclusivo em artistas e eventos underground
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoIntro;
