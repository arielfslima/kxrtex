const DemoControls = ({
  currentSection,
  totalSections,
  isAutoPlay,
  onNext,
  onPrevious,
  onReset,
  onToggleAutoPlay,
}) => {
  return (
    <div className="bg-dark-900 border-t-2 border-neon-red/30 px-6 py-4 sticky bottom-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevious}
            disabled={currentSection === 0}
            className={`px-4 py-2 border-2 font-mono text-sm uppercase tracking-wider transition ${
              currentSection === 0
                ? 'border-dark-600 text-chrome/30 cursor-not-allowed'
                : 'border-chrome/30 text-chrome hover:border-chrome hover:bg-chrome/5'
            }`}
          >
            [&lt;] ANTERIOR
          </button>

          <button
            onClick={onNext}
            disabled={currentSection === totalSections - 1}
            className={`px-4 py-2 border-2 font-mono text-sm uppercase tracking-wider transition ${
              currentSection === totalSections - 1
                ? 'border-dark-600 text-chrome/30 cursor-not-allowed'
                : 'border-neon-red bg-neon-red text-dark-950 hover:shadow-[0_0_20px_rgba(255,0,68,0.5)]'
            }`}
          >
            PROXIMO [&gt;]
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-chrome/50 font-mono text-sm">
            [{String(currentSection + 1).padStart(2, '0')}/{String(totalSections).padStart(2, '0')}]
          </span>

          <button
            onClick={onToggleAutoPlay}
            className={`px-4 py-2 border-2 font-mono text-sm uppercase tracking-wider transition ${
              isAutoPlay
                ? 'border-neon-acid bg-neon-acid text-dark-950 animate-pulse'
                : 'border-neon-acid/50 text-neon-acid hover:border-neon-acid hover:bg-neon-acid/10'
            }`}
          >
            {isAutoPlay ? '[||] PAUSAR' : '[>] AUTO'}
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 border-2 border-chrome/30 text-chrome font-mono text-sm uppercase tracking-wider hover:border-chrome hover:bg-chrome/5 transition"
          >
            [R] RESET
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoControls;
