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
    // The mask makes the paper disappear. It's a gradient from transparent to black.
    // Animating its position reveals the background.
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
    maskSize: '100% 200%', // Twice the height to allow smooth animation
    maskPosition: '50% -10%', // Starts with mask fully revealing the paper
  };

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-40px', // Start the glow just above the note
    left: '-10%', // Extend glow past the edges for a softer look
    width: '120%',
    height: '80px', // The height of the glowing bar
    // This gradient is designed to match the soft, peachy-orange glow from your image
    background: 'linear-gradient(to bottom, rgba(234, 207, 170, 0), #FBE6D5, rgba(234, 207, 170, 0))',
    filter: 'blur(25px)', // A strong blur creates the soft, hazy effect
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
