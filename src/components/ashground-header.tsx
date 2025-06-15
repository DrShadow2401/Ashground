
import React from 'react';

const AshgroundHeader: React.FC = () => {
  return (
    <header className="text-center mt-6 md:mt-8 mb-3 md:mb-4">
      <h1 className="font-headline text-5xl md:text-7xl font-bold text-foreground">
        ASHGROUND
      </h1>
      <p className="font-body italic text-base md:text-lg text-foreground/70 mt-2">
        <a
          href="https://astoeterna.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline focus:underline focus:outline-none"
        >
          By Asto Eterna
        </a>
      </p>
    </header>
  );
};

export default AshgroundHeader;
