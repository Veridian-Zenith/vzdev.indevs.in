//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { InteractiveButton } from './Common';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks';
import { useState } from 'react';


export const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [particles] = useState(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100 + '%',
    y: Math.random() * 100 + '%',
    opacity: Math.random() * 0.5 + 0.2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 10
  })));


  return (
    <section className="relative h-dvh flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Particles */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-2 h-2 bg-primary-themeable rounded-full"
              initial={{
                x: p.x,
                y: p.y,
                opacity: p.opacity
              }}
              animate={{
                y: [null, '-20%', '100%'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "linear",
                delay: p.delay
              }}
            />
          ))}
        </div>
      )}


      <div className="relative z-10 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-5xl sm:text-8xl font-black mb-4 sm:mb-6 gradient-themeable filter brightness-110 tracking-tighter leading-tight sm:leading-none"
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-base sm:text-2xl text-secondary-themeable mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed drop-shadow-lg px-4"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-secondary-themeable/60 italic mb-8 sm:mb-10 text-xs sm:text-base px-6"
        >
          {t('hero.void')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-8"
        >
          <InteractiveButton onClick={() => navigate('/projects')}>
            {t('hero.explore')}
          </InteractiveButton>
          <InteractiveButton variant="red" onClick={() => navigate('/contact')}>
            <span>{t('hero.summon')}</span> <span className="text-primary-themeable font-extrabold ml-1 group-hover:drop-shadow-[0_0_8px_var(--vz-glow-color)] transition-all">{t('hero.architect')}</span>
          </InteractiveButton>
        </motion.div>

        {!isMobile && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-secondary-themeable/40 text-[10px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-10 sm:mt-12 font-bold hover:text-primary-themeable/60 transition-colors cursor-help px-4"
            title="Unlock the Zenith Terminal to explore commands and easter eggs"
          >
            💻 Press ` or Ctrl+Alt+T to invoke the terminal
          </motion.p>
        )}
      </div>
    </section>
  );
};

