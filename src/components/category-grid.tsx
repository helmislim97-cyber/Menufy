import { ArrowLeft, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { LangSwitch } from "@/components/lang-switch";
import { useI18n } from "@/lib/i18n";

interface CategoryCard {
  id: string;
  name: string;
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
  categories: CategoryCard[];
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function CategoryGrid({ name, logoUrl, facebookUrl, instagramUrl, address, phone, description, categories, onSelect, onBack }: CategoryGridProps) {
  const { t } = useI18n();
  const hasSocial = !!(facebookUrl || instagramUrl);
  const hasInfo = !!(description || address || phone);

  return (
    <div className="min-h-screen animate-fade-in bg-[#f3efe4] px-5 py-4 text-[#1c1f16]">
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

      <div className="mt-6 grid grid-cols-2 gap-3">
        {categories.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#1c1f16]/10 bg-[#1c1f16]/5 text-left">
            {c.imageUrl && <img src={c.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <div className={`absolute inset-0 ${c.imageUrl ? "bg-gradient-to-t from-black/60 via-black/10 to-transparent" : ""}`} />
            <span className={`absolute inset-x-3 bottom-3 font-display text-lg font-extrabold uppercase tracking-wide ${c.imageUrl ? "text-white" : "text-[#1c1f16]"}`}>{c.name}</span>
          </button>
        ))}
      </div>

      {hasInfo && (
        <div className="mt-8 rounded-2xl border border-[#1c1f16]/15 bg-white/50 px-5 py-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1c1f16]/50">{t("client.info")}</p>
          {description && <p className="text-sm leading-relaxed text-[#1c1f16]/80">{description}</p>}
          {address && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1c1f16]/40" />
              <p className="text-sm text-[#1c1f16]/70">{address}</p>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[#1c1f16]/40" />
              <a href={`tel:${phone}`} className="text-sm text-[#1c1f16]/70">{phone}</a>
            </div>
          )}
        </div>
      )}

      {hasSocial && (
        <div className="mt-6 flex flex-col items-center gap-3 pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1c1f16]/50">{t("client.followUs")}</p>
          <div className="flex gap-4">
            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>}
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>}
          </div>
        </div>
      )}
    </div>
  );
}