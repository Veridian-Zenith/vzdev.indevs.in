//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect, useCallback } from 'react';
import { ORG, USER, forge, toRepo, type Repo } from '../lib/github';

export type { Repo };

const CACHE_KEY = 'vz_repos_cache_v3';
const CACHE_DURATION = 10 * 60 * 1000;
/** GitHub caps a page at 100 items. */
const LIMIT = 100;

/**
 * Forge mirrors are noise, so they're filtered out — but a few are genuinely
 * ours and are worth showing. Matched case-insensitively.
 */
const FORK_ALLOWLIST = new Set(['wuming']);

export const useOrgRepos = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRepos = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!force && cached) {
        const { timestamp, repos: cachedRepos } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setRepos(cachedRepos);
          setLastUpdated(new Date(timestamp).toLocaleTimeString());
          setLoading(false);
          return;
        }
      }

      const [orgRes, userRes] = await Promise.all([
        forge(`/orgs/${ORG}/repos?per_page=${LIMIT}&page=1`),
        forge(`/users/${USER}/repos?per_page=${LIMIT}&page=1`),
      ]);

      if (!orgRes.ok && !userRes.ok) throw new Error('Failed to reach GitHub');

      const collect = async (res: Response) => {
        if (!res.ok) return [] as Repo[];
        const data: unknown = await res.json();
        if (!Array.isArray(data)) return [] as Repo[];
        return data
          .map(toRepo)
          .filter((r): r is Repo => r !== null);
      };

      const [org, personal] = await Promise.all([collect(orgRes), collect(userRes)]);

      // Org repos win on name collision; newest push first.
      const seen = new Set<string>();
      const merged = [...org, ...personal]
        .filter((r) => !r.fork || FORK_ALLOWLIST.has(r.name.toLowerCase()))
        .filter((r) => {
          if (seen.has(r.name.toLowerCase())) return false;
          seen.add(r.name.toLowerCase());
          return true;
        })
        .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());

      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), repos: merged }));
      setRepos(merged);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRepos();
  }, [fetchRepos]);

  return { repos, loading, error, lastUpdated, refresh: fetchRepos };
};
