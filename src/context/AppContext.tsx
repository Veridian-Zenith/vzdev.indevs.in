import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface AppContextType {
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  triggerGlitch: () => void;
  isGlitching: boolean;
  setIsGlitching: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
