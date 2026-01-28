'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import LiquidGradient from '@/components/ui/flow-gradient-hero-section';

// Dynamically import the main app component to show after the intro.
const AshgroundApp = dynamic(() => import('@/app/ashground-app'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
      Loading Ashground...
    </div>
  ),
});

export default function Page() {
  const [showIntro, setShowIntro] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Use a unique key for this app's intro to avoid conflicts
    if (localStorage.getItem('ashground_intro_v1_seen')) {
      setShowIntro(false);
    } else {
      setShowIntro(true);
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem('ashground_intro_v1_seen', 'true');
    setShowIntro(false);
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        Loading Ashground...
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center text-center p-4">
        <LiquidGradient showPauseButton={false} />
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 text-white">
          <h1 className="title-main">
            ASHGROUND
          </h1>
          <div className="max-w-2xl mx-auto mb-8 text-white/80 text-lg md:text-xl space-y-2">
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

  return (
    <main>
      <AshgroundApp />
    </main>
  );
}
