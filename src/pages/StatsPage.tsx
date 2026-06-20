//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Box, Star, GitFork, ExternalLink, RefreshCw, Code, Cpu, FileJson, Terminal, Layout, type LucideIcon } from 'lucide-react';
import { AnimatedCard } from '../components/Common';
import { cn } from '../utils/cn';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';

interface Repo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
}

interface CacheData {
  timestamp: number;
  orgRepos: Repo[];
  userRepos: Repo[];
}

const CACHE_KEY = 'vz_github_stats_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const LANGUAGE_ICONS: Record<string, LucideIcon> = {
  'C++': Cpu,
  'Rust': Cpu,
  'Zig': Cpu,
  'TypeScript': FileJson,
  'JavaScript': FileJson,
  'Python': Terminal,
  'Lua': Terminal,
  'HTML': Layout,
  'CSS': Layout,
};

const getLanguageIcon = (lang: string) => {
  return LANGUAGE_ICONS[lang] || Code;
};

export const StatsPage = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [orgRepos, setOrgRepos] = useState<Repo[]>([]);
  const [userRepos, setUserRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!force && cached) {
        const { timestamp, orgRepos, userRepos } = JSON.parse(cached) as CacheData;
        if (Date.now() - timestamp < CACHE_DURATION) {
          setTimeout(() => {
            setOrgRepos(orgRepos);
            setUserRepos(userRepos);
            setLastUpdated(new Date(timestamp).toLocaleString());
            setLoading(false);
          }, 0);
          return;
        }
      }

      const [orgRes, userRes] = await Promise.all([
        fetch('https://api.github.com/orgs/Veridian-Zenith/repos?per_page=100'),
        fetch('https://api.github.com/users/daedaevibin/repos?per_page=100')
      ]);

      if (!orgRes.ok || !userRes.ok) {
        throw new Error('Failed to fetch data from GitHub API');
      }

      const orgData = await orgRes.json();
      const userData = await userRes.json();

      const cacheObj: CacheData = {
        timestamp: Date.now(),
        orgRepos: orgData,
        userRepos: userData,
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
      setOrgRepos(orgData);
      setUserRepos(userData);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const renderRepoList = (title: string, repos: Repo[], indexOffset: number) => (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="h-8 w-1 bg-primary-themeable shadow-[0_0_10px_var(--vz-glow-color)]" />
        <h2 className="text-2xl font-bold text-primary-themeable uppercase tracking-widest">{title}</h2>
      </motion.div>

      <div className={cn(
        "grid gap-6",
        isMobile ? "flex overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-8 px-8" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {repos.map((repo, i) => (
          <div
            key={repo.name}
            className={cn(isMobile && "min-w-[85vw] snap-center")}
          >
            <AnimatedCard
              delay={(indexOffset + i) * 0.05}
              className="flex flex-col h-full group border-muted-themeable hover:border-primary-themeable/50 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary-themeable rounded-lg text-primary-themeable border border-muted-themeable group-hover:rotate-12 transition-transform">
                    <Box size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-primary-themeable tracking-tight truncate max-w-[200px]">{repo.name}</h3>
                </div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-themeable hover:text-primary-themeable transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>

              <p className="text-secondary-themeable text-sm mb-6 line-clamp-2 flex-grow">
                {repo.description || t('repo.no_description')}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-muted-themeable">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-secondary-themeable rounded-md border border-muted-themeable text-primary-themeable">
                      {(() => {
                        const Icon = getLanguageIcon(repo.language || '');
                        return <Icon size={10} />;
                      })()}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-primary-themeable font-bold">
                      {repo.language || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-secondary-themeable">
                    <Star size={12} className="text-primary-themeable" />
                    <span className="text-xs font-bold">{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1 text-secondary-themeable">
                    <GitFork size={12} className="text-primary-themeable" />
                    <span className="text-xs font-bold">{repo.forks_count}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading && !lastUpdated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-themeable">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw size={48} className="text-primary-themeable" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-themeable/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl sm:text-7xl font-bold text-primary-themeable mb-6 drop-shadow-[0_0_15px_var(--vz-glow-color)]">
          {t('stats.title')}
        </h1>
        <div className="flex items-center justify-center gap-4 text-secondary-themeable/60 text-sm font-medium uppercase tracking-widest">
          <span>{t('stats.index')}</span>
          <span className="w-1 h-1 bg-muted-themeable rounded-full" />
          <span>{t('stats.updated')} {lastUpdated}</span>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-center mb-8">
          {error}
        </div>
      )}

      {renderRepoList(t('stats.org_artifacts'), orgRepos, 0)}
      {renderRepoList(t('stats.personal_artifacts'), userRepos, orgRepos.length)}

      <div className="flex justify-center mt-12">
        <button
          onClick={() => fetchData(true)}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-muted-themeable text-secondary-themeable hover:text-primary-themeable hover:border-primary-themeable transition-all text-xs font-bold uppercase tracking-widest group"
        >
          <RefreshCw size={14} className={cn("group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
          {loading ? t('stats.updating') : t('stats.force_refresh')}
        </button>
      </div>
    </div>
  );
};

