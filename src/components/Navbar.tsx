//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Languages, EyeOff } from 'lucide-react';
import { loadTranslations } from '../lib/i18n';
import { useApp } from '../context/AppContext';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'ko', label: 'Korean' },
  { code: 'ru', label: 'Russian' },
  { code: 'nb', label: 'Norwegian' },
] as const;

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { reducedMotion, setReducedMotion } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [logoPulse, setLogoPulse] = useState(false);
  const navigate = useNavigate();

  const links = [
    { key: 'home', path: '/' },
    { key: 'about', path: '/about' },
    { key: 'projects', path: '/projects' },
    { key: 'aur', path: '/aur' },
    { key: 'stats', path: '/stats' },
    { key: 'tracker', path: '/tracker' },
    { key: 'skills', path: '/skills' },
  ];

  const changeLanguage = (lng: string) => {
    void loadTranslations(lng).then(() => i18n.changeLanguage(lng));
  };

  useEffect(() => {
    const id = setInterval(() => {
      setLogoPulse(true);
      setTimeout(() => setLogoPulse(false), 900);
    }, 12000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-amber-400/15">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-3">
          {/* Wordmark */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Veridian Zenith"
          >
            <motion.img
              src="/assets/brand-image.png"
              alt=""
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              animate={logoPulse ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.9 }}
            />
            <span className="text-sm sm:text-base font-black tracking-tight bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 bg-clip-text text-transparent whitespace-nowrap">
              Veridian Zenith
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5 ml-auto">
            {links.map((l) => (
              <NavLink
                key={l.path}
                to={l.path}
                end={l.path === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-200 border border-amber-400/30'
                      : 'text-amber-100/40 hover:text-amber-300 border border-transparent'
                  }`
                }
              >
                {t(`nav.${l.key}`)}
              </NavLink>
            ))}
          </div>

          {/* Utilities */}
          <div className="hidden lg:flex items-center gap-1 ml-auto lg:ml-2">
            <div className="relative group/lang">
              <button
                className="p-2 rounded-full text-amber-100/45 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                aria-label="Language"
              >
                <Languages size={16} />
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 group-hover/lang:opacity-100 transition-opacity pointer-events-none group-hover/lang:pointer-events-auto">
                <div className="bg-black/95 backdrop-blur-xl border border-amber-400/25 rounded-2xl p-1.5 w-36 shadow-2xl">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                        i18n.language === l.code
                          ? 'bg-amber-500/10 text-amber-200'
                          : 'text-amber-100/50 hover:bg-amber-500/10 hover:text-amber-300'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`p-2 rounded-full transition-colors ${
                reducedMotion
                  ? 'bg-amber-400 text-black'
                  : 'text-amber-100/45 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
              title={reducedMotion ? 'Enable Animations' : 'Reduce Motion'}
              aria-label="Toggle reduced motion"
            >
              <EyeOff size={16} />
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="ml-1 px-5 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-300 font-bold text-xs border border-amber-400/40 transition-all"
            >
              {t('hero.summon')}
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden ml-auto p-1.5 text-amber-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-t border-amber-400/15 bg-black/95"
          >
            <div className="px-4 sm:px-6 py-4 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
              {links.map((l) => (
                <NavLink
                  key={l.path}
                  to={l.path}
                  end={l.path === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-200 border border-amber-400/30'
                        : 'text-amber-100/50 border border-transparent'
                    }`
                  }
                >
                  {t(`nav.${l.key}`)}
                </NavLink>
              ))}

              <div className="h-px bg-amber-400/15 my-3" />

              <button
                onClick={() => { navigate('/contact'); setIsOpen(false); }}
                className="px-4 py-3 rounded-xl text-sm font-bold bg-amber-500/10 border border-amber-400/30 text-amber-300"
              >
                {t('nav.contact')}
              </button>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className={`px-3 py-1.5 text-[10px] rounded-lg font-mono uppercase tracking-wider transition-colors border ${
                      i18n.language === l.code
                        ? 'bg-amber-500/10 text-amber-200 border-amber-400/30'
                        : 'text-amber-100/40 border-amber-400/15 hover:text-amber-300'
                    }`}
                  >
                    {l.code}
                  </button>
                ))}
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className="ml-auto px-3 py-1.5 text-[10px] rounded-lg font-mono uppercase tracking-wider border border-amber-400/15 text-amber-100/40 hover:text-amber-300 transition-colors"
                >
                  {reducedMotion ? 'motion on' : 'reduce motion'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
