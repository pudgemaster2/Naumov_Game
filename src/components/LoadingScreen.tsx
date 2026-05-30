import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Загрузка...', onComplete }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in
    setOpacity(100);
    
    // Hold then fade out
    const fadeOutTimeout = setTimeout(() => {
      setOpacity(0);
    }, 800);

    // Call onComplete after 1s
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1000);

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
      <div className="flex flex-col items-center space-y-4">
        {/* Animated magical medieval loader */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-gold-900/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-gold-500 border-r-gold-500/40 animate-spin"></div>
          {/* Inner details */}
          <div className="absolute inset-3 rounded-full border border-gold-600/30 animate-pulse flex items-center justify-center">
            <span className="text-gold-500 font-gothic text-xs tracking-wider">LIFT</span>
          </div>
        </div>
        
        <p className="text-gold-400 font-gothic text-xl tracking-widest animate-pulse mt-2">
          {message}
        </p>
      </div>
    </div>
  );
};
