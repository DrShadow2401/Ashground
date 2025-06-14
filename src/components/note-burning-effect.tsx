
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
  const numSmokeParticles = 80; // Slightly more smoke
  const numEmberParticles = 70; // Slightly more embers

  const borderRadius = getComputedStyle(sourceElement).borderRadius || '0.5rem'; // Use source element's border radius

  const particles = useMemo(() => {
    const smoke = Array.from({ length: numSmokeParticles }).map((_, i) => ({
      id: `smoke-${i}`,
      type: 'smoke',
      style: {
        left: `${Math.random() * 100}%`,
        top: `${10 + Math.random() * 70}%`, // Emit from a wider vertical range
        width: `${10 + Math.random() * 25}px`, // Smoke puffs can vary more
        height: `${10 + Math.random() * 25}px`,
        animationDuration: `${animationDurationSeconds * (0.65 + Math.random() * 0.4)}s`, // Smoke lingers a bit
        animationDelay: `${(animationDurationSeconds * 0.08) + (Math.random() * (animationDurationSeconds * 0.7))}s`, // Smoke starts a bit after ignition
        '--smoke-drift-x': `${(Math.random() - 0.5) * 180}px`, // Wider horizontal drift
        '--smoke-rise-distance': `-${160 + Math.random() * 150}px`, // Smoke rises further
      } as React.CSSProperties,
    }));

    const embers = Array.from({ length: numEmberParticles }).map((_, i) => ({
      id: `ember-${i}`,
      type: 'ember',
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`, // Embers from all over, as before
        width: `${3 + Math.random() * 6}px`, // Embers slightly smaller on average, more sparkle-like
        height: `${3 + Math.random() * 6}px`,
        animationDuration: `${animationDurationSeconds * (0.45 + Math.random() * 0.45)}s`, // Ember lifetime
        animationDelay: `${(animationDurationSeconds * 0.03) + (Math.random() * (animationDurationSeconds * 0.85))}s`, // Embers appear very early
        '--ember-drift-x': `${(Math.random() - 0.5) * 100}px`, // Embers drift less than smoke
        '--ember-fall-distance': `${60 + Math.random() * 60}px`, // Embers fall a bit
        '--ember-initial-y-offset': `${(Math.random() - 0.5) * 10}px`, // Slight initial vertical jitter for embers
        '--ember-initial-x-offset': `${(Math.random() - 0.5) * 10}px`, // Slight initial horizontal jitter
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
        borderRadius: borderRadius, // Apply original element's border radius
        '--duration-seconds': `${animationDurationSeconds}s`,
        '--radius': borderRadius, // Pass radius as a CSS variable for clip-path
      } as React.CSSProperties}
    >
      <img
        src={noteImageUri}
        alt="Burning note content"
        className="w-full h-full object-cover"
      />

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

