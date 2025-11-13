const DemoStepper = ({ sections, currentSection, onSectionChange, progress }) => {
  return (
    <div className="bg-dark-800 border-b border-dark-700 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-dark-800/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {sections.map((section, index) => {
            const isActive = index === currentSection;
            const isCompleted = index < currentSection;
            const isAccessible = index <= currentSection;

            return (
              <div key={index} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => isAccessible && onSectionChange(index)}
                  disabled={!isAccessible}
                  className={`relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-red-vibrant text-white scale-105 shadow-lg shadow-red-vibrant/30'
                      : isCompleted
                      ? 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                      : 'bg-dark-700/50 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isActive
                        ? 'bg-white text-red-vibrant'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-dark-600 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {section.title}
                  </span>

                  {isActive && progress !== null && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>

                {index < sections.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-dark-700'
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
