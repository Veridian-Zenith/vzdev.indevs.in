//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { ArrowUpRight, Box, Star, GitFork } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlueprintGrid, Brackets, SectionHead, Section, SignalFeed, PillButton, SpecList } from './Forge';
import { useActiveArtifact } from '../hooks/useActiveArtifact';
import { useOrgRepos } from '../hooks/useOrgRepos';
import { relativeTime } from '../utils/relativeTime';

export const HeroSection = () => {
  const { t } = useTranslation();
  const { repo, latest, recent, loading, error } = useActiveArtifact();
  const { repos } = useOrgRepos();

  const specItems: [string, string][] = repo
    ? [
        ['language', repo.language ?? '—'],
        ['licence', repo.license?.spdx_id ?? repo.license?.name ?? '—'],
        ['stars', String(repo.stargazers_count)],
        ['pushed', relativeTime(repo.pushed_at)],
      ]
    : [
        ['language', '—'],
        ['licence', '—'],
        ['stars', '—'],
        ['pushed', '—'],
      ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero band ── */}
      <section className="relative overflow-hidden border-b border-amber-400/10">
        <BlueprintGrid />
        <div className="relative mx-auto w-full max-w-5xl px-6 sm:px-8 pt-20 pb-20">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400/60 border border-amber-400/20 rounded-full px-3 py-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {t('hero.subtitle')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700"
          >
            {t('hero.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-6 text-sm sm:text-lg text-amber-100/45 max-w-xl leading-relaxed"
          >
            {t('hero.void')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <PillButton href="/projects" variant="solid">
              {t('hero.explore')} <ArrowUpRight size={15} />
            </PillButton>
            <PillButton href="/contact">{t('hero.summon')}</PillButton>
          </motion.div>
        </div>
      </section>

      <div className="flex-1">
        {/* ── Active artifact: the most recently pushed repo, live ── */}
        <Section>
          <SectionHead index="fig. 01" title="Active artifact" />

          <div className="relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden">
            <Brackets />
            <BlueprintGrid />
            <div className="relative p-6 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-400/50">
                    {loading && !repo ? 'reading forge…' : 'most recent push'}
                  </span>

                  <h3 className="text-3xl sm:text-5xl font-black text-amber-200 tracking-tighter mt-2 font-mono break-all">
                    {repo?.name ?? latest?.repo ?? '—'}
                  </h3>

                  <p className="text-sm text-amber-100/40 mt-4 max-w-lg leading-relaxed">
                    {repo?.description ??
                      (loading ? 'Resolving repository metadata…' : 'No description on the repository.')}
                  </p>

                  {latest && (
                    <p className="text-[10px] font-mono text-amber-400/40 mt-3">
                      {latest.type.toLowerCase()} · {relativeTime(new Date(latest.at).toISOString())}
                    </p>
                  )}
                </div>

                {repo ? (
                  <Box size={30} className="text-amber-300/70 shrink-0" />
                ) : (
                  <Box size={30} className="text-amber-300/30 shrink-0" />
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-amber-400/15">
                <SpecList items={specItems} />
              </div>

              {repo && (
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 font-bold text-sm transition-colors"
                >
                  Inspect on GitHub
                  <ArrowUpRight size={14} />
                </a>
              )}

              {error && !repo && (
                <p className="mt-7 text-[10px] font-mono text-red-400/70">{error}</p>
              )}
            </div>
          </div>
        </Section>

        {/* ── Signal + live registry ── */}
        <Section className="!pt-0">
          <SectionHead index="fig. 02" title="Recent signal" />
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              {loading && !latest ? (
                <p className="text-amber-100/30 text-sm font-mono border border-amber-400/15 rounded-2xl p-6">
                  reading forge…
                </p>
              ) : recent.length > 0 ? (
                <SignalFeed
                  rows={recent.slice(0, 6).map((a) => ({ t: a.date, e: a.type.toLowerCase(), m: a.message, r: a.repo }))}
                />
              ) : (
                <p className="text-amber-100/30 text-sm font-mono border border-amber-400/15 rounded-2xl p-6">
                  no recent activity for this repository
                </p>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="bg-black border border-amber-400/20 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-amber-400/15 flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/40">registry</span>
                  {loading && <span className="text-[9px] font-mono text-amber-400/30">syncing…</span>}
                </div>

                {repos.length === 0 ? (
                  <p className="px-5 py-6 text-[11px] font-mono text-amber-100/30">
                    {loading ? 'fetching…' : 'no repositories reachable'}
                  </p>
                ) : (
                  <ul className="max-h-[22rem] overflow-y-auto">
                    {repos.map((r) => {
                      const isActive = r.name.toLowerCase() === repo?.name.toLowerCase();
                      return (
                        <li key={r.id}>
                          <a
                            href={r.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group flex items-center gap-3 px-5 py-3 border-b border-amber-400/[0.07] last:border-0 transition-colors ${
                              isActive ? 'bg-amber-500/[0.06]' : 'hover:bg-amber-500/[0.04]'
                            }`}
                          >
                            <span className="min-w-0 flex-1">
                              <span className={`block text-sm font-mono font-bold tracking-tight truncate ${isActive ? 'text-amber-200' : 'text-amber-100/60'}`}>
                                {r.name}
                              </span>
                              <span className="block text-[10px] text-amber-100/30 truncate">
                                {r.language ?? '—'} · {relativeTime(r.pushed_at)}
                              </span>
                            </span>

                            {isActive && (
                              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-300/70 shrink-0">
                                active
                              </span>
                            )}
                            {!isActive && r.stargazers_count > 0 && (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/40 shrink-0">
                                <Star size={10} className="text-amber-300/70" />
                                {r.stargazers_count}
                              </span>
                            )}
                            {!isActive && r.stargazers_count === 0 && r.forks_count > 0 && (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/40 shrink-0">
                                <GitFork size={10} className="text-amber-300/70" />
                                {r.forks_count}
                              </span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};
