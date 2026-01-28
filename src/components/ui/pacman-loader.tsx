import React from 'react';

const PacmanLoader = () => {
  return (
    <div className="loader-wrapper">
      <div className="pacman-loader">
        <div className="pacman">
          <div className="pacman-top" />
          <div className="pacman-bottom" />
        </div>
        <div className="dots">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </div>
      <p className="text-foreground mt-6 text-lg font-body">Loading Ashground...</p>
    </div>
  );
};

export default PacmanLoader;
