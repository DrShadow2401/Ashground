
'use client';

import React from 'react';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  imageUri: string;
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({
  isActive,
  targetRect,
  duration,
  imageUri,
}) => {
  if (!isActive || !targetRect) {
    return null;
  }

  const animationDurationSeconds = duration / 1000;

  const effectContainerStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${targetRect.left}px`,
    top: `${targetRect.top}px`,
    width: `${targetRect.width}px`,
    height: `${targetRect.height}px`,
    zIndex: 1000,
    pointerEvents: 'none',
  };

  const numEmbers = 80;
  const numSmoke = 40;

  return (
    <div style={effectContainerStyle}>
      <div className="w-full h-full relative overflow-hidden filter saturate-150">
        {/* The note image that will be masked */}
        <div
          className="w-full h-full absolute top-0 left-0"
          style={{
            backgroundImage: `url(${imageUri})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: `burn-hole-mask ${animationDurationSeconds}s ease-in forwards`,
          }}
        />

        {/* The glowing burn ring */}
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            animation: `burn-hole-ring ${animationDurationSeconds * 0.9}s ease-in-out forwards`,
          }}
        />

        {/* Smoke particles (behind embers) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {Array.from({ length: numSmoke }).map((_, i) => {
            const size = Math.random() * 20 + 15;
            const startOpacity = Math.random() * 0.2 + 0.1;
            const animDelay = (Math.random() * animationDurationSeconds) * 0.5;
            const startX = 50 + (Math.random() - 0.5) * 50;
            const startY = 50 + (Math.random() - 0.5) * 40;

            return (
              <div
                key={`smoke-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${startX}%`,
                  top: `${startY}%`,
                  background: 'hsla(0, 0%, 20%, 1)',
                  animationName: 'smoke-float',
                  animationDuration: `${animationDurationSeconds - animDelay}s`,
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
                  animationDelay: `${animDelay}s`,
                  '--start-opacity': startOpacity,
                } as React.CSSProperties}
              />
            );
          })}
        </div>

        {/* Ember particles (in front of smoke) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {Array.from({ length: numEmbers }).map((_, i) => {
            const size = Math.random() * 5 + 2;
            const animDelay = (Math.random() * animationDurationSeconds) * 0.6;
            const startX = 50 + (Math.random() - 0.5) * 45;
            const startY = 50 + (Math.random() - 0.5) * 35;
            const drift = Math.random() - 0.5;

            return (
              <div
                key={`ember-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${startX}%`,
                  top: `${startY}%`,
                  background: `hsla(${20 + Math.random() * 40}, 100%, ${60 + Math.random() * 20}%, 0.9)`,
                  boxShadow: `0 0 ${size * 2}px hsla(${30 + Math.random() * 30}, 100%, 70%, 1), 0 0 2px 1px #fff`,
                  animationName: 'ember-float',
                  animationDuration: `${animationDurationSeconds - animDelay}s`,
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
                  animationDelay: `${animDelay}s`,
                  '--drift': drift,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NoteBurningEffect;
