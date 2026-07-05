import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  ShieldCheck, ChevronDown, Plus, Trash2, Save, Lock, Crown,
  LayoutDashboard, HandPlatter, Wallet, ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/role-settings")({
  component: RoleSettingsPage,
});

// ---- permission contract (mirrors the M1 seed / DB jsonb) -------------------
type Perms = {
  screens?: Record<string, Record<string, boolean>>;
  actions?: Record<string, boolean>;
};

interface RoleRow {
  id: string;
  restaurant_id: string;
  key: string;
  name: string;
  is_system: boolean;
  landing_screen: string;
  permissions: Perms;
}

const SCREEN_SECTIONS: { key: string; label: string; items: [string, string][] }[] = [
  { key: "activity", label: "Activité", items: [
    ["home", "Accueil"], ["orders", "Commandes"], ["assistance", "Assistance"], ["loyalty", "Fidélité"],
  ]},
  { key: "management", label: "Gestion", items: [
    ["menu", "Mon menu"], ["tables", "Mes tables"], ["appearance", "Apparence"],
    ["info", "Infos générales"], ["notifications", "Notifications"], ["roles", "Rôles & équipe"],
  ]},
  { key: "statistics", label: "Statistiques", items: [
    ["recap", "Récap"], ["daily_report", "Rapport journalier"], ["orders_stats", "Stats commandes"], ["sales", "Ventes"],
  ]},
  { key: "account", label: "Compte", items: [
    ["profile", "Profil"], ["password", "Mot de passe"], ["contact", "Contact"], ["help", "Aide"],
  ]},
];

const ACTIONS: [string, string][] = [
  ["view_menu_prices", "Voir le menu & les prix"],
  ["edit_menu", "Modifier le menu / prix"],
  ["place_manual_order", "Passer une commande manuelle"],
  ["edit_order_before_kitchen", "Modifier une commande avant cuisine"],
  ["request_committed_change", "Demander annulation / modification"],
  ["mark_paid", "Encaisser / marquer payé"],
  ["move_ticket", "Déplacer les tickets (cuisine)"],
  ["view_payment_totals", "Voir les totaux / la caisse"],
  ["view_analytics", "Voir les analyses & rapports"],
  ["approve_requests", "Approuver / rejeter les demandes"],
  ["manage_staff", "Gérer le personnel"],
  ["manage_roles", "Gérer les rôles & permissions"],
];

const LANDING: [string, string, any][] = [
  ["dashboard", "Tableau de bord", LayoutDashboard],
  ["waiter", "Écran serveur", HandPlatter],
  ["cashier", "Écran caisse", Wallet],
  ["kitchen", "Écran cuisine", ChefHat],
];

const ROLE_ICON: Record<string, any> = {
  owner: Crown, manager: ShieldCheck, cashier: Wallet, waiter: HandPlatter, kitchen: ChefHat,
};

function emptyPermissions(): Perms {
  const screens: Record<string, Record<string, boolean>> = {};
  for (const s of SCREEN_SECTIONS) {
    screens[s.key] = {};
    for (const [item] of s.items) screens[s.key][item] = false;
  }
  const actions: Record<string, boolean> = {};
  for (const [a] of ACTIONS) actions[a] = false;
  return { screens, actions };
}

function slugify(s: string): string {
  // lowercase, non-alphanumerics (incl. accents) -> underscore, trim underscores
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "role";
}

function RoleSettingsPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setRestaurantId(data.id); });
  }, [user]);

  const load = async (rid: string) => {
    const { data, error } = await supabase
      .from("roles").select("*").eq("restaurant_id", rid).order("created_at", { ascending: true });
    if (error) toast.error("Erreur de chargement des rôles");
    setRoles((data as unknown as RoleRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (restaurantId) load(restaurantId); }, [restaurantId]);

  const markDirty = (id: string) => setDirty((d) => new Set(d).add(id));

  const updateRole = (id: string, updater: (r: RoleRow) => RoleRow) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? updater(r) : r)));
    markDirty(id);
  };

  const toggleScreen = (id: string, section: string, item: string, val: boolean) =>
    updateRole(id, (r) => {
      const screens = { ...(r.permissions.screens ?? {}) };
      screens[section] = { ...(screens[section] ?? {}), [item]: val };
      return { ...r, permissions: { ...r.permissions, screens } };
    });

  const toggleAction = (id: string, action: string, val: boolean) =>
    updateRole(id, (r) => ({
      ...r, permissions: { ...r.permissions, actions: { ...(r.permissions.actions ?? {}), [action]: val } },
    }));

  const setLanding = (id: string, landing: string) =>
    updateRole(id, (r) => ({ ...r, landing_screen: landing }));

  const save = async (role: RoleRow) => {
    setSavingId(role.id);
    const { error } = await supabase.from("roles").update({
      name: role.name,
      landing_screen: role.landing_screen,
      permissions: role.permissions as any,
    }).eq("id", role.id);
    if (error) toast.error("Échec de l'enregistrement");
    else {
      toast.success(`${role.name} enregistré ✅`);
      setDirty((d) => { const n = new Set(d); n.delete(role.id); return n; });
    }
    setSavingId(null);
  };

  const addRole = async () => {
    if (!restaurantId) return;
    const name = window.prompt("Nom du nouveau rôle (ex : Barman, Hôtesse)")?.trim();
    if (!name) return;
    let key = slugify(name);
    if (roles.some((r) => r.key === key)) key = `${key}_${Date.now().toString().slice(-4)}`;
    const { error } = await supabase.from("roles").insert({
      restaurant_id: restaurantId, key, name, is_system: false,
      landing_screen: "dashboard", permissions: emptyPermissions() as any,
    });
    if (error) { toast.error("Impossible de créer le rôle"); return; }
    toast.success(`Rôle « ${name} » créé ✅`);
    load(restaurantId);
  };

  const removeRole = async (role: RoleRow) => {
    if (role.is_system) return;
    if (!window.confirm(`Supprimer le rôle « ${role.name} » ?`)) return;
    const { error } = await supabase.from("roles").delete().eq("id", role.id);
    if (error) { toast.error("Suppression impossible"); return; }
    toast.success("Rôle supprimé");
    if (restaurantId) load(restaurantId);
  };

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Rôles & permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Définissez ce que chaque rôle voit et peut faire, et l'écran où sa connexion PIN atterrit.
          </p>
        </div>
        <Button onClick={addRole} className="gap-1.5">
          <Plus className="h-4 w-4" /> Ajouter un rôle
        </Button>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="mt-6 space-y-3">
          {roles.map((role) => {
            const Icon = ROLE_ICON[role.key] ?? ShieldCheck;
            const open = openId === role.id;
            const isDirty = dirty.has(role.id);
            return (
              <div key={role.id} className="rounded-2xl border border-border bg-background overflow-hidden">
                {/* header row */}
                <div className="flex items-center gap-3 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate">{role.name}</p>
                      {role.is_system && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                          <Lock className="h-3 w-3" /> Système
                        </span>
                      )}
                      {isDirty && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                          Non enregistré
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">clé : {role.key}</p>
                  </div>
                  {!role.is_system && (
                    <button onClick={() => removeRole(role)}
                      className="grid h-9 w-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => setOpenId(open ? null : role.id)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                    <ChevronDown className={cn("h-5 w-5 transition-transform", open && "rotate-180")} />
                  </button>
                </div>

                {open && (
                  <div className="border-t border-border p-4 space-y-6">
                    {/* landing screen */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Écran d'atterrissage (connexion PIN)
                      </label>
                      <Select value={role.landing_screen} onValueChange={(v) => setLanding(role.id, v)}>
                        <SelectTrigger className="mt-1.5 w-full sm:w-72"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LANDING.map(([v, label, LIcon]) => (
                            <SelectItem key={v} value={v}>
                              <span className="flex items-center gap-2"><LIcon className="h-4 w-4" /> {label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* screen sections */}
                    <div className="space-y-4">
                      <p className="text-sm font-bold">Accès aux écrans</p>
                      {SCREEN_SECTIONS.map((section) => (
                        <div key={section.key} className="rounded-xl border border-border/70 p-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{section.label}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                            {section.items.map(([item, label]) => (
                              <label key={item} className="flex items-center justify-between gap-3 cursor-pointer">
                                <span className="text-sm">{label}</span>
                                <Switch
                                  checked={role.permissions.screens?.[section.key]?.[item] ?? false}
                                  onCheckedChange={(v) => toggleScreen(role.id, section.key, item, v)}
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* actions */}
                    <div className="rounded-xl border border-border/70 p-3">
                      <p className="text-sm font-bold mb-2">Actions autorisées</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                        {ACTIONS.map(([action, label]) => (
                          <label key={action} className="flex items-center justify-between gap-3 cursor-pointer">
                            <span className="text-sm">{label}</span>
                            <Switch
                              checked={role.permissions.actions?.[action] ?? false}
                              onCheckedChange={(v) => toggleAction(role.id, action, v)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => save(role)} disabled={!isDirty || savingId === role.id} className="gap-1.5">
                        <Save className="h-4 w-4" />
                        {savingId === role.id ? "Enregistrement…" : "Enregistrer"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardPage>
  );
}
