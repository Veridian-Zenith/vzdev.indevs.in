//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState } from 'react';
import { GitCommit, ExternalLink, History } from 'lucide-react';
import { useRepoHistory } from '../hooks/useRepoHistory';

const PAGE = 15;

export const RepoHistoryPanel = ({ repoName }: { repoName: string }) => {
  const { commits, months, total, since, loading, error } = useRepoHistory(repoName);
  const [showAll, setShowAll] = useState(false);

  const sinceLabel = new Date(since).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <span className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/50">
          <History size={11} /> history
        </span>
        {total > 0 && (
          <span className="text-[10px] font-mono text-amber-100/30">
            {total} commit{total === 1 ? '' : 's'} · since {sinceLabel}
          </span>
        )}
      </div>

      {/* Monthly breakdown — the 3-month shape at a glance */}
      {months.length > 0 && (
        <div className="flex items-end gap-1.5 h-16 mb-5">
          {months.map((m) => {
            const max = Math.max(...months.map((x) => x.count));
            const h = Math.max(10, Math.round((m.count / max) * 100));
            return (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-mono text-amber-200/70">{m.count}</span>
                <div
                  className="w-full rounded-sm bg-gradient-to-t from-amber-600/40 to-amber-400/70"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] font-mono text-amber-100/30 truncate">{m.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="text-amber-100/30 text-sm font-mono border border-amber-400/15 rounded-2xl p-6">
          reading history…
        </div>
      ) : error ? (
        <div className="text-red-400/70 text-xs font-mono border border-red-500/20 rounded-2xl p-5">
          history unavailable — {error}
        </div>
      ) : commits.length === 0 ? (
        <div className="text-amber-100/30 text-sm font-mono border border-amber-400/15 rounded-2xl p-6">
          no commits in the last 3 months
        </div>
      ) : (
        <>
          <ol className="relative pl-6 sm:pl-7">
            <span className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-amber-400/50 via-amber-400/15 to-transparent" />
            {commits.slice(0, showAll ? commits.length : PAGE).map((c) => (
              <li key={c.sha} className="relative pb-5 last:pb-0">
                <span className="absolute -left-6 sm:-left-7 top-1.5 w-2 h-2 rounded-full bg-amber-400/70 ring-4 ring-black" />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-amber-400/60 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                  >
                    {c.date}
                    <ExternalLink size={9} />
                  </a>
                  <span className="text-[9px] font-mono text-amber-300/50">{c.author}</span>
                </div>
                <p className="text-sm text-amber-100/55 mt-1.5 leading-relaxed break-words">
                  <GitCommit size={11} className="inline mr-1.5 -mt-0.5 text-amber-300/50" />
                  {c.message}
                </p>
              </li>
            ))}
          </ol>

          {commits.length > PAGE && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300/60 hover:text-amber-300 transition-colors"
            >
              {showAll ? 'show less' : `show all ${commits.length}`}
            </button>
          )}
        </>
      )}
    </div>
  );
};
