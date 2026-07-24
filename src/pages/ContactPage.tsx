import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { Mail, User, MessageSquare, ExternalLink, Send, Terminal, AtSign, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatedCard } from '../components';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const ContactPage = () => {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formState === 'sending') return;
    setFormState('sending');

    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        createdAt: serverTimestamp(),
      });

      setFormState('sent');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormState('idle'), 5000);
    } catch {
      setFormState('error');
      setTimeout(() => setFormState('idle'), 5000);
    }
  };

  return (
    <div className="pt-32 pb-24 px-5 sm:px-8 max-w-5xl mx-auto min-h-screen relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl sm:text-5xl font-bold text-primary-themeable mb-6 drop-shadow-[0_0_20px_var(--vz-glow-color)]">
          {t('contact.title')}
        </h1>
        <p className="text-secondary-themeable max-w-xl mx-auto text-lg italic leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-themeable via-themeable to-primary-themeable rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-secondary-themeable border border-muted-themeable p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary-themeable/10 rounded-xl text-primary-themeable border border-primary-themeable/30">
                <Send size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-themeable">{t('contact.invocation.title')}</h2>
                <p className="text-sm text-secondary-themeable italic">{t('contact.invocation.description')}</p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-primary-themeable/70 font-bold mb-2">Your Sigil</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Name / alias"
                    className="w-full px-4 py-3 bg-[var(--vz-bg-primary)] border border-muted-themeable rounded-xl text-primary-themeable placeholder-secondary-themeable/40 focus:outline-none focus:border-primary-themeable focus:shadow-[0_0_15px_var(--vz-shadow-color)] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-primary-themeable/70 font-bold mb-2">Void Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-3 bg-[var(--vz-bg-primary)] border border-muted-themeable rounded-xl text-primary-themeable placeholder-secondary-themeable/40 focus:outline-none focus:border-primary-themeable focus:shadow-[0_0_15px_var(--vz-shadow-color)] transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-primary-themeable/70 font-bold mb-2">Transmission Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={e => handleChange('subject', e.target.value)}
                  placeholder="What is this regarding?"
                  className="w-full px-4 py-3 bg-[var(--vz-bg-primary)] border border-muted-themeable rounded-xl text-primary-themeable placeholder-secondary-themeable/40 focus:outline-none focus:border-primary-themeable focus:shadow-[0_0_15px_var(--vz-shadow-color)] transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-primary-themeable/70 font-bold mb-2">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => handleChange('message', e.target.value)}
                  placeholder="Your message to the void..."
                  className="w-full px-4 py-3 bg-[var(--vz-bg-primary)] border border-muted-themeable rounded-xl text-primary-themeable placeholder-secondary-themeable/40 focus:outline-none focus:border-primary-themeable focus:shadow-[0_0_15px_var(--vz-shadow-color)] transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formState === 'sending' || formState === 'sent'}
                className="w-full relative overflow-hidden rounded-2xl px-8 py-4 text-lg font-bold text-white bg-primary-themeable/80 hover:bg-primary-themeable border border-muted-themeable hover:border-primary-themeable transition-all duration-300 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-themeable/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {formState === 'sending' ? (
                    <>Transmitting<span className="animate-pulse">...</span></>
                  ) : formState === 'sent' ? (
                    <><CheckCircle size={20} /> Message Sent Through The Void</>
                  ) : (
                    <><Send size={20} /> Send Transmission</>
                  )}
                </span>
              </button>

              {formState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm font-medium"
                >
                  <AlertCircle size={16} />
                  Failed to send. The void is turbulent — try again or email directly.
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {contactInfo.map((info, index) => (
            <AnimatedCard
              key={index}
              delay={0.3 + index * 0.05}
              className="flex items-center gap-4 p-5 group"
            >
              <div className="p-2.5 bg-primary-themeable/10 border border-muted-themeable rounded-xl text-primary-themeable group-hover:scale-110 transition-all duration-300 shrink-0">
                <info.icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary-themeable/50 font-bold block">{info.label}</span>
                <span className="text-sm font-bold text-primary-themeable truncate block">{info.value}</span>
                {info.sub && <span className="text-[10px] text-secondary-themeable">{info.sub}</span>}
              </div>
              {info.href && (
                <a
                  href={info.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-themeable/40 hover:text-primary-themeable transition-colors shrink-0"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </AnimatedCard>
          ))}
        </div>
      </div>

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
