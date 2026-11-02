//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect, useCallback, useRef } from 'react';
import { ORG, forge, isRecord, repoUrl } from '../lib/forgejo';

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

const FEED_LIMIT = 30;
const ENDPOINT = `/orgs/${ORG}/activities/feeds?limit=${FEED_LIMIT}`;
const CACHE_KEY = 'vz_tracker_cache_v2';
const CACHE_DURATION = 10 * 60 * 1000;
export const REFRESH_INTERVAL = 5 * 60 * 1000;
const MAX_MESSAGE = 140;

const oneLine = (text: string): string => {
  const first = text.split('\n')[0].trim();
  return first.length > MAX_MESSAGE ? `${first.slice(0, MAX_MESSAGE)}…` : first;
};

/**
 * Push actions store a JSON blob in `content`; everything else stores a plain
 * human-readable string. This reads whichever arrived and never throws.
 */
const readPush = (content: string): { message: string | null; sha: string | null } => {
  if (!content) return { message: null, sha: null };
  try {
    const parsed = JSON.parse(content) as {
      HeadCommit?: { Message?: string; Sha1?: string };
      Commits?: Array<{ Message?: string; Sha1?: string }>;
    };
    const head = parsed.HeadCommit ?? parsed.Commits?.[parsed.Commits.length - 1];
    return {
      message: head?.Message ? oneLine(head.Message) : null,
      sha: head?.Sha1 ?? null,
    };
  } catch {
    return { message: oneLine(content), sha: null };
  }
};

const parseAction = (v: unknown): Activity | null => {
  if (!isRecord(v)) return null;
  if (typeof v.id !== 'number') return null;

  const created = typeof v.created === 'string' ? v.created : '';
  const at = new Date(created).getTime();
  if (!at) return null;

  const repo = isRecord(v.repo) ? v.repo : null;
  if (!repo || typeof repo.full_name !== 'string') return null;

  const base = {
    id: String(v.id),
    repo: repo.full_name,
    date: new Date(at).toLocaleDateString(),
    at,
  };
  const repoLink =
    typeof repo.html_url === 'string' ? repo.html_url : repoUrl(repo.name as string);

  // `ref_name` arrives fully qualified: `refs/heads/main`, `refs/tags/v1.0`.
  const ref = (typeof v.ref_name === 'string' ? v.ref_name : '')
    .replace(/^refs\/(heads|tags)\//, '');
  const content = typeof v.content === 'string' ? v.content : '';
  const push = readPush(content);
  const commitLink = push.sha ? `${repoLink}/commit/${push.sha}` : repoLink;

  switch (v.op_type) {
    case 'commit_repo':
      return {
        ...base,
        type: 'Commit',
        message: push.message ?? `Pushed to ${ref || 'the default branch'}`,
        url: commitLink,
      };
    case 'push_tag':
      return {
        ...base,
        type: 'Tag',
        message: push.message ?? `Tagged ${ref}`,
        url: commitLink,
      };
    case 'create_branch':
      return { ...base, type: 'Create', message: `Created branch ${ref}`, url: repoLink };
    case 'delete_branch':
      return { ...base, type: 'Delete', message: `Deleted branch ${ref}`, url: repoLink };
    case 'delete_tag':
      return { ...base, type: 'Delete', message: `Deleted tag ${ref}`, url: repoLink };
    case 'publish_release':
      return {
        ...base,
        type: 'Release',
        message: `Released ${oneLine(content) || ref || 'a new version'}`,
        url: `${repoLink}/releases`,
      };
    case 'create_pull_request':
    case 'merge_pull_request':
    case 'close_pull_request': {
      const verb =
        v.op_type === 'create_pull_request'
          ? 'Opened'
          : v.op_type === 'merge_pull_request'
            ? 'Merged'
            : 'Closed';
      return {
        ...base,
        type: 'PR',
        message: `${verb}: ${oneLine(content) || 'pull request'}`,
        url: `${repoLink}/pulls`,
      };
    }
    case 'create_issue':
    case 'close_issue': {
      const verb = v.op_type === 'create_issue' ? 'Opened' : 'Closed';
      return {
        ...base,
        type: 'Issue',
        message: `${verb} issue: ${oneLine(content) || 'untitled'}`,
        url: `${repoLink}/issues`,
      };
    }
    case 'fork_repo':
      return { ...base, type: 'Fork', message: `Forked ${base.repo}`, url: repoLink };
    case 'create_repo':
      return { ...base, type: 'Create', message: `Created ${base.repo}`, url: repoLink };
    default:
      // Star/watch/repo-transfer noise and anything newer than this mapping.
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
        throw new Error(`Rate limited by git.gay. Resets at ${resetTime}.`);
      }
      if (!res.ok) throw new Error(`git.gay API ${res.status}`);

      const data: unknown = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format');

      const parsed = data
        .map(parseAction)
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
