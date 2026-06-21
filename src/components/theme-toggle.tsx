import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("menufy.dashboardTheme");
  return stored === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeToggle({ expanded }: { expanded?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("menufy.dashboardTheme", next);
  };

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
      className={
        expanded
          ? "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
          : "grid h-11 w-11 mx-auto place-items-center rounded-full text-white/70 hover:bg-white/5 hover:text-white"
      }
    >
      {theme === "dark" ? <Sun className="h-[18px] w-[18px] shrink-0" /> : <Moon className="h-[18px] w-[18px] shrink-0" />}
      {expanded && (theme === "dark" ? "Mode clair" : "Mode sombre")}
    </button>
  );
}