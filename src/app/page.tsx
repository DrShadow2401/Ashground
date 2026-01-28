'use client';

import dynamic from 'next/dynamic';
import React from 'react';

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
  return (
    <main>
      <AshgroundApp />
    </main>
  );
}
