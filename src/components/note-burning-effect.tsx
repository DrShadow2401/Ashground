
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({ isActive, targetRect, duration }) => {
  if (!isActive || !targetRect) {
    return null;
  }

  const numSmokeParticles = 15;
  const animationDurationSeconds = duration / 1000;

  return (
    <div
      className="note-burn-overlay fixed pointer-events-none z-[1000]"
      style={{
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        animation: `note-burn-animation ${animationDurationSeconds}s ease-in-out forwards, note-burn-glow-animation ${animationDurationSeconds}s ease-in-out forwards`,
      }}
    >
      {Array.from({ length: numSmokeParticles }).map((_, i) => (
        <div
          key={i}
          className="note-smoke-particle absolute rounded-full"
          style={{
            left: `${Math.random() * 90 + 5}%`, // Avoid edges for initial position
            bottom: `${Math.random() * 10}%`,    // Start near the bottom of the burning area
            width: `${15 + Math.random() * 25}px`,
            height: `${15 + Math.random() * 25}px`,
            animationName: 'note-smoke-animation',
            animationDuration: `${animationDurationSeconds * (0.6 + Math.random() * 0.4)}s`, // Smoke lasts part of overall duration
            animationDelay: `${animationDurationSeconds * (Math.random() * 0.5)}s`, // Stagger smoke start
            animationTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Ease out for smoke
            animationFillMode: 'forwards',
          }}
        />
      ))}
    </div>
  );
};

export default NoteBurningEffect;
