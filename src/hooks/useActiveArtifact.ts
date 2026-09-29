//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect } from 'react';
import { useForgeActivity, type Activity } from './useForgeActivity';
import { useOrgRepos, type Repo } from './useOrgRepos';

const shortName = (full: string) => (full.includes('/') ? full.split('/').pop()! : full);

export interface ActiveArtifact {
  /** Real repo metadata from the API, or null if unreachable. */
  repo: Repo | null;
  /** The newest push we saw. */
  latest: Activity | null;
  /** Recent activity scoped to that same repo. */
  recent: Activity[];
  loading: boolean;
  error: string | null;
}

const readRepo = (v: unknown): Repo | null => {
  if (typeof v !== 'object' || v === null) return null;
  const r = v as Record<string, unknown>;
  if (typeof r.full_name !== 'string' || typeof r.pushed_at !== 'string') return null;
  return r as unknown as Repo;
};

/**
 * The active artifact is whatever was pushed to most recently — resolved from the
 * org repo list rather than a curated list, so an unlisted repo still shows up
 * correctly. Nothing is invented: if we can't reach the API we show nothing.
 */
export const useActiveArtifact = (): ActiveArtifact => {
  const { activities, loading: eventsLoading, error: eventsError } = useForgeActivity();
  const { repos, loading: reposLoading } = useOrgRepos();
  const [detail, setDetail] = useState<Repo | null>(null);

  const latest = activities[0] ?? null;
  const repoKey = latest ? shortName(latest.repo).toLowerCase() : null;

  // Prefer the entry already in the shared repo list; only fall back to a
  // direct lookup if the events feed names something the list doesn't have.
  const fromList = repoKey ? repos.find((r) => r.name.toLowerCase() === repoKey) ?? null : null;

  useEffect(() => {
    if (!repoKey || fromList) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${latest!.repo}`);
        if (!res.ok) return;
        const parsed = readRepo(await res.json());
        if (!cancelled) setDetail(parsed);
      } catch {
        if (!cancelled) setDetail(null);
      }
    })();
    return () => { cancelled = true; };
  }, [repoKey, fromList, latest]);

  const repo = fromList ?? detail;
  const recent = repoKey ? activities.filter((a) => shortName(a.repo).toLowerCase() === repoKey) : [];

  return {
    repo,
    latest,
    recent,
    loading: eventsLoading || reposLoading,
    error: eventsError,
  };
};
