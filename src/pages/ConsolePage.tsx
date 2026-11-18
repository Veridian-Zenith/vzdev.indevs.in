//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Terminal, KeyRound, ShieldCheck, RefreshCw, AlertTriangle, GitPullRequest,
  CircleDot, PlayCircle, ExternalLink, LogOut, CheckCircle2, XCircle, Clock, Loader2,
} from 'lucide-react';
import { PageHeader, Section, SectionHead, Panel, fieldClass, labelClass } from '../components/Forge';
import {
  consoleApi, getToken, setToken, qualify,
  type Viewer, type RepoSummary, type Pull, type Issue, type Run, type RateLimit,
} from '../lib/console';

type LineKind = 'in' | 'out' | 'err';
interface Line { kind: LineKind; text: string }

/** Cross-repo commands sweep only the most recently pushed repos (one request each). */
const SWEEP = 3;

const ago = (iso: string): string => {
  const t = new Date(iso).getTime();
  if (!t) return '—';
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
};

const runTone = (run: Run): string => {
  if (run.conclusion === 'success') return 'text-emerald-400/80';
  if (run.conclusion === 'failure' || run.conclusion === 'timed_out') return 'text-red-400/80';
  if (run.conclusion === 'cancelled' || run.conclusion === 'skipped') return 'text-amber-100/35';
  return 'text-amber-300';
};

const RunIcon = ({ run }: { run: Run }) => {
  if (run.status !== 'completed') return <Loader2 size={13} className="animate-spin text-amber-300" />;
  if (run.conclusion === 'success') return <CheckCircle2 size={13} className="text-emerald-400/80" />;
  if (run.conclusion === 'failure' || run.conclusion === 'timed_out') return <XCircle size={13} className="text-red-400/80" />;
  return <Clock size={13} className="text-amber-100/35" />;
};

const EmptyRow = ({ text }: { text: string }) => (
  <p className="text-amber-100/25 text-xs font-mono px-4 py-5">{text}</p>
);

export const ConsolePage = () => {
  const [token, setTokenState] = useState(getToken());
  const [draft, setDraft] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [scopes, setScopes] = useState<string[]>([]);
  const [rate, setRate] = useState<RateLimit | null>(null);
  const [repos, setRepos] = useState<RepoSummary[]>([]);
  const [selected, setSelected] = useState('');

  const [pulls, setPulls] = useState<Pull[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', text: 'vz console — read-only GitHub session. type `help` for commands.' },
  ]);
  const [cmd, setCmd] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);

  const push = useCallback((...next: Line[]) => {
    setLines((prev) => [...prev, ...next].slice(-400));
  }, []);

  const connect = useCallback(async (candidate: string) => {
    setConnecting(true);
    setAuthError(null);
    try {
      const me = await consoleApi.viewer(candidate);
      const [granted, limits, org] = await Promise.all([
        consoleApi.scopes(candidate),
        consoleApi.rate(candidate),
        consoleApi.repos(candidate),
      ]);
      setToken(candidate);
      setTokenState(candidate);
      setViewer(me);
      setScopes(granted);
      setRate(limits);
      setRepos(org);
      setSelected((prev) => prev || org.find((r) => !r.archived)?.full_name || org[0]?.full_name || '');
      push({ kind: 'out', text: `connected as ${me.login} — ${org.length} repositories visible` });
    } catch (err) {
      setToken('');
      setTokenState('');
      setViewer(null);
      setAuthError(err instanceof Error ? err.message : 'could not authenticate');
    } finally {
      setConnecting(false);
    }
  }, [push]);

  // Restore a token that survived a reload within the same tab.
  useEffect(() => {
    if (getToken()) void connect(getToken());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = () => {
    setToken('');
    setTokenState('');
    setDraft('');
    setViewer(null);
    setScopes([]);
    setRate(null);
    setRepos([]);
    setSelected('');
    setPulls([]);
    setIssues([]);
    setRuns([]);
    push({ kind: 'out', text: 'session cleared — token removed from this tab' });
  };

  const loadDetail = useCallback(async (repo: string) => {
    if (!token || !repo) return;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const [p, i, r] = await Promise.all([
        consoleApi.pulls(token, repo),
        consoleApi.issues(token, repo),
        consoleApi.runs(token, repo),
      ]);
      setPulls(p);
      setIssues(i);
      setRuns(r);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'could not read repository');
      setPulls([]);
      setIssues([]);
      setRuns([]);
    } finally {
      setDetailLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (selected && viewer) void loadDetail(selected);
  }, [selected, viewer, loadDetail]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [lines]);

  const exec = async (raw: string) => {
    const input = raw.trim();
    if (!input) return;
    push({ kind: 'in', text: input });
    const [head, ...rest] = input.split(/\s+/);
    const arg = rest.join(' ');

    if (!token) {
      push({ kind: 'err', text: 'no session — connect a token first' });
      return;
    }

    const targets = arg ? [qualify(arg)] : repos.slice(0, SWEEP).map((r) => r.full_name);

    try {
      switch (head) {
        case 'help':
          push({ kind: 'out', text:
            'whoami · rate · repos · prs [repo] · issues [repo] · runs [repo] · open <repo> · clear\n' +
            `without a repo, prs/issues/runs sweep the ${SWEEP} most recently pushed repositories` });
          return;
        case 'whoami':
          push({ kind: 'out', text: `${viewer?.login ?? '?'} — scopes: ${scopes.length ? scopes.join(', ') : 'fine-grained'}` });
          return;
        case 'rate':
          push({ kind: 'out', text: rate ? `${rate.remaining}/${rate.limit} core requests left, resets ${new Date(rate.reset).toLocaleTimeString()}` : 'rate limit unavailable' });
          return;
        case 'repos':
          push({ kind: 'out', text: repos.map((r) => `${r.full_name.padEnd(34)} ${r.open_issues_count} open  ${ago(r.pushed_at)} ago`).join('\n') });
          return;
        case 'prs': {
          const found = (await Promise.all(targets.map(async (t) => [t, await consoleApi.pulls(token, t)] as const)))
            .flatMap(([t, list]) => list.map((p) => `#${p.number} ${p.title} [${t.split('/')[1]}]${p.draft ? ' (draft)' : ''}`));
          push({ kind: 'out', text: found.length ? found.join('\n') : 'no open pull requests' });
          return;
        }
        case 'issues': {
          const found = (await Promise.all(targets.map(async (t) => [t, await consoleApi.issues(token, t)] as const)))
            .flatMap(([t, list]) => list.map((i) => `#${i.number} ${i.title} [${t.split('/')[1]}] ${i.comments}💬`));
          push({ kind: 'out', text: found.length ? found.join('\n') : 'no open issues' });
          return;
        }
        case 'runs': {
          const found = (await Promise.all(targets.map(async (t) => [t, await consoleApi.runs(token, t)] as const)))
            .flatMap(([t, list]) => list.slice(0, 5).map((r) => `${(r.conclusion ?? r.status).padEnd(11)} ${r.name} [${t.split('/')[1]}] ${ago(r.created_at)}`));
          push({ kind: 'out', text: found.length ? found.join('\n') : 'no workflow runs' });
          return;
        }
        case 'open': {
          if (!arg) { push({ kind: 'err', text: 'usage: open <repo>' }); return; }
          window.open(`https://github.com/${qualify(arg)}`, '_blank', 'noopener,noreferrer');
          push({ kind: 'out', text: `opened ${qualify(arg)}` });
          return;
        }
        case 'clear':
          setLines([]);
          return;
        default:
          push({ kind: 'err', text: `unknown command: ${head}` });
      }
    } catch (err) {
      push({ kind: 'err', text: err instanceof Error ? err.message : 'command failed' });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = cmd;
    setCmd('');
    void exec(value);
  };

  const active = repos.find((r) => r.full_name === selected) ?? null;

  return (
    <div className="min-h-screen">
      <PageHeader
        fig="fig. 07 · console"
        title="Management console"
        lede="An authenticated, read-only view of the forge: repositories, pull requests, issues and workflow runs. The token stays in this tab."
      />

      {!viewer ? (
        <Section>
          <SectionHead index="fig. 07a" title="Access" />
          <Panel className="p-6 sm:p-8 max-w-xl">
            <div className="flex items-center gap-2 text-amber-300">
              <KeyRound size={16} />
              <h3 className="text-xs font-black uppercase tracking-[0.25em]">GitHub token</h3>
            </div>

            <p className="mt-4 text-xs text-amber-100/40 leading-relaxed">
              Paste a personal access token. Read-only is enough: <span className="text-amber-200/70">Metadata</span>,{' '}
              <span className="text-amber-200/70">Contents</span>,{' '}
              <span className="text-amber-200/70">Pull requests</span>,{' '}
              <span className="text-amber-200/70">Issues</span> and{' '}
              <span className="text-amber-200/70">Actions</span> read permission, plus{' '}
              <span className="text-amber-200/70">read:org</span> for a classic token.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); void connect(draft.trim()); }}
              className="mt-6 space-y-4"
            >
              <div>
                <label className={labelClass} htmlFor="token">token</label>
                <input
                  id="token"
                  type="password"
                  name="token"
                  autoComplete="off"
                  spellCheck={false}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="ghp_… or github_pat_…"
                  className={fieldClass}
                />
              </div>

              {authError && (
                <p className="flex items-start gap-2 text-red-400/80 text-xs font-mono">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {authError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={connecting || !draft.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  {connecting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  {connecting ? 'verifying' : 'connect'}
                </button>
                <a
                  href="https://github.com/settings/personal-access-tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-100/30 hover:text-amber-300 transition-colors"
                >
                  create a token <ExternalLink size={11} />
                </a>
              </div>
            </form>

            <div className="mt-8 pt-5 border-t border-amber-400/10 text-[10px] font-mono text-amber-100/25 leading-relaxed space-y-2">
              <p>
                Held in <span className="text-amber-100/40">sessionStorage</span>: it disappears when this tab
                closes and is never written to disk, a URL or a log.
              </p>
              <p>
                OAuth is not offered because GitHub&apos;s OAuth and device-flow endpoints on github.com send no
                CORS headers and need a client secret, which a static bundle cannot hold.
              </p>
            </div>
          </Panel>
        </Section>
      ) : (
        <>
          <Section className="pb-0">
            <SectionHead index="fig. 07b" title="Session" />

            <div className="flex flex-wrap items-center gap-4">
              <img
                src={viewer.avatar_url}
                alt=""
                className="w-10 h-10 rounded-full border border-amber-400/30"
                loading="lazy"
              />
              <div>
                <a
                  href={viewer.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-amber-200 hover:text-amber-100 transition-colors"
                >
                  {viewer.name ?? viewer.login}
                </a>
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-100/30">
                  {viewer.login} · {scopes.length ? scopes.join(' ') : 'fine-grained'}
                </p>
              </div>

              {rate && (
                <span className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-bold ${rate.remaining < 100 ? 'text-red-400' : 'text-amber-100/30'}`}>
                  <AlertTriangle size={11} /> {rate.remaining}/{rate.limit}
                </span>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => void loadDetail(selected)}
                  disabled={!selected || detailLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/25 text-amber-100/50 hover:text-amber-300 hover:border-amber-400/50 transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
                >
                  <RefreshCw size={12} className={detailLoading ? 'animate-spin' : ''} /> refresh
                </button>
                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/15 text-amber-100/35 hover:text-red-400 hover:border-red-400/40 transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  <LogOut size={12} /> sign out
                </button>
              </div>
            </div>
          </Section>

          <Section className="py-10">
            <SectionHead index="fig. 07c" title="Repository" />

            <div className="flex flex-wrap items-center gap-4">
              <label className="sr-only" htmlFor="repo">repository</label>
              <select
                id="repo"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className={`${fieldClass} max-w-xs`}
              >
                {repos.map((r) => (
                  <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
                ))}
              </select>

              {active && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] font-mono uppercase tracking-widest text-amber-100/30">
                  <span>{active.default_branch}</span>
                  <span>{active.stargazers_count}★</span>
                  <span>{active.forks_count} forks</span>
                  <span>pushed {ago(active.pushed_at)} ago</span>
                  {active.private && <span className="text-amber-300/70">private</span>}
                  {active.archived && <span className="text-red-400/70">archived</span>}
                </div>
              )}
            </div>

            {detailError && (
              <div className="mt-4 flex items-center gap-2 bg-red-500/[0.05] border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400/80 text-xs">
                <AlertTriangle size={12} /> {detailError}
              </div>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Panel className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <GitPullRequest size={14} className="text-amber-300" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Open pull requests</h3>
                  <span className="ml-auto text-[10px] font-mono text-amber-100/30">{pulls.length}</span>
                </div>
                {detailLoading ? <EmptyRow text="reading…" /> : pulls.length === 0 ? <EmptyRow text="none open" /> : (
                  <ul className="divide-y divide-amber-400/10">
                    {pulls.map((p) => (
                      <li key={p.number} className="py-2.5 first:pt-0 last:pb-0">
                        <a href={p.html_url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2">
                          <span className="text-[10px] font-mono text-amber-400/50 mt-0.5">#{p.number}</span>
                          <span className="flex-1 text-xs text-amber-100/60 group-hover:text-amber-200 transition-colors leading-snug">
                            {p.title}
                            {p.draft && <span className="ml-1.5 text-[9px] uppercase tracking-wider text-amber-100/25">draft</span>}
                          </span>
                        </a>
                        <p className="text-[9px] font-mono text-amber-400/30 mt-1 ml-6">
                          {p.user} · {p.head} → {p.base} · {ago(p.updated_at)} ago
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CircleDot size={14} className="text-amber-300" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Open issues</h3>
                  <span className="ml-auto text-[10px] font-mono text-amber-100/30">{issues.length}</span>
                </div>
                {detailLoading ? <EmptyRow text="reading…" /> : issues.length === 0 ? <EmptyRow text="none open" /> : (
                  <ul className="divide-y divide-amber-400/10">
                    {issues.map((i) => (
                      <li key={i.number} className="py-2.5 first:pt-0 last:pb-0">
                        <a href={i.html_url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2">
                          <span className="text-[10px] font-mono text-amber-400/50 mt-0.5">#{i.number}</span>
                          <span className="flex-1 text-xs text-amber-100/60 group-hover:text-amber-200 transition-colors leading-snug">{i.title}</span>
                        </a>
                        <p className="text-[9px] font-mono text-amber-400/30 mt-1 ml-6">
                          {i.user} · {i.comments} comments · {ago(i.updated_at)} ago
                          {i.labels.slice(0, 3).map((l) => (
                            <span key={l.name} className="ml-1.5 text-amber-300/50">[{l.name}]</span>
                          ))}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            <Panel className="p-5 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <PlayCircle size={14} className="text-amber-300" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Workflow runs</h3>
                <span className="ml-auto text-[10px] font-mono text-amber-100/30">{runs.length}</span>
              </div>
              {detailLoading ? <EmptyRow text="reading…" /> : runs.length === 0 ? <EmptyRow text="no runs recorded" /> : (
                <ul className="divide-y divide-amber-400/10">
                  {runs.map((r) => (
                    <li key={r.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                      <RunIcon run={r} />
                      <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-amber-100/60 hover:text-amber-200 transition-colors truncate">
                        {r.name} <span className="text-amber-400/40">#{r.number}</span>
                      </a>
                      <span className={`text-[9px] font-mono uppercase tracking-widest ${runTone(r)}`}>
                        {r.conclusion ?? r.status}
                      </span>
                      <span className="text-[9px] font-mono text-amber-400/25 w-14 text-right">{r.event}</span>
                      <span className="text-[9px] font-mono text-amber-400/25 w-10 text-right">{ago(r.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </Section>

          <Section className="pt-0">
            <SectionHead index="fig. 07d" title="Console" />

            <div className="relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-400/15 bg-amber-500/[0.03]">
                <Terminal size={12} className="text-amber-300" />
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-300/70">vz@console</span>
                <span className="ml-auto text-[9px] font-mono text-amber-100/20">read-only</span>
              </div>

              <div ref={feedRef} className="max-h-80 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-relaxed">
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.kind === 'in'
                        ? 'text-amber-300'
                        : line.kind === 'err'
                          ? 'text-red-400/80'
                          : 'text-amber-100/45'
                    }
                  >
                    {line.kind === 'in' && <span className="text-amber-400/40">$ </span>}
                    <span className="whitespace-pre-wrap break-words">{line.text}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-amber-400/15 px-4 py-2.5">
                <span className="text-amber-400/50 font-mono text-[11px]">$</span>
                <input
                  value={cmd}
                  onChange={(e) => setCmd(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="console command"
                  placeholder="help"
                  className="flex-1 bg-transparent border-none outline-none text-amber-200 font-mono text-[11px] placeholder-amber-100/20"
                />
              </form>
            </div>
          </Section>
        </>
      )}
    </div>
  );
};
