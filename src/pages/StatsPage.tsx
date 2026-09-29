//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useTranslation } from 'react-i18next';
import { Box, Star, RefreshCw, Archive } from 'lucide-react';
import { PageHeader, Section, SectionHead, Panel } from '../components/Forge';
import { useOrgRepos, type Repo } from '../hooks/useOrgRepos';
import { relativeTime } from '../utils/relativeTime';
import { cn } from '../utils';

export const StatsPage = () => {
  const { t } = useTranslation();
  const { repos, loading, error, lastUpdated, refresh } = useOrgRepos();

  if (loading && repos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <RefreshCw size={32} className="text-amber-300 animate-spin" />
      </div>
    );
  }

  const rows = (list: Repo[]) => (
    <Panel className="!rounded-2xl">
      <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_6rem_4rem_4rem] gap-4 px-5 py-2.5 border-b border-amber-400/15 text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/40">
        <span>repository</span>
        <span>language</span>
        <span className="text-right">stars</span>
        <span className="text-right">pushed</span>
      </div>
      <ul>
        {list.map((repo) => (
          <li key={repo.id}>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid sm:grid-cols-[minmax(0,1fr)_6rem_4rem_4rem] gap-x-4 items-center gap-y-1 px-5 py-3.5 border-b border-amber-400/[0.07] last:border-0 hover:bg-amber-500/[0.04] transition-colors"
            >
              <span className="flex items-center gap-3 min-w-0">
                {repo.archived ? (
                  <Archive size={15} className="text-red-400/70 shrink-0" />
                ) : (
                  <Box size={15} className="text-amber-300/70 shrink-0" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-mono font-bold text-amber-200 tracking-tight truncate">
                    {repo.name}
                  </span>
                  <span className="block text-[10px] text-amber-100/30 truncate">
                    {repo.description || t('repo.no_description')}
                  </span>
                </span>
              </span>

              <span className="text-[10px] font-mono text-amber-400/50 truncate">{repo.language ?? '—'}</span>

              <span className="text-[10px] font-mono text-amber-200/70 text-right flex items-center justify-end gap-1.5">
                <Star size={11} className="text-amber-300" />
                {repo.stargazers_count}
              </span>

              <span className="text-[10px] font-mono text-amber-400/40 text-right whitespace-nowrap">
                {relativeTime(repo.pushed_at)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );

  const active = repos.filter((r) => !r.archived);
  const archived = repos.filter((r) => r.archived);
  const totalStars = repos.reduce((n, r) => n + r.stargazers_count, 0);

  return (
    <div className="min-h-screen">
      <PageHeader fig="fig. 07 · stats" title={t('stats.title')} lede={t('stats.subtitle')}>
        <div className="flex flex-wrap items-center gap-4 mt-6 text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400/40">
          <span>{t('stats.index')}</span>
          <span className="w-1 h-1 bg-amber-400/50 rounded-full" />
          <span>{repos.length} repositories</span>
          <span className="w-1 h-1 bg-amber-400/50 rounded-full" />
          <span>{totalStars} stars</span>
          {lastUpdated && (
            <>
              <span className="w-1 h-1 bg-amber-400/50 rounded-full" />
              <span>{t('stats.updated')} {lastUpdated}</span>
            </>
          )}
        </div>
      </PageHeader>

      <Section>
        {error && (
          <div className="bg-red-500/[0.06] border border-red-500/25 text-red-400 p-4 rounded-2xl text-center mb-10 text-sm">
            {error}
          </div>
        )}

        <div className="mb-16">
          <SectionHead index="fig. 07a" title={t('stats.org_artifacts')} />
          {active.length > 0 ? rows(active) : <p className="text-amber-100/30 text-sm font-mono">{loading ? 'fetching…' : 'none'}</p>}
        </div>

        {archived.length > 0 && (
          <div className="mb-16">
            <SectionHead index="fig. 07b" title={t('stats.archived_artifacts')} />
            {rows(archived)}
          </div>
        )}

        <div className="flex justify-center mt-12">
          <button
            onClick={() => refresh(true)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-amber-400/30 text-amber-100/50 hover:text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/5 transition-all text-xs font-bold uppercase tracking-widest group"
          >
            <RefreshCw size={14} className={cn('group-hover:rotate-180 transition-transform duration-500', loading && 'animate-spin')} />
            {loading ? t('stats.updating') : t('stats.force_refresh')}
          </button>
        </div>
      </Section>
    </div>
  );
};
