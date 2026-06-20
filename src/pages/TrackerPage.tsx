//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { GitCommit, GitPullRequest, RefreshCw, ExternalLink, GitFork, Plus } from 'lucide-react';
import { AnimatedCard } from '../components';

interface Activity {
  id: string;
  type: 'Commit' | 'PR' | 'Fork' | 'Create' | 'Delete';
  message: string;
  repo: string;
  url: string;
  date: string;
}

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const CACHE_KEY = 'vz_tracker_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const TrackerPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!force && cached) {
        const { timestamp, activities } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setActivities(activities);
          setLoading(false);
          return;
        }
      }

      const res = await fetch('https://api.github.com/users/daedaevibin/events?per_page=30');
      if (!res.ok) throw new Error('Failed to fetch activity');

      const data: unknown = await res.json();
      
      if (!Array.isArray(data)) throw new Error('Invalid data format');

      const parsed: Activity[] = (data as GitHubEvent[])
        .filter((event) => ['PushEvent', 'PullRequestEvent', 'ForkEvent', 'CreateEvent', 'DeleteEvent'].includes(event.type))
        .map((event): Activity | null => {
          switch (event.type) {
            case 'PushEvent': {
              const commit = event.payload.commits && event.payload.commits.length > 0 ? event.payload.commits[0] : null;
              return {
                id: event.id,
                type: 'Commit',
                message: commit ? commit.message : `Pushed to ${event.payload.ref.replace('refs/heads/', '')}`,
                repo: event.repo.name,
                url: commit ? `https://github.com/${event.repo.name}/commit/${commit.sha}` : `https://github.com/${event.repo.name}`,
                date: new Date(event.created_at).toLocaleDateString(),
              } as Activity;
            }
            case 'PullRequestEvent': {
              const pr = event.payload.pull_request;
              const title = pr.title || `PR #${event.payload.number}: ${pr.head?.ref || 'unknown'}`;
              return {
                id: event.id,
                type: 'PR',
                message: `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)}: ${title}`,
                repo: event.repo.name,
                url: `https://github.com/${event.repo.name}/pull/${event.payload.number}`,
                date: new Date(event.created_at).toLocaleDateString(),
              } as Activity;
            }
            case 'ForkEvent': {
              return {
                id: event.id,
                type: 'Fork',
                message: `Forked ${event.repo.name}`,
                repo: event.repo.name,
                url: event.payload.forkee.html_url,
                date: new Date(event.created_at).toLocaleDateString(),
              } as Activity;
            }
            case 'CreateEvent': {
              return {
                id: event.id,
                type: 'Create',
                message: `Created ${event.payload.ref_type} ${event.payload.ref || ''} in ${event.repo.name}`,
                repo: event.repo.name,
                url: `https://github.com/${event.repo.name}`,
                date: new Date(event.created_at).toLocaleDateString(),
              } as Activity;
            }
            case 'DeleteEvent': {
              return {
                id: event.id,
                type: 'Delete',
                message: `Deleted ${event.payload.ref_type} ${event.payload.ref || ''} in ${event.repo.name}`,
                repo: event.repo.name,
                url: `https://github.com/${event.repo.name}`,
                date: new Date(event.created_at).toLocaleDateString(),
              } as Activity;
            }
            default:
              return null;
          }
        })

        .filter((a: Activity | null): a is Activity => a !== null);

      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), activities: parsed }));
      setActivities(parsed);
    } catch (err) {
      console.error(err);
      setError(`Unable to fetch live data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'Commit': return <GitCommit className="text-primary-themeable" />;
      case 'PR': return <GitPullRequest className="text-primary-themeable" />;
      case 'Fork': return <GitFork className="text-primary-themeable" />;
      case 'Create': return <Plus className="text-primary-themeable" />;
      case 'Delete': return <Plus className="text-red-500" />;
      default: return <GitCommit className="text-primary-themeable" />;
    }
  };

  return (
    <div className="pt-32 pb-24 px-8 max-w-4xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-primary-themeable mb-12 text-center"
      >
        Digital Forge Activity
      </motion.h1>
      
      {loading ? (
        <div className="flex justify-center text-primary-themeable"><RefreshCw className="animate-spin" /></div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity, i) => (
            <AnimatedCard key={activity.id} delay={i * 0.05}>
              <a href={activity.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                {getIcon(activity.type)}
                <div className="flex-grow">
                  <h3 className="font-bold text-secondary-themeable group-hover:text-primary-themeable transition-colors">{activity.message}</h3>
                  <p className="text-xs text-primary-themeable/60">{activity.repo} • {activity.date}</p>
                </div>
                <ExternalLink size={16} className="text-primary-themeable/30 group-hover:text-primary-themeable" />
              </a>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
};
