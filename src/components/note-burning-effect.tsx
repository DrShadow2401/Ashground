
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

  const numEmbers = 50;

  return (
    <div style={effectContainerStyle}>
      <div className="w-full h-full relative overflow-hidden">
        {/* The note image that will be masked */}
        <div
          className="w-full h-full absolute top-0 left-0"
          style={{
            backgroundImage: `url(${imageUri})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: `burn-hole-mask ${animationDurationSeconds}s ease-in-out forwards`,
          }}
        />

        {/* The glowing burn ring */}
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            animation: `burn-hole-ring ${animationDurationSeconds}s ease-in-out forwards`,
          }}
        />

        {/* Ember particles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {Array.from({ length: numEmbers }).map((_, i) => {
            const size = Math.random() * 4 + 2;
            const animDelay = (Math.random() * animationDurationSeconds) * 0.7; // embers appear throughout the first 70% of the animation
            const startX = 50 + (Math.random() - 0.5) * 40;
            const startY = 50 + (Math.random() - 0.5) * 30;

            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${startX}%`,
                  top: `${startY}%`,
                  // Use a dark, magical color palette
                  background: `hsla(${300 + Math.random() * 60}, 100%, ${60 + Math.random() * 20}%, 0.9)`,
                  boxShadow: `0 0 ${size * 2}px hsla(${300 + Math.random() * 60}, 100%, 70%, 1)`,
                  animationName: 'ember-float',
                  animationDuration: `${animationDurationSeconds - animDelay}s`,
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
                  animationDelay: `${animDelay}s`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NoteBurningEffect;
