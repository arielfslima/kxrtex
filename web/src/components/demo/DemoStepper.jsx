const DemoStepper = ({ sections, currentSection, onSectionChange, progress }) => {
  return (
    <div className="bg-dark-900 border-b-2 border-neon-red/30 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-dark-600">
          {sections.map((section, index) => {
            const isActive = index === currentSection;
            const isCompleted = index < currentSection;
            const isAccessible = index <= currentSection;

            return (
              <div key={index} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => isAccessible && onSectionChange(index)}
                  disabled={!isAccessible}
                  className={`relative flex items-center gap-3 px-4 py-2 border-2 transition-all font-mono text-sm ${
                    isActive
                      ? 'border-neon-red bg-neon-red/10 text-chrome shadow-[0_0_20px_rgba(255,0,68,0.3)]'
                      : isCompleted
                      ? 'border-neon-acid/50 bg-neon-acid/5 text-neon-acid hover:bg-neon-acid/10'
                      : 'border-dark-600 bg-dark-800/50 text-chrome/30 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-7 h-7 border-2 flex items-center justify-center font-bold text-xs ${
                      isActive
                        ? 'border-neon-red bg-neon-red text-dark-950'
                        : isCompleted
                        ? 'border-neon-acid bg-neon-acid text-dark-950'
                        : 'border-dark-500 text-chrome/50'
                    }`}
                  >
                    {isCompleted ? 'OK' : String(index + 1).padStart(2, '0')}
                  </div>
                  <span className="whitespace-nowrap uppercase tracking-wider">
                    {section.title}
                  </span>

                  {isActive && progress !== null && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-neon-red transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>

                {index < sections.length - 1 && (
                  <div className={`w-6 h-0.5 mx-1 ${
                    isCompleted ? 'bg-neon-acid' : 'bg-dark-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DemoStepper;
