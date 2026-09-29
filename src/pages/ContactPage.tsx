//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, User, MessageSquare, ExternalLink, Send, Terminal, AtSign, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  PageHeader, Section, SectionHead, Brackets, BlueprintGrid, fieldClass, labelClass,
} from '../components/Forge';

export const ContactPage = () => {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const contactInfo = [
    { icon: User, label: t('contact.architect.label'), value: 'Dae Euhwa', sub: t('contact.architect.sub') },
    { icon: Mail, label: t('contact.email.label'), value: 'daedaevibin@ik.me', href: 'mailto:daedaevibin@ik.me' },
    { icon: Terminal, label: t('contact.forge.label'), value: 'Veridian-Zenith', href: 'https://github.com/Veridian-Zenith' },
    { icon: ExternalLink, label: 'Instagram', value: '@daedaevibin', href: 'https://www.instagram.com/daedaevibin?igsh=aTg3cjFmbzdiY2s0' },
    { icon: MessageSquare, label: 'Matrix', value: '@daedaevibin:matrix.org', href: 'https://matrix.to/@daedaevibin:matrix.org#/@daedaevibin:matrix.org' },
    { icon: AtSign, label: 'Mastodon', value: '@daedaevibin@defcon.social', href: 'https://defcon.social/@daedaevibin' },
    { icon: Mail, label: 'WhatsApp', value: '+1 (208) 464-4061', href: 'https://wa.me/12084644061' },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formState === 'sending') return;

    const elapsed = Date.now() - mountedAt.current;
    mountedAt.current = Date.now();

    if (honeypot !== '' || elapsed < 3000) {
      setFormState('sent');
      setTimeout(() => setFormState('idle'), 5000);
      return;
    }

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
    <div className="min-h-screen">
      <PageHeader
        fig="fig. 05 · contact"
        title={t('contact.title')}
        lede={t('contact.subtitle')}
      />

      <Section>
        <SectionHead index="fig. 05a" title={t('contact.invocation.title')} />

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Schematic form */}
          <div className="lg:col-span-3 relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden">
            <Brackets />
            <BlueprintGrid />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Send size={18} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-200 tracking-tight">
                    {t('contact.invocation.title')}
                  </h3>
                  <p className="text-xs text-amber-100/40 mt-0.5">{t('contact.invocation.description')}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {/* Honeypot */}
                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website" type="text" name="website" tabIndex={-1} autoComplete="off"
                    value={honeypot} onChange={e => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className={labelClass}>your sigil</label>
                    <input
                      id="name" type="text" name="name" required
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="name / alias"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>void address</label>
                    <input
                      id="email" type="email" name="email" required
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="you@domain.com"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className={labelClass}>subject</label>
                  <input
                    id="subject" type="text" name="subject" required
                    value={formData.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    placeholder="what is this regarding?"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>message</label>
                  <textarea
                    id="message" name="message" required rows={5}
                    value={formData.message}
                    onChange={e => handleChange('message', e.target.value)}
                    placeholder="your message to the void..."
                    className={`${fieldClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={formState === 'sending' || formState === 'sent'}
                  className="w-full relative overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-400/40 hover:shadow-[0_0_24px_rgba(255,179,71,0.22)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {formState === 'sending' ? (
                      <>transmitting<span className="animate-pulse">...</span></>
                    ) : formState === 'sent' ? (
                      <><CheckCircle size={15} /> message sent through the void</>
                    ) : (
                      <><Send size={15} /> send transmission</>
                    )}
                  </span>
                </button>

                {formState === 'error' && (
                  <div className="flex items-center gap-2 text-red-400/90 bg-red-500/[0.06] border border-red-500/25 rounded-xl px-4 py-3 text-xs">
                    <AlertCircle size={14} className="shrink-0" />
                    Failed to send. The void is turbulent — try again or email directly.
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Channels + telemetry */}
          <div className="lg:col-span-2 space-y-3">
            {contactInfo.map((info) => {
              const body = (
                <>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-center shrink-0">
                    <info.icon size={17} className="text-amber-300" />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-mono uppercase tracking-[0.25em] text-amber-400/40">{info.label}</span>
                    <span className="block text-sm font-mono font-bold text-amber-200 mt-1 truncate">{info.value}</span>
                    {info.sub && <span className="block text-[10px] text-amber-100/30 mt-0.5">{info.sub}</span>}
                  </span>
                </>
              );

              return info.href ? (
                <a
                  key={info.label}
                  href={info.href}
                  target={info.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 bg-black border border-amber-400/20 rounded-2xl p-4 hover:border-amber-400/45 transition-colors"
                >
                  {body}
                  <ExternalLink size={13} className="text-amber-400/0 group-hover:text-amber-300 shrink-0 transition-colors" />
                </a>
              ) : (
                <div key={info.label} className="flex items-center gap-4 bg-black border border-amber-400/20 rounded-2xl p-4">
                  {body}
                </div>
              );
            })}

            <div className="relative bg-black border border-amber-400/20 rounded-2xl p-5 overflow-hidden">
              <span className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-400/40">telemetry</span>
              <dl className="mt-4 space-y-2.5">
                {[
                  ['channels', `${contactInfo.length} active`],
                  ['transport', 'firestore'],
                  ['spam filter', 'engaged'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3">
                    <dt className="text-[11px] text-amber-100/35">{k}</dt>
                    <dd className="text-[11px] font-mono text-amber-200/80">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-black/40">
          <BlueprintGrid />
          <div className="relative p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <MessageSquare size={26} className="text-[#5865F2] shrink-0" />
              <div className="min-w-0">
                <h2 className="text-xl font-black text-amber-200 tracking-tight">{t('contact.community.title')}</h2>
                <p className="text-sm text-amber-100/40 mt-1">{t('contact.community.description')}</p>
              </div>
            </div>
            <a
              href="https://discord.gg/Vprc6XRkRg"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-7 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(88,101,242,0.25)]"
            >
              {t('contact.community.join')}
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
};
