
'use client';

import dynamic from 'next/dynamic';
import React, { useRef } from 'react';
import LiquidGradient from '@/components/ui/flow-gradient-hero-section';

function AppLoadingFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
      Loading Ashground...
    </div>
  );
}

const AshgroundApp = dynamic(() => import('@/app/ashground-app'), {
  ssr: false,
  loading: AppLoadingFallback,
});

export default function Page() {
  const appContainerRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    appContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main>
      <LiquidGradient 
        title="ASHGROUND"
        ctaText="Enter"
        onCtaClick={handleEnter}
        showPauseButton={false}
      />
      <div ref={appContainerRef} className="main-app-container">
        <AshgroundApp />
      </div>
    </main>
  );
}
