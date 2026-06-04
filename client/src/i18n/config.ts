import en from "./locales/en";
import he from "./locales/he";
import fr from "./locales/fr";
import es from "./locales/es";
import de from "./locales/de";
import ru from "./locales/ru";
import am from "./locales/am";
import ar from "./locales/ar";
import yi from "./locales/yi";
import it from "./locales/it";

export type SupportedLanguage = "he" | "en" | "fr" | "es" | "de" | "ru" | "am" | "ar" | "yi" | "it";

export interface LanguageInfo {
  code: SupportedLanguage;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const ALL_LANGUAGES: LanguageInfo[] = [
  { code: "he", nativeName: "\u05e2\u05d1\u05e8\u05d9\u05ea", flag: "HE", dir: "rtl" },
  { code: "en", nativeName: "English", flag: "EN", dir: "ltr" },
  { code: "fr", nativeName: "Fran\u00e7ais", flag: "FR", dir: "ltr" },
  { code: "es", nativeName: "Espa\u00f1ol", flag: "ES", dir: "ltr" },
  { code: "de", nativeName: "Deutsch", flag: "DE", dir: "ltr" },
  { code: "ru", nativeName: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", flag: "RU", dir: "ltr" },
  { code: "am", nativeName: "\u12a0\u121b\u122d\u129b", flag: "AM", dir: "ltr" },
  { code: "ar", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", flag: "AR", dir: "rtl" },
  { code: "yi", nativeName: "\u05d9\u05d9\u05b4\u05d3\u05d9\u05e9", flag: "YI", dir: "rtl" },
  { code: "it", nativeName: "Italiano", flag: "IT", dir: "ltr" },
];

export const BILINGUAL_CODES: SupportedLanguage[] = ["he", "en"];
export const MULTILINGUAL_CODES: SupportedLanguage[] = ["he", "en", "fr", "es", "de", "ru", "am", "ar", "yi", "it"];

const translationMap: Record<SupportedLanguage, Record<string, string>> = {
  en,
  he,
  fr,
  es,
  de,
  ru,
  am,
  ar,
  yi,
  it,
};

export function getTranslation(lang: SupportedLanguage, key: string): string {
  return translationMap[lang]?.[key] || translationMap.en[key] || key;
}

export function getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
  return ALL_LANGUAGES.find((l) => l.code === code);
}

export function isRTL(code: SupportedLanguage): boolean {
  const info = getLanguageInfo(code);
  return info?.dir === "rtl";
}

export interface LanguageSettings {
  enabled: boolean;
  mode: "bilingual" | "multilingual";
  defaultLanguage: SupportedLanguage;
  enabledLanguages: SupportedLanguage[];
}

export const DEFAULT_LANGUAGE_SETTINGS: LanguageSettings = {
  enabled: false,
  mode: "bilingual",
  defaultLanguage: "he",
  enabledLanguages: BILINGUAL_CODES,
};

export function getEnabledLanguageCodes(settings: Partial<LanguageSettings> | null | undefined): SupportedLanguage[] {
  const fallback = settings?.mode === "multilingual" ? MULTILINGUAL_CODES : BILINGUAL_CODES;
  const requested = settings?.enabledLanguages?.length ? settings.enabledLanguages : fallback;
  const unique = Array.from(new Set(requested)).filter((code): code is SupportedLanguage =>
    MULTILINGUAL_CODES.includes(code as SupportedLanguage)
  );
  return unique.length ? unique : BILINGUAL_CODES;
}
