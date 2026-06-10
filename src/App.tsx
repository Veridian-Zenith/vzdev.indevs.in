//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ContactPage } from './pages/ContactPage';
import { AurPage } from './pages/AurPage';
import { BrandDisplayPage } from './pages/BrandDisplayPage';

import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils/cn';

import { BackgroundEffect } from './components/BackgroundEffect';
import { TerminalEmulator } from './components/TerminalEmulator';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MotionConfig } from 'framer-motion';
import { useIsMobile } from './hooks/useIsMobile';
import { useAtmosphere } from './hooks/useAtmosphere';

function AppContent() {
  const { reducedMotion, triggerGlitch, isGlitching } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Initialize atmosphere on app load
  useAtmosphere();

  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.altKey && e.key === 't') || e.key === '`') {
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
      <div className={cn(
        "min-h-screen bg-[var(--vz-bg-primary)] text-secondary-themeable selection:bg-[var(--vz-accent-vibrant)]/30 font-rosemary transition-all duration-75 relative overflow-x-hidden",
        isGlitching && "will-change-transform animate-glitch-intense"
      )}>
        {isLoading && (
          <ErrorBoundary>
            <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
          </ErrorBoundary>
        )}

        {/* BackgroundEffect is placed here, z-index will be managed inside it */}
        <BackgroundEffect />

        {!isLoading && (
        <div className="relative z-10">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/aur" element={<AurPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/brand" element={<BrandDisplayPage />} />
          </Routes>

          <TerminalEmulator isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />


          <footer className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] sm:w-auto max-w-3xl px-4 sm:px-6 py-2 sm:py-2 bg-[var(--vz-bg-secondary)]/80 sm:bg-[var(--vz-bg-secondary)]/60 backdrop-blur-md border border-muted-themeable rounded-xl sm:rounded-full text-[9px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.2em] text-secondary-themeable/50 shadow-xl flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-3 gap-y-2">

            <button
              onClick={triggerGlitch}
              className="text-[var(--vz-accent-vibrant)] font-bold hover:scale-110 transition-transform cursor-pointer relative overflow-hidden px-1 group whitespace-nowrap"
            >
              <span className="relative z-10">© {new Date().getFullYear()} Veridian Zenith</span>
              <AnimatePresence>
                {isGlitching && (
                  <motion.div
                    key="glitch-overlay"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[var(--vz-accent-vibrant)]/40 blur-md mix-blend-screen pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <motion.div
                className="absolute inset-0 bg-[var(--vz-accent-vibrant)]/0 group-hover:bg-[var(--vz-accent-vibrant)]/10 transition-colors duration-300"
              />
            </button>
            <span className="w-[1px] h-3 bg-muted-themeable hidden sm:block"></span>
            <a href="https://opensource.org/licenses/OSL-3.0" target="_blank" rel="noopener noreferrer" className="text-[var(--vz-accent-vibrant)]/80 hover:text-[var(--vz-accent-vibrant)] transition-colors font-bold whitespace-nowrap px-1">
              OSL-3.0
            </a>
            <span className="w-[1px] h-3 bg-muted-themeable hidden sm:block shrink-0"></span>
            <a href="https://stuff.mit.edu/doc/counter-howto.html" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
              <div className="relative mix-blend-screen overflow-hidden rounded opacity-70">
                <img src="https://stuff.mit.edu/cgi/counter/veridiandotzenithdotqzzdotio" alt="counter" className="h-4 sm:h-6 invert relative z-10 block" style={{ imageRendering: 'pixelated', filter: 'invert(1) contrast(200%) grayscale(100%)' }} loading="lazy" decoding="async" />
              </div>
            </a>
            <span className="w-[1px] h-3 bg-muted-themeable hidden sm:block shrink-0"></span>
            <button
              onClick={() => navigate('/brand')}
              className="flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 bg-[var(--vz-accent-vibrant)]/10 hover:bg-[var(--vz-accent-vibrant)]/20 border border-[var(--vz-accent-vibrant)]/20 rounded-lg transition-all group/sigil cursor-pointer"
              title="View Brand Assets"
            >
              <img src="/assets/brand-image.png" alt="Sigil" className="w-3 h-3 sm:w-4 sm:h-4 object-contain filter drop-shadow-[0_0_5px_var(--vz-glow-color)] group-hover/sigil:scale-110 transition-transform" />
              <span className="text-[var(--vz-accent-vibrant)] font-bold group-hover/sigil:text-[var(--vz-accent-vibrant)]/80 transition-colors">SIGIL</span>
            </button>
          </footer>
        </div>
      )}
      </div>
    </MotionConfig>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;

