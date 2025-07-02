'use client';

import React from 'react';

interface NoteBurningEffectProps {
  isActive: boolean;
  targetRect: DOMRect | null;
  duration: number;
  noteImageUri: string;
}

const EMBER_COUNT = 15;

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
    willChange: 'mask-size',
    animationName: 'burn-hole-mask',
    animationDuration: `${animationDurationSeconds}s`,
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
    maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
    maskSize: '0%',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
  };

  const fireRingStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '1px',
    height: '1px',
    willChange: 'transform',
    animationName: 'burn-hole-ring',
    animationDuration: `${animationDurationSeconds}s`,
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
  };

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    boxShadow: '0 0 15px 5px #fef08a, 0 0 25px 10px #fde047, inset 0 0 10px 3px #facc15',
  };


  return (
    <div style={effectContainerStyle}>
      <div style={paperStyle} />
      <div style={fireRingStyle}>
        <div style={glowStyle} />
        {Array.from({ length: EMBER_COUNT }).map((_, i) => {
           const angle = (i / EMBER_COUNT) * 360;
           const emberSize = Math.random() * 6 + 4;
           const animationDelay = (Math.random() * duration) / 1000;
           
           const emberStyle: React.CSSProperties = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${emberSize}px`,
            height: `${emberSize}px`,
            backgroundColor: '#fef08a',
            borderRadius: '50%',
            boxShadow: '0 0 10px 2px #fef08a',
            transform: `rotate(${angle}deg) translateY(0px)`, // Start at center
            willChange: 'transform, opacity',
            animationName: 'ember-float',
            animationDuration: `${Math.random() * 1.5 + 1}s`,
            animationDelay: `${animationDelay}s`,
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            opacity: 0,
           };

           return <div key={i} style={emberStyle} />;
        })}
      </div>
    </div>
  );
};

export default NoteBurningEffect;
