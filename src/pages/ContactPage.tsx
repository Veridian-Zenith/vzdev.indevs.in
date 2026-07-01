//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, ExternalLink, Send, Terminal, AtSign } from 'lucide-react';
import { AnimatedCard } from '../components';

import { useTranslation } from 'react-i18next';

export const ContactPage = () => {
  const { t } = useTranslation();
  const contactInfo = [
    {
      icon: User,
      label: t('contact.architect.label'),
      value: "Dae Euhwa",
      sub: t('contact.architect.sub'),
      color: "amber"
    },
    {
      icon: Mail,
      label: t('contact.email.label'),
      value: "daedaevibin@ik.me",
      href: "mailto:daedaevibin@ik.me",
      color: "red"
    },
    {
      icon: Terminal,
      label: t('contact.forge.label'),
      value: "Veridian-Zenith",
      href: "https://github.com/Veridian-Zenith",
      color: "gold"
    },
    {
      icon: ExternalLink,
      label: "Instagram",
      value: "@daedaevibin",
      href: "https://www.instagram.com/daedaevibin?igsh=aTg3cjFmbzdiY2s0",
      color: "purple"
    },
    {
      icon: MessageSquare,
      label: "Matrix",
      value: "@daedaevibin:matrix.org",
      href: "https://matrix.to/@daedaevibin:matrix.org#/@daedaevibin:matrix.org",
      color: "blue"
    },
    {
      icon: AtSign,
      label: "Mastodon",
      value: "@daedaevibin@defcon.social",
      href: "https://defcon.social/@daedaevibin",
      color: "orange"
    },
    {
      icon: Mail,
      label: "WhatsApp",
      value: "+1 (208) 464-4061",
      href: "https://wa.me/12084644061",
      color: "green"
    }
  ];

  return (
    <div className="pt-32 pb-24 px-8 max-w-5xl mx-auto min-h-screen relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl sm:text-7xl font-bold text-primary-themeable mb-6 drop-shadow-[0_0_20px_var(--vz-glow-color)]">
          {t('contact.title')}
        </h1>
        <p className="text-secondary-themeable max-w-xl mx-auto text-lg italic leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </motion.div>

      {/* Main Action Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative group mb-16"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-themeable via-themeable to-primary-themeable rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-secondary-themeable border border-muted-themeable p-10 sm:p-16 rounded-3xl flex flex-col items-center text-center shadow-2xl backdrop-blur-xl">
          <div className="p-6 bg-primary-themeable/10 rounded-full mb-8 text-primary-themeable border border-primary-themeable/30 shadow-[0_0_40px_var(--vz-glow-color)]">
            <Send size={56} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-primary-themeable">{t('contact.invocation.title')}</h2>
          <p className="text-secondary-themeable mb-10 max-w-md text-lg italic">
            {t('contact.invocation.description')}
          </p>
           <a
             href="mailto:daedaevibin@ik.me"
             className="inline-block w-full sm:w-auto px-12 py-5 text-xl text-center bg-primary-themeable/80 hover:bg-primary-themeable shadow-primary-themeable relative overflow-hidden rounded-2xl font-bold text-white transition-all duration-300 cursor-pointer group border border-muted-themeable hover:border-primary-themeable"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-themeable/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
             <span className="relative z-10">
               <span>{t('hero.summon')}</span> <span className="text-primary-themeable font-black ml-1 group-hover:drop-shadow-[0_0_12px_var(--vz-glow-color)] transition-all">{t('contact.architect.label')}</span>
             </span>
           </a>
        </div>
      </motion.div>

       {/* Grid of Info */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
         {contactInfo.map((info, index) => (
          <AnimatedCard
            key={index}
            delay={0.3 + index * 0.1}
            className="flex flex-col items-center text-center p-10 group"
          >
            <div className="p-4 bg-primary-themeable/10 border border-muted-themeable rounded-2xl mb-6 text-primary-themeable group-hover:scale-110 transition-all duration-500 group-hover:shadow-glow-themeable">
              <info.icon size={36} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary-themeable/60 mb-3 font-bold">{info.label}</span>
            <h3 className="text-xl font-bold text-primary-themeable mb-2">{info.value}</h3>
            {info.sub && <p className="text-sm text-secondary-themeable font-medium">{info.sub}</p>}

            {info.href && (
              <a
                href={info.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 text-xs font-bold text-primary-themeable/70 hover:text-primary-themeable transition-all uppercase tracking-widest flex items-center gap-2 group/link"
              >
                {t('contact.connect')} <ExternalLink size={12} className="group-hover/link:translate-x-1 transition-transform" />
              </a>
            )}
          </AnimatedCard>
        ))}
      </div>

      {/* Community / Discord Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative group overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-primary-themeable/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-secondary-themeable backdrop-blur-md border border-muted-themeable p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-4 mb-4">
              <MessageSquare size={40} className="text-[#5865F2] group-hover:scale-110 transition-transform" />
              <h2 className="text-3xl font-bold text-primary-themeable">{t('contact.community.title')}</h2>
            </div>
            <p className="text-secondary-themeable max-w-md text-lg">
              {t('contact.community.description')}
            </p>
          </div>
          <a
            href="https://discord.gg/Vprc6XRkRg"
            target="_blank"
            rel="noopener noreferrer"
            className="group/discord w-full md:w-auto px-10 py-5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black rounded-2xl transition-all flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(88,101,242,0.3)] hover:shadow-[0_0_50px_rgba(88,101,242,0.6)] hover:scale-105 active:scale-95"
          >
            {t('contact.community.join')}
            <ExternalLink size={20} className="group-hover/discord:translate-x-1 group-hover/discord:-translate-y-1 transition-transform" />
          </a>
        </div>
      </motion.div>
    </div>
  );
};

