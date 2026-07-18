import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DevEnvironmentBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || typeof window === "undefined" || window.location.hostname !== "dev.keshevplus.com") {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[99999] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-amber-950 shadow-[0_-2px_8px_rgba(0,0,0,0.15)] sm:text-sm"
      data-testid="banner-dev-environment"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        סביבת פיתוח (dev) — לא לשימוש עם נתונים אמיתיים · Development environment — do not use with real data
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full p-1 hover:bg-amber-600/40"
        aria-label="Dismiss"
        data-testid="button-dismiss-dev-banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
