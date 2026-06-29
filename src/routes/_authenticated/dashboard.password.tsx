import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { DashboardPage } from "@/components/dashboard-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/password")({
  component: PasswordPage,
});

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function PasswordPage() {
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const valid = next.length >= 8 && /[A-Z]/.test(next) && /[a-z]/.test(next) && /[0-9]/.test(next);

  const requirements = [
    { label: "8 caractères minimum", met: next.length >= 8 },
    { label: "1 majuscule et 1 minuscule", met: /[A-Z]/.test(next) && /[a-z]/.test(next) },
    { label: "1 chiffre", met: /[0-9]/.test(next) },
  ];

  const save = async () => {
    if (!current.trim()) return toast.error("Veuillez entrer votre mot de passe actuel.");
    if (!valid) return toast.error("Le nouveau mot de passe ne respecte pas les critères requis.");
    if (next !== confirm) return toast.error("Les mots de passe ne correspondent pas.");

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setSaving(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });
    if (signInError) {
      toast.error("Mot de passe actuel incorrect.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Mot de passe mis à jour ✅");
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <DashboardPage>
      <h1 className="text-2xl font-extrabold">{t("sidebar.password")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Modifiez votre mot de passe de connexion</p>

      <div className="mt-6 rounded-2xl border border-border bg-background p-6 space-y-5">
        <div className="rounded-xl bg-muted/50 p-4 space-y-1.5">
          <p className="text-sm font-semibold">Critères requis</p>
          <ul className="space-y-1">
            {requirements.map((r) => (
              <li key={r.label} className={`flex items-center gap-2 text-sm ${next.length > 0 ? r.met ? "text-green-600" : "text-destructive" : "text-muted-foreground"}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                {r.label}
              </li>
            ))}
          </ul>
        </div>

        <PasswordInput label="Mot de passe actuel" value={current} onChange={setCurrent} />
        <PasswordInput label="Nouveau mot de passe" value={next} onChange={setNext} />
        <PasswordInput label="Confirmer le mot de passe" value={confirm} onChange={setConfirm} />

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving ? "..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </DashboardPage>
  );
}