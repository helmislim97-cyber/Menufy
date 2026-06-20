import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ImagePlus, X, GripVertical, Eye, EyeOff } from "lucide-react";
import { AssistanceBell } from "@/components/assistance-bell";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/menu")({
  component: MenuManagement,
});

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  position: number;
  is_active: boolean;
}

interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  emoji: string | null;
  image_url: string | null;
  is_available: boolean;
  is_visible: boolean;
  position: number;
  kcal: number | null;
  prep_minutes: number | null;
  badge: string | null;
  badge_color: string | null;
  tags: string[] | null;
}

interface Supplement {
  id: string;
  product_id: string;
  name: string;
  price: number;
  position: number;
}

const UNCATEGORIZED = "__uncategorized__";

function SortableProductRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex min-w-0 items-center gap-2">
      <button {...attributes} {...listeners} className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-muted-foreground active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function SortableCategorySection({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <section ref={setNodeRef} style={style}>
      <div className="mb-2 flex items-center gap-2">
        <button {...attributes} {...listeners} className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-muted-foreground active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </section>
  );
}

function MenuManagement() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Category dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catImageFile, setCatImageFile] = useState<File | null>(null);
  const [catImagePreview, setCatImagePreview] = useState<string | null>(null);
  const [catImageUrl, setCatImageUrl] = useState<string | null>(null);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  // Product dialog
  const [prodDialogOpen, setProdDialogOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: "",
    description: "",
    price: "",
    emoji: "",
    category_id: "" as string,
    is_available: true,
    kcal: "",
    prep_minutes: "",
    badge: "",
    badgeColor: "#16a34a",
    tags: "",
  });
  const BADGE_COLORS = ["#16a34a", "#dc2626", "#ea580c", "#2563eb", "#9333ea", "#1c1f16"];
  const [savingProd, setSavingProd] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [newSupplementName, setNewSupplementName] = useState("");
  const [newSupplementPrice, setNewSupplementPrice] = useState("");

  // Upsell items
  interface UpsellItem {
    id: string;
    product_id: string;
    special_price: number | null;
    position: number;
  }
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([]);
  const [upsellDialogOpen, setUpsellDialogOpen] = useState(false);
  const [upsellProductId, setUpsellProductId] = useState("");
  const [upsellSpecialPrice, setUpsellSpecialPrice] = useState("");
  const [savingUpsell, setSavingUpsell] = useState(false);

  const loadData = async (rid: string) => {
    const [{ data: cats }, { data: prods }, { data: upsells }] = await Promise.all([
      supabase.from("categories").select("id, name, description, image_url, position, is_active").eq("restaurant_id", rid).order("position"),
      supabase
        .from("products")
        .select("id, category_id, name, description, price, emoji, image_url, is_available, is_visible, position, kcal, prep_minutes, badge, badge_color, tags")
        .eq("restaurant_id", rid)
        .order("position"),
      supabase.from("upsell_items").select("id, product_id, special_price, position").eq("restaurant_id", rid).order("position"),
    ]);
    setCategories(cats ?? []);
    setProducts(prods ?? []);
    setUpsellItems(upsells ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRestaurantId(data.id);
          loadData(data.id);
        } else {
          setLoading(false);
        }
      });
  }, [user]);

  // ───────────── Categories ─────────────
  const openNewCategory = () => {
    setEditingCat(null);
    setCatName("");
    setCatDescription("");
    setCatImageFile(null);
    setCatImagePreview(null);
    setCatImageUrl(null);
    setCatDialogOpen(true);
  };

  const openEditCategory = (c: Category) => {
    setEditingCat(c);
    setCatName(c.name);
    setCatDialogOpen(true);
  };

  const uploadCategoryImage = async (file: File): Promise<string | null> => {
    if (!restaurantId) return null;
    const ext = file.name.split(".").pop();
    const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("category-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("category-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const onCatImageSelect = (file: File | null) => {
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
      const { error } = await supabase.from("categories").update({ name: catName.trim(), description: catDescription.trim() || null, image_url: finalCatImageUrl }).eq("id", editingCat.id);
      setSavingCat(false);
      if (error) return toast.error(error.message);
      toast.success(t("menu.categoryUpdated"));
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({ restaurant_id: restaurantId, name: catName.trim(), description: catDescription.trim() || null, image_url: finalCatImageUrl, position: categories.length });
      setSavingCat(false);
      if (error) return toast.error(error.message);
      toast.success(t("menu.categoryAdded"));
    }
    setCatDialogOpen(false);
    loadData(restaurantId);
  };

  const deleteCategory = async (id: string) => {
    if (!restaurantId) return;
    if (!window.confirm(t("menu.confirmDeleteCategory"))) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("menu.categoryDeleted"));
    loadData(restaurantId);
  };

  const toggleCategoryActive = async (c: Category) => {
    setCategories((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
    const { error } = await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) {
      toast.error(error.message);
      setCategories((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: c.is_active } : x)));
    } else {
      toast.success(c.is_active ? t("menu.categoryHidden") : t("menu.categoryShown"));
    }
  };

  // ───────────── Products ─────────────
  const openNewProduct = (categoryId?: string) => {
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
      badgeColor: "#16a34a",
      tags: "",
    });
    setProdDialogOpen(true);
  };

  const openEditProduct = async (p: Product) => {
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
      badgeColor: p.badge_color ?? "#16a34a",
      tags: (p.tags ?? []).join(", "),
    });
    setProdDialogOpen(true);
    const { data } = await supabase
      .from("product_supplements")
      .select("id, product_id, name, price, position")
      .eq("product_id", p.id)
      .order("position");
    setSupplements(data ?? []);
  };

  const addSupplement = async () => {
    if (!editingProd || !newSupplementName.trim()) return;
    const price = parseFloat(newSupplementPrice) || 0;
    const position = supplements.length;
    const { data, error } = await supabase
      .from("product_supplements")
      .insert({ product_id: editingProd.id, name: newSupplementName.trim(), price, position })
      .select("id, product_id, name, price, position")
      .single();
    if (error) return toast.error(error.message);
    setSupplements((prev) => [...prev, data]);
    setNewSupplementName("");
    setNewSupplementPrice("");
  };

  const deleteSupplement = async (id: string) => {
    const { error } = await supabase.from("product_supplements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSupplements((prev) => prev.filter((s) => s.id !== id));
  };

  const uploadProductImage = async (file: File): Promise<string | null> => {
    if (!restaurantId) return null;
    const ext = file.name.split(".").pop();
    const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const onImageSelect = (file: File | null) => {
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
    const tagsArray = prodForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
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
      badge_color: prodForm.badge.trim() ? prodForm.badgeColor : null,
      tags: tagsArray.length > 0 ? tagsArray : null,
    };

    if (editingProd) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProd.id);
      setSavingProd(false);
      if (error) return toast.error(error.message);
      toast.success(t("menu.productUpdated"));
    } else {
      const position = products.filter((p) => p.category_id === category_id).length;
      const { error } = await supabase.from("products").insert({ ...payload, restaurant_id: restaurantId, position });
      setSavingProd(false);
      if (error) return toast.error(error.message);
      toast.success(t("menu.productAdded"));
    }
    setProdDialogOpen(false);
    loadData(restaurantId);
  };

  const deleteProduct = async (id: string) => {
    if (!restaurantId) return;
    if (!window.confirm(t("menu.confirmDeleteProduct"))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("menu.productDeleted"));
    loadData(restaurantId);
  };

  const openAddUpsell = () => {
    setUpsellProductId("");
    setUpsellSpecialPrice("");
    setUpsellDialogOpen(true);
  };

  const saveUpsell = async () => {
    if (!restaurantId || !upsellProductId) return;
    setSavingUpsell(true);
    const { error } = await supabase.from("upsell_items").insert({
      restaurant_id: restaurantId,
      product_id: upsellProductId,
      special_price: upsellSpecialPrice.trim() ? parseFloat(upsellSpecialPrice) : null,
      position: upsellItems.length,
    });
    setSavingUpsell(false);
    if (error) return toast.error(error.message);
    toast.success(t("menu.upsellAdded"));
    setUpsellDialogOpen(false);
    loadData(restaurantId);
  };

  const deleteUpsell = async (id: string) => {
    if (!restaurantId) return;
    const { error } = await supabase.from("upsell_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("menu.upsellDeleted"));
    loadData(restaurantId);
  };

  const handleUpsellDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = upsellItems.findIndex((u) => u.id === active.id);
    const newIndex = upsellItems.findIndex((u) => u.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(upsellItems, oldIndex, newIndex);
    setUpsellItems(reordered);
    const updates = reordered.map((u, idx) => ({ id: u.id, position: idx }));
    for (const u of updates) {
      await supabase.from("upsell_items").update({ position: u.position }).eq("id", u.id);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    const updates = reordered.map((c, idx) => ({ id: c.id, position: idx }));
    for (const u of updates) {
      await supabase.from("categories").update({ position: u.position }).eq("id", u.id);
    }
  };

  const handleProductDragEnd = async (groupProducts: Product[], event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = groupProducts.findIndex((p) => p.id === active.id);
    const newIndex = groupProducts.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(groupProducts, oldIndex, newIndex);
    const reorderedIds = reordered.map((p) => p.id);
    setProducts((prev) => {
      const others = prev.filter((p) => !reorderedIds.includes(p.id));
      const updated = reordered.map((p, idx) => ({ ...p, position: idx }));
      return [...others, ...updated].sort((a, b) => a.position - b.position);
    });
    for (let idx = 0; idx < reordered.length; idx++) {
      await supabase.from("products").update({ position: idx }).eq("id", reordered[idx].id);
    }
  };

  const toggleAvailability = async (p: Product) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_available: !x.is_available } : x)));
    const { error } = await supabase.from("products").update({ is_available: !p.is_available }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_available: p.is_available } : x)));
    }
  };

  const toggleProductVisible = async (p: Product) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_visible: !x.is_visible } : x)));
    const { error } = await supabase.from("products").update({ is_visible: !p.is_visible }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_visible: p.is_visible } : x)));
    } else {
      toast.success(p.is_visible ? t("menu.productHidden") : t("menu.productShown"));
    }
  };

  const groups: { id: string; name: string; products: Product[] }[] = [
    ...categories.map((c) => ({ id: c.id, name: c.name, products: products.filter((p) => p.category_id === c.id) })),
    {
      id: UNCATEGORIZED,
      name: t("menu.uncategorized"),
      products: products.filter((p) => p.category_id === null),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl ps-16 sm:ps-20">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <AssistanceBell />
            <LangSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 ps-16 sm:ps-20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">{t("menu.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("menu.subtitle")}</p>
          </div>
          <Button onClick={openNewCategory} size="sm" variant="outline" className="shrink-0 gap-1.5">
            <Plus className="h-4 w-4" />
            {t("menu.addCategory")}
          </Button>
        </div>

        {loading ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
        ) : !restaurantId ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.noRestaurant")}</p>
        ) : categories.length === 0 && products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center">
            <p className="font-semibold text-foreground">{t("menu.noCategoriesYet")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("menu.noCategoriesHint")}</p>
            <Button onClick={openNewCategory} className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" />
              {t("menu.addCategory")}
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-6 space-y-6">
            {groups.map((group) => {
              if (group.id === UNCATEGORIZED && group.products.length === 0) return null;
              const category = categories.find((c) => c.id === group.id);
              const sectionContent = (
                <>
                  <div className={`mb-2 flex items-center justify-between ${category && !category.is_active ? "opacity-50" : ""}`}>
                    <h2 className="text-base font-bold">{group.name}</h2>
                    <div className="flex items-center gap-1">
                      <Button onClick={() => openNewProduct(group.id === UNCATEGORIZED ? undefined : group.id)} size="sm" variant="ghost" className="gap-1.5 text-primary">
                        <Plus className="h-4 w-4" />
                        {t("menu.addProduct")}
                      </Button>
                      {category && (
                        <>
                          <button
                            onClick={() => toggleCategoryActive(category)}
                            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                            title={category.is_active ? t("menu.hideCategory") : t("menu.showCategory")}
                          >
                            {category.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => openEditCategory(category)}
                            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {group.products.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-surface/40 p-4 text-center text-sm text-muted-foreground">
                      {t("menu.noProducts")}
                    </p>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleProductDragEnd(group.products, e)}>
                    <SortableContext items={group.products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {group.products.map((p) => (
                        <SortableProductRow key={p.id} id={p.id}>
                        <div
                          className={`flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 ${!p.is_visible ? "opacity-50" : ""}`}
                        >
                          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-background text-xl">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              p.emoji || "🍽️"
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{p.name}</p>
                            {p.description && (
                              <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                            )}
                          </div>
                          <p className="shrink-0 text-sm font-bold text-gold">{Number(p.price).toFixed(2)} DT</p>
                          <button
                            onClick={() => toggleProductVisible(p)}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                            title={p.is_visible ? t("menu.hideProduct") : t("menu.showProduct")}
                          >
                            {p.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <Switch checked={p.is_available} onCheckedChange={() => toggleAvailability(p)} />
                          <button
                            onClick={() => openEditProduct(p)}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        </SortableProductRow>
                      ))}
                    </div>
                    </SortableContext>
            
                  </DndContext>
                  )}
                </>
              );
              return (
                <SortableCategorySection key={group.id} id={group.id}>
                  {sectionContent}
                </SortableCategorySection>
              );
            })}
          </div>
          </SortableContext>
          </DndContext>
        )}

        {restaurantId && (
          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">{t("menu.upsellTitle")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("menu.upsellSubtitle")}</p>
              </div>
              <Button onClick={openAddUpsell} size="sm" variant="outline" className="shrink-0 gap-1.5">
                <Plus className="h-4 w-4" />
                {t("menu.upsellAdd")}
              </Button>
            </div>

            {upsellItems.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-border bg-surface/40 p-4 text-center text-sm text-muted-foreground">
                {t("menu.upsellEmpty")}
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleUpsellDragEnd}>
              <SortableContext items={upsellItems.map((u) => u.id)} strategy={verticalListSortingStrategy}>
              <div className="mt-4 space-y-2">
                {upsellItems.map((u) => {
                  const product = products.find((p) => p.id === u.product_id);
                  if (!product) return null;
                  return (
                    <SortableProductRow key={u.id} id={u.id}>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-background text-xl">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          product.emoji || "🍽️"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{product.name}</p>
                        {u.special_price != null ? (
                          <p className="text-xs">
                            <span className="text-muted-foreground line-through">{Number(product.price).toFixed(2)} DT</span>{" "}
                            <span className="font-bold text-gold">{Number(u.special_price).toFixed(2)} DT</span>
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">{Number(product.price).toFixed(2)} DT</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteUpsell(u.id)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    </SortableProductRow>
                  );
                })}
              </div>
              </SortableContext>
              </DndContext>
            )}
          </section>
        )}
      </main>

      <DashboardSidebar />

      {/* Category dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? t("menu.editCategory") : t("menu.addCategory")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cat-name">{t("menu.categoryName")}</Label>
            <Input
              id="cat-name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder={t("menu.categoryNamePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">{t("menu.categoryDescription")}</Label>
            <Input
              id="cat-desc"
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              placeholder={t("menu.categoryDescriptionPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("menu.photo")}</Label>
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background">
                {catImagePreview ? (
                  <img src={catImagePreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-accent">
                  <ImagePlus className="h-3.5 w-3.5" />
                  {catImagePreview ? t("menu.changePhoto") : t("menu.addPhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onCatImageSelect(e.target.files?.[0] ?? null)}
                  />
                </label>
                {catImagePreview && (
                  <button
                    type="button"
                    onClick={removeCatImage}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("menu.removePhoto")}
                  </button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>
              {t("menu.cancel")}
            </Button>
            <Button onClick={saveCategory} disabled={savingCat || uploadingCatImage || !catName.trim()}>
              {t("menu.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product dialog */}
      <Dialog open={prodDialogOpen} onOpenChange={setProdDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProd ? t("menu.editProduct") : t("menu.addProduct")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_5rem] gap-2">
              <div className="space-y-2">
                <Label htmlFor="prod-name">{t("menu.productName")}</Label>
                <Input
                  id="prod-name"
                  value={prodForm.name}
                  onChange={(e) => setProdForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t("menu.productNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-emoji">{t("menu.emoji")}</Label>
                <Input
                  id="prod-emoji"
                  value={prodForm.emoji}
                  onChange={(e) => setProdForm((f) => ({ ...f, emoji: e.target.value }))}
                  placeholder="🍽️"
                  maxLength={4}
                  className="text-center text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("menu.photo")}</Label>
              <div className="flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">{prodForm.emoji || "🍽️"}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-accent">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {imagePreview ? t("menu.changePhoto") : t("menu.addPhoto")}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onImageSelect(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t("menu.removePhoto")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-desc">{t("menu.description")}</Label>
              <Textarea
                id="prod-desc"
                value={prodForm.description}
                onChange={(e) => setProdForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={t("menu.descriptionPlaceholder")}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="prod-price">{t("menu.price")}</Label>
                <Input
                  id="prod-price"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={prodForm.price}
                  onChange={(e) => setProdForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("menu.category")}</Label>
                <Select
                  value={prodForm.category_id}
                  onValueChange={(v) => setProdForm((f) => ({ ...f, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={UNCATEGORIZED}>{t("menu.uncategorized")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="prod-kcal">{t("menu.kcal")}</Label>
                <Input
                  id="prod-kcal"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={prodForm.kcal}
                  onChange={(e) => setProdForm((f) => ({ ...f, kcal: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-prep">{t("menu.prepMinutes")}</Label>
                <Input
                  id="prod-prep"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={prodForm.prep_minutes}
                  onChange={(e) => setProdForm((f) => ({ ...f, prep_minutes: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-badge">{t("menu.badge")}</Label>
              <Input
                id="prod-badge"
                value={prodForm.badge}
                onChange={(e) => setProdForm((f) => ({ ...f, badge: e.target.value }))}
                placeholder={t("menu.badgePlaceholder")}
              />
              {prodForm.badge.trim() && (
                <div className="flex items-center gap-2 pt-1">
                  {BADGE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setProdForm((f) => ({ ...f, badgeColor: c }))}
                      className={`h-7 w-7 shrink-0 rounded-full border-2 ${prodForm.badgeColor === c ? "border-foreground" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("menu.supplements")}</Label>
              {!editingProd ? (
                <p className="rounded-xl border border-dashed border-border bg-surface/40 p-3 text-xs text-muted-foreground">
                  {t("menu.supplementsHint")}
                </p>
              ) : (
                <div className="space-y-2">
                  {supplements.length > 0 && (
                    <div className="space-y-1.5">
                      {supplements.map((s) => (
                        <div key={s.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
                          <span className="flex-1 text-sm font-medium">{s.name}</span>
                          <span className="text-sm font-bold text-gold">+{Number(s.price).toFixed(2)} DT</span>
                          <button
                            type="button"
                            onClick={() => deleteSupplement(s.id)}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={newSupplementName}
                      onChange={(e) => setNewSupplementName(e.target.value)}
                      placeholder={t("menu.supplementNamePlaceholder")}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={newSupplementPrice}
                      onChange={(e) => setNewSupplementPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-20"
                    />
                    <Button type="button" size="sm" onClick={addSupplement} disabled={!newSupplementName.trim()} className="shrink-0 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
              <Label htmlFor="prod-available" className="cursor-pointer">
                {prodForm.is_available ? t("menu.available") : t("menu.unavailable")}
              </Label>
              <Switch
                id="prod-available"
                checked={prodForm.is_available}
                onCheckedChange={(v) => setProdForm((f) => ({ ...f, is_available: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProdDialogOpen(false)}>
              {t("menu.cancel")}
            </Button>
            <Button onClick={saveProduct} disabled={savingProd || uploadingImage || !prodForm.name.trim()}>
              {t("menu.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={upsellDialogOpen} onOpenChange={setUpsellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("menu.upsellAdd")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t("menu.upsellProduct")}</Label>
              <Select value={upsellProductId} onValueChange={setUpsellProductId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("menu.upsellProductPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter((p) => !upsellItems.some((u) => u.product_id === p.id))
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {Number(p.price).toFixed(2)} DT
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upsell-price">{t("menu.upsellSpecialPrice")}</Label>
              <Input
                id="upsell-price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={upsellSpecialPrice}
                onChange={(e) => setUpsellSpecialPrice(e.target.value)}
                placeholder={t("menu.upsellSpecialPricePlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("menu.upsellSpecialPriceHint")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpsellDialogOpen(false)}>
              {t("menu.cancel")}
            </Button>
            <Button onClick={saveUpsell} disabled={savingUpsell || !upsellProductId}>
              {t("menu.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
