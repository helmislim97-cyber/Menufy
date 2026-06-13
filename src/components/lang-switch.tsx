import { useI18n, type Locale } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

export const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇹🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function LangSwitch({ className = "", variant = "default" }: { className?: string; variant?: "default" | "light" }) {
  const { locale, setLocale } = useI18n();
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const styles =
    variant === "light"
      ? "border-[#1c1f16]/20 bg-white/40 text-[#1c1f16]"
      : "border-border bg-surface text-foreground hover:bg-accent";

  return (
    <div className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${styles} ${className}`}>
      <span>{current.flag}</span>
      <span>{current.label}</span>
      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Change language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}