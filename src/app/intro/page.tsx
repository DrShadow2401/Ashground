'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LiquidGradient from '@/components/ui/flow-gradient-hero-section';

export default function IntroPage() {
  const router = useRouter();

  const handleEnter = () => {
    localStorage.setItem('ashground_intro_v1_seen', 'true');
    router.push('/');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center text-center p-4">
      <LiquidGradient showPauseButton={false} />
      <div className="absolute inset-0 flex flex-col justify-center items-center z-10 text-foreground">
        <h1 className="font-body text-5xl md:text-7xl font-bold tracking-tighter">
          ASHGROUND
        </h1>
        <div className="max-w-2xl mx-auto my-8 text-foreground/80 text-base md:text-lg space-y-2">
          <p>A private space to write what you feel.</p>
          <p>There are no accounts and no history.</p>
          <p>What you write is gone when you close the page.</p>
        </div>
        <button onClick={handleEnter} className="cta-btn text-foreground border-foreground/20 hover:bg-foreground/20 bg-foreground/10">
          Enter
        </button>
      </div>
    </div>
  );
}
