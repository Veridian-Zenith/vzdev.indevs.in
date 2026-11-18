//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  Terminal, KeyRound, ShieldCheck, RefreshCw, AlertTriangle, GitPullRequest, CircleDot,
  PlayCircle, ExternalLink, LogOut, CheckCircle2, XCircle, Clock, Loader2, Lock, MessageSquare,
  RotateCw, Ban, X, Plus, Search, ShieldAlert,
} from 'lucide-react';
import { PageHeader, Section, SectionHead, Panel, fieldClass, labelClass } from '../components/Forge';
import {
  consoleApi, getToken, setToken, qualify, isGhFailure, capForPermission,
  ALL_CAPS, CAP_LABEL, CAP_PERMISSION,
  type Caps, type Capability, type CapState, type Viewer, type RepoSummary, type Pull,
  type Issue, type Run, type RateLimit,
} from '../lib/console';

type Line = { kind: 'in' | 'out' | 'err'; text: string };
type Tab = 'pulls' | 'issues' | 'runs';
type Notice = { tone: 'ok' | 'err'; text: string };

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

const describe = (e: unknown): string => {
  if (!isGhFailure(e)) return e instanceof Error ? e.message : 'action failed';
  const needs = e.needs.length ? ` — needs ${e.needs.join(', ')}` : '';
  const scope = e.scopes.length ? ` (classic scope: ${e.scopes.join(', ')})` : '';
  return `${e.message}${needs}${scope}`;
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
  <p className="text-amber-100/25 text-xs font-mono px-4 py-6">{text}</p>
);

const CapChip = ({ cap, state }: { cap: Capability; state: CapState }) => {
  const tone =
    state === 'granted'
      ? 'border-emerald-400/25 text-emerald-300/70'
      : state === 'denied'
        ? 'border-red-400/25 text-red-400/60'
        : 'border-dashed border-amber-400/20 text-amber-100/30';
  return (
    <span
      title={`${CAP_PERMISSION[cap]} — ${state === 'granted' ? 'allowed' : state === 'denied' ? 'not allowed' : 'not reported; will try'}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono ${tone}`}
    >
      {state === 'granted' ? <CheckCircle2 size={10} /> : state === 'denied' ? <Lock size={10} /> : <ShieldAlert size={10} />}
      {CAP_LABEL[cap]}
    </span>
  );
};

const Btn = ({
  children, onClick, disabled, title, tone = 'ghost', busy,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone?: 'ghost' | 'danger';
  busy?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || busy}
    title={title}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
      tone === 'danger'
        ? 'border-red-400/25 text-red-400/70 hover:border-red-400/50 hover:text-red-300'
        : 'border-amber-400/20 text-amber-100/45 hover:text-amber-300 hover:border-amber-400/40'
    }`}
  >
    {busy ? <Loader2 size={10} className="animate-spin" /> : children}
  </button>
);

export const ConsolePage = () => {
  const [token, setTokenState] = useState(getToken());
  const [draft, setDraft] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [kind, setKind] = useState<'classic' | 'fine-grained'>('fine-grained');
  const [scopes, setScopes] = useState<string[]>([]);
  const [caps, setCaps] = useState<Caps | null>(null);
  const [rate, setRate] = useState<RateLimit | null>(null);
  const [repos, setRepos] = useState<RepoSummary[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState('');
  const [tab, setTab] = useState<Tab>('pulls');

  const [pulls, setPulls] = useState<Pull[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [composer, setComposer] = useState<string | null>(null);
  const [composerText, setComposerText] = useState('');
  const [newIssue, setNewIssue] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueBody, setIssueBody] = useState('');

  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', text: 'vz console — read-only shell. type `help` for commands; write actions live in the panels above.' },
  ]);
  const [cmd, setCmd] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);

  const push = useCallback((...next: Line[]) => {
    setLines((prev) => [...prev, ...next].slice(-400));
  }, []);

  const connect = useCallback(async (candidate: string, probeRepo?: string) => {
    setConnecting(true);
    setAuthError(null);
    try {
      const c = await consoleApi.connect(candidate, probeRepo);
      setToken(candidate);
      setTokenState(candidate);
      setViewer(c.viewer);
      setKind(c.kind);
      setScopes(c.scopes);
      setCaps(c.caps);
      setRate(c.rate);
      setRepos(c.repos);
      setSelected((prev) => prev || c.repos.find((r) => !r.archived)?.full_name || c.repos[0]?.full_name || '');
      push({ kind: 'out', text: `connected as ${c.viewer.login} (${c.kind}, ${c.repos.length} repos)` });
    } catch (err) {
      setToken('');
      setTokenState('');
      setViewer(null);
      setCaps(null);
      setAuthError(describe(err));
    } finally {
      setConnecting(false);
    }
  }, [push]);

  useEffect(() => {
    if (getToken()) void connect(getToken());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = () => {
    setToken('');
    setTokenState('');
    setDraft('');
    setViewer(null);
    setCaps(null);
    setRate(null);
    setRepos([]);
    setSelected('');
    setPulls([]);
    setIssues([]);
    setRuns([]);
    setNotice(null);
    setArmed(null);
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
      setDetailError(describe(err));
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

  // A second click confirms; the arming expires so it cannot be clicked later by accident.
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(null), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  const can = (cap: Capability): boolean => caps?.[cap] !== 'denied';
  const why = (cap: Capability): string =>
    caps?.[cap] === 'denied'
      ? `needs ${CAP_PERMISSION[cap]}`
      : caps?.[cap] === 'unknown'
        ? `${CAP_PERMISSION[cap]} not confirmed — the action will tell you`
        : `${CAP_PERMISSION[cap]}`;

  const markCap = (cap: Capability, state: CapState) =>
    setCaps((prev) => (prev ? { ...prev, [cap]: state } : prev));

  const act = async (key: string, cap: Capability, fn: () => Promise<void>, okText: string) => {
    setBusy(key);
    setNotice(null);
    try {
      await fn();
      markCap(cap, 'granted');
      setNotice({ tone: 'ok', text: okText });
      if (selected) await loadDetail(selected);
    } catch (err) {
      if (isGhFailure(err)) {
        const missing = capForPermission(err.needs);
        if (missing) markCap(missing, 'denied');
      }
      setNotice({ tone: 'err', text: describe(err) });
    } finally {
      setBusy(null);
      setArmed(null);
    }
  };

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
            `without a repo, prs/issues/runs sweep the ${SWEEP} most recently pushed repositories. ` +
            'writes (comment, close, merge, re-run) are buttons in the panels above.' });
          return;
        case 'whoami':
          push({ kind: 'out', text: `${viewer?.login ?? '?'} — ${kind}, scopes: ${scopes.length ? scopes.join(', ') : 'not reported'}` });
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
      push({ kind: 'err', text: describe(err) });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = cmd;
    setCmd('');
    void exec(value);
  };

  const active = repos.find((r) => r.full_name === selected) ?? null;
  const visibleRepos = repos.filter((r) => r.full_name.toLowerCase().includes(filter.trim().toLowerCase()));
  const repoShort = selected.split('/')[1] ?? '';

  const sendComment = async (key: string, number: number) => {
    const body = composerText.trim();
    if (!body) return;
    await act(`comment:${key}`, 'issues:write',
      () => consoleApi.comment(token, selected, number, body),
      `commented on #${number}`);
    setComposer(null);
    setComposerText('');
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        fig="fig. 07 · console"
        title="Management console"
        lede="Remote control for the forge. Connect a token and the console shows exactly what it is allowed to read and change — and only offers the actions it can actually perform."
      />

      {!viewer ? (
        <Section>
          <SectionHead index="fig. 07a" title="Access" />
          <Panel className="p-6 sm:p-8 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-300">
              <KeyRound size={16} />
              <h3 className="text-xs font-black uppercase tracking-[0.25em]">Connect a GitHub token</h3>
            </div>

            <p className="mt-3 text-xs text-amber-100/40 leading-relaxed">
              Anyone holding a token that can see these repositories can use this console — GitHub decides
              what each token may do, and the console mirrors that decision.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); void connect(draft.trim()); }} className="mt-6 space-y-4">
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
                  {connecting ? 'inspecting token' : 'connect'}
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

            <div className="mt-8 pt-5 border-t border-amber-400/10 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/40 mb-2">to look</p>
                <ul className="space-y-1 text-[11px] font-mono text-amber-100/35">
                  <li>Metadata · read</li>
                  <li>Contents · read</li>
                  <li>Pull requests · read</li>
                  <li>Issues · read</li>
                  <li>Actions · read</li>
                </ul>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/40 mb-2">to act</p>
                <ul className="space-y-1 text-[11px] font-mono text-amber-100/35">
                  <li>Issues · write <span className="text-amber-100/20">— comment, close</span></li>
                  <li>Pull requests · write <span className="text-amber-100/20">— close</span></li>
                  <li>Contents · write <span className="text-amber-100/20">— merge</span></li>
                  <li>Actions · write <span className="text-amber-100/20">— re-run, cancel</span></li>
                  <li className="pt-1 text-amber-100/20">classic token: <span className="text-amber-100/30">repo</span> covers all of it</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-400/10 text-[10px] font-mono text-amber-100/25 leading-relaxed space-y-1.5">
              <p>
                Kept in <span className="text-amber-100/40">sessionStorage</span> — gone when this tab closes,
                never written to disk, a URL or a log.
              </p>
              <p>
                OAuth is not offered: GitHub&apos;s OAuth and device-flow endpoints on github.com send no CORS
                headers and need a client secret a static bundle cannot hold.
              </p>
            </div>
          </Panel>
        </Section>
      ) : (
        <>
          <Section className="pb-0">
            <SectionHead index="fig. 07b" title="Session" />

            <div className="flex flex-wrap items-center gap-4">
              <img src={viewer.avatar_url} alt="" className="w-10 h-10 rounded-full border border-amber-400/30" loading="lazy" />
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
                  {viewer.login} · {kind} · {scopes.length ? scopes.join(' ') : 'scopes not reported'}
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
            <SectionHead index="fig. 07c" title="What this token can do" />

            {caps && (
              <>
                <div className="flex flex-wrap gap-2">
                  {ALL_CAPS.slice(0, 5).map((c) => <CapChip key={c} cap={c} state={caps[c]} />)}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ALL_CAPS.slice(5).map((c) => <CapChip key={c} cap={c} state={caps[c]} />)}
                </div>

                <p className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono text-amber-100/25">
                  <ShieldAlert size={11} />
                  dashed = not reported by the token. Reads are probed; a write is only proven once it succeeds.
                  <a
                    href="https://github.com/settings/personal-access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-400/50 hover:text-amber-300 transition-colors"
                  >
                    adjust permissions <ExternalLink size={10} />
                  </a>
                </p>
              </>
            )}
          </Section>

          <Section className="py-0">
            <SectionHead index="fig. 07d" title="Repository" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-100/25" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="filter"
                  aria-label="filter repositories"
                  className={`${fieldClass} pl-9 max-w-[10rem]`}
                />
              </div>

              <label className="sr-only" htmlFor="repo">repository</label>
              <select
                id="repo"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className={`${fieldClass} max-w-xs`}
              >
                {visibleRepos.map((r) => (
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

            {notice && (
              <div className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-2.5 text-xs border ${notice.tone === 'ok' ? 'bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-300/80' : 'bg-red-500/[0.05] border-red-500/20 text-red-400/80'}`}>
                {notice.tone === 'ok' ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> : <AlertTriangle size={13} className="mt-0.5 shrink-0" />}
                <span className="flex-1">{notice.text}</span>
                <button onClick={() => setNotice(null)} aria-label="dismiss" className="opacity-50 hover:opacity-100">
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="mt-6 flex items-center gap-1 border-b border-amber-400/15">
              {([
                ['pulls', `pull requests (${pulls.length})`, GitPullRequest],
                ['issues', `issues (${issues.length})`, CircleDot],
                ['runs', `runs (${runs.length})`, PlayCircle],
              ] as const).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 -mb-px text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-colors ${
                    tab === key
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-amber-100/30 hover:text-amber-200/60'
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}

              {tab === 'issues' && (
                <button
                  onClick={() => setNewIssue((v) => !v)}
                  disabled={!can('issues:write')}
                  title={why('issues:write')}
                  className="ml-auto mb-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/20 text-[10px] font-mono uppercase tracking-wider text-amber-100/45 hover:text-amber-300 hover:border-amber-400/40 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={11} /> new issue
                </button>
              )}
            </div>

            {tab === 'issues' && newIssue && (
              <Panel className="p-5 mt-5">
                <div className="space-y-3">
                  <input
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="title"
                    className={fieldClass}
                  />
                  <textarea
                    value={issueBody}
                    onChange={(e) => setIssueBody(e.target.value)}
                    placeholder="describe it"
                    rows={3}
                    className={fieldClass}
                  />
                  <div className="flex items-center gap-2">
                    <Btn
                      busy={busy === 'new-issue'}
                      disabled={!issueTitle.trim()}
                      onClick={() => {
                        const title = issueTitle.trim();
                        const body = issueBody.trim();
                        void act('new-issue', 'issues:write',
                          async () => { await consoleApi.createIssue(token, selected, title, body); },
                          `opened "${title}"`);
                        setIssueTitle('');
                        setIssueBody('');
                        setNewIssue(false);
                      }}
                    >
                      <Plus size={11} /> open issue
                    </Btn>
                    <Btn onClick={() => setNewIssue(false)}><X size={11} /> cancel</Btn>
                  </div>
                </div>
              </Panel>
            )}

            <div className="mt-5">
              {detailLoading ? (
                <EmptyRow text="reading…" />
              ) : tab === 'pulls' ? (
                pulls.length === 0 ? <EmptyRow text="no open pull requests" /> : (
                  <ul className="divide-y divide-amber-400/10">
                    {pulls.map((p) => {
                      const key = `pr:${p.number}`;
                      return (
                        <li key={p.number} className="py-3 first:pt-0">
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-mono text-amber-400/50 mt-0.5">#{p.number}</span>
                            <a href={p.html_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-amber-100/60 hover:text-amber-200 transition-colors leading-snug">
                              {p.title}
                              {p.draft && <span className="ml-1.5 text-[9px] uppercase tracking-wider text-amber-100/25">draft</span>}
                            </a>
                          </div>
                          <p className="text-[9px] font-mono text-amber-400/30 mt-1 ml-6">
                            {p.user} · {p.head} → {p.base} · {ago(p.updated_at)} ago
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2 ml-6">
                            <Btn
                              onClick={() => { setComposer(composer === key ? null : key); setComposerText(''); }}
                              disabled={!can('issues:write')}
                              title={why('issues:write')}
                            >
                              <MessageSquare size={10} /> comment
                            </Btn>
                            <Btn
                              tone="danger"
                              disabled={!can('contents:write')}
                              title={why('contents:write')}
                              busy={busy === `merge:${key}`}
                              onClick={() => {
                                if (armed !== `merge:${key}`) { setArmed(`merge:${key}`); return; }
                                void act(`merge:${key}`, 'contents:write',
                                  () => consoleApi.mergePull(token, selected, p.number),
                                  `squash-merged #${p.number}`);
                              }}
                            >
                              {armed === `merge:${key}` ? 'confirm merge' : 'merge (squash)'}
                            </Btn>
                            <Btn
                              tone="danger"
                              disabled={!can('pulls:write')}
                              title={why('pulls:write')}
                              busy={busy === `close-pr:${key}`}
                              onClick={() => {
                                if (armed !== `close-pr:${key}`) { setArmed(`close-pr:${key}`); return; }
                                void act(`close-pr:${key}`, 'pulls:write',
                                  () => consoleApi.setPullState(token, selected, p.number, 'closed'),
                                  `closed #${p.number}`);
                              }}
                            >
                              {armed === `close-pr:${key}` ? 'confirm close' : <><Ban size={10} /> close</>}
                            </Btn>
                            <a
                              href={p.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-400/20 text-[10px] font-mono uppercase tracking-wider text-amber-100/45 hover:text-amber-300 hover:border-amber-400/40 transition-colors"
                            >
                              <ExternalLink size={10} /> open
                            </a>
                          </div>
                          {composer === key && (
                            <div className="mt-2 ml-6 flex flex-col sm:flex-row gap-2">
                              <input
                                value={composerText}
                                onChange={(e) => setComposerText(e.target.value)}
                                placeholder="comment…"
                                className={`${fieldClass} text-xs`}
                              />
                              <Btn busy={busy === `comment:${key}`} disabled={!composerText.trim()} onClick={() => void sendComment(key, p.number)}>
                                send
                              </Btn>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : tab === 'issues' ? (
                issues.length === 0 ? <EmptyRow text="no open issues" /> : (
                  <ul className="divide-y divide-amber-400/10">
                    {issues.map((i) => {
                      const key = `issue:${i.number}`;
                      return (
                        <li key={i.number} className="py-3 first:pt-0">
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-mono text-amber-400/50 mt-0.5">#{i.number}</span>
                            <a href={i.html_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-amber-100/60 hover:text-amber-200 transition-colors leading-snug">
                              {i.title}
                            </a>
                          </div>
                          <p className="text-[9px] font-mono text-amber-400/30 mt-1 ml-6">
                            {i.user} · {i.comments} comments · {ago(i.updated_at)} ago
                            {i.labels.slice(0, 3).map((l) => (
                              <span key={l.name} className="ml-1.5 text-amber-300/50">[{l.name}]</span>
                            ))}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2 ml-6">
                            <Btn
                              onClick={() => { setComposer(composer === key ? null : key); setComposerText(''); }}
                              disabled={!can('issues:write')}
                              title={why('issues:write')}
                            >
                              <MessageSquare size={10} /> comment
                            </Btn>
                            <Btn
                              tone="danger"
                              disabled={!can('issues:write')}
                              title={why('issues:write')}
                              busy={busy === `close-issue:${key}`}
                              onClick={() => {
                                if (armed !== `close-issue:${key}`) { setArmed(`close-issue:${key}`); return; }
                                void act(`close-issue:${key}`, 'issues:write',
                                  () => consoleApi.setIssueState(token, selected, i.number, 'closed'),
                                  `closed #${i.number}`);
                              }}
                            >
                              {armed === `close-issue:${key}` ? 'confirm close' : <><Ban size={10} /> close</>}
                            </Btn>
                            <a
                              href={i.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-400/20 text-[10px] font-mono uppercase tracking-wider text-amber-100/45 hover:text-amber-300 hover:border-amber-400/40 transition-colors"
                            >
                              <ExternalLink size={10} /> open
                            </a>
                          </div>
                          {composer === key && (
                            <div className="mt-2 ml-6 flex flex-col sm:flex-row gap-2">
                              <input
                                value={composerText}
                                onChange={(e) => setComposerText(e.target.value)}
                                placeholder="comment…"
                                className={`${fieldClass} text-xs`}
                              />
                              <Btn busy={busy === `comment:${key}`} disabled={!composerText.trim()} onClick={() => void sendComment(key, i.number)}>
                                send
                              </Btn>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : runs.length === 0 ? <EmptyRow text="no workflow runs recorded" /> : (
                <ul className="divide-y divide-amber-400/10">
                  {runs.map((r) => (
                    <li key={r.id} className="py-2.5 first:pt-0">
                      <div className="flex items-center gap-3">
                        <RunIcon run={r} />
                        <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-amber-100/60 hover:text-amber-200 transition-colors truncate">
                          {r.name} <span className="text-amber-400/40">#{r.number}</span>
                        </a>
                        <span className={`text-[9px] font-mono uppercase tracking-widest ${runTone(r)}`}>
                          {r.conclusion ?? r.status}
                        </span>
                        <span className="text-[9px] font-mono text-amber-400/25 w-14 text-right hidden sm:inline">{r.event}</span>
                        <span className="text-[9px] font-mono text-amber-400/25 w-10 text-right">{ago(r.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-6">
                        <Btn
                          disabled={!can('actions:write') || r.status !== 'completed'}
                          title={r.status !== 'completed' ? 'only completed runs can be re-run' : why('actions:write')}
                          busy={busy === `rerun:${r.id}`}
                          onClick={() => void act(`rerun:${r.id}`, 'actions:write',
                            () => consoleApi.rerunRun(token, selected, r.id),
                            `re-running ${r.name} #${r.number}`)}
                        >
                          <RotateCw size={10} /> re-run
                        </Btn>
                        <Btn
                          tone="danger"
                          disabled={!can('actions:write') || r.status === 'completed'}
                          title={r.status === 'completed' ? 'run already finished' : why('actions:write')}
                          busy={busy === `cancel:${r.id}`}
                          onClick={() => {
                            if (armed !== `cancel:${r.id}`) { setArmed(`cancel:${r.id}`); return; }
                            void act(`cancel:${r.id}`, 'actions:write',
                              () => consoleApi.cancelRun(token, selected, r.id),
                              `cancelling ${r.name} #${r.number}`);
                          }}
                        >
                          {armed === `cancel:${r.id}` ? 'confirm cancel' : <><Ban size={10} /> cancel</>}
                        </Btn>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>

          <Section className="pt-12">
            <SectionHead index="fig. 07e" title="Console" />

            <div className="relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-400/15 bg-amber-500/[0.03]">
                <Terminal size={12} className="text-amber-300" />
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-300/70">
                  vz@{repoShort || 'console'}
                </span>
                <span className="ml-auto text-[9px] font-mono text-amber-100/20">read-only shell</span>
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
