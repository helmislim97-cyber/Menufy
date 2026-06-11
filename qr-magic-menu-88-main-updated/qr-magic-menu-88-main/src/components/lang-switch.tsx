import { useI18n } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "fr" ? "ar" : "fr")}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent ${className}`}
      aria-label="Change language"
    >
      <Languages className="h-3.5 w-3.5" />
      {locale === "fr" ? "العربية" : "Français"}
    </button>
  );
}
