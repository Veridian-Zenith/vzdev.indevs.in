//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect, useCallback } from 'react';

/** Shape of the fields we actually read off a GitHub repo payload. */
export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  license: { spdx_id: string | null; name: string } | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  pushed_at: string;
  updated_at: string;
  archived: boolean;
  fork: boolean;
  default_branch: string;
}

const ORG = 'Veridian-Zenith';
const USER = 'daedaevibin';
const CACHE_KEY = 'vz_repos_cache';
const CACHE_DURATION = 10 * 60 * 1000;

/**
 * Most forks are noise, so they're filtered out — but a few are genuinely ours
 * and are worth showing. Matched case-insensitively.
 */
const FORK_ALLOWLIST = new Set(['wuming']);

const isRepo = (v: unknown): v is Repo =>
  typeof v === 'object' && v !== null && 'full_name' in v && 'pushed_at' in v;

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
        fetch(`https://api.github.com/orgs/${ORG}/repos?per_page=100&sort=pushed`),
        fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`),
      ]);

      if (!orgRes.ok && !userRes.ok) throw new Error('Failed to reach the forge API');

      const collect = async (res: Response) => {
        if (!res.ok) return [] as Repo[];
        const data: unknown = await res.json();
        return Array.isArray(data) ? data.filter(isRepo) : [];
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
