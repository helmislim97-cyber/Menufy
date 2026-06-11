import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/lang-switch";
import { Logo } from "@/components/logo";
import {
  QrCode,
  Smartphone,
  ChefHat,
  Sparkles,
  Clock,
  Languages,
  Printer,
  Wallet,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Menufy — Votre restaurant digitalisé en 48h" },
      { name: "description", content: "QR menu, commandes en temps réel, cuisine connectée. La solution menu digital pour les restaurants tunisiens." },
      { property: "og:title", content: "Menufy — QR menu pour restaurants tunisiens" },
      { property: "og:description", content: "Digitalisez votre restaurant en 48h. Bilingue AR/FR, mobile-first." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, locale, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-20 sm:pt-20 sm:pb-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero.badge")}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-gradient-brand">{t("hero.title").split(" ").slice(-2).join(" ")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              {t("hero.cta")}
              <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              {t("hero.cta2")}
            </a>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto mt-16 w-full max-w-xs sm:max-w-sm">
            <div className="absolute inset-0 bg-gradient-brand opacity-30 blur-2xl" />
            <div className="relative rounded-[2.5rem] border-[10px] border-surface-elevated bg-surface p-3 shadow-card">
              <div className="rounded-[1.8rem] bg-background p-4 text-start">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>9:41</span>
                  <span>Table 7</span>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">{locale === "fr" ? "Restaurant" : "مطعم"}</p>
                  <p className="text-lg font-bold">Dar El Jeld</p>
                </div>
                <div className="mt-3 flex gap-1.5 overflow-hidden">
                  {(locale === "fr" ? ["Entrées", "Plats", "Desserts"] : ["مقبلات", "أطباق", "حلويات"]).map((c, i) => (
                    <span key={c} className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-surface-elevated text-muted-foreground"}`}>{c}</span>
                  ))}
                </div>
                {[
                  { e: "🥗", n: locale === "fr" ? "Salade Tunisienne" : "سلطة تونسية", p: "8.500" },
                  { e: "🍲", n: locale === "fr" ? "Couscous Royal" : "كسكسي ملكي", p: "24.000" },
                  { e: "🥘", n: locale === "fr" ? "Tajine au thon" : "طاجين تونة", p: "18.000" },
                ].map((it) => (
                  <div key={it.n} className="mt-3 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{it.e}</span>
                      <div>
                        <p className="text-xs font-semibold">{it.n}</p>
                        <p className="text-[10px] text-primary">{it.p} DT</p>
                      </div>
                    </div>
                    <button className="rounded-lg bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">+</button>
                  </div>
                ))}
                <div className="mt-3 rounded-xl bg-gradient-brand px-3 py-2.5 text-center text-xs font-bold text-primary-foreground">
                  {locale === "fr" ? "Commander · 50.500 DT" : "اطلب · 50.500 د.ت"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/50 bg-surface/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">{t("how.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("how.subtitle")}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: QrCode, title: t("how.step1.title"), desc: t("how.step1.desc"), n: "01" },
              { icon: Smartphone, title: t("how.step2.title"), desc: t("how.step2.desc"), n: "02" },
              { icon: ChefHat, title: t("how.step3.title"), desc: t("how.step3.desc"), n: "03" },
            ].map(({ icon: Icon, title, desc, n }) => (
              <div key={n} className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40">
                <span className="absolute end-4 top-4 text-5xl font-black text-primary/10">{n}</span>
                <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">{t("features.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("features.subtitle")}</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Smartphone, k: "1" },
              { icon: Clock, k: "2" },
              { icon: QrCode, k: "3" },
              { icon: Wallet, k: "4" },
              { icon: Languages, k: "5" },
              { icon: Printer, k: "6" },
            ].map(({ icon: Icon, k }) => (
              <div key={k} className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-accent/40">
                <div className="inline-grid h-10 w-10 place-items-center rounded-lg bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold">{t(`features.${k}.title`)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{t(`features.${k}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/50 bg-surface/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">{t("pricing.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("pricing.subtitle")}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <PriceCard
              name={t("pricing.free.name")}
              price={t("pricing.free.price")}
              desc={t("pricing.free.desc")}
              features={[`5 ${t("pricing.feat.tables")}`, t("pricing.feat.menu"), t("pricing.feat.realtime")]}
            />
            <PriceCard
              highlight
              badge={t("pricing.popular")}
              name={t("pricing.pro.name")}
              price={t("pricing.pro.price")}
              period={t("pricing.pro.period")}
              desc={t("pricing.pro.desc")}
              features={[t("pricing.feat.unlimited"), t("pricing.feat.menu"), t("pricing.feat.realtime"), t("pricing.feat.qr"), t("pricing.feat.support")]}
            />
            <PriceCard
              name={t("pricing.entr.name")}
              price={t("pricing.entr.price")}
              desc={t("pricing.entr.desc")}
              features={[t("pricing.feat.multi"), t("pricing.feat.api"), t("pricing.feat.support")]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-brand p-10 text-center shadow-glow sm:p-14">
            <h2 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl">{t("cta.title")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">{t("cta.subtitle")}</p>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-background px-6 py-3.5 text-sm font-bold text-foreground transition-transform hover:scale-[1.02]"
            >
              {t("cta.button")}
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Header() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">{t("nav.howItWorks")}</a>
          <a href="#features" className="transition-colors hover:text-foreground">{t("nav.features")}</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">{t("nav.pricing")}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LangSwitch />
          <Link to="/auth" search={{ mode: "login" }} className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground sm:inline-flex">
            {t("nav.login")}
          </Link>
          <Link to="/auth" search={{ mode: "register" }} className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-glow">
            {t("nav.register")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function PriceCard({ name, price, period, desc, features, highlight, badge }: {
  name: string; price: string; period?: string; desc: string; features: string[]; highlight?: boolean; badge?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={`relative rounded-3xl border p-6 ${highlight ? "border-primary bg-surface shadow-glow" : "border-border bg-surface"}`}>
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-foreground">
          {badge}
        </span>
      )}
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">{price}</span>
        {period && <span className="text-sm text-muted-foreground">{period}</span>}
      </div>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/auth"
        search={{ mode: "register" }}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-transform hover:scale-[1.01] ${highlight ? "bg-gradient-brand text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"}`}
      >
        {t("pricing.cta")}
      </Link>
    </div>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">{t("footer.tagline")}</p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Menufy. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
