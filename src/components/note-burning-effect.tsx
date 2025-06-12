
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  sourceElement: HTMLElement | null;
  noteHTMLContent: string; // Added prop for HTML content
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({
  isActive,
  targetRect,
  duration,
  sourceElement,
  noteHTMLContent,
}) => {
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
  const numSmokeParticles = 50;
  const numEmberParticles = 40;

  const borderRadius = getComputedStyle(sourceElement).borderRadius || '0.5rem'; // Keep initial border radius
  // Initial paper color for burn effect is now white, defined in CSS by --note-initial-paper-color-for-burn
  const noteHeight = targetRect.height;

  const particles = useMemo(() => {
    const smoke = Array.from({ length: numSmokeParticles }).map((_, i) => ({
      id: `smoke-${i}`,
      type: 'smoke',
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 30 + 10}%`, // Emit more from upper part of falling note
        width: `${10 + Math.random() * 25}px`,
        height: `${10 + Math.random() * 25}px`,
        animationDuration: `${animationDurationSeconds * (0.6 + Math.random() * 0.4)}s`,
        animationDelay: `${(animationDurationSeconds * 0.15) + (Math.random() * (animationDurationSeconds * 0.7))}s`,
        '--smoke-drift-x': `${(Math.random() - 0.5) * 100}px`,
        '--smoke-rise-distance': `-${150 + Math.random() * 100}px`, // Vary smoke rise
      } as React.CSSProperties,
    }));

    const embers = Array.from({ length: numEmberParticles }).map((_, i) => ({
      id: `ember-${i}`,
      type: 'ember',
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 70 + 15}%`, // Emit from various points
        width: `${3 + Math.random() * 6}px`,
        height: `${3 + Math.random() * 6}px`,
        animationDuration: `${animationDurationSeconds * (0.4 + Math.random() * 0.5)}s`,
        animationDelay: `${(animationDurationSeconds * 0.1) + (Math.random() * (animationDurationSeconds * 0.8))}s`,
        '--ember-drift-x': `${(Math.random() - 0.5) * 60}px`,
        '--ember-fall-distance': `${60 + Math.random() * 40}px`, // Vary ember fall
      } as React.CSSProperties,
    }));
    return [...smoke, ...embers];
  }, [numSmokeParticles, numEmberParticles, animationDurationSeconds]);


  return (
    <div
      className={cn(
        "note-burn-overlay note-burn-overlay-ruled fixed pointer-events-none"
      )}
      style={{
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        borderRadius: borderRadius,
        '--duration-seconds': `${animationDurationSeconds}s`,
        // '--note-initial-paper-color': 'hsl(var(--note-initial-paper-color-for-burn))', // Set in CSS
        '--viewport-height': `${viewportHeight}px`,
        '--note-height': `${noteHeight}px`,
        '--line-color': 'hsl(var(--foreground))', /* Use a visible line color for the white paper */
        '--text-line-height': '1.4rem', /* Adjust for smaller text in burn overlay */
      } as React.CSSProperties}
    >
      <div
        className="note-burn-overlay-text-container ProseMirror" // Apply ProseMirror for basic text styling
        dangerouslySetInnerHTML={{ __html: noteHTMLContent }}
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
