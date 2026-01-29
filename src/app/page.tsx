'use client';

import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import dynamic from 'next/dynamic';
import React from 'react';
import PacmanLoader from '@/components/ui/pacman-loader';

const AshgroundApp = dynamic(() => import('@/app/ashground-app'), {
  ssr: false,
  loading: () => (
      <div className="flex justify-center items-center h-full w-full">
        <PacmanLoader />
      </div>
  ),
});


export default function Page() {
  return (
    <main className="flex flex-col w-full bg-background">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="font-body text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
              ASHGROUND
            </h1>
            <div className="max-w-xl mx-auto my-6 text-foreground/70 text-sm md:text-base space-y-1">
              <p>A private space to write what you feel.</p>
              <p>There are no accounts and no history.</p>
              <p>What you write is gone when you close the page.</p>
            </div>
            <div className="text-center text-muted-foreground text-sm mt-8 animate-pulse">
              Scroll down to begin
            </div>
          </>
        }
      >
        <AshgroundApp />
      </ContainerScroll>
    </main>
  );
}
