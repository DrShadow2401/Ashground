'use client';

import React from 'react';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  noteImageUri: string;
}

const NoteBurningEffect: React.FC<NoteBurningEffectProps> = ({
  isActive,
  targetRect,
  duration,
  noteImageUri,
}) => {
  if (!isActive || !targetRect || !noteImageUri) {
    return null;
  }

  const animationDurationSeconds = duration / 1000;

  const effectContainerStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${targetRect.left}px`,
    top: `${targetRect.top}px`,
    width: `${targetRect.width}px`,
    height: `${targetRect.height}px`,
    overflow: 'hidden',
    zIndex: 1000,
    pointerEvents: 'none',
    borderRadius: 'var(--radius)',
  };

  const paperStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${noteImageUri})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    willChange: 'mask-position',
    animationName: 'burn-from-top',
    animationDuration: `${animationDurationSeconds}s`,
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%)',
    maskSize: '100% 200%',
    maskPosition: '50% 0%',
  };

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-30px', 
    left: 0,
    width: '100%',
    height: '60px',
    background: 'linear-gradient(to bottom, rgba(255, 150, 50, 0), rgba(255, 180, 50, 0.8), rgba(255, 80, 0, 0.7), rgba(255, 200, 80, 0.8), rgba(255, 150, 50, 0))',
    filter: 'blur(20px)',
    willChange: 'transform',
    animationName: 'glow-travel-down',
    animationDuration: `${animationDurationSeconds}s`,
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
  };


  return (
    <div style={effectContainerStyle}>
      <div style={paperStyle} />
      <div style={glowStyle} />
    </div>
  );
};

export default NoteBurningEffect;
