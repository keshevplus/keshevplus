import { useState, useEffect, useCallback } from "react";
import { Plus, Minus, X, RotateCcw, Moon, Sun } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const translations: Record<string, Record<string, string>> = {
  accessibilitySettings: {
    he: "הגדרות נגישות",
    en: "Accessibility settings",
  },
  textSize: {
    he: "גודל טקסט",
    en: "Text Size",
  },
  decreaseText: {
    he: "הקטן טקסט",
    en: "Decrease text",
  },
  increaseText: {
    he: "הגדל טקסט",
    en: "Increase text",
  },
  highContrast: {
    he: "ניגודיות גבוהה",
    en: "High Contrast",
  },
  highlightLinks: {
    he: "הדגשת קישורים",
    en: "Highlight Links",
  },
  grayscale: {
    he: "גווני אפור",
    en: "Grayscale",
  },
  readableFont: {
    he: "גופן קריא",
    en: "Readable Font",
  },
  largeCursor: {
    he: "סמן גדול",
    en: "Large Cursor",
  },
  stopAnimations: {
    he: "עצירת אנימציות",
    en: "Stop Animations",
  },
  reset: {
    he: "איפוס",
    en: "Reset",
  },
  close: {
    he: "סגור",
    en: "Close",
  },
  accessibilityMenu: {
    he: "תפריט נגישות",
    en: "Accessibility menu",
  },
  darkMode: {
    he: "מצב כהה",
    en: "Dark Mode",
  },
  lightMode: {
    he: "מצב בהיר",
    en: "Light Mode",
  },
  accessibilityStatement: {
    he: "הצהרת נגישות",
    en: "Accessibility Statement",
  },
  accessibilityStatementText: {
    he: "אתר זה מחויב לנגישות דיגיטלית בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ותקנות הנגישות הישראליות.",
    en: "This site is committed to digital accessibility in accordance with Israeli Law.",
  },
};

interface A11yState {
  fontSize: number;
  highContrast: boolean;
  linkHighlight: boolean;
  grayscale: boolean;
  readableFont: boolean;
  largeCursor: boolean;
  stopAnimations: boolean;
}

const defaultState: A11yState = {
  fontSize: 0,
  highContrast: false,
  linkHighlight: false,
  grayscale: false,
  readableFont: false,
  largeCursor: false,
  stopAnimations: false,
};

const AccessibilityWidget = () => {
  const { language, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  
  const { data: widgetSettings } = useQuery<any>({
    queryKey: ['/api/settings/widgets'],
  });

  const [state, setState] = useState<A11yState>(() => {
    try {
      const saved = localStorage.getItem("a11y-settings");
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  const applyStyles = useCallback((s: A11yState) => {
    const root = document.documentElement;
    root.style.fontSize = s.fontSize ? `${100 + s.fontSize * 10}%` : "";
    root.classList.toggle("a11y-high-contrast", s.highContrast);
    root.classList.toggle("a11y-link-highlight", s.linkHighlight);
    root.classList.toggle("a11y-grayscale", s.grayscale);
    root.classList.toggle("a11y-readable-font", s.readableFont);
    root.classList.toggle("a11y-large-cursor", s.largeCursor);
    root.classList.toggle("a11y-stop-animations", s.stopAnimations);
  }, []);

  useEffect(() => {
    applyStyles(state);
    localStorage.setItem("a11y-settings", JSON.stringify(state));
  }, [state, applyStyles]);

  const increaseFontSize = () =>
    setState((p) => ({ ...p, fontSize: Math.min(p.fontSize + 1, 5) }));
  const decreaseFontSize = () =>
    setState((p) => ({ ...p, fontSize: Math.max(p.fontSize - 1, -3) }));
  const toggle = (key: keyof Omit<A11yState, "fontSize">) =>
    setState((p) => ({ ...p, [key]: !p[key] }));
  const reset = () => {
    setState(defaultState);
    applyStyles(defaultState);
  };

  if (widgetSettings?.showAccessibility === false) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 z-[9999] w-12 h-12 rounded-xl shadow-lg transition-transform duration-200 hover:scale-110",
          "bg-[#0056b3] text-white",
          "flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
          isRTL ? "right-5" : "left-5"
        )}
        aria-label={t("accessibilityMenu")}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11.5" cy="3.5" r="2.5"/>
          <path d="M10 7c-1.1 0-2 .9-2 2v5h2v6h3l2.5 0 1.5 3h2.5l-2-4H14v-7h3v-2h-4V9c0-1.1-.9-2-2-2h-1z"/>
          <path d="M7.5 16.5a5 5 0 1 0 5-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div
          className={cn(
            "fixed bottom-20 z-[9999] w-72 rounded-xl shadow-2xl overflow-hidden",
            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
            isRTL ? "right-5" : "left-5"
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="flex items-center justify-between bg-[#1565C0] text-white px-4 py-3">
            <h3 className="font-bold text-sm">{t("accessibilitySettings")}</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? t("lightMode") : t("darkMode")}</span>
              </div>
              <div className={cn("w-10 h-5 rounded-full relative transition-colors bg-muted")}>
                <div className={cn("absolute top-1 w-3 h-3 rounded-full transition-all bg-primary", isRTL ? (theme === 'dark' ? "left-1" : "right-1") : (theme === 'dark' ? "right-1" : "left-1"))} />
              </div>
            </button>

            <div className="flex items-center justify-between gap-2 border-b pb-3">
              <span className="text-sm font-medium">{t("textSize")}</span>
              <div className="flex items-center gap-1">
                <button onClick={decreaseFontSize} className="w-8 h-8 rounded bg-muted hover:bg-muted/80 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="text-xs w-8 text-center">{state.fontSize > 0 ? `+${state.fontSize}` : state.fontSize}</span>
                <button onClick={increaseFontSize} className="w-8 h-8 rounded bg-muted hover:bg-muted/80 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <ToggleRow label={t("highContrast")} active={state.highContrast} onClick={() => toggle("highContrast")} />
            <ToggleRow label={t("highlightLinks")} active={state.linkHighlight} onClick={() => toggle("linkHighlight")} />
            <ToggleRow label={t("grayscale")} active={state.grayscale} onClick={() => toggle("grayscale")} />
            <ToggleRow label={t("readableFont")} active={state.readableFont} onClick={() => toggle("readableFont")} />
            <ToggleRow label={t("largeCursor")} active={state.largeCursor} onClick={() => toggle("largeCursor")} />
            <ToggleRow label={t("stopAnimations")} active={state.stopAnimations} onClick={() => toggle("stopAnimations")} />

            <button onClick={reset} className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              {t("reset")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

function ToggleRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center justify-between py-2 px-3 rounded text-sm transition-colors", active ? "bg-[#1565C0]/10 text-[#1565C0] font-medium" : "bg-gray-50 dark:bg-gray-800 text-foreground hover:bg-gray-100")}>
      <span>{label}</span>
      <span className={cn("w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors", active ? "bg-[#1565C0] border-[#1565C0]" : "border-gray-300")}>
        {active && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white fill-current"><path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
    </button>
  );
}

export default AccessibilityWidget;
