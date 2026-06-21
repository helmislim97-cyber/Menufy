import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssistanceBell } from "@/components/assistance-bell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/info")({
  component: InfoPage,
});

interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  google_review_url: string | null;
  description: string | null;
  wifi: string | null;
}

function InfoPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editGoogleReview, setEditGoogleReview] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editWifi, setEditWifi] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id, name, address, phone, facebook_url, instagram_url, google_review_url, description, wifi")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRestaurant(data ?? null);
        if (data) {
          setEditName(data.name);
          setEditAddress(data.address ?? "");
          setEditPhone(data.phone ?? "");
          setEditFacebook(data.facebook_url ?? "");
          setEditInstagram(data.instagram_url ?? "");
          setEditGoogleReview(data.google_review_url ?? "");
          setEditDescription(data.description ?? "");
          setEditWifi(data.wifi ?? "");
        }
        setLoading(false);
      });
  }, [user]);

  const save = async () => {
    if (!restaurant || !editName.trim()) return;
    setSaving(true);
    const updates = {
      name: editName.trim(),
      address: editAddress.trim() || null,
      phone: editPhone.trim() || null,
      facebook_url: editFacebook.trim() || null,
      instagram_url: editInstagram.trim() || null,
      google_review_url: editGoogleReview.trim() || null,
      description: editDescription.trim() || null,
      wifi: editWifi.trim() || null,
    };
    const { error } = await supabase.from("restaurants").update(updates).eq("id", restaurant.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t("settings.restaurantUpdated"));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl sm:ps-80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <AssistanceBell />
            <LangSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:ps-80">
        <h1 className="text-2xl font-extrabold">{t("sidebar.info")}</h1>

        {loading ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
        ) : !restaurant ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.noRestaurant")}</p>
        ) : (
          <div className="mt-6 space-y-3">
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
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.googleReview")}</label>
              <Input value={editGoogleReview} onChange={(e) => setEditGoogleReview(e.target.value)} placeholder={t("settings.googleReviewPlaceholder")} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.description")}</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder={t("settings.descriptionPlaceholder")} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.wifi")}</label>
              <Input value={editWifi} onChange={(e) => setEditWifi(e.target.value)} placeholder={t("settings.wifiPlaceholder")} className="mt-1" />
            </div>

            <Button onClick={save} disabled={saving || !editName.trim()} className="w-full sm:w-auto">
              {t("settings.save")}
            </Button>
          </div>
        )}
      </main>

      <DashboardSidebar />
    </div>
  );
}