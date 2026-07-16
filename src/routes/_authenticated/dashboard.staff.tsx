import { createFileRoute } from "@tanstack/react-router";
import { AccessGuard } from "@/components/access-guard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { UserPlus, Users, Pencil, Trash2, X, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/staff")({
  component: () => (
    <AccessGuard area="owner">
      <StaffPage />
    </AccessGuard>
  ),
});

interface RoleOption { id: string; key: string; name: string }
interface StaffMember {
  id: string;
  full_name: string;
  role_id: string | null;
  status: string;
  roles: string[];
  created_at: string;
}

const STATUSES: [string, string][] = [
  ["active", "Actif"],
  ["suspended", "Suspendu"],
];

function StaffPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [fullName, setFullName] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setRestaurantId(data.id); });
  }, [user]);

  const load = async (rid: string) => {
    const [{ data: roleData }, { data: memberData }] = await Promise.all([
      supabase.from("roles").select("id, key, name").eq("restaurant_id", rid).neq("key", "owner").order("created_at"),
      supabase.from("team_members").select("id, full_name, role_id, status, roles, created_at").eq("restaurant_id", rid).order("created_at"),
    ]);
    setRoles((roleData as RoleOption[]) ?? []);
    setMembers((memberData as unknown as StaffMember[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (restaurantId) load(restaurantId); }, [restaurantId]);

  const roleName = (id: string | null) => roles.find((r) => r.id === id)?.name ?? "Aucun rôle";

  const openAdd = () => {
    setEditing(null);
    setFullName("");
    setRoleId("");
    setStatus("active");
    setModalOpen(true);
  };

  const openEdit = (m: StaffMember) => {
    setEditing(m);
    setFullName(m.full_name);
    setRoleId(m.role_id ?? "");
    setStatus(m.status);
    setModalOpen(true);
  };

  const save = async () => {
    if (!restaurantId) return;
    if (!fullName.trim()) { toast.error("Entrez un nom"); return; }
    if (!roleId) { toast.error("Choisissez un rôle"); return; }
    const role = roles.find((r) => r.id === roleId);
    if (!role) { toast.error("Rôle introuvable"); return; }

    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("team_members").update({
        full_name: fullName.trim(),
        role_id: roleId,
        status,
        roles: [role.key], // keep legacy array in sync with the assigned role
      }).eq("id", editing.id);
      if (error) toast.error("Échec de l'enregistrement");
      else { toast.success("Membre mis à jour ✅"); load(restaurantId); setModalOpen(false); }
    } else {
      const { error } = await supabase.from("team_members").insert({
        restaurant_id: restaurantId,
        full_name: fullName.trim(),
        role_id: roleId,
        status,
        roles: [role.key],       // legacy NOT NULL array = the assigned role's key
        // email / user_id intentionally omitted (null) — PIN staff have no auth user
      });
      if (error) toast.error("Impossible d'ajouter le membre");
      else { toast.success("Membre ajouté ✅"); load(restaurantId); setModalOpen(false); }
    }
    setSaving(false);
  };

  const setPin = async (m: StaffMember) => {
    const pin = window.prompt(`PIN à 4 chiffres pour ${m.full_name}`)?.trim();
    if (!pin) return;
    if (!/^\d{4}$/.test(pin)) { toast.error("Le PIN doit contenir 4 chiffres"); return; }
    const { error } = await supabase.functions.invoke("set-staff-pin", {
      body: { staffId: m.id, pin },
    });
    if (error) {
      let msg = "Échec de la définition du PIN";
      try {
        const body = await (error as any).context?.json?.();
        if (body?.error) msg = body.error;
      } catch { /* ignore */ }
      toast.error(msg);
      return;
    }
    toast.success(`PIN défini pour ${m.full_name} ✅`);
  };

  const remove = async (m: StaffMember) => {
    if (!restaurantId) return;
    if (!window.confirm(`Supprimer ${m.full_name} de l'équipe ?`)) return;
    const { error } = await supabase.from("team_members").delete().eq("id", m.id);
    if (error) toast.error("Suppression impossible");
    else { toast.success("Membre supprimé"); load(restaurantId); }
  };

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Personnel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez vos serveurs, caissiers et cuisiniers et assignez-leur un rôle. (Les codes PIN arrivent à l'étape suivante.)
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5" disabled={roles.length === 0}>
          <UserPlus className="h-4 w-4" /> Ajouter un membre
        </Button>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Chargement…</p>
      ) : members.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground/40">
            <Users className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold">Aucun membre pour l'instant</p>
          <p className="mt-1 text-xs text-muted-foreground">Cliquez « Ajouter un membre » pour créer votre première fiche.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {members.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-background p-4 flex items-center gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold">
                {m.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{m.full_name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    <ShieldCheck className="h-3 w-3" /> {roleName(m.role_id)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    m.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {m.status === "active" ? "Actif" : "Suspendu"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setPin(m)} title="Définir le PIN" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                  <KeyRound className="h-4 w-4" />
                </button>
                <button onClick={() => openEdit(m)} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(m)} className="grid h-9 w-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {roles.length === 0 && !loading && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Aucun rôle assignable trouvé. Créez d'abord des rôles dans « Rôles & permissions ».
        </p>
      )}

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-background p-5 max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold">{editing ? "Modifier le membre" : "Ajouter un membre"}</h2>
              <button onClick={() => setModalOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom complet</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex : Ahmed Ben Ali" className="mt-1.5" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rôle</label>
                <Select value={roleId} onValueChange={setRoleId}>
                  <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Statut</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(([v, label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={save} disabled={saving} className="w-full h-11 gap-1.5">
                {saving ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter le membre"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
}
