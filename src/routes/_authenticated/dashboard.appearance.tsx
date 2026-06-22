import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { DashboardPage } from "@/components/dashboard-page";
import { BannerCropper } from "@/components/banner-cropper";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/appearance")({
  component: AppearancePage,
});

interface Restaurant {
  id: string;
  logo_url: string | null;
  banner_url: string | null;
  banner_position_x: number | null;
  banner_position_y: number | null;
  banner_zoom: number | null;
  brand_color: string | null;
  bg_color: string | null;
  bg_pattern: string | null;
}

const BRAND_COLORS = ["#7ab450", "#dc2626", "#ea580c", "#2563eb", "#9333ea", "#0891b2", "#d4a843", "#1c1f16"];
const BG_COLORS = ["#f3efe4", "#ffffff", "#f8f8f8", "#1c1f16", "#0f172a", "#1a1a2e", "#fdf6e3", "#f0fdf4"];

function getPatternDataUrl(pattern: string, color: string): string {
  const c = encodeURIComponent(color);
  const patterns: Record<string, string> = {
    foods: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ctext x='10' y='30' font-size='20' fill='${c}'%3E🍕%3C/text%3E%3Ctext x='45' y='65' font-size='20' fill='${c}'%3E🍔%3C/text%3E%3C/svg%3E")`,
    bubbles: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='15' cy='15' r='8' fill='none' stroke='${c}' stroke-width='1.5'/%3E%3Ccircle cx='45' cy='45' r='5' fill='none' stroke='${c}' stroke-width='1.5'/%3E%3Ccircle cx='50' cy='15' r='3' fill='none' stroke='${c}' stroke-width='1.5'/%3E%3Ccircle cx='15' cy='50' r='4' fill='none' stroke='${c}' stroke-width='1.5'/%3E%3C/svg%3E")`,
    dots: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='${c}'/%3E%3C/svg%3E")`,
    hexagons: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='57'%3E%3Cpolygon points='25,2 48,14 48,43 25,55 2,43 2,14' fill='none' stroke='${c}' stroke-width='1.5'/%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20'%3E%3Cpath d='M0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 Q70 20 80 10' fill='none' stroke='${c}' stroke-width='1.5'/%3E%3C/svg%3E")`,
    diamonds: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='20' y='2' width='24' height='24' rx='1' fill='none' stroke='${c}' stroke-width='1.5' transform='rotate(45 20 14)'/%3E%3C/svg%3E")`,
    crosses: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cline x1='15' y1='8' x2='15' y2='22' stroke='${c}' stroke-width='1.5'/%3E%3Cline x1='8' y1='15' x2='22' y2='15' stroke='${c}' stroke-width='1.5'/%3E%3C/svg%3E")`,
  };
  return patterns[pattern] ?? "";
}

function AppearancePage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPosX, setBannerPosX] = useState(50);
  const [bannerPosY, setBannerPosY] = useState(50);
  const [bannerZoom, setBannerZoom] = useState(1);
  const [brandColor, setBrandColor] = useState("#7ab450");
  const [bgColor, setBgColor] = useState("#f3efe4");
  const [bgPattern, setBgPattern] = useState("none");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id, logo_url, banner_url, banner_position_x, banner_position_y, banner_zoom, brand_color, bg_color, bg_pattern")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRestaurant(data ?? null);
        if (data) {
          setLogoPreview(data.logo_url);
          setLogoUrl(data.logo_url);
          setBannerPreview(data.banner_url);
          setBannerUrl(data.banner_url);
          setBannerPosX(data.banner_position_x ?? 50);
          setBannerPosY(data.banner_position_y ?? 50);
          setBannerZoom(data.banner_zoom ?? 1);
          setBrandColor(data.brand_color ?? "#7ab450");
          setBgColor(data.bg_color ?? "#f3efe4");
          setBgPattern(data.bg_pattern ?? "none");
        }
        setLoading(false);
      });
  }, [user]);

  const uploadRestaurantLogo = async (file: File): Promise<string | null> => {
    if (!restaurant) return null;
    const ext = file.name.split(".").pop();
    const path = `${restaurant.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("restaurant-logos").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("restaurant-logos").getPublicUrl(path);
    return data.publicUrl;
  };

  const onLogoSelect = (file: File | null) => {
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl(null);
  };

  const uploadRestaurantBanner = async (file: File): Promise<string | null> => {
    if (!restaurant) return null;
    const ext = file.name.split(".").pop();
    const path = `${restaurant.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("restaurant-banners").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("restaurant-banners").getPublicUrl(path);
    return data.publicUrl;
  };

  const onBannerSelect = (file: File | null) => {
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setBannerPosX(50);
    setBannerPosY(50);
    setBannerZoom(1);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setBannerUrl(null);
  };

  const save = async () => {
    if (!restaurant) return;
    setSaving(true);

    let finalLogoUrl = logoUrl;
    if (logoFile) {
      setUploadingLogo(true);
      const uploaded = await uploadRestaurantLogo(logoFile);
      setUploadingLogo(false);
      if (!uploaded) {
        setSaving(false);
        return;
      }
      finalLogoUrl = uploaded;
    }

    let finalBannerUrl = bannerUrl;
    if (bannerFile) {
      setUploadingBanner(true);
      const uploaded = await uploadRestaurantBanner(bannerFile);
      setUploadingBanner(false);
      if (!uploaded) {
        setSaving(false);
        return;
      }
      finalBannerUrl = uploaded;
    }

    const updates = {
      logo_url: finalLogoUrl,
      banner_url: finalBannerUrl,
      banner_position_x: bannerPosX,
      banner_position_y: bannerPosY,
      banner_zoom: bannerZoom,
      brand_color: brandColor,
      bg_color: bgColor,
      bg_pattern: bgPattern,
    };
    const { error } = await supabase.from("restaurants").update(updates).eq("id", restaurant.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t("settings.restaurantUpdated"));
  };

  return (
    <DashboardPage>
        <h1 className="text-2xl font-extrabold">{t("sidebar.appearance")}</h1>

        {loading ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
        ) : !restaurant ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.noRestaurant")}</p>
        ) : (
          <div className="mt-6 space-y-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.banner")}</label>
              <div className="mt-1 flex items-center gap-3">
                <div className="grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-accent">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {bannerPreview ? t("menu.changePhoto") : t("menu.addPhoto")}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onBannerSelect(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t("menu.removePhoto")}
                    </button>
                  )}
                </div>
              </div>
              {bannerPreview && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{t("settings.bannerHint")}</p>
                  <BannerCropper
                    imageUrl={bannerPreview}
                    positionX={bannerPosX}
                    positionY={bannerPosY}
                    zoom={bannerZoom}
                    onChange={({ x, y, zoom }) => {
                      setBannerPosX(x);
                      setBannerPosY(y);
                      setBannerZoom(zoom);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">{t("settings.bannerZoom")}</span>
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.05"
                      value={bannerZoom}
                      onChange={(e) => setBannerZoom(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.logo")}</label>
              <div className="mt-1 flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background">
                  {logoPreview ? (
                    <img src={logoPreview} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-accent">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {logoPreview ? t("menu.changePhoto") : t("menu.addPhoto")}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onLogoSelect(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t("menu.removePhoto")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.brandColor")}</label>
              <p className="mt-0.5 text-xs text-muted-foreground/70">{t("settings.brandColorHint")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    className={`h-9 w-9 shrink-0 rounded-full border-2 transition-transform ${brandColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <label className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dashed border-border text-muted-foreground">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-0 w-0 opacity-0"
                  />
                  <span className="text-[10px] font-bold">+</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.bgColor")}</label>
              <p className="mt-0.5 text-xs text-muted-foreground/70">{t("settings.bgColorHint")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {BG_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    className={`h-9 w-9 shrink-0 rounded-full border-2 transition-transform ${bgColor === c ? "border-foreground scale-110" : "border-border"}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <label className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dashed border-border text-muted-foreground">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-0 w-0 opacity-0"
                  />
                  <span className="text-[10px] font-bold">+</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.bgPattern")}</label>
              <p className="mt-0.5 text-xs text-muted-foreground/70">{t("settings.bgPatternHint")}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {[
                  { id: "none", label: "Aucun" },
                  { id: "foods", label: "Foods" },
                  { id: "bubbles", label: "Bubbles" },
                  { id: "dots", label: "Dots" },
                  { id: "hexagons", label: "Hexagons" },
                  { id: "waves", label: "Waves" },
                  { id: "diamonds", label: "Diamonds" },
                  { id: "crosses", label: "Crosses" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBgPattern(p.id)}
                    className={`relative h-20 rounded-xl border-2 overflow-hidden transition-all ${bgPattern === p.id ? "border-foreground" : "border-border"}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    {p.id !== "none" && (
                      <div className="absolute inset-0" style={{ backgroundImage: getPatternDataUrl(p.id, "#1c1f1620"), backgroundSize: "40px 40px" }} />
                    )}
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-semibold text-foreground/70">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={save} disabled={saving || uploadingLogo || uploadingBanner} className="w-full sm:w-auto">
              {t("settings.save")}
            </Button>
          </div>
        )}
    </DashboardPage>
  );
}