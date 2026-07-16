import { Button } from "@/components/ui/button";
import { LogOut, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Owner: "Quitter" -> back to the dashboard. Staff: "Changer d'utilisateur" ->
// end the session and return to the PIN pad. The action itself lives in
// useStaffSession; this is just the button.
export function StaffExitButton({ isOwner, onExit }: { isOwner: boolean; onExit: () => void }) {
  const { t } = useI18n();
  return (
    <Button variant="outline" onClick={onExit} className="gap-1.5">
      {isOwner ? <X className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
      {isOwner ? t("staff.exit") : t("staff.switchUser")}
    </Button>
  );
}
