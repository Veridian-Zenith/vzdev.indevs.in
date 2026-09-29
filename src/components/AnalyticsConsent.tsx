//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { analyticsEnabled, readConsent, setConsent } from '../lib/analytics';

export const AnalyticsConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled) return;
    // Give the page a moment to settle before asking.
    const id = setTimeout(() => setVisible(readConsent() === 'unknown'), 1200);
    return () => clearTimeout(id);
  }, []);

  const decide = (choice: 'granted' | 'denied') => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Analytics consent"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[92vw] max-w-md"
        >
          <div className="relative bg-black/95 backdrop-blur-xl border border-amber-400/25 rounded-2xl p-5 shadow-[0_0_40px_rgba(255,179,71,0.08)]">
            <span className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

            <p className="text-amber-100/55 text-xs sm:text-sm leading-relaxed">
              Anonymous usage analytics help improve the forge. No personal data, no advertising.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => decide('granted')}
                className="flex-1 px-5 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 font-bold text-xs uppercase tracking-widest transition-all"
              >
                Allow
              </button>
              <button
                onClick={() => decide('denied')}
                className="flex-1 px-5 py-2.5 rounded-full border border-amber-400/20 text-amber-100/45 hover:text-amber-300 font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
