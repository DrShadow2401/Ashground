'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import PacmanLoader from '@/components/ui/pacman-loader';

// Dynamically import the main app component to show after the intro.
const AshgroundApp = dynamic(() => import('@/app/ashground-app'), {
  ssr: false,
  loading: () => <PacmanLoader />,
});

export default function Page() {
  return (
    <main>
      <AshgroundApp />
    </main>
  );
}
