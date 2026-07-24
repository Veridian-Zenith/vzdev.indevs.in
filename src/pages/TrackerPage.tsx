import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { GitCommit, GitPullRequest, RefreshCw, ExternalLink, GitFork, Plus, Clock, AlertTriangle } from 'lucide-react';
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
  payload: Record<string, unknown>;
}

const CACHE_KEY = 'vz_tracker_cache';
const CACHE_DURATION = 10 * 60 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;
const MANUAL_COOLDOWN = 30_000;

export const TrackerPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [nextRefresh, setNextRefresh] = useState(REFRESH_INTERVAL);
  const [cooldown, setCooldown] = useState(0);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; reset: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!force && cached) {
        const { timestamp, activities } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setActivities(activities);
          setLastUpdated(new Date(timestamp).toLocaleTimeString());
          setLoading(false);
          return;
        }
      }

      const res = await fetch('https://api.github.com/users/daedaevibin/events?per_page=30');
      const remaining = res.headers.get('X-RateLimit-Remaining');
      const reset = res.headers.get('X-RateLimit-Reset');
      if (remaining && reset) {
        setRateLimit({ remaining: Number(remaining), reset: Number(reset) * 1000 });
      }

      if (res.status === 403 || res.status === 429) {
        const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'unknown';
        throw new Error(`Rate limited by GitHub API. Resets at ${resetTime}. Try again later.`);
      }
      if (!res.ok) throw new Error('Failed to fetch activity');

      const data: unknown = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format');

      const parsed: Activity[] = (data as GitHubEvent[])
        .filter((event) => ['PushEvent', 'PullRequestEvent', 'ForkEvent', 'CreateEvent', 'DeleteEvent'].includes(event.type))
        .map((event): Activity | null => {
          switch (event.type) {
            case 'PushEvent': {
              const payload = event.payload as { commits?: Array<{ message: string; sha: string }>; ref?: string };
              const commit = payload.commits?.[0];
              return {
                id: event.id,
                type: 'Commit',
                message: commit?.message ?? `Pushed to ${(payload.ref ?? '').replace('refs/heads/', '')}`,
                repo: event.repo.name,
                url: commit ? `https://github.com/${event.repo.name}/commit/${commit.sha}` : `https://github.com/${event.repo.name}`,
                date: new Date(event.created_at).toLocaleDateString(),
              };
            }
            case 'PullRequestEvent': {
              const payload = event.payload as { pull_request?: { title?: string; head?: { ref?: string } }; number?: number; action?: string };
              const pr = payload.pull_request;
              const title = pr?.title ?? `PR #${payload.number}`;
              return {
                id: event.id,
                type: 'PR',
                message: `${(payload.action ?? 'unknown').charAt(0).toUpperCase() + (payload.action ?? '').slice(1)}: ${title}`,
                repo: event.repo.name,
                url: `https://github.com/${event.repo.name}/pull/${payload.number}`,
                date: new Date(event.created_at).toLocaleDateString(),
              };
            }
            case 'ForkEvent': {
              const payload = event.payload as { forkee?: { html_url?: string } };
              return {
                id: event.id,
                type: 'Fork',
                message: `Forked ${event.repo.name}`,
                repo: event.repo.name,
                url: payload.forkee?.html_url ?? `https://github.com/${event.repo.name}`,
                date: new Date(event.created_at).toLocaleDateString(),
              };
            }
            case 'CreateEvent': {
              const payload = event.payload as { ref_type?: string; ref?: string };
              return {
                id: event.id,
                type: 'Create',
                message: `Created ${payload.ref_type} ${payload.ref ?? ''} in ${event.repo.name}`,
                repo: event.repo.name,
                url: `https://github.com/${event.repo.name}`,
                date: new Date(event.created_at).toLocaleDateString(),
              };
            }
            case 'DeleteEvent': {
              const payload = event.payload as { ref_type?: string; ref?: string };
              return {
                id: event.id,
                type: 'Delete',
                message: `Deleted ${payload.ref_type} ${payload.ref ?? ''} in ${event.repo.name}`,
                repo: event.repo.name,
                url: `https://github.com/${event.repo.name}`,
                date: new Date(event.created_at).toLocaleDateString(),
              };
            }
            default:
              return null;
          }
        })
        .filter((a): a is Activity => a !== null);

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
    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  useEffect(() => {
    const tick = setInterval(() => {
      setNextRefresh(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const tick = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [cooldown]);

  const handleManualRefresh = () => {
    if (cooldown > 0) return;
    setCooldown(MANUAL_COOLDOWN);
    setNextRefresh(REFRESH_INTERVAL);
    fetchData(true);
  };

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'Commit': return <GitCommit className="text-primary-themeable" />;
      case 'PR': return <GitPullRequest className="text-primary-themeable" />;
      case 'Fork': return <GitFork className="text-primary-themeable" />;
      case 'Create': return <Plus className="text-primary-themeable" />;
      case 'Delete': return <Plus className="text-red-500" />;
    }
  };

  return (
    <div className="pt-32 pb-24 px-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-themeable mb-4 drop-shadow-[0_0_15px_var(--vz-glow-color)]">
          Digital Forge Activity
        </h1>
        <p className="text-secondary-themeable/60 text-sm italic">
          Live forge emissions from the Architect's workbench
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
        <button
          onClick={handleManualRefresh}
          disabled={loading || cooldown > 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-muted-themeable text-secondary-themeable hover:text-primary-themeable hover:border-primary-themeable transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          <RefreshCw size={14} className={`transition-all duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          {cooldown > 0 ? `${formatTime(cooldown)}` : loading ? 'Refreshing...' : 'Refresh'}
        </button>

        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-secondary-themeable/50 font-bold">
            <Clock size={11} />
            Last: {lastUpdated}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-secondary-themeable/50 font-bold">
          <RefreshCw size={11} className={nextRefresh < 60000 ? 'text-primary-themeable animate-pulse' : ''} />
          Next: {formatTime(nextRefresh)}
        </div>

        {rateLimit && (
          <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold ${
            rateLimit.remaining < 10 ? 'text-red-500' : 'text-secondary-themeable/50'
          }`}>
            <AlertTriangle size={11} />
            API: {rateLimit.remaining} remaining
          </div>
        )}
      </div>

      {loading && activities.length === 0 ? (
        <div className="flex justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          >
            <RefreshCw size={32} className="text-primary-themeable" />
          </motion.div>
        </div>
      ) : error && activities.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 text-red-500 text-sm font-medium">
            <AlertTriangle size={18} />
            {error}
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-500/70 text-xs">
              <AlertTriangle size={12} />
              {error} — showing cached data
            </div>
          )}
          <div className="grid gap-4">
            {activities.map((activity, i) => (
              <AnimatedCard key={activity.id} delay={i * 0.03}>
                <a href={activity.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="p-2 bg-primary-themeable/5 border border-muted-themeable rounded-xl group-hover:border-primary-themeable/30 transition-all">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-secondary-themeable group-hover:text-primary-themeable transition-colors text-sm truncate">{activity.message}</h3>
                    <p className="text-[10px] text-primary-themeable/50 uppercase tracking-wider mt-0.5">{activity.repo} &bull; {activity.date}</p>
                  </div>
                  <ExternalLink size={14} className="text-primary-themeable/20 group-hover:text-primary-themeable shrink-0 transition-colors" />
                </a>
              </AnimatedCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
