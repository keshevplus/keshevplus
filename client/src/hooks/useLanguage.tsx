import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import {
  type SupportedLanguage,
  type LanguageInfo,
  type LanguageSettings,
  ALL_LANGUAGES,
  BILINGUAL_CODES,
  MULTILINGUAL_CODES,
  DEFAULT_LANGUAGE_SETTINGS,
  getTranslation as getStaticTranslation,
  getLanguageInfo,
  isRTL as checkRTL,
} from "@/i18n/config";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  isRTL: boolean;
  dir: "ltr" | "rtl";
  settings: LanguageSettings;
  availableLanguages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dbTranslationsCache: Record<string, Record<string, string>> = {};

async function fetchDbTranslations(lang: string): Promise<Record<string, string>> {
  if (dbTranslationsCache[lang]) return dbTranslationsCache[lang];
  try {
    const res = await fetch(`/api/translations?lang=${lang}`);
    if (res.ok) {
      const data = await res.json();
      dbTranslationsCache[lang] = data;
      return data;
    }
  } catch {}
  return {};
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<LanguageSettings>(DEFAULT_LANGUAGE_SETTINGS);
  const [language, setLanguageState] = useState<SupportedLanguage>("he");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [dbTranslations, setDbTranslations] = useState<Record<string, string>>({});
  const [enFallback, setEnFallback] = useState<Record<string, string>>({});
  const loadingRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/language", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setSettings(data);
          const saved = localStorage.getItem("language") as SupportedLanguage | null;
          if (saved && isLanguageAvailable(saved, data)) {
            setLanguageState(saved);
          } else {
            setLanguageState(data.defaultLanguage || "he");
          }
        } else {
          const saved = localStorage.getItem("language") as SupportedLanguage | null;
          if (saved) setLanguageState(saved);
        }
      })
      .catch(() => {
        const saved = localStorage.getItem("language") as SupportedLanguage | null;
        if (saved) setLanguageState(saved);
      })
      .finally(() => setSettingsLoaded(true));

    fetchDbTranslations("he").then(setEnFallback);
  }, []);

  useEffect(() => {
    if (loadingRef.current === language) return;
    loadingRef.current = language;
    fetchDbTranslations(language).then((data) => {
      if (loadingRef.current === language) {
        setDbTranslations(data);
      }
    });
  }, [language]);

  useEffect(() => {
    if (!settingsLoaded) return;
    const rtl = checkRTL(language);
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, settingsLoaded]);

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      if (isLanguageAvailable(lang, settings)) {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
      }
    },
    [settings]
  );

  const t = useCallback(
    (key: string): string => {
      if (dbTranslations[key]) return dbTranslations[key];
      if (enFallback[key]) {
        const staticVal = getStaticTranslation(language, key);
        if (staticVal !== key) return staticVal;
        return enFallback[key];
      }
      return getStaticTranslation(language, key);
    },
    [language, dbTranslations, enFallback]
  );

  const rtl = checkRTL(language);

  const availableLanguages = getAvailableLanguages(settings);

  const currentLanguageInfo = getLanguageInfo(language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL: rtl,
        dir: rtl ? "rtl" : "ltr",
        settings,
        availableLanguages,
        currentLanguageInfo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

function isLanguageAvailable(lang: SupportedLanguage, settings: LanguageSettings): boolean {
  if (!settings.enabled) {
    return lang === "he" || lang === "en";
  }
  const codes = settings.mode === "bilingual" ? BILINGUAL_CODES : MULTILINGUAL_CODES;
  return codes.includes(lang);
}

function getAvailableLanguages(settings: LanguageSettings): LanguageInfo[] {
  if (!settings.enabled) {
    return ALL_LANGUAGES.filter((l) => BILINGUAL_CODES.includes(l.code));
  }
  const codes = settings.mode === "bilingual" ? BILINGUAL_CODES : MULTILINGUAL_CODES;
  return ALL_LANGUAGES.filter((l) => codes.includes(l.code));
}

export function invalidateTranslationCache(lang?: string) {
  if (lang) {
    delete dbTranslationsCache[lang];
  } else {
    Object.keys(dbTranslationsCache).forEach(k => delete dbTranslationsCache[k]);
  }
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
