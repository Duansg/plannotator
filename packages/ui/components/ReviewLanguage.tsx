import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { configStore, useConfigValue } from '../config';
import { english, translators, resolveBrowserLanguage, isLanguagePreference, type ReviewLanguage } from '../utils/reviewLanguage';

const LanguageContext = createContext<ReviewLanguage | undefined>(undefined);

function subscribeLanguageChange(notify: () => void) {
  window.addEventListener('languagechange', notify);
  return () => window.removeEventListener('languagechange', notify);
}

function browserLanguage() {
  return resolveBrowserLanguage(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

export function ReviewLanguageProvider({ children }: { children: React.ReactNode }) {
  const preference = useConfigValue('reviewLanguage');
  const browser = useSyncExternalStore(subscribeLanguageChange, browserLanguage, () => 'en' as const);
  const language = preference === 'auto' ? browser : preference;

  useEffect(() => {
    const root = document.documentElement;
    const original = root.getAttribute('lang');
    root.lang = language;
    return () => {
      if (original === null) root.removeAttribute('lang');
      else root.lang = original;
    };
  }, [language]);

  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

/** Shared components keep their English defaults outside a localized review. */
export function useTranslate() {
  const language = useContext(LanguageContext);
  return language ? translators[language] : english;
}

export function ReviewLanguageField() {
  const language = useContext(LanguageContext);
  const preference = useConfigValue('reviewLanguage');
  if (!language) return null;
  const t = translators[language];
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{t('Interface language')}</span>
      <select className="rounded border border-border bg-background px-2 py-1 text-sm" value={preference}
        onChange={event => {
          const choice = event.target.value;
          if (isLanguagePreference(choice)) configStore.set('reviewLanguage', choice);
        }}
      >
        <option value="auto">{t('Follow browser')}</option>
        <option value="en" lang="en">English</option>
        <option value="zh-CN" lang="zh-CN">简体中文</option>
      </select>
    </label>
  );
}
