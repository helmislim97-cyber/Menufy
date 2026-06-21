import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { AssistanceBell } from "@/components/assistance-bell";
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

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id, logo_url, banner_url, banner_position_x, banner_position_y, banner_zoom")
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
    };
    const { error } = await supabase.from("restaurants").update(updates).eq("id", restaurant.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t("settings.restaurantUpdated"));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl sm:ps-80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:max-w-6xl">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <AssistanceBell />
            <LangSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:max-w-6xl sm:ps-80">
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

            <Button onClick={save} disabled={saving || uploadingLogo || uploadingBanner} className="w-full sm:w-auto">
              {t("settings.save")}
            </Button>
          </div>
        )}
      </main>

      <DashboardSidebar />
    </div>
  );
}