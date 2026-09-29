//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect, useCallback, useRef } from 'react';

export type ActivityType = 'Commit' | 'PR' | 'Fork' | 'Create' | 'Delete';

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

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: Record<string, unknown>;
}

const ENDPOINT = 'https://api.github.com/users/daedaevibin/events?per_page=30';
const CACHE_KEY = 'vz_tracker_cache';
const CACHE_DURATION = 10 * 60 * 1000;
export const REFRESH_INTERVAL = 5 * 60 * 1000;

const INTERESTING = ['PushEvent', 'PullRequestEvent', 'ForkEvent', 'CreateEvent', 'DeleteEvent'];

const parseEvent = (event: GitHubEvent): Activity | null => {
  const at = new Date(event.created_at).getTime();
  const base = { id: event.id, repo: event.repo.name, date: new Date(event.created_at).toLocaleDateString(), at };

  switch (event.type) {
    case 'PushEvent': {
      const payload = event.payload as { commits?: Array<{ message: string; sha: string }>; ref?: string };
      const commit = payload.commits?.[0];
      return {
        ...base,
        type: 'Commit',
        message: commit?.message ?? `Pushed to ${(payload.ref ?? '').replace('refs/heads/', '')}`,
        url: commit ? `https://github.com/${event.repo.name}/commit/${commit.sha}` : `https://github.com/${event.repo.name}`,
      };
    }
    case 'PullRequestEvent': {
      const payload = event.payload as {
        pull_request?: { title?: string };
        number?: number;
        action?: string;
      };
      const action = payload.action ?? 'unknown';
      const title = payload.pull_request?.title ?? `PR #${payload.number}`;
      return {
        ...base,
        type: 'PR',
        message: `${action.charAt(0).toUpperCase() + action.slice(1)}: ${title}`,
        url: `https://github.com/${event.repo.name}/pull/${payload.number}`,
      };
    }
    case 'ForkEvent': {
      const payload = event.payload as { forkee?: { html_url?: string } };
      return {
        ...base,
        type: 'Fork',
        message: `Forked ${event.repo.name}`,
        url: payload.forkee?.html_url ?? `https://github.com/${event.repo.name}`,
      };
    }
    case 'CreateEvent': {
      const payload = event.payload as { ref_type?: string; ref?: string };
      return {
        ...base,
        type: 'Create',
        message: `Created ${payload.ref_type} ${payload.ref ?? ''} in ${event.repo.name}`,
        url: `https://github.com/${event.repo.name}`,
      };
    }
    case 'DeleteEvent': {
      const payload = event.payload as { ref_type?: string; ref?: string };
      return {
        ...base,
        type: 'Delete',
        message: `Deleted ${payload.ref_type} ${payload.ref ?? ''} in ${event.repo.name}`,
        url: `https://github.com/${event.repo.name}`,
      };
    }
    default:
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

      const res = await fetch(ENDPOINT);
      const remaining = res.headers.get('X-RateLimit-Remaining');
      const reset = res.headers.get('X-RateLimit-Reset');
      if (remaining && reset) {
        setRateLimit({ remaining: Number(remaining), reset: Number(reset) * 1000 });
      }

      if (res.status === 403 || res.status === 429) {
        const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'unknown';
        throw new Error(`Rate limited by GitHub API. Resets at ${resetTime}.`);
      }
      if (!res.ok) throw new Error('Failed to fetch activity');

      const data: unknown = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format');

      const parsed = (data as GitHubEvent[])
        .filter((e) => INTERESTING.includes(e.type))
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
