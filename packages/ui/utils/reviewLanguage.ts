import { simplifiedChinese } from './reviewMessagesZh';

export type ReviewLanguage = 'en' | 'zh-CN';
export type LanguagePreference = ReviewLanguage | 'auto';
export type ReviewMessage = keyof typeof simplifiedChinese;

export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === 'auto' || value === 'en' || value === 'zh-CN';
}

export function resolveBrowserLanguage(languages: readonly string[]): ReviewLanguage {
  for (const tag of languages) {
    const primary = tag?.split('-')[0]?.toLowerCase();
    if (primary === 'zh') return 'zh-CN';
    if (primary === 'en') return 'en';
  }
  return 'en';
}

type Values = Record<string, string | number>;
export type Translate = (message: ReviewMessage, values?: Values) => string;

function format(template: string, values?: Values): string {
  return values ? template.replace(/\{(\w+)\}/g, (token, key) => Object.hasOwn(values, key) ? String(values[key]) : token) : template;
}

export const english: Translate = (message, values) => format(message, values);
export const translators: Record<ReviewLanguage, Translate> = {
  en: english,
  'zh-CN': (message, values) => format(simplifiedChinese[message], values),
};
