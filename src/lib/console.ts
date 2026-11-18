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

/** One authenticated request, with errors phrased for a human reading them. */
const gh = async <T>(path: string, token: string): Promise<T> => {
  if (!token) throw new Error('no token');

  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if ((res.status === 403 || res.status === 429) && remaining === '0') {
      const reset = Number(res.headers.get('x-ratelimit-reset') ?? 0) * 1000;
      const at = reset ? new Date(reset).toLocaleTimeString() : 'later';
      throw new Error(`rate limited — resets at ${at}`);
    }
    if (res.status === 401) throw new Error('token rejected (401) — check it has not expired');
    if (res.status === 404) throw new Error('not found (404) — repo may be private or outside the token scope');
    if (res.status === 403) throw new Error('forbidden (403) — token lacks the scope for this resource');
    throw new Error(`GitHub API ${res.status}`);
  }

  return (await res.json()) as T;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const int = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const rec = (v: unknown): Record<string, unknown> =>
  typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};

export const consoleApi = {
  viewer: async (token: string): Promise<Viewer> => {
    const raw = rec(await gh<unknown>('/user', token));
    return {
      login: str(raw.login),
      name: str(raw.name) || null,
      avatar_url: str(raw.avatar_url),
      html_url: str(raw.html_url),
    };
  },

  /** Scopes are only reported for classic tokens; fine-grained return none. */
  scopes: async (token: string): Promise<string[]> => {
    const res = await fetch(`${API}/user`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` },
    });
    const header = res.headers.get('x-oauth-scopes') ?? '';
    return header.split(',').map((s) => s.trim()).filter(Boolean);
  },

  rate: async (token: string): Promise<RateLimit> => {
    const raw = rec(await gh<unknown>('/rate_limit', token));
    const core = rec(rec(raw.resources).core);
    return { remaining: int(core.remaining), limit: int(core.limit), reset: int(core.reset) * 1000 };
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
};

/** Accepts `name` (org repos) or a full `owner/repo`. */
export const qualify = (repo: string): string =>
  repo.includes('/') ? repo : `${ORG}/${repo}`;
