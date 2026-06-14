import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, QrCode, LogOut, ExternalLink, Download, Pencil, ImagePlus, X } from "lucide-react";
import { BannerCropper } from "@/components/banner-cropper";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  description: string | null;
  wifi: string | null;
  banner_url: string | null;
  banner_position_x: number | null;
  banner_position_y: number | null;
  banner_zoom: number | null;
}

interface RestaurantTable {
  id: string;
  number: number;
  is_active: boolean;
}

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTableNumber, setNewTableNumber] = useState("");
  const [adding, setAdding] = useState(false);
  const [qrTable, setQrTable] = useState<RestaurantTable | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [editFacebook, setEditFacebook] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editWifi, setEditWifi] = useState("");
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

  const loadTables = async (restaurantId: string) => {
    const { data } = await supabase
      .from("tables")
      .select("id, number, is_active")
      .eq("restaurant_id", restaurantId)
      .order("number");
    setTables(data ?? []);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id, name, address, phone, logo_url, facebook_url, instagram_url, description, wifi, banner_url, banner_position_x, banner_position_y, banner_zoom")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        setRestaurant(data ?? null);
        if (data) await loadTables(data.id);
        setLoading(false);
      });
  }, [user]);

  const onLogout = async () => {
    await signOut();
    toast.success("À bientôt !");
    navigate({ to: "/" });
  };

  const addTable = async () => {
    if (!restaurant) return;
    const num = parseInt(newTableNumber, 10);
    if (!num || num <= 0) return;
    setAdding(true);
    const { error } = await supabase.from("tables").insert({ restaurant_id: restaurant.id, number: num });
    setAdding(false);
    if (error) return toast.error(error.message);
    toast.success(t("settings.tableAdded"));
    setNewTableNumber("");
    loadTables(restaurant.id);
  };

  const toggleTable = async (table: RestaurantTable) => {
    setTables((prev) => prev.map((tb) => (tb.id === table.id ? { ...tb, is_active: !tb.is_active } : tb)));
    await supabase.from("tables").update({ is_active: !table.is_active }).eq("id", table.id);
  };

  const deleteTable = async (table: RestaurantTable) => {
    if (!restaurant) return;
    if (!window.confirm(t("settings.confirmDeleteTable"))) return;
    const { error } = await supabase.from("tables").delete().eq("id", table.id);
    if (error) return toast.error(error.message);
    toast.success(t("settings.tableDeleted"));
    loadTables(restaurant.id);
  };

  const openEditRestaurant = () => {
    if (!restaurant) return;
    setEditName(restaurant.name);
    setEditAddress(restaurant.address ?? "");
    setEditPhone(restaurant.phone ?? "");
    setEditFacebook(restaurant.facebook_url ?? "");
    setEditInstagram(restaurant.instagram_url ?? "");
    setEditDescription(restaurant.description ?? "");
    setEditWifi(restaurant.wifi ?? "");
    setLogoFile(null);
    setLogoPreview(restaurant.logo_url);
    setLogoUrl(restaurant.logo_url);
    setBannerFile(null);
    setBannerPreview(restaurant.banner_url);
    setBannerUrl(restaurant.banner_url);
    setBannerPosX(restaurant.banner_position_x ?? 50);
    setBannerPosY(restaurant.banner_position_y ?? 50);
    setBannerZoom(restaurant.banner_zoom ?? 1);
    setEditOpen(true);
  };

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

  const saveRestaurant = async () => {
    if (!restaurant || !editName.trim()) return;
    setSavingRestaurant(true);

    let finalLogoUrl = logoUrl;
    if (logoFile) {
      setUploadingLogo(true);
      const uploaded = await uploadRestaurantLogo(logoFile);
      setUploadingLogo(false);
      if (!uploaded) {
        setSavingRestaurant(false);
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
        setSavingRestaurant(false);
        return;
      }
      finalBannerUrl = uploaded;
    }

    const updates = {
      name: editName.trim(),
      address: editAddress.trim() || null,
      phone: editPhone.trim() || null,
      facebook_url: editFacebook.trim() || null,
      instagram_url: editInstagram.trim() || null,
      logo_url: finalLogoUrl,
      description: editDescription.trim() || null,
      wifi: editWifi.trim() || null,
      banner_url: finalBannerUrl,
      banner_position_x: bannerPosX,
      banner_position_y: bannerPosY,
      banner_zoom: bannerZoom,
    };
    const { error } = await supabase.from("restaurants").update(updates).eq("id", restaurant.id);
    setSavingRestaurant(false);
    if (error) return toast.error(error.message);
    setRestaurant({ ...restaurant, ...updates, wifi: editWifi.trim() || null });
    toast.success(t("settings.restaurantUpdated"));
    setEditOpen(false);
  };

  const menuUrl = (tableNumber: number) =>
    `${window.location.origin}/menu/${restaurant?.id}/${tableNumber}`;

  const qrImageUrl = (tableNumber: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(menuUrl(tableNumber))}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo size="sm" />
          <LangSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-extrabold">{t("settings.title")}</h1>

        {loading ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
        ) : !restaurant ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.noRestaurant")}</p>
        ) : (
          <>
            <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {restaurant.logo_url && (
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background">
                      <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("settings.restaurant")}
                    </p>
                    <p className="mt-1 text-lg font-extrabold">{restaurant.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {restaurant.address || t("settings.noAddress")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.phone || t("settings.noPhone")}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={openEditRestaurant} className="shrink-0 gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  {t("settings.editRestaurant")}
                </Button>
              </div>
            </section>

            <section className="mt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold">{t("settings.tables")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t("settings.tablesSubtitle")}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder={t("settings.tableNumberPlaceholder")}
                  className="max-w-[140px]"
                />
                <Button onClick={addTable} disabled={adding || !newTableNumber} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t("settings.addTable")}
                </Button>
              </div>

              {tables.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-border bg-surface/40 p-4 text-center text-sm text-muted-foreground">
                  {t("settings.noTables")}
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {tables.map((table) => (
                    <div key={table.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-sm font-extrabold">
                        {table.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">
                          {t("settings.table")} {table.number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {table.is_active ? t("settings.active") : t("settings.inactive")}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setQrTable(table)} className="gap-1.5">
                        <QrCode className="h-3.5 w-3.5" />
                        {t("settings.viewQr")}
                      </Button>
                      <Switch checked={table.is_active} onCheckedChange={() => toggleTable(table)} />
                      <button
                        onClick={() => deleteTable(table)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <Button onClick={onLogout} variant="outline" className="mt-8 w-full gap-2">
          <LogOut className="h-4 w-4" />
          {t("settings.logout")}
        </Button>
      </main>

      <BottomNav />

      <Dialog open={!!qrTable} onOpenChange={(open) => !open && setQrTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("settings.qrTitle")} — {t("settings.table")} {qrTable?.number}
            </DialogTitle>
          </DialogHeader>
          {qrTable && (
            <div className="flex flex-col items-center gap-3">
              <img
                src={qrImageUrl(qrTable.number)}
                alt={`QR table ${qrTable.number}`}
                className="h-64 w-64 rounded-xl border border-border bg-white p-2"
              />
              <p className="text-center text-xs text-muted-foreground">{t("settings.qrHint")}</p>
              <p className="break-all rounded-lg bg-surface px-3 py-2 text-center text-xs text-muted-foreground">
                {menuUrl(qrTable.number)}
              </p>
            </div>
          )}
          <DialogFooter className="flex-row gap-2 sm:justify-center">
            {qrTable && (
              <>
                <a href={menuUrl(qrTable.number)} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="gap-1.5">
                    <ExternalLink className="h-4 w-4" />
                    {t("settings.openLink")}
                  </Button>
                </a>
                <a href={qrImageUrl(qrTable.number)} target="_blank" rel="noreferrer" download={`table-${qrTable.number}-qr.png`}>
                  <Button className="gap-1.5">
                    <Download className="h-4 w-4" />
                    {t("settings.downloadQr")}
                  </Button>
                </a>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("settings.editRestaurantTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
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
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.restaurantName")}</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.address")}</label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder={t("settings.addressPlaceholder")} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.phone")}</label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder={t("settings.phonePlaceholder")} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.facebook")}</label>
              <Input value={editFacebook} onChange={(e) => setEditFacebook(e.target.value)} placeholder={t("settings.facebookPlaceholder")} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.instagram")}</label>
              <Input value={editInstagram} onChange={(e) => setEditInstagram(e.target.value)} placeholder={t("settings.instagramPlaceholder")} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.description")}</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder={t("settings.descriptionPlaceholder")} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.wifi")}</label>
              <Input value={editWifi} onChange={(e) => setEditWifi(e.target.value)} placeholder={t("settings.wifiPlaceholder")} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t("settings.cancel")}</Button>
            <Button onClick={saveRestaurant} disabled={savingRestaurant || uploadingLogo || uploadingBanner || !editName.trim()}>{t("settings.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}