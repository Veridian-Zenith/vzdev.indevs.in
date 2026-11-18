//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

/**
 * The forge is GitHub. Its REST API is read straight from the browser: public
 * resources answer with `Access-Control-Allow-Origin: *`, so no token is needed
 * — and none may be shipped, since a static build has nowhere to hide one.
 *
 * Unauthenticated calls are capped at 60 requests per hour per visitor IP, which
 * is why every hook caches (see the CACHE_* constants) and why the activity feed
 * refreshes on a long interval. git.gay (Forgejo) mirrors these repositories;
 * switching back is a change to FORGE_ORIGIN/API here plus the `connect-src`
 * entry in firebase.json.
 */
export const FORGE_ORIGIN = 'https://github.com';
export const API = 'https://api.github.com';
export const ORG = 'Veridian-Zenith';
export const USER = 'daedaevibin';

/** The org's page on the forge. */
export const orgUrl = `${FORGE_ORIGIN}/${ORG}`;

export const repoUrl = (name: string): string =>
  `${FORGE_ORIGIN}/${ORG}/${encodeURIComponent(name)}`;

/** Web URL for an `owner/repo` full name, which is how events spell a repo. */
export const repoUrlFromFullName = (fullName: string): string =>
  `${FORGE_ORIGIN}/${fullName}`;

export const forge = (path: string, init: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(init.headers);
  // Pin the REST version rather than inheriting whatever the account default is.
  if (!headers.has('Accept')) headers.set('Accept', 'application/vnd.github+json');
  return fetch(`${API}${path}`, { ...init, headers });
};

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

export const num = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;

/** UI-facing repository shape, kept stable for every page that reads it. */
export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  license: { spdx_id: string | null; name: string } | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  pushed_at: string;
  updated_at: string;
  archived: boolean;
  fork: boolean;
  default_branch: string;
}

export const toRepo = (v: unknown): Repo | null => {
  if (!isRecord(v)) return null;
  if (typeof v.id !== 'number') return null;
  if (typeof v.name !== 'string' || typeof v.full_name !== 'string') return null;

  // `NOASSERTION` is GitHub saying "there is a licence file, unrecognised".
  const raw = isRecord(v.license) ? v.license : null;
  const spdx = raw && typeof raw.spdx_id === 'string' ? raw.spdx_id : '';
  const license = raw
    ? {
        spdx_id: spdx && spdx !== 'NOASSERTION' ? spdx : null,
        name: typeof raw.name === 'string' ? raw.name : '',
      }
    : null;

  return {
    id: v.id,
    name: v.name,
    full_name: v.full_name,
    html_url: typeof v.html_url === 'string' ? v.html_url : repoUrl(v.name),
    description:
      typeof v.description === 'string' && v.description.trim() ? v.description : null,
    language: typeof v.language === 'string' && v.language ? v.language : null,
    license,
    stargazers_count: num(v.stargazers_count),
    forks_count: num(v.forks_count),
    open_issues_count: num(v.open_issues_count),
    topics: Array.isArray(v.topics)
      ? v.topics.filter((t): t is string => typeof t === 'string')
      : [],
    // `pushed_at` is the last push to any branch; `updated_at` also moves on
    // metadata edits, so it is only the fallback.
    pushed_at:
      (typeof v.pushed_at === 'string' && v.pushed_at) ||
      (typeof v.updated_at === 'string' ? v.updated_at : ''),
    updated_at: typeof v.updated_at === 'string' ? v.updated_at : '',
    archived: v.archived === true,
    fork: v.fork === true,
    default_branch: typeof v.default_branch === 'string' ? v.default_branch : 'main',
  };
};
