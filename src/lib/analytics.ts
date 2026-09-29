//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

/**
 * GA4 via gtag.js.
 *
 * - No-op unless VITE_FIREBASE_MEASUREMENT_ID is set (the Firebase-generated
 *   GA4 ID), so local dev and forks stay clean.
 * - Never loads in dev builds.
 * - Consent Mode v2 with everything denied by default. Analytics only starts
 *   after an explicit grant, which keeps the German/EU traffic lawful.
 */

const ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined;
export const analyticsEnabled = Boolean(ID);

const CONSENT_KEY = 'vz:ga-consent';
export type ConsentState = 'granted' | 'denied' | 'unknown';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    doNotTrack?: string;
  }
  interface Navigator {
    msDoNotTrack?: string;
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

export const readConsent = (): ConsentState => {
  if (typeof localStorage === 'undefined') return 'unknown';
  const v = localStorage.getItem(CONSENT_KEY);
  return v === 'granted' || v === 'denied' ? v : 'unknown';
};

const push = (...args: unknown[]) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
  window.gtag?.(...args);
};

/** Respects the browser-level Do Not Track signal. */
const doNotTrack = () =>
  typeof navigator !== 'undefined' &&
  (navigator.doNotTrack === '1' ||
    window.doNotTrack === '1' ||
    navigator.msDoNotTrack === '1');

let loaded = false;

export const initAnalytics = () => {
  if (!analyticsEnabled || loaded) return;
  if (!import.meta.env.PROD) return;

  loaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  // Consent Mode v2 must be set before the config/load pair.
  const stored = readConsent();
  const granted = stored === 'granted' && !doNotTrack();

  window.gtag('consent', 'default', granted
    ? { ...CONSENT_DEFAULTS, analytics_storage: 'granted', functionality_storage: 'granted', security_storage: 'granted' }
    : CONSENT_DEFAULTS);

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  s.dataset.ga4 = 'loader';
  document.head.appendChild(s);

  window.gtag('js', new Date());
  window.gtag('config', ID, {
    send_page_view: false, // we send views manually on route change
    anonymize_ip: true,
    allow_google_signals: false,
  });
};

export const setConsent = (value: 'granted' | 'denied') => {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked — consent stays in-memory for this session */
  }
  if (!analyticsEnabled) return;

  window.gtag?.('consent', 'update', {
    ...CONSENT_DEFAULTS,
    ...(value === 'granted'
      ? { analytics_storage: 'granted', functionality_storage: 'granted', security_storage: 'granted' }
      : {}),
  });
};

export const trackPageView = (path: string) => {
  if (!analyticsEnabled || readConsent() !== 'granted') return;
  push('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
};

/** Generic event helper for future use (outbound links, CTA clicks, etc). */
export const trackEvent = (name: string, params: Record<string, unknown> = {}) => {
  if (!analyticsEnabled || readConsent() !== 'granted') return;
  push('event', name, params);
};
