import React, { type ReactNode, useState } from 'react';
import { AppContext } from './AppContext';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  };

  return (
    <AppContext.Provider value={{ reducedMotion, setReducedMotion, triggerGlitch, isGlitching, setIsGlitching }}>
      {children}
    </AppContext.Provider>
  );
};
