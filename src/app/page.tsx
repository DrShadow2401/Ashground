
'use client';

import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import PacmanLoader from '@/components/ui/pacman-loader';
import UnsentExperience from "@/components/unsent-experience";

const AshgroundApp = dynamic(() => import('@/app/ashground-app'), {
  ssr: false,
  loading: () => (
      <div className="flex justify-center items-center h-full w-full">
        <PacmanLoader />
      </div>
  ),
});


export default function Page() {
  const [activeToolPanel, setActiveToolPanel] = useState('home');

  const isUnsentView = activeToolPanel === 'unsent';

  const handleCloseUnsent = () => {
    setActiveToolPanel('home');
  };

  return (
    <>
      <main className="flex flex-col w-full bg-background">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="font-body text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
                ASHGROUND
              </h1>
              <div className="max-w-xl mx-auto my-6 text-foreground/70 text-base md:text-lg space-y-1">
                <p>A private space to write what you feel.</p>
                <p>There are no accounts and no history.</p>
                <p>What you write is gone when you close the page.</p>
              </div>
              <div className="text-center text-muted-foreground text-base mt-8 animate-pulse">
                Scroll down to begin
              </div>
            </>
          }
        >
          <AshgroundApp 
            activeToolPanel={activeToolPanel}
            setActiveToolPanel={setActiveToolPanel}
          />
        </ContainerScroll>
      </main>
      {isUnsentView && <UnsentExperience onClose={handleCloseUnsent} />}
    </>
  );
}
