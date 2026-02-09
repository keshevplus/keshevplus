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
  { code: "he", nativeName: "\u05e2\u05d1\u05e8\u05d9\u05ea", flag: "\ud83c\uddee\ud83c\uddf1", dir: "rtl" },
  { code: "en", nativeName: "English", flag: "\ud83c\uddfa\ud83c\uddf8", dir: "ltr" },
  { code: "fr", nativeName: "Fran\u00e7ais", flag: "\ud83c\uddeb\ud83c\uddf7", dir: "ltr" },
  { code: "es", nativeName: "Espa\u00f1ol", flag: "\ud83c\uddea\ud83c\uddf8", dir: "ltr" },
  { code: "de", nativeName: "Deutsch", flag: "\ud83c\udde9\ud83c\uddea", dir: "ltr" },
  { code: "ru", nativeName: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", flag: "\ud83c\uddf7\ud83c\uddfa", dir: "ltr" },
  { code: "am", nativeName: "\u12a0\u121b\u122d\u129b", flag: "\ud83c\uddea\ud83c\uddf9", dir: "ltr" },
  { code: "ar", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", flag: "\ud83c\uddf8\ud83c\udde6", dir: "rtl" },
  { code: "yi", nativeName: "\u05d9\u05d9\u05b4\u05d3\u05d9\u05e9", flag: "\ud83c\uddee\ud83c\uddf1", dir: "rtl" },
  { code: "it", nativeName: "Italiano", flag: "\ud83c\uddee\ud83c\uddf9", dir: "ltr" },
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
}

export const DEFAULT_LANGUAGE_SETTINGS: LanguageSettings = {
  enabled: false,
  mode: "bilingual",
  defaultLanguage: "he",
};
