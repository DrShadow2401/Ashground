
'use client';

import React from 'react';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  sourceElement: HTMLElement | null; // The actual DOM element being "burned" for style consistency
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({ isActive, targetRect, duration, sourceElement }) => {
  if (!isActive || !targetRect) {
    return null;
  }

  const numSmokeParticles = 30; // Increased smoke particles
  const animationDurationSeconds = duration / 1000;

  // Dynamically get border-radius from the source element, fallback if not available
  const borderRadius = sourceElement ? getComputedStyle(sourceElement).borderRadius : '0.75rem'; // 0.75rem is for rounded-xl

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
        animation: `note-burn-animation ${animationDurationSeconds}s ease-out forwards, note-burn-glow-animation ${animationDurationSeconds}s ease-out forwards`,
      }}
    >
      {Array.from({ length: numSmokeParticles }).map((_, i) => (
        <div
          key={i}
          className="note-smoke-particle"
          style={{
            position: 'absolute',
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 30}%`,
            width: `${8 + Math.random() * 16}px`, // Adjusted size
            height: `${8 + Math.random() * 16}px`, // Adjusted size
            animationName: 'note-smoke-animation',
            animationDuration: `${animationDurationSeconds * (0.7 + Math.random() * 0.5)}s`, // Smoke lasts longer and varies more
            animationDelay: `${animationDurationSeconds * (Math.random() * 0.5)}s`, // Stagger smoke start times
            animationTimingFunction: 'cubic-bezier(0.1, 0.8, 0.2, 1)',
            animationFillMode: 'forwards',
          }}
        />
      ))}
    </div>
  );
};

export default NoteBurningEffect;
