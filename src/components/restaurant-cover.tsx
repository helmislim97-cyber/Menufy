import { Facebook, Instagram } from "lucide-react";
import { LangSwitch } from "@/components/lang-switch";
import { useI18n } from "@/lib/i18n";

interface RestaurantCoverProps {
  name: string;
  logoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tableNumber: string;
  onOrder: () => void;
}

export function RestaurantCover({ name, logoUrl, facebookUrl, instagramUrl, tableNumber, onOrder }: RestaurantCoverProps) {
  const { t } = useI18n();
  const hasSocial = !!(facebookUrl || instagramUrl);

  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-between overflow-hidden bg-[#f3efe4] px-6 py-4 text-[#1c1f16]">
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
        <button onClick={onOrder} className="w-full rounded-2xl bg-[#1c1f16] py-3.5 text-base font-extrabold uppercase tracking-widest text-[#f3efe4] transition-transform active:scale-[0.98]">
          {t("client.orderNow")}
        </button>
      </div>
    </div>
  );
}