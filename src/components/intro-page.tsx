'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CelestialSphere } from '@/components/ui/celestial-sphere';

interface IntroPageProps {
  onEnter: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onEnter }) => {
  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-950 text-white">
      <CelestialSphere
        hue={250}
        speed={0.2}
        zoom={1.1}
        particleSize={3.0}
        className="absolute top-0 left-0 w-full h-full opacity-70"
      />
      <div className="relative z-10 text-center p-4">
        <h1 className="font-headline text-7xl md:text-9xl font-bold">
          ASHGROUND
        </h1>
        <p className="font-body italic text-lg md:text-xl text-white/70 mt-4 max-w-2xl mx-auto">
          A note-taking application with a focus on elegance and simplicity.
          <br />
          When you're done, just burn it.
        </p>
        <Button 
          onClick={onEnter} 
          className="mt-10 bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
          size="lg"
          variant="outline"
        >
          Enter
        </Button>
      </div>
       <footer className="absolute bottom-6 text-center text-white/50 text-sm font-body z-10">
          <a
            href="https://questonin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/80 transition-colors"
          >
            By Questonin
          </a>
      </footer>
    </main>
  );
};

export default IntroPage;
