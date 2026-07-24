//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { AnimatedCard } from '../components';
import { Package, Terminal, Shield, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks';
import { Link } from 'react-router-dom';

export const AurPage = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-secondary-themeable/20 backdrop-blur-xl border border-muted-themeable p-10 rounded-3xl max-w-sm"
        >
          <AlertTriangle className="mx-auto text-amber-500 mb-6" size={48} />
          <h2 className="text-2xl font-bold mb-4 text-primary-themeable">Desktop Feature</h2>
          <p className="text-secondary-themeable mb-8 leading-relaxed">
            The AUR (Arch User Repository) management page is optimized for desktop view.
          </p>
          <Link
            to="/"
            className="inline-block bg-[var(--vz-accent-vibrant)] text-black font-black px-8 py-3 rounded-full shadow-glow-themeable"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const packages = [
    {
      id: 'meshiji',
      icon: <Package className="text-amber-500" size={32} />,
      title: 'meshiji',
      description: t('projects.meshiji.description'),
      url: 'https://aur.archlinux.org/packages/meshiji',
      deprecated: true
    },
    {
      id: 'voix',
      icon: <Download className="text-red-500" size={32} />,
      title: 'voix',
      description: t('projects.voix.description'),
      url: 'https://aur.archlinux.org/packages/voix'
    },
    {
      id: 'peguni_draem-la',
      icon: <Shield className="text-gold-500" size={32} />,
      title: 'peguni_draem-la',
      description: t('projects.peguni.description'),
      url: 'https://aur.archlinux.org/packages/peguni_draem-la'
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 sm:px-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-5xl sm:text-7xl font-black mb-6 gradient-themeable filter brightness-110 tracking-tight">
          {t('aur.title')}
        </h1>
        <p className="text-xl text-secondary-themeable max-w-2xl mx-auto leading-relaxed">
          {t('aur.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {packages.map((pkg, i) => (
          <AnimatedCard key={pkg.id} delay={i * 0.1}>
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="p-3 bg-primary-themeable/10 rounded-2xl w-fit border border-muted-themeable text-primary-themeable">
                  {pkg.icon}
                </div>
              </div>
               <h3 className="text-2xl font-bold mb-4 text-primary-themeable group-hover:brightness-125 transition-all flex items-center gap-2">
                 {pkg.title}
                 {pkg.deprecated && (
                   <span className="text-[10px] uppercase tracking-widest text-amber-500 font-black opacity-80">
                     {t('projects.deprecated')}
                   </span>
                 )}
               </h3>
              <p className="text-secondary-themeable mb-6 leading-relaxed text-sm flex-grow">
                {pkg.description}
              </p>

              <a
                href={pkg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary-themeable font-bold hover:brightness-125 transition-all group/link mt-auto"
              >
                {t('projects.inspect')} <ExternalLink size={16} className="group-hover/link:translate-x-1 transition-transform" />
              </a>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-secondary-themeable/40 backdrop-blur-xl border border-muted-themeable rounded-3xl p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8">
            <Terminal className="text-primary-themeable" size={24} />
            <h2 className="text-2xl font-bold text-primary-themeable uppercase tracking-widest">
              {t('aur.install.title')}
            </h2>
          </div>

          {/* Installing paru section */}
          <div className="mb-10 bg-secondary-themeable rounded-2xl p-6 border border-muted-themeable">
            <h3 className="text-sm font-bold text-primary-themeable uppercase tracking-[0.2em] mb-4">First: Install paru (AUR Helper)</h3>
            <div className="bg-primary-themeable/5 rounded-xl p-5 font-mono text-xs sm:text-sm text-secondary-themeable space-y-2 border border-muted-themeable/20">
              <div className="flex gap-3"><span className="text-primary-themeable select-none">$</span><span>sudo pacman -S --needed base-devel</span></div>
              <div className="flex gap-3"><span className="text-primary-themeable select-none">$</span><span>git clone https://aur.archlinux.org/paru.git</span></div>
              <div className="flex gap-3"><span className="text-primary-themeable select-none">$</span><span>cd paru</span></div>
              <div className="flex gap-3"><span className="text-primary-themeable select-none">$</span><span>makepkg -si</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-secondary-themeable/60 rounded-2xl p-6 font-mono text-sm border border-muted-themeable relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-themeable/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-secondary-themeable/40 mb-2"># Install with paru (Recommended)</div>
                <div className="flex items-center gap-3">
                  <span className="text-primary-themeable select-none">$</span>
                  <span className="text-secondary-themeable">paru -S voix</span>
                </div>
              </div>
            </div>
            <div className="bg-secondary-themeable/60 rounded-2xl p-6 font-mono text-sm border border-muted-themeable relative group overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-themeable/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-secondary-themeable/40 mb-2"># Alternative: Install with yay</div>
                <div className="flex items-center gap-3">
                  <span className="text-primary-themeable select-none">$</span>
                  <span className="text-secondary-themeable">yay -S voix</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-secondary-themeable/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t('aur.maintainer')}: Dae Euhwa
            </div>
            <div className="hidden sm:block">
              Architecture: x86_64
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
