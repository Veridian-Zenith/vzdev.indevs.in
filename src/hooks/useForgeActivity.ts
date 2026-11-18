//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect, useCallback, useRef } from 'react';
import { ORG, forge, isRecord, num, repoUrlFromFullName } from '../lib/github';

export type ActivityType =
  | 'Commit'
  | 'Tag'
  | 'Release'
  | 'PR'
  | 'Issue'
  | 'Fork'
  | 'Create'
  | 'Delete';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  repo: string;
  url: string;
  date: string;
  /** ISO timestamp, used to determine what changed most recently */
  at: number;
}

/** GitHub serves 30 events per page for an org feed. */
const FEED_LIMIT = 30;
const ENDPOINT = `/orgs/${ORG}/events?per_page=${FEED_LIMIT}`;
const CACHE_KEY = 'vz_tracker_cache_v3';
const CACHE_DURATION = 10 * 60 * 1000;
/**
 * Unauthenticated requests are capped at 60/hour per visitor IP, and the feed is
 * the one polled endpoint, so it refreshes slowly: 4 requests/hour.
 */
export const REFRESH_INTERVAL = 15 * 60 * 1000;
const MAX_MESSAGE = 140;

const oneLine = (text: string): string => {
  const first = text.split('\n')[0].trim();
  return first.length > MAX_MESSAGE ? `${first.slice(0, MAX_MESSAGE)}…` : first;
};

/**
 * Maps one `/orgs/{org}/events` item onto the shape the tracker renders.
 * Anything GitHub emits that this does not model (stars, watches, comments,
 * membership) returns null rather than inventing a row.
 */
const parseEvent = (v: unknown): Activity | null => {
  if (!isRecord(v)) return null;
  if (typeof v.id !== 'string' && typeof v.id !== 'number') return null;

  const created = typeof v.created_at === 'string' ? v.created_at : '';
  const at = new Date(created).getTime();
  if (!at) return null;

  const repo = isRecord(v.repo) ? v.repo : null;
  if (!repo || typeof repo.name !== 'string') return null;

  const repoLink = repoUrlFromFullName(repo.name);
  const payload = isRecord(v.payload) ? v.payload : {};
  const base = {
    id: String(v.id),
    repo: repo.name,
    date: new Date(at).toLocaleDateString(),
    at,
  };

  // `ref` arrives fully qualified: `refs/heads/main`, `refs/tags/v1.0`.
  const rawRef = typeof payload.ref === 'string' ? payload.ref : '';
  const ref = rawRef.replace(/^refs\/(heads|tags)\//, '');
  const isTag = rawRef.startsWith('refs/tags/');

  const head = typeof payload.head === 'string' ? payload.head : '';
  const commits = Array.isArray(payload.commits) ? payload.commits : [];
  const lastCommit = commits.length ? commits[commits.length - 1] : null;
  const headMessage =
    isRecord(lastCommit) && typeof lastCommit.message === 'string'
      ? oneLine(lastCommit.message)
      : null;
  const commitLink = head ? `${repoLink}/commit/${head}` : repoLink;

  switch (v.type) {
    case 'PushEvent': {
      if (isTag) {
        return {
          ...base,
          type: 'Tag',
          message: headMessage ?? `Tagged ${ref || 'a release'}`,
          url: commitLink,
        };
      }
      const count = num(payload.size) || commits.length;
      return {
        ...base,
        type: 'Commit',
        message:
          headMessage ??
          `Pushed ${count || 'a'} commit${count === 1 ? '' : 's'} to ${ref || 'the default branch'}`,
        url: commitLink,
      };
    }
    case 'CreateEvent': {
      const refType = typeof payload.ref_type === 'string' ? payload.ref_type : 'branch';
      if (refType === 'tag') {
        return { ...base, type: 'Tag', message: `Tagged ${ref || 'a release'}`, url: commitLink };
      }
      if (refType === 'repository') {
        return { ...base, type: 'Create', message: `Created ${base.repo}`, url: repoLink };
      }
      return { ...base, type: 'Create', message: `Created branch ${ref}`, url: repoLink };
    }
    case 'DeleteEvent': {
      const refType = typeof payload.ref_type === 'string' ? payload.ref_type : 'branch';
      return {
        ...base,
        type: 'Delete',
        message: `Deleted ${refType === 'tag' ? 'tag' : 'branch'} ${ref}`,
        url: repoLink,
      };
    }
    case 'ReleaseEvent': {
      const release = isRecord(payload.release) ? payload.release : {};
      const title =
        (typeof release.name === 'string' && release.name.trim()) ||
        (typeof release.tag_name === 'string' && release.tag_name) ||
        'a new version';
      return {
        ...base,
        type: 'Release',
        message: `Released ${oneLine(title)}`,
        url:
          typeof release.html_url === 'string' ? release.html_url : `${repoLink}/releases`,
      };
    }
    case 'PullRequestEvent': {
      const pr = isRecord(payload.pull_request) ? payload.pull_request : {};
      const action = typeof payload.action === 'string' ? payload.action : '';
      const verb =
        pr.merged === true ? 'Merged' : action === 'closed' ? 'Closed' : action === 'opened' ? 'Opened' : 'Updated';
      return {
        ...base,
        type: 'PR',
        message: `${verb}: ${oneLine(
          typeof pr.title === 'string' && pr.title ? pr.title : 'pull request',
        )}`,
        url: typeof pr.html_url === 'string' ? pr.html_url : `${repoLink}/pulls`,
      };
    }
    case 'IssuesEvent': {
      const issue = isRecord(payload.issue) ? payload.issue : {};
      const verb =
        payload.action === 'opened' ? 'Opened' : payload.action === 'closed' ? 'Closed' : 'Updated';
      return {
        ...base,
        type: 'Issue',
        message: `${verb} issue: ${oneLine(
          typeof issue.title === 'string' && issue.title ? issue.title : 'untitled',
        )}`,
        url: typeof issue.html_url === 'string' ? issue.html_url : `${repoLink}/issues`,
      };
    }
    case 'ForkEvent': {
      const forkee = isRecord(payload.forkee) ? payload.forkee : {};
      const target =
        typeof forkee.full_name === 'string' && forkee.full_name ? forkee.full_name : 'a fork';
      return {
        ...base,
        type: 'Fork',
        message: `Forked to ${target}`,
        url: typeof forkee.html_url === 'string' ? forkee.html_url : repoLink,
      };
    }
    default:
      // Star/watch/comment/member noise and anything newer than this mapping.
      return null;
  }
};

export const useForgeActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [nextRefresh, setNextRefresh] = useState(REFRESH_INTERVAL);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; reset: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!force && cached) {
        const { timestamp, activities: cachedActivities } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setActivities(cachedActivities);
          setLastUpdated(new Date(timestamp).toLocaleTimeString());
          setLoading(false);
          return;
        }
      }

      const res = await forge(ENDPOINT);
      const remaining = res.headers.get('X-RateLimit-Remaining');
      const reset = res.headers.get('X-RateLimit-Reset');
      if (remaining && reset) {
        setRateLimit({ remaining: Number(remaining), reset: Number(reset) * 1000 });
      }

      if (res.status === 403 || res.status === 429) {
        const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'unknown';
        throw new Error(`Rate limited by GitHub. Resets at ${resetTime}.`);
      }
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);

      const data: unknown = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format');

      const parsed = data
        .map(parseEvent)
        .filter((a): a is Activity => a !== null)
        .sort((a, b) => b.at - a.at);

      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), activities: parsed }));
      setActivities(parsed);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setNextRefresh(REFRESH_INTERVAL);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  useEffect(() => {
    const tick = setInterval(() => setNextRefresh((p) => Math.max(0, p - 1000)), 1000);
    return () => clearInterval(tick);
  }, []);

  return { activities, loading, error, lastUpdated, nextRefresh, rateLimit, refresh: fetchData };
};
