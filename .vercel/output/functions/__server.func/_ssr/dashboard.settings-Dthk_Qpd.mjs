import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { a as useAuth, u as useI18n } from "./router-QBDctAac.mjs";
import { L as Logo } from "./logo-CA2Gasx3.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { B as BottomNav } from "./bottom-nav-BdMsgy1g.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input, D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./input-CX2_nYzV.mjs";
import { S as Switch } from "./switch-CQ4rbtn8.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { v as Pencil, p as Plus, Q as QrCode, w as Trash2, j as LogOut, E as ExternalLink, D as Download, x as ImagePlus, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
function BannerCropper({ imageUrl, positionX, positionY, zoom, onChange }) {
  const containerRef = reactExports.useRef(null);
  const [dragging, setDragging] = reactExports.useState(false);
  const lastPos = reactExports.useRef(null);
  const clamp = (v) => Math.min(100, Math.max(0, v));
  const onPointerDown = (e) => {
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging || !lastPos.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - lastPos.current.x) / rect.width * 100;
    const dy = (e.clientY - lastPos.current.y) / rect.height * 100;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onChange({ x: clamp(positionX - dx), y: clamp(positionY - dy), zoom });
  };
  const onPointerUp = () => {
    setDragging(false);
    lastPos.current = null;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: containerRef,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave: onPointerUp,
      className: "relative h-40 w-full cursor-move overflow-hidden rounded-2xl border border-border bg-background touch-none select-none",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: imageUrl,
          alt: "",
          draggable: false,
          className: "absolute h-full w-full object-cover",
          style: {
            objectPosition: `${positionX}% ${positionY}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${positionX}% ${positionY}%`
          }
        }
      )
    }
  );
}
function SettingsPage() {
  const {
    user,
    signOut
  } = useAuth();
  const {
    t
  } = useI18n();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [tables, setTables] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [newTableNumber, setNewTableNumber] = reactExports.useState("");
  const [adding, setAdding] = reactExports.useState(false);
  const [qrTable, setQrTable] = reactExports.useState(null);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [editName, setEditName] = reactExports.useState("");
  const [editAddress, setEditAddress] = reactExports.useState("");
  const [editPhone, setEditPhone] = reactExports.useState("");
  const [savingRestaurant, setSavingRestaurant] = reactExports.useState(false);
  const [editFacebook, setEditFacebook] = reactExports.useState("");
  const [editInstagram, setEditInstagram] = reactExports.useState("");
  const [editDescription, setEditDescription] = reactExports.useState("");
  const [editWifi, setEditWifi] = reactExports.useState("");
  const [logoFile, setLogoFile] = reactExports.useState(null);
  const [logoPreview, setLogoPreview] = reactExports.useState(null);
  const [logoUrl, setLogoUrl] = reactExports.useState(null);
  const [uploadingLogo, setUploadingLogo] = reactExports.useState(false);
  const [bannerFile, setBannerFile] = reactExports.useState(null);
  const [bannerPreview, setBannerPreview] = reactExports.useState(null);
  const [bannerUrl, setBannerUrl] = reactExports.useState(null);
  const [uploadingBanner, setUploadingBanner] = reactExports.useState(false);
  const [bannerPosX, setBannerPosX] = reactExports.useState(50);
  const [bannerPosY, setBannerPosY] = reactExports.useState(50);
  const [bannerZoom, setBannerZoom] = reactExports.useState(1);
  const loadTables = async (restaurantId) => {
    const {
      data
    } = await supabase.from("tables").select("id, number, is_active").eq("restaurant_id", restaurantId).order("number");
    setTables(data ?? []);
  };
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id, name, address, phone, logo_url, facebook_url, instagram_url, description, wifi, banner_url, banner_position_x, banner_position_y, banner_zoom").eq("owner_id", user.id).maybeSingle().then(async ({
      data
    }) => {
      setRestaurant(data ?? null);
      if (data) await loadTables(data.id);
      setLoading(false);
    });
  }, [user]);
  const onLogout = async () => {
    await signOut();
    toast.success("À bientôt !");
    navigate({
      to: "/"
    });
  };
  const addTable = async () => {
    if (!restaurant) return;
    const num = parseInt(newTableNumber, 10);
    if (!num || num <= 0) return;
    setAdding(true);
    const {
      error
    } = await supabase.from("tables").insert({
      restaurant_id: restaurant.id,
      number: num
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    toast.success(t("settings.tableAdded"));
    setNewTableNumber("");
    loadTables(restaurant.id);
  };
  const toggleTable = async (table) => {
    setTables((prev) => prev.map((tb) => tb.id === table.id ? {
      ...tb,
      is_active: !tb.is_active
    } : tb));
    await supabase.from("tables").update({
      is_active: !table.is_active
    }).eq("id", table.id);
  };
  const deleteTable = async (table) => {
    if (!restaurant) return;
    if (!window.confirm(t("settings.confirmDeleteTable"))) return;
    const {
      error
    } = await supabase.from("tables").delete().eq("id", table.id);
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
  const uploadRestaurantLogo = async (file) => {
    if (!restaurant) return null;
    const ext = file.name.split(".").pop();
    const path = `${restaurant.id}/${crypto.randomUUID()}.${ext}`;
    const {
      error
    } = await supabase.storage.from("restaurant-logos").upload(path, file, {
      upsert: true
    });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const {
      data
    } = supabase.storage.from("restaurant-logos").getPublicUrl(path);
    return data.publicUrl;
  };
  const onLogoSelect = (file) => {
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl(null);
  };
  const uploadRestaurantBanner = async (file) => {
    if (!restaurant) return null;
    const ext = file.name.split(".").pop();
    const path = `${restaurant.id}/${crypto.randomUUID()}.${ext}`;
    const {
      error
    } = await supabase.storage.from("restaurant-banners").upload(path, file, {
      upsert: true
    });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const {
      data
    } = supabase.storage.from("restaurant-banners").getPublicUrl(path);
    return data.publicUrl;
  };
  const onBannerSelect = (file) => {
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
      banner_zoom: bannerZoom
    };
    const {
      error
    } = await supabase.from("restaurants").update(updates).eq("id", restaurant.id);
    setSavingRestaurant(false);
    if (error) return toast.error(error.message);
    setRestaurant({
      ...restaurant,
      ...updates,
      wifi: editWifi.trim() || null
    });
    toast.success(t("settings.restaurantUpdated"));
    setEditOpen(false);
  };
  const menuUrl = (tableNumber) => `${window.location.origin}/menu/${restaurant?.id}/${tableNumber}`;
  const qrImageUrl = (tableNumber) => `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(menuUrl(tableNumber) + "?qr=1")}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-3xl items-center justify-between px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: "sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-extrabold", children: t("settings.title") }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-center text-sm text-muted-foreground", children: t("menu.loading") }) : !restaurant ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-center text-sm text-muted-foreground", children: t("menu.noRestaurant") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 rounded-2xl border border-border bg-surface p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            restaurant.logo_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.logo_url, alt: restaurant.name, className: "h-full w-full object-contain" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: t("settings.restaurant") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg font-extrabold", children: restaurant.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: restaurant.address || t("settings.noAddress") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: restaurant.phone || t("settings.noPhone") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openEditRestaurant, className: "shrink-0 gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
            t("settings.editRestaurant")
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-extrabold", children: t("settings.tables") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t("settings.tablesSubtitle") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", inputMode: "numeric", min: "1", value: newTableNumber, onChange: (e) => setNewTableNumber(e.target.value), placeholder: t("settings.tableNumberPlaceholder"), className: "max-w-[140px]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addTable, disabled: adding || !newTableNumber, className: "gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              t("settings.addTable")
            ] })
          ] }),
          tables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-xl border border-dashed border-border bg-surface/40 p-4 text-center text-sm text-muted-foreground", children: t("settings.noTables") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: tables.map((table) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-sm font-extrabold", children: table.number }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold", children: [
                t("settings.table"),
                " ",
                table.number
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: table.is_active ? t("settings.active") : t("settings.inactive") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setQrTable(table), className: "gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-3.5 w-3.5" }),
              t("settings.viewQr")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: table.is_active, onCheckedChange: () => toggleTable(table) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteTable(table), className: "grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] }, table.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onLogout, variant: "outline", className: "mt-8 w-full gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
        t("settings.logout")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!qrTable, onOpenChange: (open) => !open && setQrTable(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        t("settings.qrTitle"),
        " — ",
        t("settings.table"),
        " ",
        qrTable?.number
      ] }) }),
      qrTable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: qrImageUrl(qrTable.number), alt: `QR table ${qrTable.number}`, className: "h-64 w-64 rounded-xl border border-border bg-white p-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: t("settings.qrHint") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-all rounded-lg bg-surface px-3 py-2 text-center text-xs text-muted-foreground", children: menuUrl(qrTable.number) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "flex-row gap-2 sm:justify-center", children: qrTable && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: menuUrl(qrTable.number) + "?qr=1", target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
          t("settings.openLink")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: qrImageUrl(qrTable.number), target: "_blank", rel: "noreferrer", download: `table-${qrTable.number}-qr.png`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
          t("settings.downloadQr")
        ] }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editOpen, onOpenChange: setEditOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("settings.editRestaurantTitle") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.banner") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background", children: bannerPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: bannerPreview, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-5 w-5 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-accent", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-3.5 w-3.5" }),
                bannerPreview ? t("menu.changePhoto") : t("menu.addPhoto"),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => onBannerSelect(e.target.files?.[0] ?? null) })
              ] }),
              bannerPreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: removeBanner, className: "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
                t("menu.removePhoto")
              ] })
            ] })
          ] }),
          bannerPreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("settings.bannerHint") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BannerCropper, { imageUrl: bannerPreview, positionX: bannerPosX, positionY: bannerPosY, zoom: bannerZoom, onChange: ({
              x,
              y,
              zoom
            }) => {
              setBannerPosX(x);
              setBannerPosY(y);
              setBannerZoom(zoom);
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.bannerZoom") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "1", max: "2.5", step: "0.05", value: bannerZoom, onChange: (e) => setBannerZoom(parseFloat(e.target.value)), className: "flex-1" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.logo") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background", children: logoPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoPreview, alt: "", className: "h-full w-full object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-5 w-5 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-accent", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-3.5 w-3.5" }),
                logoPreview ? t("menu.changePhoto") : t("menu.addPhoto"),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => onLogoSelect(e.target.files?.[0] ?? null) })
              ] }),
              logoPreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: removeLogo, className: "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
                t("menu.removePhoto")
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.restaurantName") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editName, onChange: (e) => setEditName(e.target.value), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.address") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editAddress, onChange: (e) => setEditAddress(e.target.value), placeholder: t("settings.addressPlaceholder"), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.phone") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editPhone, onChange: (e) => setEditPhone(e.target.value), placeholder: t("settings.phonePlaceholder"), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.facebook") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editFacebook, onChange: (e) => setEditFacebook(e.target.value), placeholder: t("settings.facebookPlaceholder"), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.instagram") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editInstagram, onChange: (e) => setEditInstagram(e.target.value), placeholder: t("settings.instagramPlaceholder"), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.description") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: editDescription, onChange: (e) => setEditDescription(e.target.value), placeholder: t("settings.descriptionPlaceholder"), rows: 3, className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: t("settings.wifi") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editWifi, onChange: (e) => setEditWifi(e.target.value), placeholder: t("settings.wifiPlaceholder"), className: "mt-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditOpen(false), children: t("settings.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveRestaurant, disabled: savingRestaurant || uploadingLogo || uploadingBanner || !editName.trim(), children: t("settings.save") })
      ] })
    ] }) })
  ] });
}
export {
  SettingsPage as component
};
