//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

/**
 * Authenticated GitHub access for the management console.
 *
 * The token is supplied by the operator and kept in `sessionStorage` for this
 * tab only: it dies when the tab closes, it is never written to
 * `localStorage`, never put in a URL, and never logged.
 *
 * OAuth is deliberately not offered here. GitHub's OAuth and device-flow
 * endpoints live on `github.com` and send no CORS headers (they reject
 * preflight), and the token exchange requires a `client_secret` that a static
 * bundle cannot hold. `api.github.com` is the only browser-reachable half, so
 * a pasted token is the entire zero-backend story.
 *
 * Capabilities are discovered, not assumed. Classic tokens report their scopes
 * on every response, so writes can be derived exactly; fine-grained tokens
 * report nothing, so reads are probed and writes stay `unknown` until an action
 * proves otherwise. A failed write still teaches us the truth: GitHub names the
 * missing permission in `x-accepted-github-permissions`.
 */
import { API, ORG } from './github';

const TOKEN_KEY = 'vz_console_token';

export const getToken = (): string => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
};

export const setToken = (token: string): void => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — the caller keeps it in memory only */
  }
};

export type Capability =
  | 'repo:read'
  | 'pulls:read'
  | 'issues:read'
  | 'actions:read'
  | 'contents:read'
  | 'issues:write'
  | 'pulls:write'
  | 'actions:write'
  | 'contents:write';

export type CapState = 'granted' | 'denied' | 'unknown';
export type Caps = Record<Capability, CapState>;

export const ALL_CAPS: Capability[] = [
  'repo:read', 'pulls:read', 'issues:read', 'actions:read', 'contents:read',
  'issues:write', 'pulls:write', 'actions:write', 'contents:write',
];

export const CAP_LABEL: Record<Capability, string> = {
  'repo:read': 'read repo',
  'pulls:read': 'read pull requests',
  'issues:read': 'read issues',
  'actions:read': 'read runs',
  'contents:read': 'read contents',
  'issues:write': 'comment / close issue',
  'pulls:write': 'close pull request',
  'actions:write': 're-run / cancel run',
  'contents:write': 'merge pull request',
};

/** GitHub's own name for the permission each capability maps to. */
export const CAP_PERMISSION: Record<Capability, string> = {
  'repo:read': 'Metadata: read',
  'pulls:read': 'Pull requests: read',
  'issues:read': 'Issues: read',
  'actions:read': 'Actions: read',
  'contents:read': 'Contents: read',
  'issues:write': 'Issues: write',
  'pulls:write': 'Pull requests: write',
  'actions:write': 'Actions: write',
  'contents:write': 'Contents: write (merge)',
};

export interface Viewer {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface RepoSummary {
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  archived: boolean;
  default_branch: string;
  pushed_at: string;
  open_issues_count: number;
  stargazers_count: number;
  forks_count: number;
}

export interface Pull {
  number: number;
  title: string;
  user: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  html_url: string;
  head: string;
  base: string;
  mergeable: boolean | null;
}

export interface Issue {
  number: number;
  title: string;
  user: string;
  labels: { name: string; color: string }[];
  comments: number;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface Run {
  id: number;
  name: string;
  number: number;
  event: string;
  status: string;
  conclusion: string | null;
  branch: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface RateLimit {
  remaining: number;
  limit: number;
  reset: number;
}

/** An API failure that carries what GitHub says was missing. */
export interface GhFailure extends Error {
  status: number;
  /** e.g. `['contents=write']` from `x-accepted-github-permissions`. */
  needs: string[];
  /** e.g. `['repo', 'workflow']` from `x-accepted-oauth-scopes`. */
  scopes: string[];
}

const splitHeader = (res: Response, name: string): string[] =>
  (res.headers.get(name) ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const fail = (message: string, status: number, res?: Response): GhFailure => {
  const err = new Error(message) as GhFailure;
  err.status = status;
  err.needs = res ? splitHeader(res, 'x-accepted-github-permissions') : [];
  err.scopes = res ? splitHeader(res, 'x-accepted-oauth-scopes') : [];
  return err;
};

export const isGhFailure = (e: unknown): e is GhFailure =>
  e instanceof Error && typeof (e as GhFailure).status === 'number';

/** One authenticated request, with errors phrased for a human reading them. */
const gh = async <T>(path: string, token: string, init: RequestInit = {}): Promise<T> => {
  if (!token) throw fail('no token', 0);

  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-GitHub-Api-Version', '2022-11-28');

  const res = await fetch(`${API}${path}`, { ...init, headers });

  if (!res.ok) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if ((res.status === 403 || res.status === 429) && remaining === '0') {
      const reset = Number(res.headers.get('x-ratelimit-reset') ?? 0) * 1000;
      throw fail(`rate limited — resets at ${reset ? new Date(reset).toLocaleTimeString() : 'later'}`, 429, res);
    }
    if (res.status === 401) throw fail('token rejected — check it has not expired', 401, res);
    if (res.status === 404) throw fail('not found — the repo may be private or outside the token scope', 404, res);
    if (res.status === 403) throw fail('forbidden by token permissions', 403, res);
    if (res.status === 405) throw fail('not mergeable — conflicts or required checks are still pending', 405, res);
    if (res.status === 409) throw fail('conflict (409) — the branch changed or the item is already in that state', 409, res);
    if (res.status === 422) throw fail('GitHub rejected the change (422) — usually an already-merged or already-closed item', 422, res);
    throw fail(`GitHub API ${res.status}`, res.status, res);
  }

  // 204/empty bodies (re-run, cancel) are success with nothing to parse.
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const int = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const rec = (v: unknown): Record<string, unknown> =>
  typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};

/** Read probing is the only way to see a fine-grained token's read access. */
const probe = async (path: string, token: string): Promise<CapState> => {
  try {
    await gh(path, token);
    return 'granted';
  } catch (e) {
    if (isGhFailure(e) && (e.status === 403 || e.status === 404)) return 'denied';
    return 'unknown';
  }
};

export interface Connection {
  viewer: Viewer;
  kind: 'classic' | 'fine-grained';
  scopes: string[];
  caps: Caps;
  rate: RateLimit;
  repos: RepoSummary[];
}

export const consoleApi = {
  /** Identity, token kind, probed capabilities, quota and repos in one go. */
  connect: async (token: string, probeRepo?: string): Promise<Connection> => {
    const identity = await fetch(`${API}/user`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` },
    });

    // GitHub only sends this header for classic tokens; fine-grained sends none.
    const scopeHeader = identity.headers.get('x-oauth-scopes');
    const classic = scopeHeader !== null;
    const scopes = (scopeHeader ?? '').split(',').map((s) => s.trim()).filter(Boolean);

    if (!identity.ok) throw fail('token rejected — check it has not expired', identity.status, identity);
    const me = rec(await identity.json());

    const rate = rec(rec(rec(await gh<unknown>('/rate_limit', token)).resources).core);
    const repos = await consoleApi.repos(token);

    const target = probeRepo ?? repos[0]?.full_name ?? `${ORG}/.github`;
    const [repoRead, pullsRead, issuesRead, actionsRead, contentsRead] = await Promise.all([
      probe(`/repos/${target}`, token),
      probe(`/repos/${target}/pulls?per_page=1`, token),
      probe(`/repos/${target}/issues?per_page=1&filter=all`, token),
      probe(`/repos/${target}/actions/runs?per_page=1`, token),
      probe(`/repos/${target}/contents?per_page=1`, token),
    ]);

    const caps: Caps = {
      'repo:read': repoRead,
      'pulls:read': pullsRead,
      'issues:read': issuesRead,
      'actions:read': actionsRead,
      'contents:read': contentsRead,
      // Fine-grained tokens expose no write scopes, so these stay unknown until
      // an action either succeeds or GitHub names the missing permission.
      'issues:write': 'unknown',
      'pulls:write': 'unknown',
      'actions:write': 'unknown',
      'contents:write': 'unknown',
    };

    if (classic) {
      const repoScope = scopes.includes('repo') || scopes.includes('public_repo');
      // Merging a pull request is gated by Contents, not by Pull requests.
      caps['contents:write'] = repoScope ? 'granted' : 'denied';
      caps['issues:write'] = repoScope ? 'granted' : 'denied';
      caps['pulls:write'] = repoScope ? 'granted' : 'denied';
      caps['actions:write'] = repoScope ? 'granted' : 'denied';
    }

    return {
      viewer: {
        login: str(me.login),
        name: str(me.name) || null,
        avatar_url: str(me.avatar_url),
        html_url: str(me.html_url),
      },
      kind: classic ? 'classic' : 'fine-grained',
      scopes,
      caps,
      rate: { remaining: int(rate.remaining), limit: int(rate.limit), reset: int(rate.reset) * 1000 },
      repos,
    };
  },

  repos: async (token: string): Promise<RepoSummary[]> => {
    const raw = await gh<unknown>(`/orgs/${ORG}/repos?per_page=100&sort=pushed`, token);
    if (!Array.isArray(raw)) return [];
    return raw.map((v) => {
      const r = rec(v);
      return {
        name: str(r.name),
        full_name: str(r.full_name),
        html_url: str(r.html_url),
        private: r.private === true,
        archived: r.archived === true,
        default_branch: str(r.default_branch) || 'main',
        pushed_at: str(r.pushed_at),
        open_issues_count: int(r.open_issues_count),
        stargazers_count: int(r.stargazers_count),
        forks_count: int(r.forks_count),
      };
    });
  },

  pulls: async (token: string, repo: string): Promise<Pull[]> => {
    const raw = await gh<unknown>(`/repos/${repo}/pulls?state=open&per_page=30`, token);
    if (!Array.isArray(raw)) return [];
    return raw.map((v) => {
      const p = rec(v);
      return {
        number: int(p.number),
        title: str(p.title),
        user: str(rec(p.user).login),
        draft: p.draft === true,
        created_at: str(p.created_at),
        updated_at: str(p.updated_at),
        html_url: str(p.html_url),
        head: str(rec(p.head).ref),
        base: str(rec(p.base).ref),
        mergeable: typeof p.mergeable === 'boolean' ? p.mergeable : null,
      };
    });
  },

  issues: async (token: string, repo: string): Promise<Issue[]> => {
    const raw = await gh<unknown>(`/repos/${repo}/issues?state=open&per_page=30`, token);
    if (!Array.isArray(raw)) return [];
    return raw
      // The issues endpoint also returns pull requests; the console lists them apart.
      .filter((v) => !rec(v).pull_request)
      .map((v) => {
        const i = rec(v);
        return {
          number: int(i.number),
          title: str(i.title),
          user: str(rec(i.user).login),
          labels: Array.isArray(i.labels)
            ? i.labels.map((l) => ({ name: str(rec(l).name), color: str(rec(l).color) }))
            : [],
          comments: int(i.comments),
          created_at: str(i.created_at),
          updated_at: str(i.updated_at),
          html_url: str(i.html_url),
        };
      });
  },

  runs: async (token: string, repo: string): Promise<Run[]> => {
    const raw = rec(await gh<unknown>(`/repos/${repo}/actions/runs?per_page=20`, token));
    const list = Array.isArray(raw.workflow_runs) ? raw.workflow_runs : [];
    return list.map((v) => {
      const r = rec(v);
      return {
        id: int(r.id),
        name: str(r.name) || str(r.display_title) || 'workflow',
        number: int(r.run_number),
        event: str(r.event),
        status: str(r.status),
        conclusion: str(r.conclusion) || null,
        branch: str(r.head_branch),
        created_at: str(r.created_at),
        updated_at: str(r.updated_at),
        html_url: str(r.html_url),
      };
    });
  },

  /* ---- writes: each is gated by a capability the UI checks first ---- */

  comment: async (token: string, repo: string, issue: number, body: string): Promise<void> => {
    await gh(`/repos/${repo}/issues/${issue}/comments`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
  },

  setIssueState: async (token: string, repo: string, issue: number, state: 'open' | 'closed'): Promise<void> => {
    await gh(`/repos/${repo}/issues/${issue}`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
  },

  setPullState: async (token: string, repo: string, pull: number, state: 'open' | 'closed'): Promise<void> => {
    await gh(`/repos/${repo}/pulls/${pull}`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
  },

  mergePull: async (token: string, repo: string, pull: number): Promise<void> => {
    // PUT /pulls/{n}/merge is gated by Contents: write, not Pull requests.
    await gh(`/repos/${repo}/pulls/${pull}/merge`, token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merge_method: 'squash' }),
    });
  },

  rerunRun: async (token: string, repo: string, run: number): Promise<void> => {
    await gh(`/repos/${repo}/actions/runs/${run}/rerun`, token, { method: 'POST' });
  },

  cancelRun: async (token: string, repo: string, run: number): Promise<void> => {
    await gh(`/repos/${repo}/actions/runs/${run}/cancel`, token, { method: 'POST' });
  },

  createIssue: async (token: string, repo: string, title: string, body: string): Promise<Issue> => {
    const i = rec(await gh<unknown>(`/repos/${repo}/issues`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    }));
    return {
      number: int(i.number),
      title: str(i.title),
      user: str(rec(i.user).login),
      labels: [],
      comments: 0,
      created_at: str(i.created_at),
      updated_at: str(i.updated_at),
      html_url: str(i.html_url),
    };
  },
};

/** Accepts `name` (org repos) or a full `owner/repo`. */
export const qualify = (repo: string): string =>
  repo.includes('/') ? repo : `${ORG}/${repo}`;

/** Maps the capability a write needs onto what GitHub reported as missing. */
export const capForPermission = (needs: string[]): Capability | null => {
  const joined = needs.join(',').toLowerCase();
  if (!joined) return null;
  if (joined.includes('contents')) return 'contents:write';
  if (joined.includes('actions')) return 'actions:write';
  if (joined.includes('pull')) return 'pulls:write';
  if (joined.includes('issue')) return 'issues:write';
  return null;
};
