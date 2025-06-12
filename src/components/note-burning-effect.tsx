
'use client';

import React, { useEffect, useMemo } from 'react';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  sourceElement: HTMLElement | null; 
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({ isActive, targetRect, duration, sourceElement }) => {
  if (!isActive || !targetRect || !sourceElement) {
    return null;
  }

  const animationDurationSeconds = duration / 1000;
  const numSmokeParticles = 35;
  const numEmberParticles = 25;

  const borderRadius = getComputedStyle(sourceElement).borderRadius || '0.75rem'; // Fallback for rounded-xl
  const initialPaperColor = getComputedStyle(sourceElement).backgroundColor || 'hsl(var(--card))';

  // Memoize particles to prevent re-generation on every render unless key props change
  const particles = useMemo(() => {
    const smoke = Array.from({ length: numSmokeParticles }).map((_, i) => ({
      id: `smoke-${i}`,
      type: 'smoke',
      style: {
        left: `${Math.random() * 100}%`, // Spread across width
        top: `${Math.random() * 30 + 60}%`, // Emit from bottom 60-90% initially, rising
        width: `${6 + Math.random() * 18}px`,
        height: `${6 + Math.random() * 18}px`,
        animationDuration: `${animationDurationSeconds * (0.6 + Math.random() * 0.6)}s`,
        animationDelay: `${animationDurationSeconds * (0.1 + Math.random() * 0.4)}s`, // Staggered start
        '--smoke-drift-x': `${(Math.random() - 0.5) * 60}px`, // Add random horizontal drift
      } as React.CSSProperties,
    }));

    const embers = Array.from({ length: numEmberParticles }).map((_, i) => ({
      id: `ember-${i}`,
      type: 'ember',
      style: {
        left: `${Math.random() * 70 + 15}%`, // More concentrated initially, avoiding extreme edges
        top: `${Math.random() * 40 + 50}%`,    // Emit from lower-mid section
        width: `${2 + Math.random() * 4}px`,
        height: `${2 + Math.random() * 4}px`,
        animationDuration: `${animationDurationSeconds * (0.4 + Math.random() * 0.3)}s`,
        animationDelay: `${animationDurationSeconds * (0.05 + Math.random() * 0.5)}s`, // Embers appear throughout burn
      } as React.CSSProperties,
    }));
    return [...smoke, ...embers];
  }, [numSmokeParticles, numEmberParticles, animationDurationSeconds]);


  return (
    <div
      className="note-burn-overlay"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        borderRadius: borderRadius,
        '--duration-seconds': `${animationDurationSeconds}s`,
        '--note-initial-paper-color': initialPaperColor, // Pass initial color to CSS
      } as React.CSSProperties}
    >
      {particles.map(p => (
        <div
          key={p.id}
          className={p.type === 'smoke' ? 'note-smoke-particle' : 'note-ember-particle'}
          style={p.style}
        />
      ))}
    </div>
  );
};

export default NoteBurningEffect;
