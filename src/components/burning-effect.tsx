
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface BurningEffectProps {
  duration: number; // in milliseconds
}

const NUM_ASHES = 30;

interface AshParticle {
  id: number;
  style: React.CSSProperties;
}

const BurningEffect: React.FC<BurningEffectProps> = ({ duration }) => {
  const [ashParticles, setAshParticles] = useState<AshParticle[]>([]);

  useEffect(() => {
    const newAshes: AshParticle[] = [];
    for (let i = 0; i < NUM_ASHES; i++) {
      newAshes.push({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * (duration / 1000 / 2)}s`, // Start falling during the first half of the animation
          animationDuration: `${(duration / 1000 / 2) + (Math.random() * (duration / 1000 / 2))}s`, // Fall for the remainder
          width: `${Math.random() * 5 + 2}px`,
          height: `${Math.random() * 5 + 2}px`,
        },
      });
    }
    setAshParticles(newAshes);
  }, [duration]);

  return (
    <div
      className="burn-overlay fixed inset-0 z-[1000] pointer-events-none bg-black/70"
      style={{ animation: `burnReveal ${duration / 1000}s ease-out forwards` }}
    >
      {ashParticles.map((ash) => (
        <div
          key={ash.id}
          className="ash-particle absolute top-[-10px] rounded-full bg-gray-700 opacity-70"
          style={{
            ...ash.style,
            animationName: 'fallAndFade',
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
          }}
        />
      ))}
    </div>
  );
};

export default BurningEffect;
