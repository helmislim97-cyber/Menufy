import type { CSSProperties } from "react";
import { Facebook, Instagram } from "lucide-react";
import { LangSwitch } from "@/components/lang-switch";
import { useI18n } from "@/lib/i18n";

const PATTERN_MAP: Record<string, string> = {
  bubbles: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='15' cy='15' r='8' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3Ccircle cx='45' cy='45' r='5' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3Ccircle cx='50' cy='15' r='3' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  dots: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%231c1f1615'/%3E%3C/svg%3E")`,
  hexagons: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='57'%3E%3Cpolygon points='25,2 48,14 48,43 25,55 2,43 2,14' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20'%3E%3Cpath d='M0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 Q70 20 80 10' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  diamonds: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='20' y='2' width='24' height='24' rx='1' fill='none' stroke='%231c1f1615' stroke-width='1.5' transform='rotate(45 20 14)'/%3E%3C/svg%3E")`,
  crosses: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cline x1='15' y1='8' x2='15' y2='22' stroke='%231c1f1615' stroke-width='1.5'/%3E%3Cline x1='8' y1='15' x2='22' y2='15' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  foods: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M20 70 L45 20 L70 70 Z' fill='none' stroke='%231c1f1618' stroke-width='2.5'/%3E%3Ccircle cx='45' cy='38' r='6' fill='%231c1f1618'/%3E%3Ccircle cx='33' cy='55' r='4' fill='%231c1f1618'/%3E%3Ccircle cx='57' cy='55' r='4' fill='%231c1f1618'/%3E%3Crect x='75' y='75' width='36' height='6' rx='3' fill='none' stroke='%231c1f1618' stroke-width='2.5'/%3E%3Crect x='70' y='85' width='46' height='9' rx='4' fill='none' stroke='%231c1f1618' stroke-width='2.5'/%3E%3Crect x='78' y='66' width='30' height='6' rx='3' fill='none' stroke='%231c1f1618' stroke-width='2.5'/%3E%3C/svg%3E")`,
};

interface RestaurantCoverProps {
  name: string;
  logoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tableNumber: string;
  leaving?: boolean;
  onOrder: () => void;
  bgColor?: string;
  bgPattern?: string;
}

export function RestaurantCover({ name, logoUrl, facebookUrl, instagramUrl, tableNumber, leaving, onOrder, bgColor, bgPattern }: RestaurantCoverProps) {
  const { t } = useI18n();
  const bg = bgColor ?? "#f3efe4";
  const hasSocial = !!(facebookUrl || instagramUrl);
  const bgStyle: CSSProperties = {
    backgroundColor: bg,
    ...(bgPattern && bgPattern !== "none" && PATTERN_MAP[bgPattern] ? { backgroundImage: PATTERN_MAP[bgPattern], backgroundSize: "40px 40px" } : {}),
  };

  return (
    <div
      className={`relative flex h-[100dvh] flex-col items-center justify-between overflow-hidden px-6 py-4 text-[#1c1f16] transition-opacity duration-300 ease-out ${leaving ? "opacity-0" : "opacity-100"}`}
      style={bgStyle}
    >
      <div className="absolute right-4 top-4 z-10">
        <LangSwitch variant="light" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center pt-12">
        <div className="flex h-60 w-56 flex-col items-center justify-center rounded-[3rem] border border-[#1c1f16]/25 px-6 text-center">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="max-h-40 max-w-full object-contain" />
          ) : (
            <p className="font-display text-2xl font-extrabold uppercase tracking-[0.2em]">{name}</p>
          )}
        </div>

        {hasSocial && (
          <div className="mt-5 flex gap-4">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25 transition-colors hover:bg-[#1c1f16]/5" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25 transition-colors hover:bg-[#1c1f16]/5" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-md pb-2">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.3em] text-[#1c1f16]/50">
          {t("client.table")} {tableNumber}
        </p>
        <button
          onClick={onOrder}
          disabled={leaving}
          className="w-full rounded-2xl bg-[#1c1f16] py-3.5 text-base font-extrabold uppercase tracking-widest transition-transform active:scale-[0.98]"
          style={{ color: bg }}
        >
          {t("client.orderNow")}
        </button>
      </div>
    </div>
  );
}