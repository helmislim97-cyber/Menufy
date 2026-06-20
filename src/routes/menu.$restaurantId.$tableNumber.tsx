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
import { ShoppingCart, Plus, Minus, CheckCircle2, Search, ArrowLeft, MapPin, Flame, Clock, ChefHat, BellRing, ClipboardList, Wallet, XCircle, Star, Facebook, Instagram, ChevronDown } from "lucide-react";

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
  google_review_url: string | null;
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

interface Supplement {
  id: string;
  product_id: string;
  name: string;
  price: number;
  position: number;
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
            className="absolute bottom-0 end-0 grid h-8 w-8 place-items-center rounded-ss-xl bg-primary text-primary-foreground shadow-md z-10"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <div className="absolute bottom-0 end-0 flex items-center gap-1.5 rounded-ss-xl bg-white px-1.5 py-1 shadow-md z-10">
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
  const [cart, setCart] = useState<Record<string, { productId: string; qty: number; note: string; supplementIds: string[]; priceOverride?: number }>>({});
  const [productSupplements, setProductSupplements] = useState<Record<string, Supplement[]>>({});

  const makeCartKey = (productId: string, supplementIds: string[]) =>
    `${productId}::${[...supplementIds].sort().join(",")}`;
  const [detailNote, setDetailNote] = useState("");
  const [detailSupplements, setDetailSupplements] = useState<Supplement[]>([]);
  const [selectedSupplementIds, setSelectedSupplementIds] = useState<string[]>([]);
  const [detailQty, setDetailQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [notes, setNotes] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCountryCode, setCustomerCountryCode] = useState("+216");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showInfoError, setShowInfoError] = useState(false);
  const [infoErrorType, setInfoErrorType] = useState<"empty" | "invalid">("empty");
  const [invalidFields, setInvalidFields] = useState<{ firstName: boolean; lastName: boolean; phone: boolean }>({ firstName: false, lastName: false, phone: false });
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number } | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [orderDetailsItems, setOrderDetailsItems] = useState<{ product_name: string; product_price: number; quantity: number; notes: string | null }[]>([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [upsellItems, setUpsellItems] = useState<{ product_id: string; special_price: number | null }[]>([]);
  const [sessionOrders, setSessionOrders] = useState<{ id: string; total: number; status: string; created_at: string; customerName: string; items: { product_name: string; product_price: number; quantity: number }[] }[]>([]);
  const [expandedHistoryOrderId, setExpandedHistoryOrderId] = useState<string | null>(null);
  const [ordersHistoryOpen, setOrdersHistoryOpen] = useState(false);
  const [assistanceOpen, setAssistanceOpen] = useState(false);
  const [assistanceName, setAssistanceName] = useState("");
  const [assistanceMessage, setAssistanceMessage] = useState("");
  const [assistanceSending, setAssistanceSending] = useState(false);
  const [assistanceSent, setAssistanceSent] = useState(false);

  useEffect(() => {
    const storageKey = `menufy_session_${restaurantId}_${tableNumber}`;
    const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
    const params = new URLSearchParams(window.location.search);
    const isFreshScan = params.get("qr") === "1";

    if (isFreshScan) {
      localStorage.setItem(storageKey, String(Date.now()));
      setSessionExpired(false);
      params.delete("qr");
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }

    const checkSession = () => {
      const stored = localStorage.getItem(storageKey);
      const now = Date.now();

      if (!stored) {
        localStorage.setItem(storageKey, String(now));
      } else {
        const startedAt = parseInt(stored, 10);
        if (!isNaN(startedAt) && now - startedAt > SESSION_DURATION_MS) {
          setSessionExpired(true);
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 10000);
    return () => clearInterval(interval);
  }, [restaurantId, tableNumber]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: rest } = await supabase
        .from("restaurants")
        .select("id, name, logo_url, facebook_url, instagram_url, google_review_url, address, phone, description, wifi, banner_url, banner_position_x, banner_position_y, banner_zoom")
        .eq("id", restaurantId)
        .eq("is_active", true)
        .maybeSingle();

      if (cancelled) return;
      setRestaurant(rest ?? null);
      if (!rest) {
        setLoading(false);
        return;
      }

      const [{ data: cats }, { data: prods }, { data: upsells }] = await Promise.all([
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
        supabase
          .from("upsell_items")
          .select("product_id, special_price")
          .eq("restaurant_id", restaurantId)
          .order("position"),
      ]);

      if (cancelled) return;
      const catList = cats ?? [];
      const prodList = prods ?? [];
      setCategories(catList);
      setProducts(prodList);
      setUpsellItems(upsells ?? []);

      const firstWithProducts = catList.find((c) => prodList.some((p) => p.category_id === c.id));
      if (firstWithProducts) {
        setActiveCategory(firstWithProducts.id);
      } else if (prodList.some((p) => p.category_id === null)) {
        setActiveCategory(UNCATEGORIZED);
      }

      if (prodList.length > 0) {
        const { data: supps } = await supabase
          .from("product_supplements")
          .select("id, product_id, name, price, position")
          .in("product_id", prodList.map((p) => p.id))
          .order("position");
        const grouped: Record<string, Supplement[]> = {};
        for (const s of supps ?? []) {
          if (!grouped[s.product_id]) grouped[s.product_id] = [];
          grouped[s.product_id].push(s);
        }
        setProductSupplements(grouped);
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
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isScrollingToSection = useRef(false);
  const pendingScrollCategory = useRef<string | null>(null);
  const categoriesScrollPos = useRef(0);
  const productsScrollPos = useRef(0);

  useEffect(() => {
    const el = tabRefs.current[activeCategory];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategory]);

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
      const cartKey = makeCartKey(detailProduct.id, []);
      setDetailNote(cart[cartKey]?.note ?? "");
      setSelectedSupplementIds([]);
      setDetailQty(1);
      setDetailSupplements(productSupplements[detailProduct.id] ?? []);
    } else {
      setDetailSupplements([]);
      setSelectedSupplementIds([]);
      setDetailQty(1);
    }
  }, [detailProduct, productSupplements]);

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
      .map(([cartKey, entry]) => {
        const product = products.find((p) => p.id === entry.productId);
        if (!product || entry.qty <= 0) return null;
        const allSupp = productSupplements[entry.productId] ?? [];
        const chosenSupplements = allSupp.filter((s) => entry.supplementIds.includes(s.id));
        const unitPrice = entry.priceOverride != null ? Number(entry.priceOverride) : Number(product.price) + chosenSupplements.reduce((sum, s) => sum + Number(s.price), 0);
        return { cartKey, product, qty: entry.qty, note: entry.note, supplements: chosenSupplements, unitPrice };
      })
      .filter((x): x is { cartKey: string; product: Product; qty: number; note: string; supplements: Supplement[]; unitPrice: number } => x !== null);
  }, [cart, products, productSupplements]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);

  const cartProductIds = new Set(cartItems.map((i) => i.product.id));
  const suggestedItems = upsellItems
    .map((u) => {
      const product = products.find((p) => p.id === u.product_id);
      if (!product || cartProductIds.has(product.id)) return null;
      return { product, specialPrice: u.special_price };
    })
    .filter((x): x is { product: Product; specialPrice: number | null } => x !== null);

  const addToCart = (productId: string, note?: string, supplementIds: string[] = [], qtyToAdd: number = 1, priceOverride?: number) => {
    const cartKey = makeCartKey(productId, supplementIds);
    setCart((c) => ({
      ...c,
      [cartKey]: {
        productId,
        qty: (c[cartKey]?.qty ?? 0) + qtyToAdd,
        note: note ?? c[cartKey]?.note ?? "",
        supplementIds,
        priceOverride: priceOverride ?? c[cartKey]?.priceOverride,
      },
    }));
  };

  const changeQtyByKey = (cartKey: string, delta: number) => {
    setCart((c) => {
      const next = { ...c };
      const entry = next[cartKey];
      if (!entry) return c;
      const updated = Math.max(0, entry.qty + delta);
      if (updated === 0) {
        delete next[cartKey];
      } else {
        next[cartKey] = { ...entry, qty: updated };
      }
      return next;
    });
  };

  const changeQty = (productId: string, delta: number) => {
    const cartKey = makeCartKey(productId, []);
    if (delta > 0 && !cart[cartKey]) {
      addToCart(productId);
      return;
    }
    changeQtyByKey(cartKey, delta);
  };

  const setItemNote = (productId: string, note: string, supplementIds: string[] = []) => {
    const cartKey = makeCartKey(productId, supplementIds);
    setCart((c) => {
      if (!c[cartKey]) return c;
      return { ...c, [cartKey]: { ...c[cartKey], note } };
    });
  };

  const placeOrder = async () => {
    if (!restaurant || cartItems.length === 0) return;
    const fnEmpty = customerFirstName.trim().length === 0;
    const lnEmpty = customerLastName.trim().length === 0;
    const phEmpty = customerPhone.trim().length === 0;
    const fnInvalid = !fnEmpty && customerFirstName.trim().length < 2;
    const lnInvalid = !lnEmpty && customerLastName.trim().length < 2;
    const phInvalid = !phEmpty && customerPhone.trim().length < 8;

    if (fnEmpty || lnEmpty || phEmpty || fnInvalid || lnInvalid || phInvalid) {
      setInvalidFields({ firstName: fnEmpty || fnInvalid, lastName: lnEmpty || lnInvalid, phone: phEmpty || phInvalid });
      setInfoErrorType(fnEmpty && lnEmpty && phEmpty ? "empty" : (fnInvalid || lnInvalid || phInvalid) ? "invalid" : "empty");
      setShowInfoError(true);
      return;
    }
    setInvalidFields({ firstName: false, lastName: false, phone: false });
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

    const items = cartItems.map((i) => {
      const suppText = i.supplements.length > 0 ? ` + ${i.supplements.map((s) => s.name).join(", ")}` : "";
      const noteText = i.note.trim() ? ` (${i.note.trim()})` : "";
      return {
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name + suppText + noteText,
        product_price: i.unitPrice,
        quantity: i.qty,
      };
    });

    await supabase.from("order_items").insert(items);

    setPlacing(false);
    setOrderStatus("pending");
    setPlacedOrder({ id: order.id, total: cartTotal });
    setSessionOrders((prev) => [
      ...prev,
      {
        id: order.id,
        total: cartTotal,
        status: "pending",
        created_at: new Date().toISOString(),
        customerName: `${customerFirstName.trim()} ${customerLastName.trim()}`,
        items: items.map((i) => ({ product_name: i.product_name, product_price: i.product_price, quantity: i.quantity })),
      },
    ]);
    setCartOpen(false);
    setCart({});
    setNotes("");
  };

  useEffect(() => {
    if (!placedOrder) return;

    const channel = supabase
      .channel(`order-status-${placedOrder.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${placedOrder.id}` },
        (payload) => {
          const newStatus = (payload.new as { status?: string }).status;
          if (newStatus) setOrderStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [placedOrder]);

  useEffect(() => {
    if (sessionOrders.length === 0) return;

    const channel = supabase
      .channel(`session-orders-${tableNumber}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as { id?: string; status?: string };
          if (!updated.id || !updated.status) return;
          setSessionOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status! } : o))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionOrders.length, tableNumber]);

  const openOrderDetails = async () => {
    if (!placedOrder) return;
    setOrderDetailsOpen(true);
    setOrderDetailsLoading(true);
    const { data } = await supabase
      .from("order_items")
      .select("product_name, product_price, quantity, notes")
      .eq("order_id", placedOrder.id);
    setOrderDetailsItems(data ?? []);
    setOrderDetailsLoading(false);
  };

  const submitReview = async (rating: number) => {
    setReviewRating(rating);
    setReviewSubmitted(true);
    if (rating >= 4 && restaurant?.google_review_url) {
      window.open(restaurant.google_review_url, "_blank");
    }
    await supabase.from("reviews").insert({
      restaurant_id: restaurant?.id,
      order_id: placedOrder?.id ?? null,
      table_number: parseInt(tableNumber, 10) || null,
      rating,
    });
  };

  const sendAssistanceRequest = async () => {
    if (!restaurant || !assistanceName.trim()) return;
    setAssistanceSending(true);
    await supabase.from("assistance_requests").insert({
      restaurant_id: restaurant.id,
      table_number: parseInt(tableNumber, 10) || null,
      customer_name: assistanceName.trim(),
      message: assistanceMessage.trim() || null,
    });
    setAssistanceSending(false);
    setAssistanceSent(true);
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
    const steps = [
      { key: "pending", label: t("client.tracker.received"), icon: ClipboardList },
      { key: "preparing", label: t("client.tracker.preparing"), icon: ChefHat },
      { key: "ready", label: t("client.tracker.ready"), icon: BellRing },
    ];
    const stepIndex = steps.findIndex((s) => s.key === orderStatus);
    const isCancelled = orderStatus === "cancelled";
    const isPaid = orderStatus === "paid";

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3efe4] px-6 text-center text-[#1c1f16]">
        <div
          className={`grid h-16 w-16 place-items-center rounded-full ${
            isCancelled ? "bg-destructive/15 text-destructive" : isPaid ? "bg-gold/15 text-gold" : "bg-primary/15 text-primary"
          }`}
        >
          {isCancelled ? <XCircle className="h-9 w-9" /> : isPaid ? <Wallet className="h-9 w-9" /> : <CheckCircle2 className="h-9 w-9" />}
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">
          {isCancelled ? t("client.tracker.cancelledTitle") : isPaid ? t("client.tracker.paidTitle") : t("client.success.title")}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-[#1c1f16]/60">
          {isCancelled ? t("client.tracker.cancelledSubtitle") : isPaid ? t("client.tracker.paidSubtitle") : t("client.success.subtitle")}
        </p>

        {!isCancelled && !isPaid && (
          <div className="mt-8 grid w-full max-w-sm grid-cols-3 gap-2">
            {steps.map((s, i) => (
              <div key={s.key} className="relative flex flex-col items-center">
                {i > 0 && (
                  <div className="absolute end-1/2 top-6 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-[#1c1f16]/15">
                    <div
                      className={`absolute inset-y-0 start-0 rounded-full bg-primary transition-all duration-500 ${
                        i - 1 < stepIndex ? "w-full" : i - 1 === stepIndex ? "w-full animate-track-pulse" : "w-0"
                      }`}
                    />
                  </div>
                )}
                <div
                  className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full transition-colors ${
                    i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-white text-[#1c1f16]/30"
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-2 text-center text-xs font-bold leading-tight ${
                    i <= stepIndex ? "text-[#1c1f16]" : "text-[#1c1f16]/40"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

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



        <div className="mt-6 w-full max-w-xs rounded-2xl bg-white p-4 shadow-sm">
          {reviewSubmitted ? (
            <p className="text-sm font-semibold text-[#1c1f16]">{t("client.review.thanks")}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#1c1f16]">{t("client.review.prompt")}</p>
              <div dir="ltr" className="mt-3 flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => submitReview(n)}
                    className="grid h-9 w-9 place-items-center text-[#d4a843]"
                  >
                    <Star className={`h-7 w-7 ${reviewRating && n <= reviewRating ? "fill-[#d4a843]" : ""}`} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {(restaurant?.facebook_url || restaurant?.instagram_url) && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-[#1c1f16]/50">{t("client.followUs")}</span>
            <div className="flex items-center gap-3">
              {restaurant.facebook_url && (
                <a
                  href={restaurant.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#1c1f16] shadow-sm"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {restaurant.instagram_url && (
                <a
                  href={restaurant.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#1c1f16] shadow-sm"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        )}

        <Button onClick={startNewOrder} className="mt-8 w-full max-w-xs">
          {t("client.success.newOrder")}
        </Button>
        <button onClick={openOrderDetails} className="mt-3 text-sm font-semibold text-[#1c1f16]/60 underline">
          {t("client.viewOrderDetails")}
        </button>

        <p className="mt-10 text-xs text-[#1c1f16]/40">
          {t("client.poweredBy")}{" "}
          <a href="https://menufy-tau.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-[#1c1f16]/60 hover:text-[#1c1f16]">
            Menufy
          </a>
        </p>
        <p className="mt-0.5 text-xs text-[#1c1f16]/40">© {new Date().getFullYear()} Menufy. {t("client.allRightsReserved")}</p>

        <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto bg-[#f3efe4] text-[#1c1f16]">
            <DialogHeader>
              <DialogTitle className="text-[#1c1f16]">{t("client.orderDetailsTitle")}</DialogTitle>
            </DialogHeader>
            {orderDetailsLoading ? (
              <p className="py-4 text-center text-sm text-[#1c1f16]/60">{t("menu.loading")}</p>
            ) : (
              <div className="space-y-2">
                {orderDetailsItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1c1f16]">{item.quantity}× {item.product_name}</p>
                      {item.notes && <p className="text-xs italic text-[#1c1f16]/50">{item.notes}</p>}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-gold">
                      {(Number(item.product_price) * item.quantity).toFixed(2)} DT
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[#1c1f16]/10 pt-3 text-base font-extrabold text-[#1c1f16]">
                  <span>{t("client.total")}</span>
                  <span className="text-gold">{placedOrder.total.toFixed(2)} DT</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
              ref={(el) => { tabRefs.current[c.id] = el; }}
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
                <ProductCard key={p.id} p={p} qty={cart[makeCartKey(p.id, [])]?.qty ?? 0} t={t} addToCart={addToCart} changeQty={changeQty} onOpen={setDetailProduct} />
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
                      <ProductCard key={p.id} p={p} qty={cart[makeCartKey(p.id, [])]?.qty ?? 0} t={t} addToCart={addToCart} changeQty={changeQty} onOpen={setDetailProduct} />
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1c1f16]/10 bg-[#f3efe4]/95 p-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            onClick={() => setOrdersHistoryOpen(true)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#1c1f16] shadow-sm"
            aria-label={t("client.viewOrderDetails")}
          >
            <ClipboardList className="h-5 w-5" />
          </button>

          {cartCount > 0 ? (
            <button
              onClick={() => setCartOpen(true)}
              className="flex flex-1 items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-glow"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <ShoppingCart className="h-4 w-4" />
                {cartCount} {cartCount > 1 ? t("client.items") : t("client.item")}
              </span>
              <span className="text-sm font-extrabold">{cartTotal.toFixed(2)} DT</span>
            </button>
          ) : (
            <div className="flex flex-1 justify-center">
              <button
                onClick={() => setCartOpen(true)}
                className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"
                aria-label={t("client.cartTitle")}
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setAssistanceOpen(true)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#1c1f16] shadow-sm"
            aria-label={t("client.assistance.button")}
          >
            <BellRing className="h-5 w-5" />
          </button>
        </div>
      </div>

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
                {(Number(detailProduct.price) + detailSupplements.filter((s) => selectedSupplementIds.includes(s.id)).reduce((sum, s) => sum + Number(s.price), 0)).toFixed(2)} <span className="text-base font-semibold">DT</span>
              </p>

              {detailSupplements.length > 0 && (
                <div className="mt-4 w-full space-y-1.5 text-left">
                  <label className="text-xs font-medium text-[#1c1f16]/60">{t("client.supplements")}</label>
                  {detailSupplements.map((s) => {
                    const checked = selectedSupplementIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setSelectedSupplementIds((prev) =>
                            checked ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                          checked ? "border-primary bg-primary/10" : "border-[#1c1f16]/15 bg-white"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-medium text-[#1c1f16]">
                          <span className={`grid h-4 w-4 place-items-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-[#1c1f16]/30"}`}>
                            {checked && <CheckCircle2 className="h-3 w-3" />}
                          </span>
                          {s.name}
                        </span>
                        <span className="font-bold text-[#1c1f16]/70">+{Number(s.price).toFixed(2)} DT</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!detailProduct.is_available ? (
                <span className="mt-4 rounded-full bg-[#1c1f16]/70 px-4 py-1.5 text-sm font-bold uppercase text-white">
                  {t("client.soldOut")}
                </span>
              ) : (
                <>
                  <div className="mt-4 flex items-center gap-6 rounded-full bg-[#ebe7dc] px-6 py-2.5">
                    <button
                      onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                      className="grid h-7 w-7 place-items-center text-[#1c1f16]"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-6 text-center text-lg font-bold text-[#1c1f16]">{detailQty}</span>
                    <button
                      onClick={() => setDetailQty((q) => q + 1)}
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
                      addToCart(detailProduct.id, detailNote, selectedSupplementIds, detailQty);
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
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#1c1f16]/5 text-[#1c1f16]/30">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <p className="text-sm text-[#1c1f16]/60">{t("client.cartEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map(({ cartKey, product, qty, note, supplements, unitPrice }) => (
                <div key={cartKey} className="flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm">
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-background text-xl">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      product.emoji || "🍽️"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1c1f16]">{product.name}</p>
                    <p className="text-xs text-[#1c1f16]/50">{unitPrice.toFixed(2)} DT</p>
                    {supplements.length > 0 && (
                      <p className="text-xs text-[#1c1f16]/50">+ {supplements.map((s) => s.name).join(", ")}</p>
                    )}
                    {note.trim() && <p className="text-xs italic text-[#1c1f16]/50">{note.trim()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQtyByKey(cartKey, -1)}
                      className="grid h-7 w-7 place-items-center rounded-full border border-[#1c1f16]/15 bg-white text-[#1c1f16]"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-sm font-bold text-[#1c1f16]">{qty}</span>
                    <button
                      onClick={() => changeQtyByKey(cartKey, 1)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="w-16 shrink-0 text-end text-sm font-bold text-gold">
                    {(unitPrice * qty).toFixed(2)} DT
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

              {suggestedItems.length > 0 && (
                <div className="space-y-2 border-t border-[#1c1f16]/10 pt-3">
                  <p className="text-sm font-bold text-[#1c1f16]">{t("client.suggestedForYou")}</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {suggestedItems.map(({ product, specialPrice }) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product.id, undefined, [], 1, specialPrice != null ? Number(specialPrice) : undefined)}
                        className="flex w-28 shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-white p-2 text-center"
                      >
                        <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-background text-xl">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            product.emoji || "🍽️"
                          )}
                        </div>
                        <p className="line-clamp-1 text-xs font-semibold text-[#1c1f16]">{product.name}</p>
                        {specialPrice != null ? (
                          <p className="text-[11px]">
                            <span className="text-[#1c1f16]/40 line-through">{Number(product.price).toFixed(2)}</span>{" "}
                            <span className="font-bold text-gold">{Number(specialPrice).toFixed(2)} DT</span>
                          </p>
                        ) : (
                          <p className="text-[11px] font-bold text-gold">{Number(product.price).toFixed(2)} DT</p>
                        )}
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Plus className="h-3 w-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-[#1c1f16]/10 pt-3">
                <p className="text-sm font-bold text-[#1c1f16]">{t("client.yourInfo")} <span className="text-destructive">*</span></p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={customerFirstName}
                    onChange={(e) => { setCustomerFirstName(e.target.value.replace(/[^\p{L}\s'-]/gu, "")); setInvalidFields((f) => ({ ...f, firstName: false })); }}
                    placeholder={`${t("client.firstNamePlaceholder")} *`}
                    className={invalidFields.firstName ? "border-destructive bg-destructive/5" : ""}
                  />
                  <Input
                    value={customerLastName}
                    onChange={(e) => { setCustomerLastName(e.target.value.replace(/[^\p{L}\s'-]/gu, "")); setInvalidFields((f) => ({ ...f, lastName: false })); }}
                    placeholder={`${t("client.lastNamePlaceholder")} *`}
                    className={invalidFields.lastName ? "border-destructive bg-destructive/5" : ""}
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
                    inputMode="numeric"
                    value={customerPhone}
                    onChange={(e) => { setCustomerPhone(e.target.value.replace(/[^0-9]/g, "")); setInvalidFields((f) => ({ ...f, phone: false })); }}
                    placeholder={`${t("client.phonePlaceholder")} *`}
                    className={`flex-1 ${invalidFields.phone ? "border-destructive bg-destructive/5" : ""}`}
                  />
                </div>
                {showInfoError && (
                  <p className="text-xs font-medium text-destructive">
                    {infoErrorType === "empty" ? t("client.missingInfoError") : t("client.invalidInfoError")}
                  </p>
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

      <Dialog open={ordersHistoryOpen} onOpenChange={setOrdersHistoryOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto bg-[#f3efe4] text-[#1c1f16]">
          <DialogHeader>
            <DialogTitle className="text-[#1c1f16]">{t("client.ordersHistoryTitle")}</DialogTitle>
          </DialogHeader>
          {sessionOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#1c1f16]/5 text-[#1c1f16]/30">
                <ClipboardList className="h-8 w-8" />
              </div>
              <p className="text-sm text-[#1c1f16]/60">{t("client.noOrdersYet")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessionOrders.slice().reverse().map((o) => {
                const expanded = expandedHistoryOrderId === o.id;
                return (
                  <div key={o.id} className="rounded-xl bg-white p-3 shadow-sm">
                    <button
                      onClick={() => setExpandedHistoryOrderId(expanded ? null : o.id)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1c1f16]">{o.customerName}</p>
                        <p className="text-xs text-[#1c1f16]/50">
                          {new Date(o.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })} · {t("client.table")} {tableNumber}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-primary">
                          {o.status === "pending" && t("client.tracker.received")}
                          {o.status === "preparing" && t("client.tracker.preparing")}
                          {o.status === "ready" && t("client.tracker.ready")}
                          {o.status === "cancelled" && t("client.tracker.cancelledTitle")}
                          {o.status === "paid" && t("client.tracker.paidTitle")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gold">{o.total.toFixed(2)} DT</span>
                        <ChevronDown className={`h-4 w-4 text-[#1c1f16]/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {expanded && (
                      <div className="mt-3 space-y-1.5 border-t border-[#1c1f16]/10 pt-3">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-[#1c1f16]/70">{item.quantity}× {item.product_name}</span>
                            <span className="font-semibold text-[#1c1f16]">{(item.product_price * item.quantity).toFixed(2)} DT</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={assistanceOpen} onOpenChange={(open) => { setAssistanceOpen(open); if (!open) { setAssistanceSent(false); setAssistanceMessage(""); } }}>
        <DialogContent className="bg-[#f3efe4] text-[#1c1f16]">
          <DialogHeader>
            <DialogTitle className="text-[#1c1f16]">{t("client.assistance.title")}</DialogTitle>
          </DialogHeader>
          {assistanceSent ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                <BellRing className="h-8 w-8" />
              </div>
              <p className="text-center text-sm font-semibold text-[#1c1f16]">{t("client.assistance.sent")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2 pb-1 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[#1c1f16]/5 text-[#1c1f16]/40">
                  <BellRing className="h-7 w-7" />
                </div>
                <p className="text-xs text-[#1c1f16]/60">{t("client.assistance.instructions")}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1c1f16]/60">{t("client.assistance.namePlaceholder")}</label>
                <Input
                  value={assistanceName}
                  onChange={(e) => setAssistanceName(e.target.value)}
                  placeholder={t("client.assistance.namePlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1c1f16]/60">{t("client.assistance.messagePlaceholder")}</label>
                <Textarea
                  value={assistanceMessage}
                  onChange={(e) => setAssistanceMessage(e.target.value)}
                  placeholder={t("client.assistance.messagePlaceholder")}
                  rows={2}
                />
              </div>
              <Button onClick={sendAssistanceRequest} disabled={assistanceSending || !assistanceName.trim()} className="w-full">
                {assistanceSending ? t("client.placing") : t("client.assistance.send")}
              </Button>
            </div>
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