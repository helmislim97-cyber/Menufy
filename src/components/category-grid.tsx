import { ArrowLeft, Facebook, Instagram, MapPin, Phone, Info, Wifi } from "lucide-react";
import { LangSwitch } from "@/components/lang-switch";
import { useI18n } from "@/lib/i18n";

interface CategoryCard {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

interface CategoryGridProps {
  name: string;
  logoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  wifi: string | null;
  categories: CategoryCard[];
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function CategoryGrid({ name, logoUrl, facebookUrl, instagramUrl, address, phone, description, wifi, categories, onSelect, onBack }: CategoryGridProps) {
  const { t } = useI18n();
  const hasSocial = !!(facebookUrl || instagramUrl);

  return (
    <div className="min-h-screen animate-fade-in bg-[#f3efe4] px-5 py-4 text-[#1c1f16] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
        <LangSwitch variant="light" />
      </div>

      <div className="mt-4 flex flex-col items-center">
        {logoUrl ? (
          <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] border border-[#1c1f16]/25 p-3">
            <img src={logoUrl} alt={name} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <p className="font-display text-xl font-extrabold uppercase tracking-[0.2em]">{name}</p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        {categories.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)} className="relative w-full h-40 sm:h-56 overflow-hidden rounded-2xl bg-white/70 text-left flex items-stretch shadow-sm border border-[#1c1f16]/8">
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
        {description && (
          <div className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.info")}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#1c1f16]/80">{description}</p>
            </div>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.address")}</p>
              <p className="mt-1 text-sm text-[#1c1f16]/80">{address}</p>
            </div>
          </div>
        )}

        {phone && (
          <div className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.reservation")}</p>
              <a href={`tel:${phone}`} className="mt-1 block text-sm text-[#1c1f16]/80">{phone}</a>
            </div>
          </div>
        )}

        {wifi && (
          <div className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10">
            <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40">{t("client.wifi")}</p>
              <p className="mt-1 text-sm font-mono tracking-wide text-[#1c1f16]/80">{wifi}</p>
            </div>
          </div>
        )}
      </div>

      {hasSocial && (
        <div className="mt-6 flex flex-col items-center gap-3 pb-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1c1f16]/50">{t("client.followUs")}</p>
          <div className="flex gap-4">
            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>}
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>}
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