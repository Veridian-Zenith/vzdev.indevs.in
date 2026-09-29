//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { PageHeader, Section, SectionHead, Panel, Specimen } from '../components/Forge';
import { Package, Terminal, Shield, Download, ExternalLink, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TILE = 'w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-center shrink-0';

export const AurPage = () => {
  const { t } = useTranslation();

  const packages = [
    { id: 'voix', Icon: Download, title: 'voix', description: t('projects.voix.description'), url: 'https://aur.archlinux.org/packages/voix' },
    { id: 'meshiji', Icon: Package, title: 'meshiji', description: t('projects.meshiji.description'), url: 'https://aur.archlinux.org/packages/meshiji' },
    { id: 'peguni_draem-la', Icon: Shield, title: 'peguni_draem-la', description: t('projects.peguni.description'), url: 'https://aur.archlinux.org/packages/peguni_draem-la' },
    { id: 'ddsh-bin', Icon: Package, title: 'ddsh-bin', description: t('aur.packages.ddsh-bin.description'), url: 'https://aur.archlinux.org/packages/ddsh-bin' },
    { id: 'ddsh-git', Icon: Package, title: 'ddsh-git', description: t('aur.packages.ddsh-git.description'), url: 'https://aur.archlinux.org/packages/ddsh-git' },
    { id: 'ddsc-bin', Icon: Package, title: 'ddsc-bin', description: t('aur.packages.ddsc-bin.description'), url: 'https://aur.archlinux.org/packages/ddsc-bin' },
    { id: 'ddsc-git', Icon: Package, title: 'ddsc-git', description: t('aur.packages.ddsc-git.description'), url: 'https://aur.archlinux.org/packages/ddsc-git' },
    { id: 'veridian-zenith-git', Icon: Package, title: 'veridian-zenith-git', description: t('aur.packages.veridian-zenith-git.description'), url: 'https://aur.archlinux.org/packages/veridian-zenith-git' },
    { id: 'veridian-icons-git', Icon: Package, title: 'veridian-icons-git', description: t('aur.packages.veridian-icons-git.description'), url: 'https://aur.archlinux.org/packages/veridian-icons-git' },
    { id: 'veridian-cursors', Icon: Package, title: 'veridian-cursors', description: t('aur.packages.veridian-cursors.description'), url: 'https://aur.archlinux.org/packages/veridian-cursors' },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader fig="fig. 08 · aur" title={t('aur.title')} lede={t('aur.subtitle')} />

      <Section>
        <SectionHead index="fig. 08a" title="Packages" />

        {/* h-full on the grid child + flex on the inner column is what keeps
            descriptions and links aligned across rows of differing text length. */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(({ id, Icon, title, description, url }) => (
            <Panel key={id} className="group h-full !border-amber-400/20">
              <div className="flex h-full flex-col p-5 sm:p-6">
                <div className={TILE}>
                  <Icon size={18} className="text-amber-300 transition-colors group-hover:text-amber-200" />
                </div>

                <h3 className="mt-5 text-sm sm:text-base font-mono font-bold text-amber-200 tracking-tight break-all">
                  {title}
                </h3>

                <p className="mt-2.5 text-amber-100/40 text-sm leading-relaxed flex-1">
                  {description}
                </p>

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 pt-4 border-t border-amber-400/15 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  {t('projects.inspect')}
                  <ExternalLink size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead index="fig. 08b" title={t('aur.install.title')} />

        <Specimen className="p-6 sm:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className={TILE}>
              <Terminal size={18} className="text-amber-300" />
            </div>
            <h2 className="text-lg font-black text-amber-200 uppercase tracking-widest">
              {t('aur.install.title')}
            </h2>
          </div>

          <div className="mb-8 rounded-2xl border border-amber-400/20 p-5">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300/80 mb-4">
              First: install paru (AUR helper)
            </h3>
            <div className="rounded-xl border border-amber-400/10 bg-amber-500/[0.03] p-4 font-mono text-xs sm:text-sm text-amber-100/45 space-y-2">
              {['sudo pacman -S --needed base-devel', 'git clone https://aur.archlinux.org/paru.git', 'cd paru', 'makepkg -si'].map((cmd) => (
                <div key={cmd} className="flex gap-3">
                  <span className="text-amber-400 select-none">$</span>
                  <span className="break-all">{cmd}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { note: '# install with paru (recommended)', cmd: 'paru -S voix', dim: false },
              { note: '# alternative: install with yay', cmd: 'yay -S voix', dim: true },
            ].map(({ note, cmd, dim }) => (
              <div
                key={cmd}
                className={`rounded-2xl border border-amber-400/20 p-5 font-mono text-xs sm:text-sm relative overflow-hidden group ${
                  dim ? 'opacity-60 hover:opacity-100 transition-opacity' : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-amber-100/30 mb-2">{note}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 select-none">$</span>
                    <span className="text-amber-100/60">{cmd}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-amber-400/15 flex flex-wrap items-center gap-4 justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-amber-100/30">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {t('aur.maintainer')}: Dae Euhwa
            </span>
            <span className="flex items-center gap-2">
              <Globe size={11} /> Architecture: x86_64
            </span>
          </div>
        </Specimen>
      </Section>
    </div>
  );
};
