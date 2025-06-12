
'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  sourceElement: HTMLElement | null; 
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({ isActive, targetRect, duration, sourceElement }) => {
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportHeight(window.innerHeight);
    }
  }, []);

  if (!isActive || !targetRect || !sourceElement) {
    return null;
  }

  const animationDurationSeconds = duration / 1000;
  const numSmokeParticles = 40; // Increased for more effect during fall
  const numEmberParticles = 30;

  const borderRadius = getComputedStyle(sourceElement).borderRadius || '0.75rem'; 
  const initialPaperColor = getComputedStyle(sourceElement).backgroundColor || 'hsl(var(--card))';
  const noteHeight = targetRect.height;


  const particles = useMemo(() => {
    const smoke = Array.from({ length: numSmokeParticles }).map((_, i) => ({
      id: `smoke-${i}`,
      type: 'smoke',
      style: {
        left: `${Math.random() * 100}%`, 
        top: `${Math.random() * 50 + 25}%`, // Emit from various points of the falling note
        width: `${8 + Math.random() * 20}px`,
        height: `${8 + Math.random() * 20}px`,
        animationDuration: `${animationDurationSeconds * (0.5 + Math.random() * 0.5)}s`, // Shorter duration as note falls
        animationDelay: `${(animationDurationSeconds * 0.1) + (Math.random() * (animationDurationSeconds * 0.6))}s`, // Staggered start during fall
        '--smoke-drift-x': `${(Math.random() - 0.5) * 70}px`, 
      } as React.CSSProperties,
    }));

    const embers = Array.from({ length: numEmberParticles }).map((_, i) => ({
      id: `ember-${i}`,
      type: 'ember',
      style: {
        left: `${Math.random() * 100}%`, 
        top: `${Math.random() * 60 + 20}%`, // Emit from various points
        width: `${2 + Math.random() * 5}px`,
        height: `${2 + Math.random() * 5}px`,
        animationDuration: `${animationDurationSeconds * (0.3 + Math.random() * 0.4)}s`,
        animationDelay: `${(animationDurationSeconds * 0.05) + (Math.random() * (animationDurationSeconds * 0.7))}s`, 
        '--ember-drift-x': `${(Math.random() - 0.5) * 40}px`,
      } as React.CSSProperties,
    }));
    return [...smoke, ...embers];
  }, [numSmokeParticles, numEmberParticles, animationDurationSeconds]);


  return (
    <div
      className="note-burn-overlay fixed pointer-events-none"
      style={{
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        borderRadius: borderRadius,
        '--duration-seconds': `${animationDurationSeconds}s`,
        '--note-initial-paper-color': initialPaperColor,
        '--viewport-height': `${viewportHeight}px`,
        '--note-height': `${noteHeight}px`,
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
