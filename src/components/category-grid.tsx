import type { CSSProperties } from "react";
import { ArrowLeft, Facebook, Instagram, MapPin, Phone, Info, Wifi, Clock } from "lucide-react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi", thursday: "Jeudi",
  friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche",
};
const TODAY_KEY = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];

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
  bubbles: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='15' cy='15' r='8' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3Ccircle cx='45' cy='45' r='5' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  dots: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect x='10' y='52' width='60' height='10' rx='5' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='8' y='65' width='64' height='14' rx='7' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='10' y='82' width='60' height='10' rx='5' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Cellipse cx='40' cy='48' rx='32' ry='12' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='90' y='85' width='58' height='9' rx='4' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='86' y='97' width='66' height='13' rx='6' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='90' y='113' width='58' height='9' rx='4' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Crect x='86' y='75' width='66' height='9' rx='4' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3Cline x1='119' y1='20' x2='119' y2='73' stroke='%231c1f1625' stroke-width='2'/%3E%3Cline x1='105' y1='30' x2='133' y2='30' stroke='%231c1f1625' stroke-width='2'/%3E%3Cpath d='M105 30 Q119 55 133 30' fill='none' stroke='%231c1f1625' stroke-width='2'/%3E%3C/svg%3E")`,
  hexagons: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='57'%3E%3Cpolygon points='25,2 48,14 48,43 25,55 2,43 2,14' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20'%3E%3Cpath d='M0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 Q70 20 80 10' fill='none' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  diamonds: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='20' y='2' width='24' height='24' rx='1' fill='none' stroke='%231c1f1615' stroke-width='1.5' transform='rotate(45 20 14)'/%3E%3C/svg%3E")`,
  crosses: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cline x1='15' y1='8' x2='15' y2='22' stroke='%231c1f1615' stroke-width='1.5'/%3E%3Cline x1='8' y1='15' x2='22' y2='15' stroke='%231c1f1615' stroke-width='1.5'/%3E%3C/svg%3E")`,
  foods: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M20 70 L45 20 L70 70 Z' fill='none' stroke='%231c1f1625' stroke-width='2.5'/%3E%3Ccircle cx='45' cy='38' r='6' fill='%231c1f1625'/%3E%3Ccircle cx='33' cy='55' r='4' fill='%231c1f1625'/%3E%3Ccircle cx='57' cy='55' r='4' fill='%231c1f1625'/%3E%3Crect x='75' y='75' width='36' height='6' rx='3' fill='none' stroke='%231c1f1625' stroke-width='2.5'/%3E%3Crect x='70' y='85' width='46' height='9' rx='4' fill='none' stroke='%231c1f1625' stroke-width='2.5'/%3E%3Crect x='78' y='66' width='30' height='6' rx='3' fill='none' stroke='%231c1f1625' stroke-width='2.5'/%3E%3C/svg%3E")`,
};

interface CategoryCard {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

interface DayHours { isOpen: boolean; slots: { open: string; close: string }[]; }
type OpeningHours = Record<string, DayHours>;

interface CategoryGridProps {
  name: string;
  logoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  wifi: string | null;
  openingHours?: OpeningHours | null;
  infoOrder?: string[] | null;
  brandColor?: string;
  categories: CategoryCard[];
  onSelect: (id: string) => void;
  onBack: () => void;
  bgColor?: string;
  bgPattern?: string;
}

export function CategoryGrid({ name, logoUrl, facebookUrl, instagramUrl, tiktokUrl, twitterUrl, address, phone, description, wifi, openingHours, infoOrder, brandColor, categories, onSelect, onBack, bgColor, bgPattern }: CategoryGridProps) {
  const bg = bgColor ?? "#f3efe4";
  const orderedKeys = infoOrder ?? ["description","address","phone","wifi","hours"];
  const bgStyle: CSSProperties = {
    backgroundColor: bg,
    ...(bgPattern && bgPattern !== "none" && PATTERN_MAP[bgPattern] ? { backgroundImage: PATTERN_MAP[bgPattern], backgroundSize: bgPattern === "foods" ? "120px 120px" : bgPattern === "hexagons" ? "80px 80px" : bgPattern === "bubbles" ? "80px 80px" : bgPattern === "dots" ? "160px 160px" : bgPattern === "waves" ? "100px 30px" : bgPattern === "diamonds" ? "60px 60px" : bgPattern === "crosses" ? "50px 50px" : "40px 40px" } : {}),
  };
  const { t } = useI18n();
  const hasSocial = !!(facebookUrl || instagramUrl || tiktokUrl || twitterUrl);

  return (
    <div className="min-h-screen animate-fade-in px-2 py-4 text-[#1c1f16] sm:px-6 sm:py-8" style={bgStyle}>
      <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
        <LangSwitch variant="light" />
      </div>

      <div className="mt-4 flex flex-col items-center">
        {logoUrl ? (
          <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] border border-[#1c1f16]/25 p-3" style={{ backgroundColor: bg }}>
            <img src={logoUrl} alt={name} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <p className="font-display text-xl font-extrabold uppercase tracking-[0.2em]">{name}</p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        {categories.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)} className="relative w-full h-32 sm:h-48 overflow-hidden rounded-2xl bg-white/70 text-left flex items-stretch shadow-sm border border-[#1c1f16]/8">
            {c.imageUrl && (
              <>
                <img src={c.imageUrl} alt="" className="absolute right-0 top-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 via-30% to-transparent" />
              </>
            )}
            <div className="relative px-5 self-end pb-4">
              <p className="font-display text-xl font-extrabold uppercase tracking-wide text-[#1c1f16]">{c.name}</p>
              {c.description && (
                <p className="mt-1 text-sm text-[#1c1f16]/55">{c.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {orderedKeys.map((key) => {
          if (key === "description" && description?.trim()) return (
            <div key="description" className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.info")}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#1c1f16]/80" style={{ whiteSpace: "pre-line" }}>{description}</p>
              </div>
            </div>
          );
          if (key === "address" && address?.trim()) return (
            <div key="address" className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.address")}</p>
                <p className="mt-1 text-sm text-[#1c1f16]/80">{address}</p>
              </div>
            </div>
          );
          if (key === "phone" && phone?.trim()) return (
            <div key="phone" className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.reservation")}</p>
                <a href={`tel:${phone}`} className="mt-1 block text-sm text-[#1c1f16]/80">{phone}</a>
              </div>
            </div>
          );
          if (key === "wifi" && wifi?.trim()) return (
            <div key="wifi" className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10">
              <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.wifi")}</p>
                <p className="mt-1 text-sm font-mono tracking-wide text-[#1c1f16]/80">{wifi}</p>
              </div>
            </div>
          );
          if (key === "hours" && openingHours && Object.values(openingHours).some((d) => d.isOpen)) return (
            <div key="hours" className="rounded-2xl bg-white/60 border border-[#1c1f16]/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1c1f16]/10">
                <Clock className="h-4 w-4 shrink-0" style={{ color: brandColor ?? "#1c1f16" }} />
                <p className="text-sm font-bold text-[#1c1f16]">{t("client.openingHours")}</p>
              </div>
              <div className="divide-y divide-[#1c1f16]/8">
                {DAYS.map((day) => {
                  const dh = openingHours[day];
                  const isToday = day === TODAY_KEY;
                  return (
                    <div key={day} className="flex items-center justify-between px-4 py-2.5" style={isToday ? { backgroundColor: `${brandColor ?? "#1c1f16"}12` } : {}}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ fontWeight: isToday ? 700 : 400, color: isToday ? (brandColor ?? "#1c1f16") : "#1c1f16" }}>{DAY_LABELS[day]}</span>
                        {isToday && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: brandColor ?? "#1c1f16" }}>{t("client.today")}</span>}
                      </div>
                      <div className="text-sm" style={{ fontWeight: isToday ? 700 : 400, color: isToday ? (brandColor ?? "#1c1f16") : "#1c1f1699" }}>
                        {dh?.isOpen && dh.slots.length > 0 ? dh.slots.map((s) => `${s.open} – ${s.close}`).join(", ") : <span className="text-[#1c1f16]/40">{t("client.closed")}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
          return null;
        })}
      </div>

      {hasSocial && (
        <div className="mt-6 flex flex-col items-center gap-3 pb-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1c1f16]/50">{t("client.followUs")}</p>
          <div className="flex gap-4">
            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>}
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>}
            {tiktokUrl && <a href={tiktokUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="TikTok"><TikTokIcon className="h-4 w-4" /></a>}
            {twitterUrl && <a href={twitterUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="X"><XIcon className="h-4 w-4" /></a>}
          </div>
        </div>
      )}

      <footer className="pb-8 pt-6 text-center text-xs text-[#1c1f16]/40">
        <p>
          {t("client.poweredBy")}{" "}
          <a href="https://menufy-tau.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-[#1c1f16]/60 hover:text-[#1c1f16]">
            Menufy
          </a>
        </p>
        <p className="mt-0.5">© {new Date().getFullYear()} Menufy. {t("client.allRightsReserved")}</p>
      </footer>
      </div>
    </div>
  );
}