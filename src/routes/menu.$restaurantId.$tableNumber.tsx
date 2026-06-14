import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RestaurantCover } from "@/components/restaurant-cover";
import { CategoryGrid } from "@/components/category-grid";
import { ShoppingCart, Plus, Minus, CheckCircle2, Search, ArrowLeft, MapPin, Flame, Clock } from "lucide-react";

export const Route = createFileRoute("/menu/$restaurantId/$tableNumber")({
  head: () => ({
    meta: [
      { title: "Menu — Menufy" },
      { name: "description", content: "Commandez directement depuis votre table." },
    ],
  }),
  component: MenuPage,
});

interface Restaurant {
  id: string;
  name: string;
  logo_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  wifi: string | null;
  banner_url: string | null;
  banner_position_x: number | null;
  banner_position_y: number | null;
  banner_zoom: number | null;
}

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

function ProductCard({
  p,
  qty,
  t,
  addToCart,
  changeQty,
}: {
  p: Product;
  qty: number;
  t: (key: string) => string;
  addToCart: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
      {p.badge && (
        <span className="absolute top-3 right-0 rounded-l-full bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground shadow-sm">
          {p.badge}
        </span>
      )}
      <div className="flex gap-3 p-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-background text-3xl">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            p.emoji || "🍽️"
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-base font-extrabold leading-tight text-[#1c1f16] pr-12">{p.name}</p>
          {p.description && (
            <p className="mt-1 text-xs leading-snug text-muted-foreground line-clamp-2">{p.description}</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 pr-12">
            <p className="text-base font-extrabold text-[#1c1f16]">{Number(p.price).toFixed(2)} DT</p>
            {(p.kcal || p.prep_minutes) && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {p.kcal && (
                  <span className="flex items-center gap-0.5">
                    <Flame className="h-3 w-3" />
                    {p.kcal} {t("client.kcal")}
                  </span>
                )}
                {p.kcal && p.prep_minutes && <span>|</span>}
                {p.prep_minutes && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {p.prep_minutes} {t("client.min")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {qty === 0 ? (
        <button onClick={() => addToCart(p.id)} className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Plus className="h-4 w-4" />
        </button>
      ) : (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-white px-2 py-1 shadow-sm">
          <button onClick={() => changeQty(p.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-foreground">
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-4 text-center text-sm font-bold">{qty}</span>
          <button onClick={() => changeQty(p.id, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
            <Plus className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function MenuPage() {
  const { restaurantId, tableNumber } = Route.useParams();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCover, setShowCover] = useState(true);
  const [coverLeaving, setCoverLeaving] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ total: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: rest } = await supabase
        .from("restaurants")
        .select("id, name, logo_url, facebook_url, instagram_url, address, phone, description, wifi, banner_url, banner_position_x, banner_position_y, banner_zoom")
        .eq("id", restaurantId)
        .eq("is_active", true)
        .maybeSingle();

      if (cancelled) return;
      setRestaurant(rest ?? null);
      if (!rest) {
        setLoading(false);
        return;
      }

      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, description, image_url, position")
          .eq("restaurant_id", restaurantId)
          .order("position"),
        supabase
          .from("products")
          .select("id, category_id, name, description, price, emoji, image_url, is_available, position, kcal, prep_minutes, badge, tags")
          .eq("restaurant_id", restaurantId)
          .eq("is_available", true)
          .order("position"),
      ]);

      if (cancelled) return;
      const catList = cats ?? [];
      const prodList = prods ?? [];
      setCategories(catList);
      setProducts(prodList);

      const firstWithProducts = catList.find((c) => prodList.some((p) => p.category_id === c.id));
      if (firstWithProducts) {
        setActiveCategory(firstWithProducts.id);
      } else if (prodList.some((p) => p.category_id === null)) {
        setActiveCategory(UNCATEGORIZED);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const visibleCategories = useMemo(() => {
    const cats = categories.filter((c) => products.some((p) => p.category_id === c.id));
    if (products.some((p) => p.category_id === null)) {
      cats.push({ id: UNCATEGORIZED, name: t("menu.uncategorized"), description: null, image_url: null, position: 9999 });
    }
    return cats;
  }, [categories, products, t]);

  const categoryCards = useMemo(() => {
    return visibleCategories.map((c) => {
      const cat = c as Category;
      if (cat.image_url) {
        return { id: c.id, name: c.name, description: cat.description ?? null, imageUrl: cat.image_url };
      }
      const match = products.find(
        (p) => (c.id === UNCATEGORIZED ? p.category_id === null : p.category_id === c.id) && p.image_url,
      );
      return { id: c.id, name: c.name, description: cat.description ?? null, imageUrl: match?.image_url ?? null };
    });
  }, [visibleCategories, products]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  const productsByCategory = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const c of visibleCategories) {
      map[c.id] = c.id === UNCATEGORIZED
        ? products.filter((p) => p.category_id === null)
        : products.filter((p) => p.category_id === c.id);
    }
    return map;
  }, [visibleCategories, products]);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingToSection = useRef(false);

  useEffect(() => {
    if (searchQuery.trim()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToSection.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-category-id");
          if (id) setActiveCategory(id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [visibleCategories, searchQuery]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const el = sectionRefs.current[id];
    if (el) {
      isScrollingToSection.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isScrollingToSection.current = false;
      }, 600);
    }
  };

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, qty]) => {
        const product = products.find((p) => p.id === productId);
        if (!product || qty <= 0) return null;
        return { product, qty };
      })
      .filter((x): x is { product: Product; qty: number } => x !== null);
  }, [cart, products]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * Number(i.product.price), 0);

  const addToCart = (productId: string) => {
    setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 }));
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((c) => {
      const next = { ...c };
      const current = next[productId] ?? 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        delete next[productId];
      } else {
        next[productId] = updated;
      }
      return next;
    });
  };

  const placeOrder = async () => {
    if (!restaurant || cartItems.length === 0) return;
    setPlacing(true);

    const { data: order, error: orderError } = await supabase
    .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        table_number: parseInt(tableNumber, 10) || null,
        status: "pending",
        total: cartTotal,
        notes: notes.trim() || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      setPlacing(false);
      return;
    }

    const items = cartItems.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      product_price: i.product.price,
      quantity: i.qty,
    }));

    await supabase.from("order_items").insert(items);

    setPlacing(false);
    setPlacedOrder({ total: cartTotal });
    setCartOpen(false);
    setCart({});
    setNotes("");
  };

  const startNewOrder = () => {
    setPlacedOrder(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("menu.loading")}</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between border-b border-border/50 px-4 py-4">
          <Logo size="sm" />
          <LangSwitch />
        </header>
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="text-xl font-extrabold">{t("client.notFound.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("client.notFound.subtitle")}</p>
        </main>
      </div>
    );
  }

  if (showCover) {
    return (
      <RestaurantCover
        name={restaurant.name}
        logoUrl={restaurant.logo_url}
        facebookUrl={restaurant.facebook_url}
        instagramUrl={restaurant.instagram_url}
        tableNumber={tableNumber}
        leaving={coverLeaving}
        onOrder={() => {
          setCoverLeaving(true);
          setTimeout(() => setShowCover(false), 250);
        }}
      />
    );
  }

  if (showCategories && categoryCards.length > 0) {
    return (
      <CategoryGrid
        name={restaurant.name}
        logoUrl={restaurant.logo_url}
        facebookUrl={restaurant.facebook_url}
        instagramUrl={restaurant.instagram_url}
        address={restaurant.address}
        phone={restaurant.phone}
        description={restaurant.description}
        wifi={restaurant.wifi}
        categories={categoryCards}
        onSelect={(id) => {
          setActiveCategory(id);
          setShowCategories(false);
        }}
        onBack={() => { setCoverLeaving(false); setShowCover(true); }}
      />
    );
  }

  if (placedOrder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">{t("client.success.title")}</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("client.success.subtitle")}</p>
        <div className="mt-6 w-full max-w-xs rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("client.success.table")}</span>
            <span className="font-bold">{tableNumber}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("client.total")}</span>
            <span className="font-bold text-gold">{placedOrder.total.toFixed(2)} DT</span>
          </div>
        </div>
        <Button onClick={startNewOrder} className="mt-8 w-full max-w-xs">
          {t("client.success.newOrder")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in bg-[#f3efe4] pb-28">
      <div className="mx-auto max-w-4xl sm:px-6 sm:py-8">
      <header className="relative bg-[#f3efe4]">
        <div className="relative h-56 w-full overflow-hidden sm:-mx-6 sm:-mt-8 sm:w-[calc(100%+3rem)]">
          {restaurant.banner_url ? (
            <img
              src={restaurant.banner_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: `${restaurant.banner_position_x ?? 50}% ${restaurant.banner_position_y ?? 50}%`,
                transform: `scale(${restaurant.banner_zoom ?? 1})`,
                transformOrigin: `${restaurant.banner_position_x ?? 50}% ${restaurant.banner_position_y ?? 50}%`,
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1f16]/10 to-[#1c1f16]/5" />
          )}
          <div className="absolute left-4 top-4">
            <button
              onClick={() => setShowCategories(true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#1c1f16]/25 bg-white/70 text-[#1c1f16] backdrop-blur-sm"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute right-4 top-4">
            <LangSwitch variant="light" />
          </div>
        </div>
        <div className="relative rounded-t-3xl bg-[#f3efe4] -mt-6 px-4 pb-3 pt-20 text-center">
          {restaurant.logo_url && (
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 flex h-36 w-36 items-center justify-center rounded-full border-4 border-[#f3efe4] bg-white p-5 shadow-md">
              <img src={restaurant.logo_url} alt={restaurant.name} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          )}
          <h1 className="mt-2 text-xl font-extrabold leading-tight text-[#1c1f16]">{restaurant.name}</h1>
          <p className="mt-1 text-xs uppercase tracking-wider text-[#1c1f16]/40">
            {t("client.table")} {tableNumber}
          </p>
        </div>

        <div className="mx-auto max-w-md px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("client.searchPlaceholder")}
              className="ps-9"
            />
          </div>
        </div>
      </header>

      {visibleCategories.length > 0 && (
        <div className={`scrollbar-none sticky top-0 z-30 flex gap-2 overflow-x-auto bg-[#f3efe4] px-4 py-3 mx-auto max-w-md ${searchQuery.trim() ? "opacity-40" : ""}`}>
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchQuery("");
                scrollToCategory(c.id);
              }}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeCategory === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <main className="mx-auto max-w-md px-4 py-4">
        {visibleCategories.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("client.empty")}</p>
        ) : searchResults ? (
          searchResults.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">{t("client.noResults")}</p>
          ) : (
            <div className="space-y-4">
              {searchResults.map((p) => (
                <ProductCard key={p.id} p={p} qty={cart[p.id] ?? 0} t={t} addToCart={addToCart} changeQty={changeQty} />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-6">
            {visibleCategories.map((c) => {
              const prods = productsByCategory[c.id] ?? [];
              if (prods.length === 0) return null;
              return (
                <div
                  key={c.id}
                  data-category-id={c.id}
                  ref={(el) => { sectionRefs.current[c.id] = el; }}
                  className="scroll-mt-32"
                >
                  <h2 className="mb-3 text-lg font-extrabold uppercase tracking-wide text-[#1c1f16]">{c.name}</h2>
                  <div className="space-y-4">
                    {prods.map((p) => (
                      <ProductCard key={p.id} p={p} qty={cart[p.id] ?? 0} t={t} addToCart={addToCart} changeQty={changeQty} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-xl">
          <button
            onClick={() => setCartOpen(true)}
            className="mx-auto flex max-w-md w-full items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-glow"
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <ShoppingCart className="h-4 w-4" />
              {cartCount} {cartCount > 1 ? t("client.items") : t("client.item")}
            </span>
            <span className="text-sm font-extrabold">{cartTotal.toFixed(2)} DT</span>
          </button>
        </div>
      )}

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("client.cartTitle")}</DialogTitle>
          </DialogHeader>

          {cartItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("client.cartEmpty")}</p>
          ) : (
            <div className="space-y-2">
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5">
                  <span className="text-xl">{product.emoji || "🍽️"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{Number(product.price).toFixed(2)} DT</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(product.id, -1)}
                      className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{qty}</span>
                    <button
                      onClick={() => changeQty(product.id, 1)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="w-16 shrink-0 text-end text-sm font-bold text-gold">
                    {(Number(product.price) * qty).toFixed(2)} DT
                  </span>
                </div>
              ))}

              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-muted-foreground">{t("client.notes")}</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("client.notesPlaceholder")}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-extrabold">
                <span>{t("client.total")}</span>
                <span className="text-gold">{cartTotal.toFixed(2)} DT</span>
              </div>
            </div>
          )}

          {cartItems.length > 0 && (
            <DialogFooter>
              <Button onClick={placeOrder} disabled={placing} className="w-full">
                {placing ? t("client.placing") : t("client.confirmOrder")}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}