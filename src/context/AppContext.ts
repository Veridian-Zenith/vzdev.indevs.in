import { createContext, useContext } from 'react';

export interface AppContextType {
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  triggerGlitch: () => void;
  isGlitching: boolean;
  setIsGlitching: (value: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
