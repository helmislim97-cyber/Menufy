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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const COUNTRY_CODES = [
  { code: "+93", flag: "🇦🇫", name: "Afghanistan" },
  { code: "+355", flag: "🇦🇱", name: "Albania" },
  { code: "+213", flag: "🇩🇿", name: "Algeria" },
  { code: "+376", flag: "🇦🇩", name: "Andorra" },
  { code: "+244", flag: "🇦🇴", name: "Angola" },
  { code: "+1", flag: "🇦🇬", name: "Antigua and Barbuda" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+374", flag: "🇦🇲", name: "Armenia" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "+994", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "+1", flag: "🇧🇸", name: "Bahamas" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+1", flag: "🇧🇧", name: "Barbados" },
  { code: "+375", flag: "🇧🇾", name: "Belarus" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+501", flag: "🇧🇿", name: "Belize" },
  { code: "+229", flag: "🇧🇯", name: "Benin" },
  { code: "+975", flag: "🇧🇹", name: "Bhutan" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+387", flag: "🇧🇦", name: "Bosnia and Herzegovina" },
  { code: "+267", flag: "🇧🇼", name: "Botswana" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+673", flag: "🇧🇳", name: "Brunei" },
  { code: "+359", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+226", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+257", flag: "🇧🇮", name: "Burundi" },
  { code: "+855", flag: "🇰🇭", name: "Cambodia" },
  { code: "+237", flag: "🇨🇲", name: "Cameroon" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+238", flag: "🇨🇻", name: "Cape Verde" },
  { code: "+236", flag: "🇨🇫", name: "Central African Republic" },
  { code: "+235", flag: "🇹🇩", name: "Chad" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+269", flag: "🇰🇲", name: "Comoros" },
  { code: "+242", flag: "🇨🇬", name: "Congo" },
  { code: "+243", flag: "🇨🇩", name: "DR Congo" },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+385", flag: "🇭🇷", name: "Croatia" },
  { code: "+53", flag: "🇨🇺", name: "Cuba" },
  { code: "+357", flag: "🇨🇾", name: "Cyprus" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "+253", flag: "🇩🇯", name: "Djibouti" },
  { code: "+1", flag: "🇩🇲", name: "Dominica" },
  { code: "+1", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "+240", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+291", flag: "🇪🇷", name: "Eritrea" },
  { code: "+372", flag: "🇪🇪", name: "Estonia" },
  { code: "+268", flag: "🇸🇿", name: "Eswatini" },
  { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+679", flag: "🇫🇯", name: "Fiji" },
  { code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+241", flag: "🇬🇦", name: "Gabon" },
  { code: "+220", flag: "🇬🇲", name: "Gambia" },
  { code: "+995", flag: "🇬🇪", name: "Georgia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "+1", flag: "🇬🇩", name: "Grenada" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+224", flag: "🇬🇳", name: "Guinea" },
  { code: "+245", flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "+592", flag: "🇬🇾", name: "Guyana" },
  { code: "+509", flag: "🇭🇹", name: "Haiti" },
  { code: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+36", flag: "🇭🇺", name: "Hungary" },
  { code: "+354", flag: "🇮🇸", name: "Iceland" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+98", flag: "🇮🇷", name: "Iran" },
  { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+1", flag: "🇯🇲", name: "Jamaica" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+7", flag: "🇰🇿", name: "Kazakhstan" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+686", flag: "🇰🇮", name: "Kiribati" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+996", flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "+856", flag: "🇱🇦", name: "Laos" },
  { code: "+371", flag: "🇱🇻", name: "Latvia" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "+266", flag: "🇱🇸", name: "Lesotho" },
  { code: "+231", flag: "🇱🇷", name: "Liberia" },
  { code: "+218", flag: "🇱🇾", name: "Libya" },
  { code: "+423", flag: "🇱🇮", name: "Liechtenstein" },
  { code: "+370", flag: "🇱🇹", name: "Lithuania" },
  { code: "+352", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+853", flag: "🇲🇴", name: "Macau" },
  { code: "+261", flag: "🇲🇬", name: "Madagascar" },
  { code: "+265", flag: "🇲🇼", name: "Malawi" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+960", flag: "🇲🇻", name: "Maldives" },
  { code: "+223", flag: "🇲🇱", name: "Mali" },
  { code: "+356", flag: "🇲🇹", name: "Malta" },
  { code: "+692", flag: "🇲🇭", name: "Marshall Islands" },
  { code: "+222", flag: "🇲🇷", name: "Mauritania" },
  { code: "+230", flag: "🇲🇺", name: "Mauritius" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+691", flag: "🇫🇲", name: "Micronesia" },
  { code: "+373", flag: "🇲🇩", name: "Moldova" },
  { code: "+377", flag: "🇲🇨", name: "Monaco" },
  { code: "+976", flag: "🇲🇳", name: "Mongolia" },
  { code: "+382", flag: "🇲🇪", name: "Montenegro" },
  { code: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "+258", flag: "🇲🇿", name: "Mozambique" },
  { code: "+95", flag: "🇲🇲", name: "Myanmar" },
  { code: "+264", flag: "🇳🇦", name: "Namibia" },
  { code: "+674", flag: "🇳🇷", name: "Nauru" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+227", flag: "🇳🇪", name: "Niger" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+389", flag: "🇲🇰", name: "North Macedonia" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+680", flag: "🇵🇼", name: "Palau" },
  { code: "+970", flag: "🇵🇸", name: "Palestine" },
  { code: "+507", flag: "🇵🇦", name: "Panama" },
  { code: "+675", flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+51", flag: "🇵🇪", name: "Peru" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+40", flag: "🇷🇴", name: "Romania" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+1", flag: "🇰🇳", name: "Saint Kitts and Nevis" },
  { code: "+1", flag: "🇱🇨", name: "Saint Lucia" },
  { code: "+1", flag: "🇻🇨", name: "Saint Vincent and the Grenadines" },
  { code: "+685", flag: "🇼🇸", name: "Samoa" },
  { code: "+378", flag: "🇸🇲", name: "San Marino" },
  { code: "+239", flag: "🇸🇹", name: "Sao Tome and Principe" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+221", flag: "🇸🇳", name: "Senegal" },
  { code: "+381", flag: "🇷🇸", name: "Serbia" },
  { code: "+248", flag: "🇸🇨", name: "Seychelles" },
  { code: "+232", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+421", flag: "🇸🇰", name: "Slovakia" },
  { code: "+386", flag: "🇸🇮", name: "Slovenia" },
  { code: "+677", flag: "🇸🇧", name: "Solomon Islands" },
  { code: "+252", flag: "🇸🇴", name: "Somalia" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+211", flag: "🇸🇸", name: "South Sudan" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+249", flag: "🇸🇩", name: "Sudan" },
  { code: "+597", flag: "🇸🇷", name: "Suriname" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+963", flag: "🇸🇾", name: "Syria" },
  { code: "+886", flag: "🇹🇼", name: "Taiwan" },
  { code: "+992", flag: "🇹🇯", name: "Tajikistan" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+670", flag: "🇹🇱", name: "Timor-Leste" },
  { code: "+228", flag: "🇹🇬", name: "Togo" },
  { code: "+676", flag: "🇹🇴", name: "Tonga" },
  { code: "+1", flag: "🇹🇹", name: "Trinidad and Tobago" },
  { code: "+216", flag: "🇹🇳", name: "Tunisia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+993", flag: "🇹🇲", name: "Turkmenistan" },
  { code: "+688", flag: "🇹🇻", name: "Tuvalu" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+998", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "+678", flag: "🇻🇺", name: "Vanuatu" },
  { code: "+39", flag: "🇻🇦", name: "Vatican City" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+967", flag: "🇾🇪", name: "Yemen" },
  { code: "+260", flag: "🇿🇲", name: "Zambia" },
  { code: "+263", flag: "🇿🇼", name: "Zimbabwe" },
];

function ProductCard({
  p,
  qty,
  t,
  addToCart,
  changeQty,
  onOpen,
}: {
  p: Product;
  qty: number;
  t: (key: string) => string;
  addToCart: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  onOpen: (p: Product) => void;
}) {
  const soldOut = !p.is_available;
  return (
    <div
      onClick={() => onOpen(p)}
      className={`relative h-32 rounded-2xl bg-white shadow-[0_8px_24px_-8px_rgba(28,31,22,0.25)] cursor-pointer sm:h-auto ${soldOut ? "opacity-60" : ""}`}
    >
      {soldOut ? (
        <span className="absolute top-3 right-0 rounded-l-full bg-[#1c1f16]/70 px-3 py-1 text-xs font-bold uppercase text-white shadow-sm">
          {t("client.soldOut")}
        </span>
      ) : (
        p.badge && (
          <span className="absolute top-3 right-0 rounded-l-full bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground shadow-sm">
            {p.badge}
          </span>
        )
      )}
      <div className="flex items-center gap-3 p-3">
        <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-background text-3xl">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            p.emoji || "🍽️"
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-base font-extrabold leading-tight text-[#1c1f16]">{p.name}</p>
          {p.description && (
            <p className="mt-1 text-xs leading-snug text-muted-foreground line-clamp-2">{p.description}</p>
          )}
          <div className="mt-auto flex flex-col gap-1 pt-2">
            <p className="text-base font-extrabold text-[#1c1f16]">{Number(p.price).toFixed(2)} DT</p>
            {(p.kcal || p.prep_minutes) && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
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
      {!soldOut && (
        qty === 0 ? (
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(p); }}
            className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-tl-xl bg-primary text-primary-foreground shadow-md z-10"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <div className="absolute bottom-0 right-0 flex items-center gap-1.5 rounded-tl-xl bg-white px-1.5 py-1 shadow-md z-10">
            <button onClick={(e) => { e.stopPropagation(); changeQty(p.id, -1); }} className="grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-foreground">
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-4 text-center text-sm font-bold text-[#1c1f16]">{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); changeQty(p.id, 1); }} className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )
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
  const [cart, setCart] = useState<Record<string, { qty: number; note: string }>>({});
  const [detailNote, setDetailNote] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [notes, setNotes] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCountryCode, setCustomerCountryCode] = useState("+216");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showInfoError, setShowInfoError] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ total: number } | null>(null);

  useEffect(() => {
    const storageKey = `menufy_session_${restaurantId}_${tableNumber}`;
    const SESSION_DURATION_MS = 3 * 60 * 1000; // TEMP: 3 min for testing
    const stored = localStorage.getItem(storageKey);
    const now = Date.now();

    if (!stored) {
      localStorage.setItem(storageKey, String(now));
    } else {
      const startedAt = parseInt(stored, 10);
      if (!isNaN(startedAt) && now - startedAt > SESSION_DURATION_MS) {
        setSessionExpired(true);
        localStorage.removeItem(storageKey);
      }
    }
  }, [restaurantId, tableNumber]);

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
  const pendingScrollCategory = useRef<string | null>(null);
  const categoriesScrollPos = useRef(0);
  const productsScrollPos = useRef(0);

  useEffect(() => {
    if (searchQuery.trim()) return;

    const onScroll = () => {
      if (isScrollingToSection.current) return;
      const threshold = 140;
      let current: string | null = null;
      for (const c of visibleCategories) {
        const el = sectionRefs.current[c.id];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          current = c.id;
        } else {
          break;
        }
      }
      if (current && current !== activeCategory) {
        setActiveCategory(current);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [visibleCategories, searchQuery, activeCategory]);

  useEffect(() => {
    if (detailProduct) {
      setDetailNote(cart[detailProduct.id]?.note ?? "");
    }
  }, [detailProduct, cart]);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      // Save current scroll position of the view we're leaving
      if (!showCover && !showCategories) {
        productsScrollPos.current = window.scrollY;
      } else if (!showCover && showCategories) {
        categoriesScrollPos.current = window.scrollY;
      }

      const view = e.state?.view ?? "cover";
      if (view === "cover") {
        setCoverLeaving(false);
        setShowCover(true);
        setShowCategories(true);
      } else if (view === "categories") {
        setShowCover(false);
        setShowCategories(true);
        isScrollingToSection.current = true;
        requestAnimationFrame(() => {
          window.scrollTo(0, categoriesScrollPos.current);
          setTimeout(() => { isScrollingToSection.current = false; }, 300);
        });
      } else if (view === "products") {
        setShowCover(false);
        setShowCategories(false);
        isScrollingToSection.current = true;
        requestAnimationFrame(() => {
          window.scrollTo(0, productsScrollPos.current);
          setTimeout(() => { isScrollingToSection.current = false; }, 300);
        });
      }
    };
    window.addEventListener("popstate", onPopState);
    if (!window.history.state?.view) {
      window.history.replaceState({ view: "cover" }, "");
    }
    return () => window.removeEventListener("popstate", onPopState);
  }, [showCover, showCategories]);

  useEffect(() => {
    if (showCategories) return;
    const targetId = pendingScrollCategory.current;
    if (!targetId || targetId === UNCATEGORIZED) {
      pendingScrollCategory.current = null;
      return;
    }
    isScrollingToSection.current = true;

    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const tryScroll = () => {
      const el = sectionRefs.current[targetId];
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        setActiveCategory(targetId);
        pendingScrollCategory.current = null;
        setTimeout(() => {
          isScrollingToSection.current = false;
        }, 400);
      } else if (attempts < 20) {
        attempts++;
        timeoutId = setTimeout(tryScroll, 50);
      } else {
        pendingScrollCategory.current = null;
        isScrollingToSection.current = false;
      }
    };
    timeoutId = setTimeout(tryScroll, 50);
    return () => clearTimeout(timeoutId);
  }, [showCategories, productsByCategory]);

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
      .map(([productId, entry]) => {
        const product = products.find((p) => p.id === productId);
        if (!product || entry.qty <= 0) return null;
        return { product, qty: entry.qty, note: entry.note };
      })
      .filter((x): x is { product: Product; qty: number; note: string } => x !== null);
  }, [cart, products]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * Number(i.product.price), 0);

  const addToCart = (productId: string, note?: string) => {
    setCart((c) => ({
      ...c,
      [productId]: { qty: (c[productId]?.qty ?? 0) + 1, note: note ?? c[productId]?.note ?? "" },
    }));
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((c) => {
      const next = { ...c };
      const current = next[productId]?.qty ?? 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        delete next[productId];
      } else {
        next[productId] = { qty: updated, note: next[productId]?.note ?? "" };
      }
      return next;
    });
  };

  const setItemNote = (productId: string, note: string) => {
    setCart((c) => {
      if (!c[productId]) return c;
      return { ...c, [productId]: { ...c[productId], note } };
    });
  };

  const placeOrder = async () => {
    if (!restaurant || cartItems.length === 0) return;
    if (!customerFirstName.trim() || !customerLastName.trim() || !customerPhone.trim()) {
      setShowInfoError(true);
      return;
    }
    setShowInfoError(false);
    setPlacing(true);

    const { data: order, error: orderError } = await supabase
    .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        table_number: parseInt(tableNumber, 10) || null,
        status: "pending",
        total: cartTotal,
        notes: notes.trim() || null,
        customer_name: `${customerFirstName.trim()} ${customerLastName.trim()}`,
        customer_phone: `${customerCountryCode} ${customerPhone.trim()}`,
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
      product_name: i.product.name + (i.note.trim() ? ` (${i.note.trim()})` : ""),
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
    setCustomerFirstName("");
    setCustomerLastName("");
    setCustomerPhone("");
    setShowInfoError(false);
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
          window.history.pushState({ view: "categories" }, "");
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
          categoriesScrollPos.current = window.scrollY;
          pendingScrollCategory.current = id;
          window.history.pushState({ view: "products" }, "");
          setShowCategories(false);
        }}
        onBack={() => { setCoverLeaving(false); setShowCover(true); }}
      />
    );
  }

  if (placedOrder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3efe4] px-6 text-center text-[#1c1f16]">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">{t("client.success.title")}</h1>
        <p className="mt-2 max-w-xs text-sm text-[#1c1f16]/60">{t("client.success.subtitle")}</p>
        <div className="mt-6 w-full max-w-xs rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#1c1f16]/60">{t("client.success.table")}</span>
            <span className="font-bold">{tableNumber}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-[#1c1f16]/60">{t("client.total")}</span>
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
      <div className="mx-auto max-w-5xl sm:px-6 sm:py-8">
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
              onClick={() => { productsScrollPos.current = window.scrollY; window.history.back(); }}
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
              className="ps-9 bg-white text-[#1c1f16] placeholder:text-[#1c1f16]/40"
            />
          </div>
        </div>
      </header>

      {visibleCategories.length > 0 && (
        <div className={`scrollbar-none sticky top-0 z-30 flex gap-2 overflow-x-auto bg-[#f3efe4] px-4 py-3 mx-auto max-w-md sm:max-w-none ${searchQuery.trim() ? "opacity-40" : ""}`}>
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
                  : "border-[#1c1f16]/15 bg-white text-[#1c1f16]/70"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <main className="mx-auto max-w-md px-2 py-4 pb-[60vh] sm:px-4 sm:max-w-none">
        {visibleCategories.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("client.empty")}</p>
        ) : searchResults ? (
          searchResults.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">{t("client.noResults")}</p>
          ) : (
            <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
              {searchResults.map((p) => (
                <ProductCard key={p.id} p={p} qty={cart[p.id]?.qty ?? 0} t={t} addToCart={addToCart} changeQty={changeQty} onOpen={setDetailProduct} />
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
                  <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                    {prods.map((p) => (
                      <ProductCard key={p.id} p={p} qty={cart[p.id]?.qty ?? 0} t={t} addToCart={addToCart} changeQty={changeQty} onOpen={setDetailProduct} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-md px-4 py-6 text-center text-xs text-[#1c1f16]/40">
        <p>
          {t("client.poweredBy")}{" "}
          <a href="https://menufy-tau.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-[#1c1f16]/60 hover:text-[#1c1f16]">
            Menufy
          </a>
        </p>
        <p className="mt-0.5">© {new Date().getFullYear()} Menufy. {t("client.allRightsReserved")}</p>
      </footer>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1c1f16]/10 bg-[#f3efe4]/95 p-4 backdrop-blur-xl">
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

      <Dialog open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-[#f3efe4] text-[#1c1f16]">
          {detailProduct && (
            <div className="flex flex-col items-center text-center">
              <div className="grid h-56 w-56 place-items-center overflow-hidden rounded-2xl bg-background text-6xl">
                {detailProduct.image_url ? (
                  <img src={detailProduct.image_url} alt={detailProduct.name} className="h-full w-full object-cover" />
                ) : (
                  detailProduct.emoji || "🍽️"
                )}
              </div>
              <p className="mt-4 text-lg text-muted-foreground">{detailProduct.name}</p>
              {detailProduct.description && (
                <p className="mt-1 text-sm text-muted-foreground">{detailProduct.description}</p>
              )}
              <p className="mt-2 text-3xl font-extrabold text-[#1c1f16]">
                {Number(detailProduct.price).toFixed(2)} <span className="text-base font-semibold">DT</span>
              </p>

              {!detailProduct.is_available ? (
                <span className="mt-4 rounded-full bg-[#1c1f16]/70 px-4 py-1.5 text-sm font-bold uppercase text-white">
                  {t("client.soldOut")}
                </span>
              ) : (
                <>
                  <div className="mt-4 flex items-center gap-6 rounded-full bg-[#ebe7dc] px-6 py-2.5">
                    <button
                      onClick={() => changeQty(detailProduct.id, -1)}
                      className="grid h-7 w-7 place-items-center text-[#1c1f16]"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-6 text-center text-lg font-bold text-[#1c1f16]">{cart[detailProduct.id]?.qty ?? 0}</span>
                    <button
                      onClick={() => changeQty(detailProduct.id, 1)}
                      className="grid h-7 w-7 place-items-center text-[#1c1f16]"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 w-full space-y-1.5 text-left">
                    <label className="text-xs font-medium text-[#1c1f16]/60">{t("client.itemNote")}</label>
                    <Textarea
                      value={detailNote}
                      onChange={(e) => setDetailNote(e.target.value)}
                      placeholder={t("client.itemNotePlaceholder")}
                      rows={2}
                      className="bg-white"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      addToCart(detailProduct.id, detailNote);
                      setItemNote(detailProduct.id, detailNote);
                      setDetailProduct(null);
                    }}
                    className="mt-4 w-full gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t("client.addToCart")}
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-[#f3efe4] text-[#1c1f16]">
          <DialogHeader>
            <DialogTitle className="text-[#1c1f16]">{t("client.cartTitle")}</DialogTitle>
          </DialogHeader>

          {cartItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#1c1f16]/60">{t("client.cartEmpty")}</p>
          ) : (
            <div className="space-y-2">
              {cartItems.map(({ product, qty, note }) => (
                <div key={product.id} className="flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm">
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-background text-xl">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      product.emoji || "🍽️"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1c1f16]">{product.name}</p>
                    <p className="text-xs text-[#1c1f16]/50">{Number(product.price).toFixed(2)} DT</p>
                    {note.trim() && <p className="text-xs italic text-[#1c1f16]/50">{note.trim()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(product.id, -1)}
                      className="grid h-7 w-7 place-items-center rounded-full border border-[#1c1f16]/15 bg-white text-[#1c1f16]"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-sm font-bold text-[#1c1f16]">{qty}</span>
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

              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm font-bold shadow-sm">
                <span className="text-[#1c1f16]/60">{t("client.success.table")}</span>
                <span className="text-[#1c1f16]">{tableNumber}</span>
              </div>

              <div className="flex items-center justify-between border-t border-[#1c1f16]/10 pt-3 text-base font-extrabold text-[#1c1f16]">
                <span>{t("client.total")}</span>
                <span className="text-gold">{cartTotal.toFixed(2)} DT</span>
              </div>

              <div className="space-y-2 border-t border-[#1c1f16]/10 pt-3">
                <p className="text-sm font-bold text-[#1c1f16]">{t("client.yourInfo")} <span className="text-destructive">*</span></p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={customerFirstName}
                    onChange={(e) => setCustomerFirstName(e.target.value)}
                    placeholder={`${t("client.firstNamePlaceholder")} *`}
                  />
                  <Input
                    value={customerLastName}
                    onChange={(e) => setCustomerLastName(e.target.value)}
                    placeholder={`${t("client.lastNamePlaceholder")} *`}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={customerCountryCode} onValueChange={setCustomerCountryCode}>
                    <SelectTrigger className="w-24 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={`${t("client.phonePlaceholder")} *`}
                    className="flex-1"
                  />
                </div>
                {showInfoError && (
                  <p className="text-xs font-medium text-destructive">{t("client.missingInfoError")}</p>
                )}
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

      <Dialog open={sessionExpired} onOpenChange={() => {}}>
        <DialogContent className="bg-[#f3efe4] text-[#1c1f16] [&>button]:hidden">
          <div className="flex flex-col items-center px-2 py-4 text-center">
            <h2 className="text-lg font-extrabold">{t("client.sessionExpired.title")}</h2>
            <p className="mt-2 text-sm text-[#1c1f16]/70">{t("client.sessionExpired.subtitle")}</p>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}