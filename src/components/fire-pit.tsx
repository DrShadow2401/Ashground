
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

  // Create a more varied set of flames
  const flameCount = 15; // Increased for more density
  const flames = Array.from({ length: flameCount }).map((_, i) => {
    const size = Math.random() * 50 + 30; // Random size between 30px and 80px
    const duration = Math.random() * 0.5 + 0.8; // Random duration around 1s
    const delay = Math.random() * 0.5; // Random delay
    const horizontalPosition = Math.random() * 80 + 10; // % position from left (10% to 90%)
    
    // More varied flame colors
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 
        'bg-red-600', 'bg-orange-400', 'bg-yellow-500'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return (
      <div
        key={`flame-${i}`}
        className={cn(
          'flame',
          randomColor,
          'absolute rounded-[50%_50%_50%_50%_/_80%_80%_20%_20%] opacity-80 filter blur-[3px]',
          'animate-flame-flicker' // Changed to a single, more complex animation
        )}
        style={{
          width: `${size * 0.7}px`, // Flames are generally taller than wide
          height: `${size}px`,
          left: `${horizontalPosition}%`,
          bottom: `${Math.random() * -10}px`, // Some flames start slightly lower
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          transformOrigin: 'bottom center',
        }}
      />
    );
  });

  return (
    <div
      className="fire-pit fixed bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] pointer-events-none z-[998]"
      aria-hidden="true"
    >
      <div className="relative w-full h-full">
        {flames}
        {/* Optional: Add a subtle glow at the base */}
        <div className="absolute bottom-0 left-0 right-0 h-[20px] bg-yellow-400/30 rounded-full blur-md"></div>
      </div>
    </div>
  );
};

export default FirePit;
