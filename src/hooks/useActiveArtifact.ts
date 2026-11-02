//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect } from 'react';
import { useForgeActivity, type Activity } from './useForgeActivity';
import { useOrgRepos } from './useOrgRepos';
import { forge, toRepo, type Repo } from '../lib/forgejo';

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
  // direct lookup if the feed names something the list doesn't have.
  const fromList = repoKey ? repos.find((r) => r.name.toLowerCase() === repoKey) ?? null : null;

  useEffect(() => {
    if (!repoKey || fromList || !latest) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await forge(`/repos/${latest.repo}`);
        if (!res.ok) return;
        const parsed = toRepo(await res.json());
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
