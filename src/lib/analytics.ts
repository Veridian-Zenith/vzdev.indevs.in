//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

/**
 * GA4 via gtag.js.
 *
 * DNT / GPC are treated as hard blocks, not preferences:
 *   - the gtag script is never injected
 *   - no cookies or identifiers are set
 *   - no consent prompt is shown to nudge the user back
 *
 * That is stricter than most sites, which typically load the tag anyway and
 * only set consent_storage to "denied" — which still drops cookies.
 *
 * GPC (Global Privacy Control) is checked alongside DNT because it is the
 * enforceable, standardised signal; DNT alone is widely ignored.
 */

const ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined;

const CONSENT_KEY = 'vz:ga-consent';

export type TrackingPreference = 'blocked' | 'unknown' | 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    doNotTrack?: string;
  }
  interface Navigator {
    msDoNotTrack?: string;
    globalPrivacyControl?: boolean;
  }
}

const CONSENT_DEFAULTS = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'denied',
} as const;

const GRANTED = {
  ...CONSENT_DEFAULTS,
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  security_storage: 'granted',
} as const;

/** `navigator.doNotTrack`, the legacy `window.doNotTrack`, and the MS variant. */
export const dntEnabled = (): boolean => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  return navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
};

/** Global Privacy Control — the enforceable successor to DNT. */
export const gpcEnabled = (): boolean =>
  typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;

/** A machine-readable opt-out is in force. Nothing about us should ever run. */
export const trackingBlocked = (): boolean => dntEnabled() || gpcEnabled();

/** False when no measurement ID is configured, so forks and local dev stay inert. */
export const analyticsAvailable = Boolean(ID);

export const analyticsEnabled = analyticsAvailable;

const readStored = (): TrackingPreference => {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * The single gate everything else consults. A block outranks stored consent,
 * so enabling DNT immediately overrides an earlier opt-in.
 */
export const readPreference = (): TrackingPreference => {
  if (trackingBlocked()) return 'blocked';
  return readStored();
};

const canTrack = () => readPreference() === 'granted';

/**
 * Called at startup. If a block is in force but gtag is somehow already present
 * (consent given earlier in the SPA session, DNT switched on since), actively
 * revoke rather than merely going quiet.
 */
const enforceBlock = () => {
  if (!analyticsAvailable) return;
  if (!window.gtag) return;

  window.gtag('consent', 'update', CONSENT_DEFAULTS);

  // Expire anything GA stored before the block was observed.
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim();
    if (name && (name === '_ga' || name === '_gat' || name.startsWith('_ga_'))) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  }
};

let injected = false;

export const initAnalytics = () => {
  if (!analyticsAvailable) return;
  if (!import.meta.env.PROD) return;

  if (trackingBlocked()) {
    enforceBlock();
    return;
  }
  if (injected) return;

  injected = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  // Consent Mode v2 must be set before the config/load pair.
  window.gtag('consent', 'default', readStored() === 'granted' ? GRANTED : CONSENT_DEFAULTS);

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  s.dataset.ga4 = 'loader';
  document.head.appendChild(s);

  window.gtag('js', new Date());
  window.gtag('config', ID, {
    send_page_view: false, // sent manually on route change
    anonymize_ip: true,
    allow_google_signals: false,
  });
};

/**
 * Records an explicit choice. A no-op while a DNT/GPC block is in force — the
 * browser setting wins, and we don't persist anything that could outlive it.
 */
export const setConsent = (value: 'granted' | 'denied') => {
  if (trackingBlocked()) return;
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked — held in memory for this session only */
  }
  if (!analyticsAvailable) return;
  window.gtag?.('consent', 'update', value === 'granted' ? GRANTED : CONSENT_DEFAULTS);
};

const emit = (...args: unknown[]) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
  window.gtag?.(...args);
};

export const trackPageView = (path: string) => {
  if (!analyticsAvailable || !canTrack()) return;
  emit('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
};

export const trackEvent = (name: string, params: Record<string, unknown> = {}) => {
  if (!analyticsAvailable || !canTrack()) return;
  emit('event', name, params);
};
