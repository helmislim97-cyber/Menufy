import { UtensilsCrossed } from "lucide-react";

export function MenufyBrand({ href = "https://menufy-tau.vercel.app" }: { href?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#1c1f16]/60 hover:text-[#1c1f16] transition-colors">
      <div className="grid h-4 w-4 place-items-center rounded-md bg-gradient-brand">
        <UtensilsCrossed size={8} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="text-xs font-extrabold tracking-tight text-[#1c1f16]/60">Menu<span className="text-primary">fy</span></span>
    </a>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  return (
    <div className="inline-flex items-center gap-2">
      <div className={`${sz} grid place-items-center rounded-xl bg-gradient-brand shadow-glow`}>
        <UtensilsCrossed size={icon} className="text-white" strokeWidth={2.5} />
      </div>
      <span className={`${text} font-extrabold tracking-tight`}>
        Menu<span className="text-primary">fy</span>
      </span>
    </div>
  );
}
