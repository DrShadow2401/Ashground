
import React from 'react';

const AshgroundHeader: React.FC = () => {
  return (
    <header className="text-center mt-8 md:mt-10 mb-6 md:mb-8">
      <h1 className="font-headline text-5xl md:text-7xl font-bold text-foreground">
        ASHGROUND
      </h1>
      <p className="font-body italic text-base md:text-lg text-foreground/70 mt-2">
        By Asto Eterna
      </p>
    </header>
  );
};

export default AshgroundHeader;
