export type SupportedLanguage = 'en' | 'fr' | 'es';

export type LanguageOption = {
  code: SupportedLanguage;
  endonym: string;
  locale: string;
};

export const LANGUAGE_STORAGE_KEY = 'itip-lang';
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', endonym: 'English', locale: 'en-US' },
  { code: 'fr', endonym: 'Français', locale: 'fr-FR' },
  { code: 'es', endonym: 'Español', locale: 'es-ES' },
];

const SUPPORTED_LANGUAGE_SET = new Set<SupportedLanguage>(
  SUPPORTED_LANGUAGES.map((language) => language.code),
);

const LOCALE_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
};

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return !!value && SUPPORTED_LANGUAGE_SET.has(value as SupportedLanguage);
}

export function normalizeLanguage(value: string | null | undefined): SupportedLanguage | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().split('/').pop()?.split('-')[0] ?? '';
  return isSupportedLanguage(normalized) ? normalized : null;
}

export function getLocaleForLanguage(language: SupportedLanguage): string {
  return LOCALE_BY_LANGUAGE[language];
}
