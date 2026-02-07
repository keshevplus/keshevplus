import { useState, useEffect, useCallback } from "react";
import { Accessibility, Plus, Minus, X, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const translations: Record<string, Record<string, string>> = {
  accessibilitySettings: {
    he: "הגדרות נגישות",
    en: "Accessibility settings",
    fr: "Paramètres d'accessibilité",
    es: "Configuración de accesibilidad",
    de: "Barrierefreiheit-Einstellungen",
    ru: "Настройки доступности",
    am: "ተደራሽነት ቅንብሮች",
    ar: "إعدادات إمكانية الوصول",
    yi: "צוגענגלעכקייט אינשטעלונגען",
  },
  textSize: {
    he: "גודל טקסט",
    en: "Text Size",
    fr: "Taille du texte",
    es: "Tamaño del texto",
    de: "Textgröße",
    ru: "Размер текста",
    am: "የጽሑፍ መጠን",
    ar: "حجم النص",
    yi: "טעקסט גרייס",
  },
  decreaseText: {
    he: "הקטן טקסט",
    en: "Decrease text",
    fr: "Réduire le texte",
    es: "Reducir texto",
    de: "Text verkleinern",
    ru: "Уменьшить текст",
    am: "ጽሑፍ ቀንስ",
    ar: "تصغير النص",
    yi: "פארקלענערן טעקסט",
  },
  increaseText: {
    he: "הגדל טקסט",
    en: "Increase text",
    fr: "Agrandir le texte",
    es: "Aumentar texto",
    de: "Text vergrößern",
    ru: "Увеличить текст",
    am: "ጽሑፍ ጨምር",
    ar: "تكبير النص",
    yi: "פארגרעסערן טעקסט",
  },
  highContrast: {
    he: "ניגודיות גבוהה",
    en: "High Contrast",
    fr: "Contraste élevé",
    es: "Alto contraste",
    de: "Hoher Kontrast",
    ru: "Высокая контрастность",
    am: "ከፍተኛ ንፅፅር",
    ar: "تباين عالٍ",
    yi: "הויכער קאָנטראַסט",
  },
  highlightLinks: {
    he: "הדגשת קישורים",
    en: "Highlight Links",
    fr: "Surligner les liens",
    es: "Resaltar enlaces",
    de: "Links hervorheben",
    ru: "Выделить ссылки",
    am: "አገናኞችን አድምቅ",
    ar: "تمييز الروابط",
    yi: "באַלויכטן לינקס",
  },
  grayscale: {
    he: "גווני אפור",
    en: "Grayscale",
    fr: "Niveaux de gris",
    es: "Escala de grises",
    de: "Graustufen",
    ru: "Оттенки серого",
    am: "ግራጫ ቀለም",
    ar: "تدرج الرمادي",
    yi: "גרוי טענער",
  },
  readableFont: {
    he: "גופן קריא",
    en: "Readable Font",
    fr: "Police lisible",
    es: "Fuente legible",
    de: "Lesbare Schrift",
    ru: "Читаемый шрифт",
    am: "ሊነበብ የሚችል ቅርጸ-ቁምፊ",
    ar: "خط مقروء",
    yi: "לייענבאַר שריפֿט",
  },
  largeCursor: {
    he: "סמן גדול",
    en: "Large Cursor",
    fr: "Grand curseur",
    es: "Cursor grande",
    de: "Großer Cursor",
    ru: "Большой курсор",
    am: "ትልቅ ጠቋሚ",
    ar: "مؤشر كبير",
    yi: "גרויסער קורסאָר",
  },
  stopAnimations: {
    he: "עצירת אנימציות",
    en: "Stop Animations",
    fr: "Arrêter les animations",
    es: "Detener animaciones",
    de: "Animationen stoppen",
    ru: "Остановить анимации",
    am: "እንቅስቃሴዎችን ያቁሙ",
    ar: "إيقاف الرسوم المتحركة",
    yi: "שטעלן אַנימאַציעס",
  },
  reset: {
    he: "איפוס",
    en: "Reset",
    fr: "Réinitialiser",
    es: "Restablecer",
    de: "Zurücksetzen",
    ru: "Сбросить",
    am: "ዳግም አስጀምር",
    ar: "إعادة تعيين",
    yi: "צוריקשטעלן",
  },
  close: {
    he: "סגור",
    en: "Close",
    fr: "Fermer",
    es: "Cerrar",
    de: "Schließen",
    ru: "Закрыть",
    am: "ዝጋ",
    ar: "إغلاق",
    yi: "שליסן",
  },
  accessibilityMenu: {
    he: "תפריט נגישות",
    en: "Accessibility menu",
    fr: "Menu d'accessibilité",
    es: "Menú de accesibilidad",
    de: "Barrierefreiheit-Menü",
    ru: "Меню доступности",
    am: "ተደራሽነት ምናሌ",
    ar: "قائمة إمكانية الوصول",
    yi: "צוגענגלעכקייט מעניו",
  },
  accessibilityStatement: {
    he: "הצהרת נגישות",
    en: "Accessibility Statement",
    fr: "Déclaration d'accessibilité",
    es: "Declaración de accesibilidad",
    de: "Barrierefreiheitserklärung",
    ru: "Заявление о доступности",
    am: "ተደራሽነት መግለጫ",
    ar: "بيان إمكانية الوصول",
    yi: "צוגענגלעכקייט דערקלערונג",
  },
  accessibilityStatementText: {
    he: "אתר זה מחויב לנגישות דיגיטלית בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ותקנות הנגישות הישראליות. אנו פועלים להנגיש את האתר בהתאם לתקן הישראלי 5568 ולהנחיות WCAG 2.1 ברמה AA.",
    en: "This site is committed to digital accessibility in accordance with Israeli Equal Rights for People with Disabilities Law and accessibility regulations. We strive to make the site accessible per Israeli Standard 5568 and WCAG 2.1 Level AA guidelines.",
    fr: "Ce site s'engage en faveur de l'accessibilité numérique conformément à la loi israélienne sur l'égalité des droits pour les personnes handicapées et aux réglementations en matière d'accessibilité. Nous nous efforçons de rendre le site accessible conformément à la norme israélienne 5568 et aux directives WCAG 2.1 niveau AA.",
    es: "Este sitio está comprometido con la accesibilidad digital de acuerdo con la Ley de Igualdad de Derechos para Personas con Discapacidades de Israel y las regulaciones de accesibilidad. Nos esforzamos por hacer el sitio accesible según la Norma Israelí 5568 y las pautas WCAG 2.1 Nivel AA.",
    de: "Diese Website verpflichtet sich zur digitalen Barrierefreiheit gemäß dem israelischen Gleichstellungsgesetz für Menschen mit Behinderungen und den Barrierefreiheitsvorschriften. Wir bemühen uns, die Website gemäß dem israelischen Standard 5568 und den WCAG 2.1 Level AA-Richtlinien zugänglich zu machen.",
    ru: "Этот сайт привержен цифровой доступности в соответствии с израильским Законом о равных правах для людей с ограниченными возможностями и правилами доступности. Мы стремимся сделать сайт доступным в соответствии с израильским стандартом 5568 и руководством WCAG 2.1 уровня AA.",
    am: "ይህ ድረ-ገጽ በእስራኤል የአካል ጉዳተኞች እኩል መብቶች ሕግ እና ተደራሽነት ደንቦች መሠረት ለዲጂታል ተደራሽነት ቁርጠኛ ነው። ድረ-ገጹን በእስራኤል ደረጃ 5568 እና WCAG 2.1 ደረጃ AA መመሪያዎች መሠረት ተደራሽ ለማድረግ እንጥራለን።",
    ar: "يلتزم هذا الموقع بإمكانية الوصول الرقمي وفقًا لقانون المساواة في الحقوق للأشخاص ذوي الإعاقة الإسرائيلي ولوائح إمكانية الوصول. نسعى لجعل الموقع متاحًا وفقًا للمعيار الإسرائيلي 5568 وإرشادات WCAG 2.1 المستوى AA.",
    yi: "דער וועבזייטל איז פארפליכט צו דיגיטאלע צוגענגלעכקייט לויט דעם ישראלדיקן גלייכע רעכט געזעץ פאר מענטשן מיט באהינדערונגען און צוגענגלעכקייט רעגולאציעס. מיר שטרעבן צו מאכן דעם וועבזייטל צוגענגלעך לויט ישראלדיקן סטאנדארט 5568 און WCAG 2.1 AA ריכטליניען.",
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
  const [open, setOpen] = useState(false);
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
        aria-label={t("accessibilityMenu")}
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
          aria-label={t("accessibilitySettings")}
        >
          <div className="flex items-center justify-between bg-[#1565C0] text-white px-4 py-3">
            <h3 className="font-bold text-sm">
              {t("accessibilitySettings")}
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              aria-label={t("close")}
              data-testid="button-accessibility-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground font-medium">
                {t("textSize")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={decreaseFontSize}
                  className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={t("decreaseText")}
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
                  aria-label={t("increaseText")}
                  data-testid="button-a11y-increase-font"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <ToggleRow
              label={t("highContrast")}
              active={state.highContrast}
              onClick={() => toggle("highContrast")}
              testId="button-a11y-contrast"
            />
            <ToggleRow
              label={t("highlightLinks")}
              active={state.linkHighlight}
              onClick={() => toggle("linkHighlight")}
              testId="button-a11y-links"
            />
            <ToggleRow
              label={t("grayscale")}
              active={state.grayscale}
              onClick={() => toggle("grayscale")}
              testId="button-a11y-grayscale"
            />
            <ToggleRow
              label={t("readableFont")}
              active={state.readableFont}
              onClick={() => toggle("readableFont")}
              testId="button-a11y-font"
            />
            <ToggleRow
              label={t("largeCursor")}
              active={state.largeCursor}
              onClick={() => toggle("largeCursor")}
              testId="button-a11y-cursor"
            />
            <ToggleRow
              label={t("stopAnimations")}
              active={state.stopAnimations}
              onClick={() => toggle("stopAnimations")}
              testId="button-a11y-animations"
            />

            <button
              onClick={reset}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground transition-colors"
              data-testid="button-a11y-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t("reset")}
            </button>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-bold text-[#1565C0] dark:text-blue-300 mb-1">
                {t("accessibilityStatement")}
              </h4>
              <p className="text-[10px] leading-tight text-muted-foreground" data-testid="text-accessibility-statement">
                {t("accessibilityStatementText")}
              </p>
            </div>
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
