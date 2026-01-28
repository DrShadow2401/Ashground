'use client';

import dynamic from 'next/dynamic';
import React from 'react';

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
  return (
    <main>
      <AshgroundApp />
    </main>
  );
}
