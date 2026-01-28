
'use client';

import React from 'react';
import LiquidGradient from '@/components/ui/flow-gradient-hero-section';
import { useRouter } from 'next/navigation';

export default function IntroPage() {
  const router = useRouter();

  const handleEnter = () => {
    localStorage.setItem('ashground_intro_v1_seen', 'true');
    router.push('/');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center text-center p-4">
      <LiquidGradient showPauseButton={false} />
      <div className="absolute inset-0 flex flex-col justify-center items-center z-10 text-white">
        <h1 className="title-main">
          ASHGROUND
        </h1>
        <div className="max-w-2xl mx-auto my-8 text-white/80 text-lg md:text-xl space-y-2">
          <p>Ashground is a minimalist writing space designed for release, not storage.</p>
          <p>Write freely, without accounts, history, or permanence.</p>
          <p>When you’re done, everything burns.</p>
        </div>
        <button onClick={handleEnter} className="cta-btn">
          Enter
        </button>
      </div>
    </div>
  );
}
