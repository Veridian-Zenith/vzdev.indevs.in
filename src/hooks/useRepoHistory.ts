//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect, useCallback } from 'react';
import { ORG, forge, isRecord, repoUrl } from '../lib/forgejo';

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  at: number;
  url: string;
}

export interface MonthBucket {
  /** e.g. `2026-07` */
  key: string;
  /** e.g. `Jul` */
  label: string;
  count: number;
}

export interface RepoHistory {
  commits: Commit[];
  months: MonthBucket[];
  total: number;
  since: string;
  loading: boolean;
  error: string | null;
}

const MONTHS = 3;
const CACHE_PREFIX = 'vz_hist_v2_';
const CACHE_DURATION = 60 * 60 * 1000; // 1h — history changes slowly
/** Forgejo caps a page at 50 items. */
const LIMIT = 50;

const sinceDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - MONTHS);
  return d.toISOString();
};

const readCommit = (v: unknown, repoName: string): Commit | null => {
  if (!isRecord(v) || typeof v.sha !== 'string') return null;
  const commit = isRecord(v.commit) ? v.commit : {};
  const author = isRecord(commit.author) ? commit.author : {};

  const raw =
    (typeof author.date === 'string' ? author.date : '') ||
    (typeof v.created === 'string' ? v.created : '');
  const at = raw ? new Date(raw).getTime() : 0;
  if (!at) return null;

  const message = String(commit.message ?? '').split('\n')[0].trim();
  return {
    sha: v.sha,
    message: message || 'commit',
    // Forgejo does not attach an account to a commit, only its git identity.
    author: typeof author.name === 'string' && author.name ? author.name : 'unknown',
    date: new Date(at).toLocaleDateString(),
    at,
    url:
      typeof v.html_url === 'string'
        ? v.html_url
        : `${repoUrl(repoName)}/commit/${v.sha}`,
  };
};

const bucket = (commits: Commit[]): MonthBucket[] => {
  const map = new Map<string, number>();
  for (const c of commits) {
    const d = new Date(c.at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, count]) => ({
      key,
      label: new Date(`${key}-01T00:00:00`).toLocaleDateString(undefined, { month: 'short' }),
      count,
    }));
};

/**
 * Commit history for one repository over the last 3 months.
 *
 * Fetched per selection rather than up front for every repo, so only the
 * artifact being inspected costs a request. Results are cached for an hour.
 */
interface Loaded {
  /** Which repo these commits belong to, so stale data is never shown. */
  repo: string;
  commits: Commit[];
}

export const useRepoHistory = (repoName: string | null): RepoHistory => {
  const [loaded, setLoaded] = useState<Loaded>({ repo: '', commits: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [since, setSince] = useState(() => sinceDate());

  const key = repoName?.toLowerCase() ?? '';
  // Derived rather than reset in an effect: switching repos simply stops
  // matching, so the previous repo's commits can never render.
  const commits = loaded.repo === key ? loaded.commits : [];

  const load = useCallback(async (force = false) => {
    if (!repoName) return;
    const cacheKey = CACHE_PREFIX + key;

    if (!force) {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const { timestamp, commits: cached } = JSON.parse(raw);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setLoaded({ repo: key, commits: cached });
            setSince(sinceDate());
            return;
          }
        }
      } catch { /* storage unavailable — fall through to network */ }
    }

    setLoading(true);
    setError(null);
    try {
      const sinceIso = sinceDate();
      const url =
        `/repos/${ORG}/${encodeURIComponent(repoName)}/commits` +
        `?since=${encodeURIComponent(sinceIso)}&limit=${LIMIT}`;
      const res = await forge(url);
      if (res.status === 404 || res.status === 409) { setLoaded({ repo: key, commits: [] }); return; }
      if (!res.ok) throw new Error(`git.gay API ${res.status}`);

      const data: unknown = await res.json();
      const parsed = (Array.isArray(data) ? data : [])
        .map((c) => readCommit(c, repoName))
        .filter((c): c is Commit => c !== null)
        .sort((a, b) => b.at - a.at);

      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), commits: parsed }));
      } catch { /* ignore quota */ }

      setLoaded({ repo: key, commits: parsed });
      setSince(sinceIso);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [repoName, key]);

  useEffect(() => {
    if (!repoName) return;
    // Fetching commit history is a genuine external-system sync, so the
    // loading flag legitimately starts on the next tick.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [repoName, load]);

  return {
    commits,
    months: bucket(commits),
    total: commits.length,
    since,
    loading,
    error,
  };
};
