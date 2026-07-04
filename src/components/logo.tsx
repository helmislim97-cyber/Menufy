function MenufyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="96" height="96" rx="24" fill="#7ab450" />
      <rect x="16" y="16" width="30" height="30" rx="9" fill="#fff" />
      <rect x="25" y="25" width="12" height="12" rx="4" fill="#7ab450" />
      <rect x="54" y="16" width="30" height="30" rx="9" fill="#fff" />
      <rect x="63" y="25" width="12" height="12" rx="4" fill="#7ab450" />
      <rect x="16" y="54" width="30" height="30" rx="9" fill="#fff" />
      <rect x="25" y="63" width="12" height="12" rx="4" fill="#7ab450" />
      <rect x="54" y="55" width="12" height="12" rx="3.5" fill="#fff" />
      <rect x="72" y="55" width="12" height="12" rx="3.5" fill="#fff" />
      <rect x="54" y="72" width="12" height="12" rx="3.5" fill="#fff" />
      <rect x="72" y="72" width="12" height="12" rx="3.5" fill="#D4A843" />
    </svg>
  );
}

export function MenufyBrand({ href = "https://menufy.tn" }: { href?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80">
      <MenufyIcon className="h-4 w-4" />
      <span className="text-xs font-bold tracking-tight text-[#0C1F17]/60" style={{ fontFamily: "var(--font-display)" }}>
        menu<span className="text-primary">fy</span>
      </span>
    </a>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  return (
    <div className="inline-flex items-center gap-2">
      <MenufyIcon className={sz} />
      <span className={`${text} font-bold tracking-tight`} style={{ fontFamily: "var(--font-display)" }}>
        menu<span className="text-primary">fy</span>
      </span>
    </div>
  );
}

export function LogoIcon({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  return <MenufyIcon className={sz} />;
}