'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import IntroPage from '@/components/intro-page';

// Define the loading component separately
function AppLoadingFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
      Loading Ashground...
    </div>
  );
}

const AshgroundApp = dynamic(() => import('@/app/ashground-app'), {
  ssr: false,
  loading: AppLoadingFallback, // Use the defined component
});

export default function Page() {
  const [showApp, setShowApp] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasVisited = localStorage.getItem('ashground_has_visited');
    if (hasVisited) {
      setShowApp(true);
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem('ashground_has_visited', 'true');
    setShowApp(true);
  };
  
  // To prevent hydration mismatch, we wait until the component is mounted on the client
  // before we render anything that depends on localStorage
  if (!isMounted) {
     return <AppLoadingFallback />;
  }

  if (!showApp) {
    return <IntroPage onEnter={handleEnter} />;
  }

  return <AshgroundApp />;
}
