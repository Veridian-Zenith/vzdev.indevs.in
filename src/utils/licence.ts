//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

/**
 * The forge does not fingerprint licences on its repository payload, so the
 * curated value is what readers normally see. `NOASSERTION` is GitHub's marker
 * for a licence it could not identify — an internal token, never shown — and is
 * filtered out should a payload ever carry one.
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
