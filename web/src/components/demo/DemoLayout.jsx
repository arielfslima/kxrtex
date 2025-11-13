import { useState, useEffect } from 'react';
import DemoStepper from './DemoStepper';
import DemoControls from './DemoControls';

const DemoLayout = ({ children, sections, currentSection, onSectionChange }) => {
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAutoPlay) {
      const sectionDuration = sections[currentSection]?.duration || 30;
      const interval = 100;
      const totalSteps = (sectionDuration * 1000) / interval;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (100 / totalSteps);
          if (next >= 100) {
            if (currentSection < sections.length - 1) {
              onSectionChange(currentSection + 1);
              return 0;
            } else {
              setIsAutoPlay(false);
              return 100;
            }
          }
          return next;
        });
      }, interval);

      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [isAutoPlay, currentSection, sections, onSectionChange]);

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      onSectionChange(currentSection + 1);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      onSectionChange(currentSection - 1);
      setProgress(0);
    }
  };

  const handleReset = () => {
    onSectionChange(0);
    setProgress(0);
    setIsAutoPlay(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => !prev);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <DemoStepper
        sections={sections}
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        progress={isAutoPlay ? progress : null}
      />

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>

      <DemoControls
        currentSection={currentSection}
        totalSections={sections.length}
        isAutoPlay={isAutoPlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onReset={handleReset}
        onToggleAutoPlay={toggleAutoPlay}
      />
    </div>
  );
};

export default DemoLayout;
