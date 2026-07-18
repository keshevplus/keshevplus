import { AlertTriangle } from "lucide-react";

export default function DevEnvironmentBanner() {
  if (typeof window === "undefined" || window.location.hostname !== "dev.keshevplus.com") {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-amber-950 sm:text-sm"
      data-testid="banner-dev-environment"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        סביבת פיתוח (dev) — לא לשימוש עם נתונים אמיתיים · Development environment — do not use with real data
      </span>
    </div>
  );
}
