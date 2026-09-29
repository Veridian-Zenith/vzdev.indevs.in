//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect } from 'react';
import { RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { PageHeader, Section, SectionHead, SignalFeed } from '../components/Forge';
import { useForgeActivity } from '../hooks/useForgeActivity';

const MANUAL_COOLDOWN = 30_000;

const formatTime = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const TrackerPage = () => {
  const { activities, loading, error, lastUpdated, nextRefresh, rateLimit, refresh } = useForgeActivity();
  const [cooldown, setCooldown] = useState(0);

  const handleManualRefresh = () => {
    if (cooldown > 0) return;
    setCooldown(MANUAL_COOLDOWN);
    void refresh(true);
  };

  // cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const tick = setInterval(() => setCooldown((p) => Math.max(0, p - 1000)), 1000);
    return () => clearInterval(tick);
  }, [cooldown]);

  return (
    <div className="min-h-screen">
      <PageHeader
        fig="fig. 06 · tracker"
        title="Forge activity"
        lede="Live emissions from the Architect's workbench, in the order they happened."
      />

      <Section>
        <SectionHead index="fig. 06a" title="Signal" />

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-10">
          <button
            onClick={handleManualRefresh}
            disabled={loading || cooldown > 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-400/30 text-amber-100/50 hover:text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/5 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            {cooldown > 0 ? formatTime(cooldown) : loading ? 'refreshing' : 'refresh'}
          </button>

          {lastUpdated && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-100/30 font-bold">
              <Clock size={11} /> last: {lastUpdated}
            </span>
          )}

          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-100/30 font-bold">
            <RefreshCw size={11} className={nextRefresh < 60000 ? 'text-amber-300 animate-pulse' : ''} />
            next: {formatTime(nextRefresh)}
          </span>

          {rateLimit && (
            <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold ${rateLimit.remaining < 10 ? 'text-red-400' : 'text-amber-100/30'}`}>
              <AlertTriangle size={11} /> api: {rateLimit.remaining} remaining
            </span>
          )}
        </div>

        {loading && activities.length === 0 ? (
          <div className="flex justify-center py-20">
            <RefreshCw size={28} className="text-amber-300 animate-spin" />
          </div>
        ) : error && activities.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 bg-red-500/[0.06] border border-red-500/25 rounded-2xl px-6 py-4 text-red-400 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-8 flex items-center gap-2 bg-red-500/[0.05] border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400/80 text-xs">
                <AlertTriangle size={12} /> {error} — showing cached data
              </div>
            )}
            {activities.length > 0 ? (
              <SignalFeed
                rows={activities.map((a) => ({ t: a.date, e: a.type.toLowerCase(), m: a.message, r: a.repo }))}
              />
            ) : (
              <p className="text-amber-100/30 text-sm font-mono border border-amber-400/15 rounded-2xl p-6">
                no signal recorded yet
              </p>
            )}
          </>
        )}
      </Section>
    </div>
  );
};
