//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = ['en', 'de', 'ko', 'ru', 'nb'] as const;

const translationImporters = {
  en: () => import('../locales/en.json'),
  de: () => import('../locales/de.json'),
  ko: () => import('../locales/ko.json'),
  ru: () => import('../locales/ru.json'),
  nb: () => import('../locales/nb.json'),
} satisfies Record<(typeof supportedLanguages)[number], () => Promise<{ default: Record<string, string> }>>;

const loadedLanguages = new Set<string>();

export const loadTranslations = async (language?: string): Promise<void> => {
  const baseLanguage = (language ?? i18n.resolvedLanguage ?? i18n.language ?? 'en').split('-')[0] as (typeof supportedLanguages)[number];
  if (!supportedLanguages.includes(baseLanguage) || loadedLanguages.has(baseLanguage)) return;
  const { default: translation } = await translationImporters[baseLanguage]();
  i18n.addResourceBundle(baseLanguage, 'translation', translation, true, true);
  loadedLanguages.add(baseLanguage);
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    }
  });

i18n.on('languageChanged', (lng) => {
  void loadTranslations(lng);
});
