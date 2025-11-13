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
    <div className="bg-dark-800 border-t border-dark-700 px-6 py-4 sticky bottom-0 z-50 backdrop-blur-sm bg-dark-800/90">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevious}
            disabled={currentSection === 0}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentSection === 0
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                : 'bg-dark-700 text-white hover:bg-dark-600'
            }`}
          >
            ← Anterior
          </button>

          <button
            onClick={onNext}
            disabled={currentSection === totalSections - 1}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentSection === totalSections - 1
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-vibrant to-pink-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-vibrant/50'
            }`}
          >
            Próximo →
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            {currentSection + 1} / {totalSections}
          </span>

          <button
            onClick={onToggleAutoPlay}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isAutoPlay
                ? 'bg-yellow-500 text-dark-900 hover:bg-yellow-400'
                : 'bg-dark-700 text-white hover:bg-dark-600'
            }`}
          >
            {isAutoPlay ? '⏸ Pausar' : '▶ Auto-Play'}
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 font-medium transition"
          >
            ↺ Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoControls;
