import type { CSSProperties } from "react";
import { Facebook, Instagram, Wifi } from "lucide-react";

type OpeningHours = Record<string, { isOpen: boolean; slots: { open: string; close: string }[] }>;

function getOpenStatus(openingHours: OpeningHours | null | undefined, brandColor: string): { label: string; isOpen: boolean; color: string } | null {
  if (!openingHours) return null;
  const todayKey = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];
  const dh = openingHours[todayKey];
  if (!dh) return null;
  if (!dh.isOpen || dh.slots.length === 0) return { label: "Fermé aujourd'hui", isOpen: false, color: "#1c1f1660" };
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const slot of dh.slots) {
    const [oh, om] = slot.open.split(":").map(Number);
    const [ch, cm] = slot.close.split(":").map(Number);
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    if (nowMin >= openMin && nowMin < closeMin) {
      return { label: `Ouvert · ferme à ${slot.close}`, isOpen: true, color: brandColor };
    }
  }
  const nextSlot = dh.slots.find(s => {
    const [oh, om] = s.open.split(":").map(Number);
    return oh * 60 + om > nowMin;
  });
  if (nextSlot) return { label: `Ouvre à ${nextSlot.open}`, isOpen: false, color: "#1c1f1660" };
  return { label: "Fermé", isOpen: false, color: "#1c1f1660" };
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
import { LangSwitch } from "@/components/lang-switch";
import { useI18n } from "@/lib/i18n";

const PATTERN_MAP: Record<string, string> = {
  bubbles: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='15' cy='15' r='8' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3Ccircle cx='45' cy='45' r='5' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3Ccircle cx='50' cy='15' r='3' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  dots: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect x='10' y='52' width='60' height='10' rx='5' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='8' y='65' width='64' height='14' rx='7' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='10' y='82' width='60' height='10' rx='5' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Cellipse cx='40' cy='48' rx='32' ry='12' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='90' y='85' width='58' height='9' rx='4' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='86' y='97' width='66' height='13' rx='6' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='90' y='113' width='58' height='9' rx='4' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='86' y='75' width='66' height='9' rx='4' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Cline x1='119' y1='20' x2='119' y2='73' stroke='%231c1f1625' stroke-width='2'/%3E%3Cline x1='105' y1='30' x2='133' y2='30' stroke='%231c1f1625' stroke-width='2'/%3E%3Cpath d='M105 30 Q119 55 133 30' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3C/svg%3E")`,
  hexagons: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='57'%3E%3Cpolygon points='25,2 48,14 48,43 25,55 2,43 2,14' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20'%3E%3Cpath d='M0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 Q70 20 80 10' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  diamonds: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='20' y='2' width='24' height='24' rx='1' fill='none' stroke='%231c1f1615' stroke-width='1.5' transform='rotate(45 20 14)'/%3E%3C/svg%3E")`,
  crosses: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cline x1='15' y1='8' x2='15' y2='22' stroke='%231c1f1615' stroke-width='1.5'/%3E%3Cline x1='8' y1='15' x2='22' y2='15' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  foods: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M20 70 L45 20 L70 70 Z' fill='none' stroke='%231c1f1625' stroke-width='2.5'/%3E%3Ccircle cx='45' cy='38' r='6' fill='%231c1f1625'/%3E%3Ccircle cx='33' cy='55' r='4' fill='%231c1f1625'/%3E%3Ccircle cx='57' cy='55' r='4' fill='%231c1f1625'/%3E%3Crect x='75' y='75' width='36' height='6' rx='3' fill='none' stroke='%231c1f1625' stroke-width='2.5'/%3E%3Crect x='70' y='85' width='46' height='9' rx='4' fill='none' stroke='%231c1f1625' stroke-width='2.5'/%3E%3Crect x='78' y='66' width='30' height='6' rx='3' fill='none' stroke='%231c1f1625' stroke-width='2.5'/%3E%3C/svg%3E")`,
};

interface RestaurantCoverProps {
  name: string;
  logoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
  tableNumber: string;
  leaving?: boolean;
  onOrder: () => void;
  bgColor?: string;
  bgPattern?: string;
  brandColor?: string;
  openingHours?: OpeningHours | null;
  wifi?: string | null;
}

export function RestaurantCover({ name, logoUrl, facebookUrl, instagramUrl, tiktokUrl, twitterUrl, tableNumber, leaving, onOrder, bgColor, bgPattern, brandColor, openingHours, wifi }: RestaurantCoverProps) {
  const { t } = useI18n();
  const bg = bgColor ?? "#f3efe4";
  const brand = brandColor ?? "#7ab450";
  const hasSocial = !!(facebookUrl || instagramUrl || tiktokUrl || twitterUrl);
  const openStatus = getOpenStatus(openingHours, brand);
  const bgStyle: CSSProperties = {
    backgroundColor: bg,
    ...(bgPattern && bgPattern !== "none" && PATTERN_MAP[bgPattern] ? { backgroundImage: PATTERN_MAP[bgPattern], backgroundSize: bgPattern === "foods" ? "120px 120px" : bgPattern === "hexagons" ? "80px 80px" : bgPattern === "bubbles" ? "80px 80px" : bgPattern === "dots" ? "160px 160px" : bgPattern === "waves" ? "100px 30px" : bgPattern === "diamonds" ? "60px 60px" : bgPattern === "crosses" ? "50px 50px" : "40px 40px" } : {}),
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
        <div className="flex h-60 w-56 flex-col items-center justify-center rounded-[3rem] border border-[#1c1f16]/25 px-6 text-center" style={{ backgroundColor: bg }}>
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="max-h-40 max-w-full object-contain" />
          ) : (
            <p className="font-display text-2xl font-extrabold uppercase tracking-[0.2em]">{name}</p>
          )}
        </div>

        {openStatus && (
          <div className="mt-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: `${openStatus.color}18`, color: openStatus.color, border: `1px solid ${openStatus.color}30` }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: openStatus.color }} />
            {openStatus.label}
          </div>
        )}

        {hasSocial && (
          <div className="mt-4 flex gap-4">
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
            {tiktokUrl && (
              <a href={tiktokUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25 transition-colors hover:bg-[#1c1f16]/5" aria-label="TikTok">
                <TikTokIcon className="h-4 w-4" />
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25 transition-colors hover:bg-[#1c1f16]/5" aria-label="X">
                <XIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-md pb-2">
        {wifi?.trim() && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/60 border border-[#1c1f16]/10 px-4 py-3">
            <Wifi className="h-4 w-4 shrink-0 text-[#1c1f16]/40" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.wifi")}</p>
              <p className="text-sm font-mono text-[#1c1f16]/80">{wifi}</p>
            </div>
          </div>
        )}
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