import en from './en.json';
import th from './th.json';

export type Language = 'en' | 'th';

const translations = {
  en,
  th,
};

export function getTranslation(language: Language) {
  return translations[language] || translations.en;
}

export function t(language: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
  }

  return typeof value === 'string' ? value : key;
}

export function getLanguageName(language: Language): string {
  return language === 'th' ? 'ไทย' : 'English';
}
