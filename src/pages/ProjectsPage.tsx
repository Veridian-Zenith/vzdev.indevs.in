//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageHeader, Section, SectionHead, Brackets, BlueprintGrid, SpecList, SignalFeed,
} from '../components/Forge';
import { ARTIFACTS, type Status } from '../data/artifacts';
import { useOrgRepos, type Repo } from '../hooks/useOrgRepos';
import { useForgeActivity } from '../hooks/useForgeActivity';
import { relativeTime } from '../utils/relativeTime';
import { resolveLicence } from '../utils/licence';

/** The API's `archived` flag wins over our editorial status. */
const liveStatus = (fallback: Status, repo?: Repo): Status => (repo?.archived ? 'archived' : fallback);

const statusTone: Record<Status, string> = {
  stable: 'text-amber-400/50',
  early: 'text-amber-300/70',
  archived: 'text-red-400/70',
};

const shortName = (full: string) => (full.includes('/') ? full.split('/').pop()! : full);

export const ProjectsPage = () => {
  const { t } = useTranslation();
  const { repos, loading } = useOrgRepos();
  const { activities } = useForgeActivity();
  const [active, setActive] = useState(ARTIFACTS[0]);
  const ActiveIcon = active.Icon;

  // Live metadata for the selected artifact, when the API knows about it.
  const liveFor = (a: { name: string }) => repos.find((r) => r.name.toLowerCase() === a.name.toLowerCase());
  const live = liveFor(active);
  const liveSignal = activities
    .filter((a) => shortName(a.repo).toLowerCase() === active.name.toLowerCase())
    .map((a) => ({ t: a.date, e: a.type.toLowerCase(), m: a.message, r: a.repo }));

  return (
    <div className="min-h-screen">
      <PageHeader
        fig="fig. 02 · projects"
        title={t('projects.title')}
        lede={t('projects.subtitle')}
      />

      <Section>
        <SectionHead index="fig. 02a" title="Registry" />
        <div className="bg-black border border-amber-400/25 rounded-2xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_5rem_7rem_5rem] gap-4 px-5 py-2.5 border-b border-amber-400/15 text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/40">
            <span>package</span>
            <span>lang</span>
            <span>pushed</span>
            <span className="text-right">status</span>
          </div>
          <ul>
            {ARTIFACTS.map((a) => {
              const isActive = active.id === a.id;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setActive(a)}
                    className={`w-full text-left grid sm:grid-cols-[minmax(0,1fr)_5rem_7rem_5rem] gap-x-4 items-center gap-y-1 px-5 py-3.5 border-b border-amber-400/[0.07] last:border-0 transition-colors ${
                      isActive ? 'bg-amber-500/[0.06]' : 'hover:bg-amber-500/[0.03]'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <a.Icon size={15} className={`shrink-0 ${isActive ? 'text-amber-300' : 'text-amber-300/50'}`} />
                      <span className="min-w-0">
                        <span className={`block text-sm font-mono font-bold tracking-tight truncate ${isActive ? 'text-amber-200' : 'text-amber-100/60'}`}>
                          {a.label}
                        </span>
                        <span className="block text-[10px] text-amber-100/30 truncate">{a.role}</span>
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-400/50">{a.lang}</span>
                    <span className="text-[10px] font-mono text-amber-100/35">{live ? relativeTime(live.pushed_at) : '—'}</span>
                    <span className={`text-[10px] font-mono text-right ${statusTone[liveStatus(a.status, liveFor(a))]}`}>
                      {liveStatus(a.status, liveFor(a))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead index="fig. 02b" title={`${active.label}`} />

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden">
            <Brackets />
            <BlueprintGrid />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-200 tracking-tighter font-mono">
                    {active.name}
                  </h3>
                  <p className="text-sm text-amber-100/40 mt-2">{t(active.descKey)}</p>
                </div>
                <ActiveIcon size={26} className="text-amber-300/70 shrink-0" />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-6">
                {active.topics.map((topic) => (
                  <span key={topic} className="text-[10px] font-mono px-2 py-1 rounded border border-amber-400/20 text-amber-300/70 bg-amber-500/[0.04]">
                    {topic}
                  </span>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-amber-400/15">
                <SpecList items={[
                  ['language', live?.language ?? active.lang],
                  ['licence', resolveLicence(live?.license?.spdx_id, active.licence)],
                  ['stars', live ? String(live.stargazers_count) : '—'],
                  ['pushed', live ? relativeTime(live.pushed_at) : '—'],
                ]} />
              </div>

              <a
                href={`https://github.com/Veridian-Zenith/${active.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 font-bold text-sm transition-colors"
              >
                {t('projects.inspect')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            {liveSignal.length > 0 ? (
              <SignalFeed rows={liveSignal} />
            ) : (
              <div className="text-amber-100/30 text-sm font-mono border border-amber-400/15 rounded-2xl p-6">
                {loading ? 'reading forge…' : 'no recent activity for this artifact'}
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-black/40">
          <BlueprintGrid />
          <div className="relative p-8 sm:p-10 text-center">
            <p className="text-amber-100/40 text-sm max-w-md mx-auto leading-relaxed">
              {t('projects.future')}
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
};
