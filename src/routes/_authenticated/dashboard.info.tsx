import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPage } from "@/components/dashboard-page";
import { toast } from "sonner";
import { Clock, Plus, Trash2, GripVertical } from "lucide-react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi", thursday: "Jeudi",
  friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche",
};

interface TimeSlot { open: string; close: string; }
interface DayHours { isOpen: boolean; slots: TimeSlot[]; }
type OpeningHours = Record<string, DayHours>;

function defaultHours(): OpeningHours {
  return Object.fromEntries(DAYS.map((d) => [d, { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] }]));
}

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
  tiktok_url: string | null;
  twitter_url: string | null;
  description: string | null;
  wifi: string | null;
  opening_hours: Record<string, { isOpen: boolean; slots: { open: string; close: string }[] }> | null;
  info_order: string[] | null;
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
  const [editTiktok, setEditTiktok] = useState("");
  const [editTwitter, setEditTwitter] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editWifi, setEditWifi] = useState("");
  const [editHours, setEditHours] = useState<OpeningHours>(defaultHours());
  const [infoOrder, setInfoOrder] = useState<string[]>(["description","address","phone","wifi","hours"]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id, name, address, phone, facebook_url, instagram_url, google_review_url, tiktok_url, twitter_url, description, wifi, opening_hours, info_order")
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
          setEditTiktok(data.tiktok_url ?? "");
          setEditTwitter(data.twitter_url ?? "");
          setEditDescription(data.description ?? "");
          setEditWifi(data.wifi ?? "");
          setEditHours((data.opening_hours as OpeningHours) ?? defaultHours());
          setInfoOrder(data.info_order ?? ["description","address","phone","wifi","hours"]);
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
      tiktok_url: editTiktok.trim() || null,
      twitter_url: editTwitter.trim() || null,
      description: editDescription.trim() || null,
      wifi: editWifi.trim() || null,
      opening_hours: editHours,
      info_order: infoOrder,
    };
    const { error } = await supabase.from("restaurants").update(updates).eq("id", restaurant.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t("settings.restaurantUpdated"));
  };

  return (
    <DashboardPage>
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
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.tiktok")}</label>
              <Input value={editTiktok} onChange={(e) => setEditTiktok(e.target.value)} placeholder={t("settings.tiktokPlaceholder")} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("settings.twitter")}</label>
              <Input value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} placeholder={t("settings.twitterPlaceholder")} className="mt-1" />
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

            <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{t("settings.infoOrder")}</p>
              <p className="text-xs text-muted-foreground/70">{t("settings.infoOrderHint")}</p>
              <div className="space-y-1 pt-1">
                {infoOrder.map((key, idx) => {
                  const labels: Record<string, string> = {
                    description: t("settings.description"),
                    address: t("settings.address"),
                    phone: t("settings.phone"),
                    wifi: t("settings.wifi"),
                    hours: t("settings.openingHours"),
                  };
                  return (
                    <div
                      key={key}
                      draggable
                      onDragStart={() => setDragIndex(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIndex === null || dragIndex === idx) return;
                        const next = [...infoOrder];
                        const [moved] = next.splice(dragIndex, 1);
                        next.splice(idx, 0, moved);
                        setInfoOrder(next);
                        setDragIndex(null);
                      }}
                      onDragEnd={() => setDragIndex(null)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                      <span className="text-sm font-medium">{labels[key] ?? key}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{t("settings.openingHours")}</span>
              </div>
              {DAYS.map((day) => {
                const dh = editHours[day] ?? { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] };
                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{DAY_LABELS[day]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{dh.isOpen ? t("settings.open") : t("settings.closed")}</span>
                        <button
                          type="button"
                          onClick={() => setEditHours((h) => ({ ...h, [day]: { ...dh, isOpen: !dh.isOpen } }))}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${dh.isOpen ? "bg-primary" : "bg-muted"}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${dh.isOpen ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </div>
                    </div>
                    {dh.isOpen && (
                      <div className="space-y-1.5 ps-2">
                        {dh.slots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot.open}
                              onChange={(e) => {
                                const slots = dh.slots.map((s, i) => i === idx ? { ...s, open: e.target.value } : s);
                                setEditHours((h) => ({ ...h, [day]: { ...dh, slots } }));
                              }}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                            />
                            <span className="text-muted-foreground">—</span>
                            <input
                              type="time"
                              value={slot.close}
                              onChange={(e) => {
                                const slots = dh.slots.map((s, i) => i === idx ? { ...s, close: e.target.value } : s);
                                setEditHours((h) => ({ ...h, [day]: { ...dh, slots } }));
                              }}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                            />
                            {dh.slots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const slots = dh.slots.filter((_, i) => i !== idx);
                                  setEditHours((h) => ({ ...h, [day]: { ...dh, slots } }));
                                }}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const slots = [...dh.slots, { open: "09:00", close: "18:00" }];
                            setEditHours((h) => ({ ...h, [day]: { ...dh, slots } }));
                          }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                          {t("settings.addSlot")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={save} disabled={saving || !editName.trim()} className="w-full sm:w-auto">
              {t("settings.save")}
            </Button>
          </div>
        )}
    </DashboardPage>
  );
}