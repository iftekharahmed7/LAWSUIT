import { cn } from "../utils";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * Drop this into the site header/nav. Shows the language you'll switch TO,
 * which is the common convention for language toggles (EN -> shows "বাংলা").
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Switch language"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border",
        "bg-card px-3 py-1.5 text-sm font-medium text-foreground",
        "transition-colors hover:bg-muted",
        className,
      )}
    >
      <span className={language === "en" ? "opacity-100" : "opacity-50"}>
        EN
      </span>
      <span className="opacity-30">/</span>
      <span className={language === "bn" ? "opacity-100" : "opacity-50"}>
        বাংলা
      </span>
    </button>
  );
}