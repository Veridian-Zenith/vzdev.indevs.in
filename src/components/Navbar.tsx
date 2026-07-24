//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Languages, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AtmosphereSelector } from './AtmosphereSelector';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { reducedMotion, setReducedMotion } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [logoHoverTime, setLogoHoverTime] = useState(0);
  const [isLogoPulsing, setIsLogoPulsing] = useState(false);
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    let pulseTimeout: ReturnType<typeof setTimeout>;
    let resetTimeout: ReturnType<typeof setTimeout>;

    if (logoHoverTime > 0) {
      pulseTimeout = setTimeout(() => {
        setIsLogoPulsing(true);
      }, 3000);
    } else {
      resetTimeout = setTimeout(() => {
        setIsLogoPulsing(false);
      }, 0);
    }

    return () => {
      clearTimeout(pulseTimeout);
      clearTimeout(resetTimeout);
    };
  }, [logoHoverTime]);


  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[90%] max-w-5xl">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        whileHover={{ scale: 1.01 }}
        className="navbar-custom backdrop-blur-2xl rounded-full px-4 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-[var(--vz-accent-vibrant)]/40 transition-all group"
      >
        <Link
          to="/"
          className="flex items-center gap-2 logo-custom"
          onMouseEnter={() => setLogoHoverTime(100)}
          onMouseLeave={() => setLogoHoverTime(0)}
        >
          <motion.div className="relative overflow-hidden rounded-lg">
            <motion.img
              src="/assets/brand-image.png"
              alt="VZ Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain filter"
              whileHover={{
                scale: 1.2,
                rotate: 360,
                filter: "brightness(1.3) drop-shadow(0 0 20px var(--vz-shadow-color))"
              }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              animate={isLogoPulsing ? {
                scale: [1, 1.3, 1],
                filter: ["brightness(1)", `brightness(2) drop-shadow(0 0 15px var(--vz-shadow-color))`, "brightness(1)"],
              } : {}}
            />
          </motion.div>
          <span className="text-xl font-black bg-gradient-to-r from-[var(--vz-accent-vibrant)] via-[var(--vz-gradient-2)] to-[var(--vz-accent-vibrant)] bg-clip-text text-transparent sm:inline drop-shadow-[0_0_10px_var(--vz-shadow-color)] filter brightness-110 tracking-tight whitespace-nowrap">
            Veridian Zenith
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { name: t('nav.home'), path: '/' },
            { name: t('nav.about'), path: '/about' },
            { name: t('nav.projects'), path: '/projects' },
            { name: t('nav.aur'), path: '/aur' },
            { name: 'Stats', path: '/stats' },
            { name: 'Tracker', path: '/tracker' },
          ].map((item) => (


            <Link
              key={item.path}
              to={item.path}
              className="px-4 py-2 rounded-full text-sm font-bold text-secondary-themeable hover:text-primary-themeable hover:bg-primary-themeable/10 transition-all relative group/link"
            >
              {item.name}
              <motion.div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary-themeable group-hover/link:w-1/2 transition-all" />
            </Link>
          ))}
          <AtmosphereSelector />
           <div className="relative group/lang">
             <button className="p-2 rounded-full hover:bg-primary-themeable/10 transition-colors">
               <Languages size={20} className="text-secondary-themeable group-hover/lang:text-primary-themeable" />
             </button>
             <div className="absolute top-full right-0 pt-3 -mt-1 opacity-0 group-hover/lang:opacity-100 transition-opacity pointer-events-none group-hover/lang:pointer-events-auto">
               <div className="bg-secondary-themeable backdrop-blur-2xl border border-muted-themeable rounded-xl p-2 w-32 shadow-2xl">
                 <button onClick={() => changeLanguage('en')} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-primary-themeable/10 text-secondary-themeable hover:text-primary-themeable transition-colors">English</button>
                 <button onClick={() => changeLanguage('de')} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-primary-themeable/10 text-secondary-themeable hover:text-primary-themeable transition-colors">German</button>
                 <button onClick={() => changeLanguage('ko')} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-primary-themeable/10 text-secondary-themeable hover:text-primary-themeable transition-colors">Korean</button>
                 <button onClick={() => changeLanguage('ru')} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-primary-themeable/10 text-secondary-themeable hover:text-primary-themeable transition-colors">Russian</button>
               </div>
             </div>
           </div>
           <button
             onClick={() => setReducedMotion(!reducedMotion)}
             className={`p-2 rounded-full transition-all ${reducedMotion ? 'bg-primary-themeable text-black' : 'hover:bg-primary-themeable/10 text-secondary-themeable hover:text-primary-themeable'}`}
             title={reducedMotion ? "Enable Animations" : "Reduce Motion"}
           >
             <EyeOff size={20} />
           </button>
           <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { navigate('/contact'); setIsOpen(false); }}
            className="ml-2 bg-[var(--vz-accent-vibrant)]/10 hover:bg-[var(--vz-accent-vibrant)] text-[var(--vz-accent-vibrant)] hover:text-black font-black border border-[var(--vz-accent-vibrant)]/40 px-6 py-2 rounded-full transition-all cursor-pointer flex items-center gap-2 shadow-glow-themeable hover:shadow-glow-themeable"
          >
            {t('hero.summon')} <ChevronRight size={16} />
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-[var(--vz-accent-vibrant)]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </motion.div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-0 right-0 bg-[var(--vz-bg-secondary)]/95 backdrop-blur-2xl border border-[var(--vz-accent-vibrant)]/20 rounded-2xl p-4 flex flex-col gap-3 items-center md:hidden shadow-2xl mx-2 overflow-y-auto max-h-[70vh]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--vz-accent-vibrant)]/10 to-transparent pointer-events-none" />

            {[
              { name: t('nav.home'), path: '/' },
              { name: t('nav.about'), path: '/about' },
              { name: t('nav.projects'), path: '/projects' },
              { name: 'Stats', path: '/stats' },
              { name: 'Tracker', path: '/tracker' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="text-xl font-bold text-secondary-themeable hover:text-primary-themeable transition-colors"
              >
                {item.name}
              </Link>
            ))}

            <div className="w-full h-px bg-[var(--vz-accent-vibrant)]/10" />

            <div className="flex flex-col items-center gap-3 w-full">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--vz-accent-vibrant)]/60">Atmosphere</span>
              <AtmosphereSelector />
            </div>

            <div className="w-full h-px bg-[var(--vz-accent-vibrant)]/10" />

            <button
              onClick={() => { navigate('/contact'); setIsOpen(false); }}
              className="w-full bg-[var(--vz-accent-vibrant)] py-3 rounded-full text-lg font-black text-black shadow-glow-themeable"
            >
              {t('nav.contact')}
            </button>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <button onClick={() => changeLanguage('en')} className="px-3 py-1.5 text-xs rounded-md bg-secondary-themeable/50 hover:bg-primary-themeable/20 text-secondary-themeable hover:text-primary-themeable font-bold transition-colors">EN</button>
              <button onClick={() => changeLanguage('de')} className="px-3 py-1.5 text-xs rounded-md bg-secondary-themeable/50 hover:bg-primary-themeable/20 text-secondary-themeable hover:text-primary-themeable font-bold transition-colors">DE</button>
              <button onClick={() => changeLanguage('ko')} className="px-3 py-1.5 text-xs rounded-md bg-secondary-themeable/50 hover:bg-primary-themeable/20 text-secondary-themeable hover:text-primary-themeable font-bold transition-colors">KO</button>
              <button onClick={() => changeLanguage('ru')} className="px-3 py-1.5 text-xs rounded-md bg-secondary-themeable/50 hover:bg-primary-themeable/20 text-secondary-themeable hover:text-primary-themeable font-bold transition-colors">RU</button>
              <button onClick={() => changeLanguage('nb')} className="px-3 py-1.5 text-xs rounded-md bg-secondary-themeable/50 hover:bg-primary-themeable/20 text-secondary-themeable hover:text-primary-themeable font-bold transition-colors">NO</button>
            </div>
            <p className="text-[10px] text-center text-secondary-themeable/40 mt-2">Best viewed on desktop.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

