import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in
    setOpacity(100);
    
    // Hold then fade out
    const fadeOutTimeout = setTimeout(() => {
      setOpacity(0);
    }, 1300);

    // Call onComplete after 1.5s
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(fadeOutTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian-950/95 transition-opacity duration-200 pointer-events-auto"
      style={{ opacity: opacity / 100 }}
    >
      <div className="flex flex-col items-center">
        {/* Animated magical medieval loader */}
        <div className="relative w-36 h-36">
          <div className="absolute inset-0 rounded-full border-4 border-gold-900/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-gold-500 border-r-gold-500/40 animate-spin"></div>
          {/* Inner details */}
          <div className="absolute inset-4 rounded-full border border-gold-600/30 animate-pulse flex items-center justify-center bg-obsidian-950/30">
            <span className="text-gold-500 font-gothic text-sm md:text-base font-bold tracking-widest">
              Загрузка
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
