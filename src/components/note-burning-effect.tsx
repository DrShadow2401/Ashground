
'use client';

import React, { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  sourceElement: HTMLElement | null;
  noteImageUri: string; // Changed from noteHTMLContent to noteImageUri
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({
  isActive,
  targetRect,
  duration,
  sourceElement,
  noteImageUri, // Use image URI
}) => {

  useEffect(() => {
    // Viewport height is no longer needed as the note burns in place
  }, []);

  if (!isActive || !targetRect || !sourceElement || !noteImageUri) {
    return null;
  }

  const animationDurationSeconds = duration / 1000;
  const numSmokeParticles = 70; // Increased for more intense burn
  const numEmberParticles = 60; // Increased

  const borderRadius = getComputedStyle(sourceElement).borderRadius || '0.5rem';
  // Initial paper color for burn effect is now white, defined in CSS by --note-initial-paper-color-for-burn

  const particles = useMemo(() => {
    const smoke = Array.from({ length: numSmokeParticles }).map((_, i) => ({
      id: `smoke-${i}`,
      type: 'smoke',
      style: {
        left: `${Math.random() * 100}%`,
        // Emit smoke more towards the start of burn, from various parts
        top: `${20 + Math.random() * 60}%`,
        width: `${15 + Math.random() * 30}px`,
        height: `${15 + Math.random() * 30}px`,
        animationDuration: `${animationDurationSeconds * (0.7 + Math.random() * 0.3)}s`,
        // Start smoke slightly after ignition
        animationDelay: `${(animationDurationSeconds * 0.1) + (Math.random() * (animationDurationSeconds * 0.6))}s`,
        '--smoke-drift-x': `${(Math.random() - 0.5) * 150}px`,
        '--smoke-rise-distance': `-${180 + Math.random() * 120}px`,
      } as React.CSSProperties,
    }));

    const embers = Array.from({ length: numEmberParticles }).map((_, i) => ({
      id: `ember-${i}`,
      type: 'ember',
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`, // Embers from all over
        width: `${4 + Math.random() * 7}px`,
        height: `${4 + Math.random() * 7}px`,
        animationDuration: `${animationDurationSeconds * (0.5 + Math.random() * 0.4)}s`,
        animationDelay: `${(animationDurationSeconds * 0.05) + (Math.random() * (animationDurationSeconds * 0.8))}s`,
        '--ember-drift-x': `${(Math.random() - 0.5) * 80}px`,
        '--ember-fall-distance': `${50 + Math.random() * 50}px`,
      } as React.CSSProperties,
    }));
    return [...smoke, ...embers];
  }, [numSmokeParticles, numEmberParticles, animationDurationSeconds]);


  return (
    <div
      className={cn(
        "note-burn-overlay fixed pointer-events-none"
        // Removed note-burn-overlay-ruled as html2canvas captures visual appearance
      )}
      style={{
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        borderRadius: borderRadius,
        '--duration-seconds': `${animationDurationSeconds}s`,
        '--note-initial-paper-color-for-burn': 'hsl(var(--note-initial-paper-color-for-burn))',
        // Viewport and note height related variables are no longer needed for in-place burn
      } as React.CSSProperties}
    >
      {/* Render the captured image */}
      <img 
        src={noteImageUri} 
        alt="Burning note content" 
        className="w-full h-full object-cover" // object-cover to fill, object-contain to show all
        style={{ imageRendering: 'pixelated' }} // Helps if image is scaled up for sharpness
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
