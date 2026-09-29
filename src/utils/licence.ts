//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

/**
 * GitHub reports `NOASSERTION` for any licence it cannot fingerprint, which is
 * the case for several repos here. That is an internal marker, not something to
 * show a reader, so it falls back to our own curated value.
 */
const UNKNOWN = new Set(['NOASSERTION', 'NONE', 'null', 'undefined', '']);

export const resolveLicence = (
  spdx: string | null | undefined,
  fallback: string,
): string => {
  const value = spdx?.trim();
  if (!value || UNKNOWN.has(value.toUpperCase())) return fallback;
  return value;
};
