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
    <div className="min-h-screen bg-dark-950 flex flex-col relative">
      {/* Noise overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scan lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      <DemoStepper
        sections={sections}
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        progress={isAutoPlay ? progress : null}
      />

      <main className="flex-1 flex items-center justify-center p-8 relative z-10">
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
