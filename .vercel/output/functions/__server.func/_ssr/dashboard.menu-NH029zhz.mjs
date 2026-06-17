import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { a as useAuth, u as useI18n } from "./router-QBDctAac.mjs";
import { L as Logo } from "./logo-CA2Gasx3.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { B as BottomNav } from "./bottom-nav-BdMsgy1g.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, I as Input, d as DialogFooter } from "./input-CX2_nYzV.mjs";
import { R as Root } from "../_libs/radix-ui__react-label.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { T as Textarea, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-D_mvxjrL.mjs";
import { S as Switch } from "./switch-CQ4rbtn8.mjs";
import { c as useSensors, d as useSensor, D as DndContext, e as closestCenter, T as TouchSensor, P as PointerSensor } from "../_libs/dnd-kit__core.mjs";
import { S as SortableContext, v as verticalListSortingStrategy, a as arrayMove, u as useSortable } from "../_libs/dnd-kit__sortable.mjs";
import { C as CSS } from "../_libs/dnd-kit__utilities.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { p as Plus, v as Pencil, w as Trash2, x as ImagePlus, X, G as GripVertical } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = Root.displayName;
const UNCATEGORIZED = "__uncategorized__";
function SortableProductRow({
  id,
  children
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, style, className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { ...attributes, ...listeners, className: "grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-muted-foreground active:cursor-grabbing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children })
  ] });
}
function SortableCategorySection({
  id,
  children
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { ref: setNodeRef, style, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { ...attributes, ...listeners, className: "grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-muted-foreground active:cursor-grabbing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children })
  ] }) });
}
function MenuManagement() {
  const {
    user
  } = useAuth();
  const {
    t
  } = useI18n();
  const [restaurantId, setRestaurantId] = reactExports.useState(null);
  const [categories, setCategories] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [catDialogOpen, setCatDialogOpen] = reactExports.useState(false);
  const [editingCat, setEditingCat] = reactExports.useState(null);
  const [catName, setCatName] = reactExports.useState("");
  const [catDescription, setCatDescription] = reactExports.useState("");
  const [catImageFile, setCatImageFile] = reactExports.useState(null);
  const [catImagePreview, setCatImagePreview] = reactExports.useState(null);
  const [catImageUrl, setCatImageUrl] = reactExports.useState(null);
  const [uploadingCatImage, setUploadingCatImage] = reactExports.useState(false);
  const [savingCat, setSavingCat] = reactExports.useState(false);
  const [prodDialogOpen, setProdDialogOpen] = reactExports.useState(false);
  const [editingProd, setEditingProd] = reactExports.useState(null);
  const [prodForm, setProdForm] = reactExports.useState({
    name: "",
    description: "",
    price: "",
    emoji: "",
    category_id: "",
    is_available: true,
    kcal: "",
    prep_minutes: "",
    badge: "",
    tags: ""
  });
  const [savingProd, setSavingProd] = reactExports.useState(false);
  const [imageFile, setImageFile] = reactExports.useState(null);
  const [imagePreview, setImagePreview] = reactExports.useState(null);
  const [imageUrl, setImageUrl] = reactExports.useState(null);
  const [uploadingImage, setUploadingImage] = reactExports.useState(false);
  const [supplements, setSupplements] = reactExports.useState([]);
  const [newSupplementName, setNewSupplementName] = reactExports.useState("");
  const [newSupplementPrice, setNewSupplementPrice] = reactExports.useState("");
  const loadData = async (rid) => {
    const [{
      data: cats
    }, {
      data: prods
    }] = await Promise.all([supabase.from("categories").select("id, name, description, image_url, position").eq("restaurant_id", rid).order("position"), supabase.from("products").select("id, category_id, name, description, price, emoji, image_url, is_available, position, kcal, prep_minutes, badge, tags").eq("restaurant_id", rid).order("position")]);
    setCategories(cats ?? []);
    setProducts(prods ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle().then(({
      data
    }) => {
      if (data) {
        setRestaurantId(data.id);
        loadData(data.id);
      } else {
        setLoading(false);
      }
    });
  }, [user]);
  const openNewCategory = () => {
    setEditingCat(null);
    setCatName("");
    setCatDescription("");
    setCatImageFile(null);
    setCatImagePreview(null);
    setCatImageUrl(null);
    setCatDialogOpen(true);
  };
  const openEditCategory = (c) => {
    setEditingCat(c);
    setCatName(c.name);
    setCatDialogOpen(true);
  };
  const uploadCategoryImage = async (file) => {
    if (!restaurantId) return null;
    const ext = file.name.split(".").pop();
    const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;
    const {
      error
    } = await supabase.storage.from("category-images").upload(path, file, {
      upsert: true
    });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const {
      data
    } = supabase.storage.from("category-images").getPublicUrl(path);
    return data.publicUrl;
  };
  const onCatImageSelect = (file) => {
    if (!file) return;
    setCatImageFile(file);
    setCatImagePreview(URL.createObjectURL(file));
  };
  const removeCatImage = () => {
    setCatImageFile(null);
    setCatImagePreview(null);
    setCatImageUrl(null);
  };
  const saveCategory = async () => {
    if (!restaurantId || !catName.trim()) return;
    setSavingCat(true);
    let finalCatImageUrl = catImageUrl;
    if (catImageFile) {
      setUploadingCatImage(true);
      const uploaded = await uploadCategoryImage(catImageFile);
      setUploadingCatImage(false);
      if (!uploaded) {
        setSavingCat(false);
        return;
      }
      finalCatImageUrl = uploaded;
    }
    if (editingCat) {
      const {
        error
      } = await supabase.from("categories").update({
        name: catName.trim(),
        description: catDescription.trim() || null,
        image_url: finalCatImageUrl
      }).eq("id", editingCat.id);
      setSavingCat(false);
      if (error) return toast.error(error.message);
      toast.success(t("menu.categoryUpdated"));
    } else {
      const {
        error
      } = await supabase.from("categories").insert({
        restaurant_id: restaurantId,
        name: catName.trim(),
        description: catDescription.trim() || null,
        image_url: finalCatImageUrl,
        position: categories.length
      });
      setSavingCat(false);
      if (error) return toast.error(error.message);
      toast.success(t("menu.categoryAdded"));
    }
    setCatDialogOpen(false);
    loadData(restaurantId);
  };
  const deleteCategory = async (id) => {
    if (!restaurantId) return;
    if (!window.confirm(t("menu.confirmDeleteCategory"))) return;
    const {
      error
    } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("menu.categoryDeleted"));
    loadData(restaurantId);
  };
  const openNewProduct = (categoryId) => {
    setEditingProd(null);
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setSupplements([]);
    setNewSupplementName("");
    setNewSupplementPrice("");
    setProdForm({
      name: "",
      description: "",
      price: "",
      emoji: "",
      category_id: categoryId ?? categories[0]?.id ?? UNCATEGORIZED,
      is_available: true,
      kcal: "",
      prep_minutes: "",
      badge: "",
      tags: ""
    });
    setProdDialogOpen(true);
  };
  const openEditProduct = async (p) => {
    setEditingProd(p);
    setImageFile(null);
    setImagePreview(p.image_url);
    setImageUrl(p.image_url);
    setNewSupplementName("");
    setNewSupplementPrice("");
    setProdForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      emoji: p.emoji ?? "",
      category_id: p.category_id ?? UNCATEGORIZED,
      is_available: p.is_available,
      kcal: p.kcal != null ? String(p.kcal) : "",
      prep_minutes: p.prep_minutes != null ? String(p.prep_minutes) : "",
      badge: p.badge ?? "",
      tags: (p.tags ?? []).join(", ")
    });
    setProdDialogOpen(true);
    const {
      data
    } = await supabase.from("product_supplements").select("id, product_id, name, price, position").eq("product_id", p.id).order("position");
    setSupplements(data ?? []);
  };
  const addSupplement = async () => {
    if (!editingProd || !newSupplementName.trim()) return;
    const price = parseFloat(newSupplementPrice) || 0;
    const position = supplements.length;
    const {
      data,
      error
    } = await supabase.from("product_supplements").insert({
      product_id: editingProd.id,
      name: newSupplementName.trim(),
      price,
      position
    }).select("id, product_id, name, price, position").single();
    if (error) return toast.error(error.message);
    setSupplements((prev) => [...prev, data]);
    setNewSupplementName("");
    setNewSupplementPrice("");
  };
  const deleteSupplement = async (id) => {
    const {
      error
    } = await supabase.from("product_supplements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSupplements((prev) => prev.filter((s) => s.id !== id));
  };
  const uploadProductImage = async (file) => {
    if (!restaurantId) return null;
    const ext = file.name.split(".").pop();
    const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;
    const {
      error
    } = await supabase.storage.from("product-images").upload(path, file, {
      upsert: true
    });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const {
      data
    } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };
  const onImageSelect = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
  };
  const saveProduct = async () => {
    if (!restaurantId || !prodForm.name.trim()) return;
    setSavingProd(true);
    let finalImageUrl = imageUrl;
    if (imageFile) {
      setUploadingImage(true);
      const uploaded = await uploadProductImage(imageFile);
      setUploadingImage(false);
      if (!uploaded) {
        setSavingProd(false);
        return;
      }
      finalImageUrl = uploaded;
    }
    const category_id = prodForm.category_id === UNCATEGORIZED ? null : prodForm.category_id;
    const tagsArray = prodForm.tags.split(",").map((t2) => t2.trim()).filter((t2) => t2.length > 0);
    const payload = {
      name: prodForm.name.trim(),
      description: prodForm.description.trim() || null,
      price: parseFloat(prodForm.price) || 0,
      emoji: prodForm.emoji.trim() || null,
      image_url: finalImageUrl,
      category_id,
      is_available: prodForm.is_available,
      kcal: prodForm.kcal.trim() ? parseInt(prodForm.kcal, 10) : null,
      prep_minutes: prodForm.prep_minutes.trim() ? parseInt(prodForm.prep_minutes, 10) : null,
      badge: prodForm.badge.trim() || null,
      tags: tagsArray.length > 0 ? tagsArray : null
    };
    if (editingProd) {
      const {
        error
      } = await supabase.from("products").update(payload).eq("id", editingProd.id);
      setSavingProd(false);
      if (error) return toast.error(error.message);
      toast.success(t("menu.productUpdated"));
    } else {
      const position = products.filter((p) => p.category_id === category_id).length;
      const {
        error
      } = await supabase.from("products").insert({
        ...payload,
        restaurant_id: restaurantId,
        position
      });
      setSavingProd(false);
      if (error) return toast.error(error.message);
      toast.success(t("menu.productAdded"));
    }
    setProdDialogOpen(false);
    loadData(restaurantId);
  };
  const deleteProduct = async (id) => {
    if (!restaurantId) return;
    if (!window.confirm(t("menu.confirmDeleteProduct"))) return;
    const {
      error
    } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("menu.productDeleted"));
    loadData(restaurantId);
  };
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  }), useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5
    }
  }));
  const handleCategoryDragEnd = async (event) => {
    const {
      active,
      over
    } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    const updates = reordered.map((c, idx) => ({
      id: c.id,
      position: idx
    }));
    for (const u of updates) {
      await supabase.from("categories").update({
        position: u.position
      }).eq("id", u.id);
    }
  };
  const handleProductDragEnd = async (groupProducts, event) => {
    const {
      active,
      over
    } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = groupProducts.findIndex((p) => p.id === active.id);
    const newIndex = groupProducts.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(groupProducts, oldIndex, newIndex);
    const reorderedIds = reordered.map((p) => p.id);
    setProducts((prev) => {
      const others = prev.filter((p) => !reorderedIds.includes(p.id));
      const updated = reordered.map((p, idx) => ({
        ...p,
        position: idx
      }));
      return [...others, ...updated].sort((a, b) => a.position - b.position);
    });
    for (let idx = 0; idx < reordered.length; idx++) {
      await supabase.from("products").update({
        position: idx
      }).eq("id", reordered[idx].id);
    }
  };
  const toggleAvailability = async (p) => {
    setProducts((prev) => prev.map((x) => x.id === p.id ? {
      ...x,
      is_available: !x.is_available
    } : x));
    const {
      error
    } = await supabase.from("products").update({
      is_available: !p.is_available
    }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      setProducts((prev) => prev.map((x) => x.id === p.id ? {
        ...x,
        is_available: p.is_available
      } : x));
    }
  };
  const groups = [...categories.map((c) => ({
    id: c.id,
    name: c.name,
    products: products.filter((p) => p.category_id === c.id)
  })), {
    id: UNCATEGORIZED,
    name: t("menu.uncategorized"),
    products: products.filter((p) => p.category_id === null)
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-3xl items-center justify-between px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: "sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-extrabold", children: t("menu.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t("menu.subtitle") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNewCategory, size: "sm", variant: "outline", className: "shrink-0 gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          t("menu.addCategory")
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-center text-sm text-muted-foreground", children: t("menu.loading") }) : !restaurantId ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-center text-sm text-muted-foreground", children: t("menu.noRestaurant") }) : categories.length === 0 && products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: t("menu.noCategoriesYet") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t("menu.noCategoriesHint") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNewCategory, className: "mt-4 gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          t("menu.addCategory")
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: handleCategoryDragEnd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SortableContext, { items: categories.map((c) => c.id), strategy: verticalListSortingStrategy, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-6", children: groups.map((group) => {
        if (group.id === UNCATEGORIZED && group.products.length === 0) return null;
        const category = categories.find((c) => c.id === group.id);
        const sectionContent = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold", children: group.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => openNewProduct(group.id === UNCATEGORIZED ? void 0 : group.id), size: "sm", variant: "ghost", className: "gap-1.5 text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                t("menu.addProduct")
              ] }),
              category && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditCategory(category), className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteCategory(category.id), className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
              ] })
            ] })
          ] }),
          group.products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-border bg-surface/40 p-4 text-center text-sm text-muted-foreground", children: t("menu.noProducts") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: (e) => handleProductDragEnd(group.products, e), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SortableContext, { items: group.products.map((p) => p.id), strategy: verticalListSortingStrategy, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: group.products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SortableProductRow, { id: p.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-background text-xl", children: p.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.image_url, alt: p.name, className: "h-full w-full object-cover" }) : p.emoji || "🍽️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold", children: p.name }),
              p.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: p.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "shrink-0 text-sm font-bold text-gold", children: [
              Number(p.price).toFixed(2),
              " DT"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: p.is_available, onCheckedChange: () => toggleAvailability(p) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditProduct(p), className: "grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteProduct(p.id), className: "grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] }) }, p.id)) }) }) })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SortableCategorySection, { id: group.id, children: sectionContent }, group.id);
      }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: catDialogOpen, onOpenChange: setCatDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingCat ? t("menu.editCategory") : t("menu.addCategory") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cat-name", children: t("menu.categoryName") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cat-name", value: catName, onChange: (e) => setCatName(e.target.value), placeholder: t("menu.categoryNamePlaceholder") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cat-desc", children: t("menu.categoryDescription") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cat-desc", value: catDescription, onChange: (e) => setCatDescription(e.target.value), placeholder: t("menu.categoryDescriptionPlaceholder") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("menu.photo") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background", children: catImagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: catImagePreview, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-5 w-5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-accent", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-3.5 w-3.5" }),
              catImagePreview ? t("menu.changePhoto") : t("menu.addPhoto"),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => onCatImageSelect(e.target.files?.[0] ?? null) })
            ] }),
            catImagePreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: removeCatImage, className: "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
              t("menu.removePhoto")
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCatDialogOpen(false), children: t("menu.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveCategory, disabled: savingCat || uploadingCatImage || !catName.trim(), children: t("menu.save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: prodDialogOpen, onOpenChange: setProdDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingProd ? t("menu.editProduct") : t("menu.addProduct") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_5rem] gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-name", children: t("menu.productName") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "prod-name", value: prodForm.name, onChange: (e) => setProdForm((f) => ({
              ...f,
              name: e.target.value
            })), placeholder: t("menu.productNamePlaceholder") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-emoji", children: t("menu.emoji") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "prod-emoji", value: prodForm.emoji, onChange: (e) => setProdForm((f) => ({
              ...f,
              emoji: e.target.value
            })), placeholder: "🍽️", maxLength: 4, className: "text-center text-lg" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("menu.photo") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background", children: imagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: imagePreview, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: prodForm.emoji || "🍽️" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-accent", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-3.5 w-3.5" }),
                imagePreview ? t("menu.changePhoto") : t("menu.addPhoto"),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => onImageSelect(e.target.files?.[0] ?? null) })
              ] }),
              imagePreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: removeImage, className: "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
                t("menu.removePhoto")
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-desc", children: t("menu.description") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "prod-desc", value: prodForm.description, onChange: (e) => setProdForm((f) => ({
            ...f,
            description: e.target.value
          })), placeholder: t("menu.descriptionPlaceholder"), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-price", children: t("menu.price") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "prod-price", type: "number", inputMode: "decimal", step: "0.01", min: "0", value: prodForm.price, onChange: (e) => setProdForm((f) => ({
              ...f,
              price: e.target.value
            })), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("menu.category") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: prodForm.category_id, onValueChange: (v) => setProdForm((f) => ({
              ...f,
              category_id: v
            })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: UNCATEGORIZED, children: t("menu.uncategorized") })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-kcal", children: t("menu.kcal") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "prod-kcal", type: "number", inputMode: "numeric", min: "0", value: prodForm.kcal, onChange: (e) => setProdForm((f) => ({
              ...f,
              kcal: e.target.value
            })), placeholder: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-prep", children: t("menu.prepMinutes") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "prod-prep", type: "number", inputMode: "numeric", min: "0", value: prodForm.prep_minutes, onChange: (e) => setProdForm((f) => ({
              ...f,
              prep_minutes: e.target.value
            })), placeholder: "0" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-badge", children: t("menu.badge") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "prod-badge", value: prodForm.badge, onChange: (e) => setProdForm((f) => ({
            ...f,
            badge: e.target.value
          })), placeholder: t("menu.badgePlaceholder") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-tags", children: t("menu.tags") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "prod-tags", value: prodForm.tags, onChange: (e) => setProdForm((f) => ({
            ...f,
            tags: e.target.value
          })), placeholder: t("menu.tagsPlaceholder") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("menu.supplements") }),
          !editingProd ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-border bg-surface/40 p-3 text-xs text-muted-foreground", children: t("menu.supplementsHint") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            supplements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: supplements.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm font-medium", children: s.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-gold", children: [
                "+",
                Number(s.price).toFixed(2),
                " DT"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => deleteSupplement(s.id), className: "grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, s.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newSupplementName, onChange: (e) => setNewSupplementName(e.target.value), placeholder: t("menu.supplementNamePlaceholder"), className: "flex-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", inputMode: "decimal", step: "0.01", min: "0", value: newSupplementPrice, onChange: (e) => setNewSupplementPrice(e.target.value), placeholder: "0.00", className: "w-20" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", onClick: addSupplement, disabled: !newSupplementName.trim(), className: "shrink-0 gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prod-available", className: "cursor-pointer", children: prodForm.is_available ? t("menu.available") : t("menu.unavailable") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "prod-available", checked: prodForm.is_available, onCheckedChange: (v) => setProdForm((f) => ({
            ...f,
            is_available: v
          })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setProdDialogOpen(false), children: t("menu.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveProduct, disabled: savingProd || uploadingImage || !prodForm.name.trim(), children: t("menu.save") })
      ] })
    ] }) })
  ] });
}
export {
  MenuManagement as component
};
