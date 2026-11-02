//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

/**
 * The forge is a Forgejo instance at git.gay. Its REST API follows the Gitea
 * dialect, which differs from GitHub's in ways the UI should not have to know
 * about: repos report `stars_count`/`updated_at` (no `pushed_at`), commits
 * carry no author login, and no licence is fingerprinted on the repo payload.
 * The translation happens once, in `toRepo`, so pages keep reading one shape.
 */
export const FORGE_ORIGIN = 'https://git.gay';
export const API = `${FORGE_ORIGIN}/api/v1`;
export const ORG = 'Veridian-Zenith';
export const USER = 'daedaevibin';

/** The org's page on the forge. */
export const orgUrl = `${FORGE_ORIGIN}/${ORG}`;

export const repoUrl = (name: string): string =>
  `${FORGE_ORIGIN}/${ORG}/${encodeURIComponent(name)}`;

/**
 * The forge serves its API with `Access-Control-Allow-Origin: *`, so it can be
 * read straight from the browser. (Its `.rss` feeds carry no CORS headers and
 * cannot be.)
 */
export const forge = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(`${API}${path}`, init);

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

  // Forgejo updates `updated_at` on push, which is the closest thing it has to
  // GitHub's `pushed_at`.
  const touched = typeof v.updated_at === 'string' ? v.updated_at : '';

  return {
    id: v.id,
    name: v.name,
    full_name: v.full_name,
    html_url: typeof v.html_url === 'string' ? v.html_url : repoUrl(v.name),
    description:
      typeof v.description === 'string' && v.description.trim() ? v.description : null,
    // Empty string when the forge could not detect a primary language.
    language: typeof v.language === 'string' && v.language ? v.language : null,
    // Not exposed on the repo payload; pages fall back to their curated value.
    license: null,
    stargazers_count: num(v.stars_count),
    forks_count: num(v.forks_count),
    open_issues_count: num(v.open_issues_count),
    topics: Array.isArray(v.topics)
      ? v.topics.filter((t): t is string => typeof t === 'string')
      : [],
    pushed_at: touched,
    updated_at: touched,
    archived: v.archived === true,
    fork: v.fork === true,
    default_branch: typeof v.default_branch === 'string' ? v.default_branch : 'main',
  };
};
