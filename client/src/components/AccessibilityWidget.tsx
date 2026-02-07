import { useState, useEffect, useCallback } from "react";
import { Accessibility, Plus, Minus, X, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface A11yState {
  fontSize: number;
  highContrast: boolean;
  linkHighlight: boolean;
  grayscale: boolean;
  readableFont: boolean;
}

const defaultState: A11yState = {
  fontSize: 0,
  highContrast: false,
  linkHighlight: false,
  grayscale: false,
  readableFont: false,
};

const AccessibilityWidget = () => {
  const { language, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(() => {
    try {
      const saved = localStorage.getItem("a11y-settings");
      return saved ? JSON.parse(saved) : defaultState;
    } catch {
      return defaultState;
    }
  });

  const applyStyles = useCallback((s: A11yState) => {
    const root = document.documentElement;
    root.style.fontSize = s.fontSize ? `${100 + s.fontSize * 10}%` : "";
    root.classList.toggle("a11y-high-contrast", s.highContrast);
    root.classList.toggle("a11y-link-highlight", s.linkHighlight);
    root.classList.toggle("a11y-grayscale", s.grayscale);
    root.classList.toggle("a11y-readable-font", s.readableFont);
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

  const isHe = language === "he";

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 z-[9999] w-12 h-12 rounded-full",
          "bg-[#1565C0] hover:bg-[#0D47A1] text-white",
          "flex items-center justify-center shadow-lg",
          "transition-transform duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
          isRTL ? "left-5" : "right-5"
        )}
        aria-label={isHe ? "תפריט נגישות" : "Accessibility menu"}
        data-testid="button-accessibility-toggle"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {open && (
        <div
          className={cn(
            "fixed bottom-20 z-[9999] w-72 rounded-md shadow-xl",
            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
            "overflow-hidden",
            isRTL ? "left-5" : "right-5"
          )}
          dir={isRTL ? "rtl" : "ltr"}
          role="dialog"
          aria-label={isHe ? "הגדרות נגישות" : "Accessibility settings"}
        >
          <div className="flex items-center justify-between bg-[#1565C0] text-white px-4 py-3">
            <h3 className="font-bold text-sm">
              {isHe ? "הגדרות נגישות" : "Accessibility"}
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              aria-label={isHe ? "סגור" : "Close"}
              data-testid="button-accessibility-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground font-medium">
                {isHe ? "גודל טקסט" : "Text Size"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={decreaseFontSize}
                  className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={isHe ? "הקטן טקסט" : "Decrease text"}
                  data-testid="button-a11y-decrease-font"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs w-8 text-center text-foreground">
                  {state.fontSize > 0 ? `+${state.fontSize}` : state.fontSize}
                </span>
                <button
                  onClick={increaseFontSize}
                  className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={isHe ? "הגדל טקסט" : "Increase text"}
                  data-testid="button-a11y-increase-font"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <ToggleRow
              label={isHe ? "ניגודיות גבוהה" : "High Contrast"}
              active={state.highContrast}
              onClick={() => toggle("highContrast")}
              testId="button-a11y-contrast"
            />
            <ToggleRow
              label={isHe ? "הדגשת קישורים" : "Highlight Links"}
              active={state.linkHighlight}
              onClick={() => toggle("linkHighlight")}
              testId="button-a11y-links"
            />
            <ToggleRow
              label={isHe ? "גווני אפור" : "Grayscale"}
              active={state.grayscale}
              onClick={() => toggle("grayscale")}
              testId="button-a11y-grayscale"
            />
            <ToggleRow
              label={isHe ? "גופן קריא" : "Readable Font"}
              active={state.readableFont}
              onClick={() => toggle("readableFont")}
              testId="button-a11y-font"
            />

            <button
              onClick={reset}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground transition-colors"
              data-testid="button-a11y-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isHe ? "איפוס" : "Reset"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

function ToggleRow({
  label,
  active,
  onClick,
  testId,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between py-2 px-3 rounded text-sm transition-colors",
        active
          ? "bg-[#1565C0]/10 text-[#1565C0] dark:bg-[#1565C0]/20 dark:text-blue-300 font-medium"
          : "bg-gray-50 dark:bg-gray-800 text-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
      data-testid={testId}
    >
      <span>{label}</span>
      <span
        className={cn(
          "w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors",
          active
            ? "bg-[#1565C0] border-[#1565C0]"
            : "border-gray-300 dark:border-gray-600"
        )}
      >
        {active && (
          <svg
            viewBox="0 0 12 12"
            className="w-2.5 h-2.5 text-white fill-current"
          >
            <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default AccessibilityWidget;
