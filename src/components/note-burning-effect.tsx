'use client';

import React from 'react';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number; // Total duration of the glow effect
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({
  isActive,
  targetRect,
  duration,
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  };

  const softGlowStyle: React.CSSProperties = {
    width: '200px', // Increased size for a softer, wider glow
    height: '200px',
    background: 'radial-gradient(circle, hsl(55, 100%, 80%) 10%, transparent 70%)',
    filter: 'blur(40px)', // Increased blur for more softness
    opacity: 0,
    willChange: 'opacity, transform',
    animationName: 'soft-glow-pulse',
    animationDuration: `${animationDurationSeconds}s`,
    animationTimingFunction: 'ease-in-out',
    animationFillMode: 'forwards',
  };


  return (
    <div style={effectContainerStyle}>
      <div style={softGlowStyle} />
    </div>
  );
};

export default NoteBurningEffect;
