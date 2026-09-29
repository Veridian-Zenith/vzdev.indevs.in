//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useTranslation } from 'react-i18next';
import { Hammer, Shield, BookOpen } from 'lucide-react';
import {
  PageHeader, Section, SectionHead, Brackets, BlueprintGrid, SpecList, SignalFeed,
} from '../components/Forge';
import type { SignalRow } from '../components/Forge';

const MILESTONES: SignalRow[] = [
  { t: '2023', e: 'origin', m: 'First Veridian-Zenith repository pushed', r: 'genesis' },
  { t: '2024', e: 'release', m: 'AUR theme, icons and cursor packages published', r: 'aur' },
  { t: '2025', e: 'commit', m: 'Voix — privilege management enters C++26', r: 'voix' },
  { t: '2026', e: 'merge', m: 'Heimdallr resolver, Galdr, Verdandi kernel', r: 'forge' },
];

export const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <PageHeader
        fig="fig. 04 · about"
        title={t('about.title')}
        lede={t('about.subtitle')}
      />

      <Section>
        <SectionHead index="fig. 04a" title="Specification" />
        <div className="relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden">
          <Brackets />
          <BlueprintGrid />
          <div className="relative p-6 sm:p-10">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h3 className="text-2xl sm:text-4xl font-black text-amber-200 tracking-tighter">
                  {t('about.forge.title')}
                </h3>
                <p className="text-sm text-amber-100/40 mt-4 max-w-lg leading-relaxed">
                  {t('about.forge.description')}
                </p>
              </div>
              <Hammer size={26} className="text-amber-300/70 shrink-0" />
            </div>
            <div className="mt-10 pt-6 border-t border-amber-400/15">
              <SpecList items={[
                ['focus', 'systems · security'],
                ['origin', 'nordic'],
                ['licence', 'OSL-3.0'],
                ['public', 'open source'],
              ]} />
            </div>
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead index="fig. 04b" title="Principles" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative bg-black border border-amber-400/20 rounded-2xl p-6 sm:p-7 overflow-hidden">
            <span className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <Shield size={20} className="text-amber-300" />
            <h3 className="text-base font-black text-amber-200 tracking-tight mt-4">
              {t('about.philosophy.title')}
            </h3>
            <p className="text-sm text-amber-100/40 mt-3 leading-relaxed">
              {t('about.philosophy.description')}
            </p>
          </div>

          <div className="relative bg-black border border-amber-400/20 rounded-2xl p-6 sm:p-7 overflow-hidden">
            <span className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <BookOpen size={20} className="text-amber-300" />
            <h3 className="text-base font-black text-amber-200 tracking-tight mt-4">
              {t('about.license.title')}
            </h3>
            <p className="text-sm text-amber-100/40 mt-3 leading-relaxed">
              {t('about.license.description')}
              <a
                href="https://opensource.org/licenses/OSL-3.0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 font-bold hover:underline"
              >
                {t('about.license.link')}
              </a>
              {t('about.license.description2')}
            </p>
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead index="fig. 04c" title="Provenance" />
        <SignalFeed rows={MILESTONES} />
      </Section>
    </div>
  );
};
