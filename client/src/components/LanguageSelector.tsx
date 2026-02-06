import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportedLanguage } from "@/i18n/config";

export function LanguageSelector() {
  const { language, setLanguage, availableLanguages, settings, currentLanguageInfo } = useLanguage();

  if (availableLanguages.length <= 1) return null;

  if (!settings.enabled && availableLanguages.length === 2) {
    const other = availableLanguages.find((l) => l.code !== language);
    if (!other) return null;
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(other.code)}
        data-testid="button-language-toggle"
        aria-label={`Switch to ${other.nativeName}`}
      >
        <span className="text-base" role="img" aria-hidden="true">{other.flag}</span>
        <span className="hidden sm:inline ml-1 text-sm">{other.nativeName}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-testid="button-language-selector"
          aria-label="Select language"
        >
          {currentLanguageInfo ? (
            <>
              <span className="text-base" role="img" aria-hidden="true">{currentLanguageInfo.flag}</span>
              <span className="hidden sm:inline ml-1 text-sm">{currentLanguageInfo.nativeName}</span>
            </>
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as SupportedLanguage)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              language === lang.code && "bg-accent"
            )}
            data-testid={`menu-language-${lang.code}`}
          >
            <span className="text-base" role="img" aria-hidden="true">{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
