import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { DashboardPage } from "@/components/dashboard-page";
import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfilePage,
});

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
}

interface EditingField {
  field: keyof Profile;
  label: string;
  value: string;
  type?: string;
}

function ProfileRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string | null;
  onEdit: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between py-4 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 px-6 -mx-6 transition-colors"
      onClick={onEdit}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
        Modifier
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [profile, setProfile] = useState<Profile>({
    full_name: null,
    email: null,
    phone: null,
    birth_date: null,
    gender: null,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingField | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      full_name: user.user_metadata?.full_name ?? null,
      email: user.email ?? null,
      phone: user.user_metadata?.phone ?? null,
      birth_date: user.user_metadata?.birth_date ?? null,
      gender: user.user_metadata?.gender ?? null,
    });
    setLoading(false);
  }, [user]);

  const openEdit = (field: keyof Profile, label: string, type?: string) => {
    setEditing({ field, label, value: profile[field] ?? "", type });
    setEditValue(profile[field] ?? "");
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.field === "email") {
      const { error } = await supabase.auth.updateUser({ email: editValue.trim() });
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const metaKey = editing.field;
      const { error } = await supabase.auth.updateUser({
        data: { [metaKey]: editValue.trim() || null },
      });
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setProfile((p) => ({ ...p, [editing.field]: editValue.trim() || null }));
    toast.success("Profil mis à jour ✅");
    setSaving(false);
    setEditing(null);
  };

  const fields: { field: keyof Profile; label: string; type?: string }[] = [
    { field: "full_name", label: "Nom légal" },
    { field: "email", label: "Email" },
    { field: "phone", label: "Numéro de téléphone" },
    { field: "birth_date", label: "Date de naissance", type: "date" },
    { field: "gender", label: "Genre" },
  ];

  return (
    <DashboardPage>
      <h1 className="text-2xl font-extrabold">{t("sidebar.profile")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Gérez vos informations personnelles</p>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-background px-6 py-2">
          {fields.map(({ field, label, type }) => (
            <ProfileRow
              key={field}
              label={label}
              value={field === "gender"
                ? profile.gender === "male" ? "Homme" : profile.gender === "female" ? "Femme" : null
                : profile[field]}
              onEdit={() => openEdit(field, label, type)}
            />
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-background p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-extrabold">Modifier — {editing.label}</h2>
            {editing.field === "gender" ? (
              <div className="flex gap-3">
                {[{ val: "male", label: "Homme" }, { val: "female", label: "Femme" }].map((g) => (
                  <button
                    key={g.val}
                    onClick={() => setEditValue(g.val)}
                    className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors ${editValue === g.val ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                type={editing.type ?? "text"}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={editing.label}
                autoFocus
              />
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Annuler</Button>
              <Button className="flex-1" disabled={saving} onClick={save}>
                {saving ? "..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
}