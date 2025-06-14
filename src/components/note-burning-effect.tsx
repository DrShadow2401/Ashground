
      
'use client';

import React, { useEffect, useMemo } from 'react';
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
  const numSmokeParticles = 80;
  const numEmberParticles = 70;

  const borderRadius = getComputedStyle(sourceElement).borderRadius || '0.5rem';

  const particles = useMemo(() => {
    const smoke = Array.from({ length: numSmokeParticles }).map((_, i) => ({
      id: `smoke-${i}`,
      type: 'smoke',
      style: {
        left: `${Math.random() * 100}%`,
        top: `${10 + Math.random() * 70}%`,
        width: `${10 + Math.random() * 25}px`,
        height: `${10 + Math.random() * 25}px`,
        animationDuration: `${animationDurationSeconds * (0.65 + Math.random() * 0.4)}s`,
        animationDelay: `${(animationDurationSeconds * 0.08) + (Math.random() * (animationDurationSeconds * 0.7))}s`,
        '--smoke-drift-x': `${(Math.random() - 0.5) * 180}px`,
        '--smoke-rise-distance': `-${160 + Math.random() * 150}px`,
      } as React.CSSProperties,
    }));

    const embers = Array.from({ length: numEmberParticles }).map((_, i) => ({
      id: `ember-${i}`,
      type: 'ember',
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${3 + Math.random() * 6}px`,
        height: `${3 + Math.random() * 6}px`,
        animationDuration: `${animationDurationSeconds * (0.45 + Math.random() * 0.45)}s`,
        animationDelay: `${(animationDurationSeconds * 0.03) + (Math.random() * (animationDurationSeconds * 0.85))}s`,
        '--ember-drift-x': `${(Math.random() - 0.5) * 100}px`,
        '--ember-fall-distance': `${60 + Math.random() * 60}px`,
        '--ember-initial-y-offset': `${(Math.random() - 0.5) * 10}px`,
        '--ember-initial-x-offset': `${(Math.random() - 0.5) * 10}px`,
      } as React.CSSProperties,
    }));
    return [...smoke, ...embers];
  }, [numSmokeParticles, numEmberParticles, animationDurationSeconds]);


  return (
    <div
      className={cn(
        "note-burn-overlay fixed pointer-events-none"
      )}
      style={{
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        borderRadius: borderRadius,
        '--duration-seconds': `${animationDurationSeconds}s`,
        '--radius': borderRadius,
        backgroundImage: `url(${noteImageUri})`,
        backgroundSize: 'cover', // Changed from object-fit for img
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      } as React.CSSProperties}
    >
      {/* Removed <img> tag here, content is now a background-image of this div */}
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

    