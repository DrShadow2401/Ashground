
'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  sourceElement: HTMLElement | null;
  noteImageUri: string;
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({
  isActive,
  targetRect,
  duration,
  sourceElement,
  noteImageUri,
}) => {

  if (!isActive || !targetRect || !sourceElement || !noteImageUri) {
    return null;
  }

  const animationDurationSeconds = duration / 1000;
  const flameCount = 80; // Increased for a wider, more intense flame front
  const numSmokeParticles = 50;
  const numEmberParticles = 40;

  const borderRadius = getComputedStyle(sourceElement).borderRadius || '0.5rem';

  const flames = useMemo(() => {
    return Array.from({ length: flameCount }).map((_, i) => {
      const size = Math.random() * 60 + 40; // height
      const animDuration = Math.random() * 0.4 + 0.3; // faster, more erratic flicker
      const delay = Math.random() * 0.4;
      // Spread flames across a wide area to form a "wall"
      const horizontalPosition = (Math.random() - 0.5) * 150; 

      const colors = ['bg-orange-500/80', 'bg-yellow-400/70', 'bg-red-600/70', 'bg-orange-400/90'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      return {
        id: `flame-${i}`,
        className: cn(
          'absolute rounded-[50%_50%_20%_20%_/_60%_60%_40%_40%] filter blur-[5px]',
          randomColor
        ),
        style: {
          width: `${size * 0.7}px`,
          height: `${size}px`,
          // Position along the x-axis of the rotated flame container
          left: `calc(50% + ${horizontalPosition}px)`,
          bottom: `${Math.random() * 20}px`, // Stagger vertical start
          animationName: 'flame-flicker-in-place',
          animationDuration: `${animDuration}s`,
          animationDelay: `${delay}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          transformOrigin: 'bottom center',
        } as React.CSSProperties
      }
    });
  }, [flameCount]);

  const particles = useMemo(() => {
    const sharedDelay = animationDurationSeconds * 0.1;
    const sharedDuration = animationDurationSeconds * 0.9;
    
    const smoke = Array.from({ length: numSmokeParticles }).map((_, i) => ({
      id: `smoke-${i}`,
      type: 'smoke',
      style: {
        left: `${(Math.random() - 0.5) * 100}%`, // Emerge from along the flame front
        bottom: `${-10 + Math.random() * 15}%`,
        animationName: 'particle-rise-and-fade',
        animationDuration: `${1 + Math.random() * 2}s`,
        animationDelay: `${sharedDelay + (Math.random() * sharedDuration)}s`,
        '--particle-rise-distance': `-${150 + Math.random() * 100}px`,
        '--particle-drift-x': `${(Math.random() - 0.5) * 100}px`,
        '--particle-scale': `${2 + Math.random() * 2}`,
      } as React.CSSProperties,
    }));
    
    const embers = Array.from({ length: numEmberParticles }).map((_, i) => ({
      id: `ember-${i}`,
      type: 'ember',
      style: {
        left: `${(Math.random() - 0.5) * 100}%`, // Emerge from along the flame front
        bottom: `${Math.random() * 100}%`,
        animationName: 'particle-rise-and-fade',
        animationDuration: `${1 + Math.random() * 1.5}s`,
        animationDelay: `${sharedDelay + (Math.random() * sharedDuration)}s`,
        '--particle-rise-distance': `-${80 + Math.random() * 50}px`,
        '--particle-drift-x': `${(Math.random() - 0.5) * 60}px`,
        '--particle-scale': '1',
      } as React.CSSProperties,
    }));
    return [...smoke, ...embers];
  }, [numSmokeParticles, numEmberParticles, animationDurationSeconds]);

  return (
    <div
      className="fixed pointer-events-none z-[1000] overflow-hidden"
      style={{
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        borderRadius: borderRadius,
      }}
    >
      <div
        className="note-burn-image"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${noteImageUri})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: borderRadius,
          maskImage: 'linear-gradient(315deg, transparent 48%, black 52%)',
          maskSize: '250% 250%',
          maskRepeat: 'no-repeat',
          animationName: 'diagonal-wipe',
          animationDuration: `${animationDurationSeconds}s`,
          animationFillMode: 'forwards',
          animationTimingFunction: 'ease-in-out',
          willChange: 'mask-position',
        } as React.CSSProperties}
      />
      <div
        className="flame-container absolute bottom-0 left-0 w-[200%] h-[200px]"
        style={{
          transformOrigin: 'bottom left',
          animationName: 'diagonal-flame-travel',
          animationDuration: `${animationDurationSeconds * 1.2}s`, // travel slightly slower than wipe
          animationFillMode: 'forwards',
          animationTimingFunction: 'linear',
          willChange: 'transform',
        }}
      >
        {flames.map(f => (
          <div key={f.id} className={f.className} style={f.style} />
        ))}
        {particles.map(p => (
          <div
            key={p.id}
            className={p.type === 'smoke' ? 'note-smoke-particle' : 'note-ember-particle'}
            style={p.style}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteBurningEffect;
