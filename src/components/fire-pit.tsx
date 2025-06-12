
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FirePitProps {
  isActive: boolean;
}

const FirePit: React.FC<FirePitProps> = ({ isActive }) => {
  if (!isActive) {
    return null;
  }

  const flameCount = 25; // Increased for a wider, denser fire
  const flames = Array.from({ length: flameCount }).map((_, i) => {
    const size = Math.random() * 60 + 40; // Random size between 40px and 100px
    const duration = Math.random() * 0.6 + 0.7; // Random duration around 0.7s to 1.3s
    const delay = Math.random() * 0.6;
    const horizontalPosition = Math.random() * 90 + 5; // Spread flames across 5% to 95%

    const colors = [
        'bg-red-500/80', 'bg-orange-500/80', 'bg-yellow-400/70',
        'bg-red-600/80', 'bg-orange-400/80', 'bg-yellow-500/70',
        'bg-red-700/70', 'bg-orange-600/70',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return (
      <div
        key={`flame-${i}`}
        className={cn(
          'flame',
          randomColor,
          'absolute rounded-[50%_50%_50%_50%_/_70%_70%_30%_30%] filter blur-[3px] animate-flame-flicker'
        )}
        style={{
          width: `${size * 0.65}px`,
          height: `${size}px`,
          left: `${horizontalPosition}%`,
          bottom: `${Math.random() * -15}px`, // Some flames start slightly lower for depth
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          transformOrigin: 'bottom center',
        }}
      />
    );
  });

  return (
    <div
      className="fire-pit fixed bottom-0 left-0 right-0 w-full h-[180px] pointer-events-none z-[998] flex justify-center"
      aria-hidden="true"
    >
      <div className="relative w-4/5 max-w-2xl h-full"> {/* Fire is 80% of viewport width, max 2xl */}
        {flames}
        <div className="absolute bottom-0 left-0 right-0 h-[30px] bg-yellow-500/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[15px] bg-red-600/10 rounded-full blur-md"></div>
      </div>
    </div>
  );
};

export default FirePit;
