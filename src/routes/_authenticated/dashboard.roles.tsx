import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2, Pencil, X, ChefHat, Wallet, HandPlatter, Shield, Crown, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/roles")({
  component: RolesPage,
});

type RoleKey = "manager" | "cashier" | "waiter" | "kitchen";

interface RoleDef {
  key: RoleKey;
  label: string;
  desc: string;
  icon: any;
  color: string;
}

const ROLES: RoleDef[] = [
  { key: "manager", label: "Manager", desc: "Accès complet sauf facturation", icon: Shield, color: "bg-purple-100 text-purple-700" },
  { key: "cashier", label: "Caissier", desc: "Encaisser les paiements", icon: Wallet, color: "bg-blue-100 text-blue-700" },
  { key: "waiter", label: "Serveur", desc: "Servir et répondre aux assistances", icon: HandPlatter, color: "bg-green-100 text-green-700" },
  { key: "kitchen", label: "Cuisine", desc: "Voir et préparer les commandes", icon: ChefHat, color: "bg-orange-100 text-orange-700" },
];

interface TeamMember {
  id: string;
  full_name: string;
  email: string | null;
  roles: string[];
  status: string;
  user_id: string | null;
  created_at: string;
}

function RolesPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<RoleKey[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setRestaurantId(data.id);
    });
  }, [user]);

  const loadMembers = async (rid: string) => {
    const { data } = await supabase.from("team_members").select("*").eq("restaurant_id", rid).order("created_at", { ascending: true });
    setMembers((data as TeamMember[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!restaurantId) return;
    loadMembers(restaurantId);
  }, [restaurantId]);

  const openAdd = () => {
    setEditing(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setSelectedRoles([]);
    setModalOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setFullName(m.full_name);
    setEmail(m.email ?? "");
    setPassword("");
    setSelectedRoles(m.roles as RoleKey[]);
    setModalOpen(true);
  };

  const toggleRole = (role: RoleKey) => {
    setSelectedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  const save = async () => {
    if (!fullName.trim()) { toast.error("Entrez un nom"); return; }
    if (selectedRoles.length === 0) { toast.error("Sélectionnez au moins un rôle"); return; }
    if (!restaurantId) return;

    if (editing) {
      setSaving(true);
      const { error } = await supabase.from("team_members").update({
        full_name: fullName.trim(),
        email: email.trim() || null,
        roles: selectedRoles,
      }).eq("id", editing.id);
      if (error) toast.error("Erreur");
      else { toast.success("Membre mis à jour ✅"); loadMembers(restaurantId); setModalOpen(false); }
      setSaving(false);
      return;
    }

    // New member — needs login credentials
    if (!email.trim()) { toast.error("L'email est requis pour créer un accès"); return; }
    if (password.length < 6) { toast.error("Le mot de passe doit faire au moins 6 caractères"); return; }
    setSaving(true);

    // 1. Insert the team_members row first
    const { data: inserted, error: insertErr } = await supabase.from("team_members").insert({
      restaurant_id: restaurantId,
      full_name: fullName.trim(),
      email: email.trim(),
      roles: selectedRoles,
      status: "active",
    }).select().single();

    if (insertErr || !inserted) {
      toast.error("Erreur lors de l'ajout");
      setSaving(false);
      return;
    }

    // 2. Create the login account via Edge Function
    const { data: fnData, error: fnError } = await supabase.functions.invoke("smooth-action", {
      body: {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        roles: selectedRoles,
        memberId: inserted.id,
      },
    });

    console.log("create-staff response:", fnData, fnError);

    if (fnError || (fnData && fnData.error)) {
      // Roll back the team_members row if account creation failed
      await supabase.from("team_members").delete().eq("id", inserted.id);
      toast.error(fnData?.error || fnError?.message || "Erreur lors de la création du compte");
      setSaving(false);
      return;
    }

    toast.success("Membre ajouté avec accès ✅");
    loadMembers(restaurantId);
    setModalOpen(false);
    setSaving(false);
  };

  const remove = async (m: TeamMember) => {
    if (!window.confirm(`Supprimer ${m.full_name} de l'équipe ?`)) return;
    if (!restaurantId) return;
    const { error } = await supabase.from("team_members").delete().eq("id", m.id);
    if (error) toast.error("Erreur");
    else { toast.success("Membre supprimé"); loadMembers(restaurantId); }
  };

  const roleDef = (key: string) => ROLES.find((r) => r.key === key);

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Rôles & équipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gérez les membres de votre équipe et leurs accès</p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> Ajouter un membre
        </Button>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <div className="mt-6 space-y-6">

          {/* Owner card */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                <Crown className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold flex items-center gap-2">
                  Vous (Propriétaire)
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gold">Owner</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Team members */}
          {members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground/40">
                <UserPlus className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold">Aucun membre dans l'équipe</p>
              <p className="mt-1 text-xs text-muted-foreground">Ajoutez vos serveurs, caissiers et personnel de cuisine.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-background p-4 flex items-center gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold">
                    {m.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{m.full_name}</p>
                    {m.email && <p className="text-xs text-muted-foreground truncate">{m.email}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.roles.map((r) => {
                        const def = roleDef(r);
                        if (!def) return null;
                        return (
                          <span key={r} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${def.color}`}>
                            <def.icon className="h-3 w-3" /> {def.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
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

          {/* Roles legend */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-3">Les rôles et leurs accès</p>
            <div className="space-y-3">
              {ROLES.map((r) => (
                <div key={r.key} className="flex items-start gap-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${r.color}`}>
                    <r.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email {!editing && "(requis pour l'accès)"}</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@exemple.com" type="email" className="mt-1.5" disabled={!!editing} />
                {editing && <p className="mt-1 text-xs text-muted-foreground">L'email ne peut pas être modifié après création.</p>}
              </div>
              {!editing && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mot de passe</label>
                  <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caractères" type="text" className="mt-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">Communiquez ce mot de passe à votre employé pour qu'il puisse se connecter.</p>
                </div>
              )}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rôles</label>
                <p className="text-xs text-muted-foreground mb-2">Sélectionnez un ou plusieurs rôles.</p>
                <div className="space-y-2">
                  {ROLES.map((r) => {
                    const active = selectedRoles.includes(r.key);
                    return (
                      <button
                        key={r.key}
                        onClick={() => toggleRole(r.key)}
                        className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${active ? "border-primary bg-primary/5" : "border-border hover:bg-accent"}`}
                      >
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${r.color}`}>
                          <r.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{r.label}</p>
                          <p className="text-xs text-muted-foreground">{r.desc}</p>
                        </div>
                        <div className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${active ? "border-primary bg-primary text-white" : "border-border"}`}>
                          {active && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button onClick={save} disabled={saving} className="w-full h-11 gap-1.5">
                {saving ? "Enregistrement..." : editing ? "Enregistrer" : "Ajouter le membre"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
}