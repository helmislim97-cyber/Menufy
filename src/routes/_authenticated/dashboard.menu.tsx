import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { BottomNav } from "@/components/bottom-nav";
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
import { Plus, Pencil, Trash2, ImagePlus, X } from "lucide-react";
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
  position: number;
  kcal: number | null;
  prep_minutes: number | null;
  badge: string | null;
  tags: string[] | null;
}

const UNCATEGORIZED = "__uncategorized__";

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
    tags: "",
  });
  const [savingProd, setSavingProd] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async (rid: string) => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from("categories").select("id, name, description, image_url, position").eq("restaurant_id", rid).order("position"),
      supabase
        .from("products")
        .select("id, category_id, name, description, price, emoji, image_url, is_available, position, kcal, prep_minutes, badge, tags")
        .eq("restaurant_id", rid)
        .order("position"),
    ]);
    setCategories(cats ?? []);
    setProducts(prods ?? []);
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

  // ───────────── Products ─────────────
  const openNewProduct = (categoryId?: string) => {
    setEditingProd(null);
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
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
      tags: "",
    });
    setProdDialogOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProd(p);
    setImageFile(null);
    setImagePreview(p.image_url);
    setImageUrl(p.image_url);
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
      tags: (p.tags ?? []).join(", "),
    });
    setProdDialogOpen(true);
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

  const toggleAvailability = async (p: Product) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_available: !x.is_available } : x)));
    const { error } = await supabase.from("products").update({ is_available: !p.is_available }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_available: p.is_available } : x)));
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
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo size="sm" />
          <LangSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
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
          <div className="mt-6 space-y-6">
            {groups.map((group) => {
              if (group.id === UNCATEGORIZED && group.products.length === 0) return null;
              const category = categories.find((c) => c.id === group.id);
              return (
                <section key={group.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-base font-bold">{group.name}</h2>
                    <div className="flex items-center gap-1">
                      <Button onClick={() => openNewProduct(group.id === UNCATEGORIZED ? undefined : group.id)} size="sm" variant="ghost" className="gap-1.5 text-primary">
                        <Plus className="h-4 w-4" />
                        {t("menu.addProduct")}
                      </Button>
                      {category && (
                        <>
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
                    <div className="space-y-2">
                      {group.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
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
                              <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                            )}
                          </div>
                          <p className="shrink-0 text-sm font-bold text-gold">{Number(p.price).toFixed(2)} DT</p>
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
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />

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
        <DialogContent>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-tags">{t("menu.tags")}</Label>
              <Input
                id="prod-tags"
                value={prodForm.tags}
                onChange={(e) => setProdForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder={t("menu.tagsPlaceholder")}
              />
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
    </div>
  );
}
