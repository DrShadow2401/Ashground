
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
  const numEmbers = 150;
  const numSmoke = 60;

  const effectContainerStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${targetRect.left}px`,
    top: `${targetRect.top}px`,
    width: `${targetRect.width}px`,
    height: `${targetRect.height}px`,
    zIndex: 1000,
    pointerEvents: 'none',
  };

  return (
    <>
      {/* Full-screen initial flash */}
      <div
        className="fixed inset-0 z-[1001] bg-white"
        style={{
          animation: `blast-flash ${animationDurationSeconds * 0.5}s ease-out forwards`,
          pointerEvents: 'none',
        }}
      />
      <div style={effectContainerStyle}>
        <div className="w-full h-full relative overflow-visible filter saturate-150">
          {/* The note image that will be masked */}
          <div
            className="w-full h-full absolute top-0 left-0"
            style={{
              backgroundImage: `url(${imageUri})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: `blast-hole-mask ${animationDurationSeconds}s cubic-bezier(0.6, 0, 0.8, 1) forwards`,
            }}
          />

          {/* The glowing blast shockwave ring */}
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              animation: `blast-shockwave ${animationDurationSeconds * 0.8}s ease-out forwards`,
            }}
          />
          
          {/* Smoke particles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {Array.from({ length: numSmoke }).map((_, i) => {
              const size = Math.random() * 40 + 20;
              const animDelay = (Math.random() * animationDurationSeconds) * 0.1;
              const startX = 50 + (Math.random() - 0.5) * 20;
              const startY = 50 + (Math.random() - 0.5) * 20;

              return (
                <div
                  key={`smoke-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${startX}%`,
                    top: `${startY}%`,
                    background: `hsla(0, 0%, ${Math.random() * 15}%, ${Math.random() * 0.4 + 0.2})`,
                    animationName: 'blast-smoke-puff',
                    animationDuration: `${animationDurationSeconds * 1.2}s`,
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                    animationDelay: `${animDelay}s`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>

          {/* Ember particles (shrapnel) */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
            {Array.from({ length: numEmbers }).map((_, i) => {
              const size = Math.random() * 6 + 2;
              const animDelay = (Math.random() * animationDurationSeconds) * 0.2;
              const angle = Math.random() * 360;
              const radius = Math.random() * 20; // Start inside the initial blast
              const travelDistance = 150 + Math.random() * 200; // How far they fly

              const startX = 50 + radius * Math.cos((angle * Math.PI) / 180);
              const startY = 50 + radius * Math.sin((angle * Math.PI) / 180);
              

              return (
                <div
                  key={`ember-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${startX}%`,
                    top: `${startY}%`,
                    background: `hsla(${15 + Math.random() * 30}, 100%, ${60 + Math.random() * 20}%, 1)`,
                    boxShadow: `0 0 ${size * 2}px hsla(${20 + Math.random() * 20}, 100%, 70%, 1), 0 0 2px 1px #fff`,
                    animationName: 'blast-ember-float',
                    animationDuration: `${animationDurationSeconds * 0.8 + 0.5}s`,
                    animationTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
                    animationFillMode: 'forwards',
                    animationDelay: `${animDelay}s`,
                    '--angle': `${angle}deg`,
                    '--travel-distance': `${travelDistance}px`,
                    '--rotation': `${Math.random() * 720 - 360}deg`
                  } as React.CSSProperties
                }
              />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteBurningEffect;
