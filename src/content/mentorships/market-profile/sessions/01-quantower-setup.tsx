import { useState, type ReactNode } from "react";
import {
  AppWindow,
  Bot,
  Calculator,
  Check,
  Copy,
  CreditCard,
  Crown,
  Database,
  Download,
  FlaskConical,
  Handshake,
  HardDrive,
  Headset,
  KeyRound,
  Keyboard,
  LayoutGrid,
  MemoryStick,
  MessageCircle,
  Monitor,
  MonitorCog,
  Palette,
  Phone,
  Rewind,
  ScanSearch,
  Smartphone,
  Ticket,
  Wifi,
} from "lucide-react";
import {
  Callout,
  Checklist,
  Compare,
  Figure,
  Flow,
  IconGrid,
  Pending,
  Section,
  StatStrip,
  Steps,
} from "@/components/notes";
import type { SessionMeta } from "@/content";
import { cn } from "@/lib/utils";

/*
 * Screenshots for this session: public/screenshots/market-profile/01-quantower-setup/
 */
export const meta: SessionMeta = {
  number: 1,
  title: "Quantower Setup",
  kind: "live",
  status: "draft",
  summary:
    "Quantower India: system requirements, creating an account and subscribing (Advanced – Equity, coupon PRT5), what is included, and the TPO and order-flow tick settings for Nifty, Bank Nifty and stocks.",
  tags: ["software", "Quantower", "setup", "tick size"],
  keyPoints: [
    "Subscribe to Quantower Advanced – Equity (Equity, Index F&O, Stock F&O, Crypto). Coupon code PRT5 gives 5% off: ₹2,950 → ₹2,802 a month including GST.",
    "Real-time tick data from True Data (an NSE-approved vendor) comes with the monthly Quantower subscription. The subscription is the participant's responsibility.",
    "Needs Windows 10 or above, preferably an SSD (250 GB) and 6 GB RAM, and internet above 20 Mbps. Mobile phones do not support the MP & OFA software.",
    "Daily TPO: build from 30 minutes, 1-day aggregation, 3 months history, custom step 120 ticks (Bank Nifty) / 70 ticks (Nifty).",
    "Order-flow custom step: 50 ticks for Bank Nifty, 30 ticks for Nifty.",
    "Stock tick settings: custom step = 1% of the stock price, divided by 1, 2, 10, 20 or 100 depending on the price band.",
  ],
};

export default function QuantowerSetup() {
  return (
    <>
      <StatStrip
        items={[
          { icon: MonitorCog, value: "Quantower", label: "India · trading platform", hue: "accent" },
          { icon: Download, value: "Installed", label: "on this computer", hue: "green" },
          { icon: KeyRound, value: "Purchased", label: "licence bought", hue: "green" },
          { icon: Ticket, value: "PRT5", label: "coupon code · 5% off", hue: "amber" },
        ]}
      />

      <Section title="Setup at a glance">
        <p>Getting the platform ready happens in this order:</p>
        <Flow items={["Create account", "Download & install", "Subscribe (PRT5)", "Connect", "Apply tick settings"]} />
        <SupportCard />
        <Checklist
          title="Setup checklist"
          items={[
            { text: "Create an account on quantower.in", done: true },
            { text: "Download and install Quantower India", done: true },
            { text: "Subscribe: Quantower Advanced – Equity, coupon PRT5", done: true },
            { text: "Connect the broker (optional, for placing orders)" },
            { text: "Apply the TPO and order-flow tick settings", note: "Values below, for Nifty, Bank Nifty and stocks." },
            { text: "Save the workspace so it opens the same way every day" },
          ]}
        />
      </Section>

      <Section title="System requirements">
        <IconGrid
          cols={4}
          items={[
            { icon: Monitor, title: "Windows 10+", body: "Microsoft Windows 10 and above.", hue: "accent" },
            { icon: HardDrive, title: "SSD 250 GB", body: "Preferably an SSD for storage.", hue: "teal" },
            { icon: MemoryStick, title: "6 GB RAM", body: "Preferred memory.", hue: "violet" },
            { icon: Wifi, title: "20+ Mbps", body: "Required internet speed: above 20 Mbps.", hue: "green" },
          ]}
        />
        <Callout kind="warning" title="Not on mobile">
          <p>
            <Smartphone className="mr-1 inline h-4 w-4 align-[-2px]" /> Mobile phones do not support the MP & OFA
            software. Use a Windows computer.
          </p>
        </Callout>
      </Section>

      <Section title="Create an account and subscribe">
        <Steps
          items={[
            {
              title: "Create an account on quantower.in",
              body: (
                <>
                  Go to{" "}
                  <a href="https://quantower.in/" target="_blank" rel="noreferrer">
                    quantower.in
                  </a>{" "}
                  and create an account.
                </>
              ),
            },
            { title: "Download and install", body: "Download the software and install it on your computer." },
            {
              title: "Choose Quantower Advanced – Equity",
              body: (
                <>
                  On the{" "}
                  <a href="https://quantower.in/pricing" target="_blank" rel="noreferrer">
                    pricing page
                  </a>
                  , pick <strong>Quantower Advanced</strong> and the segment{" "}
                  <strong>Equity (Equity, Index F&O, Stock F&O, Crypto)</strong>.
                </>
              ),
            },
            { title: "Apply coupon PRT5 and pay", body: "Enter PRT5 in Discount coupon, press Apply, then pay with Razorpay." },
          ]}
        />

        <h3>Which plan</h3>
        <div className="my-6 grid gap-4 lg:grid-cols-3">
          <PlanCard
            name="Quantower Free"
            price="Free"
            tone="muted"
            points={["All segments as supported by broker or Quantower (see the feature matrix)", "Requires a broker connection"]}
          />
          <PlanCard
            name="Quantower Lite"
            price="₹800"
            tone="accent"
            points={[
              "Real-time, market depth and 1-minute+ historical data",
              "Not suitable for order flow and volume analysis",
              "Requires a broker connection",
            ]}
          />
          <PlanCard
            name="Quantower Advanced"
            price="₹2,500"
            tone="bull"
            chosen
            points={[
              "Suitable for all features of Quantower",
              "Segment: Equity (Equity, Index F&O, Stock F&O, Crypto)",
              "Other segments: Commodity only · Equity and Commodity · Crypto only",
            ]}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Prices are monthly, plus GST. Quarterly billing is 10% less and yearly billing 15% less. Free, Lite and Advanced
          all note a static IP will be required under the new SEBI API usage guidelines, when implemented.
        </p>

        <h3>What you pay</h3>
        <PriceBreakdown />

        <div className="grid gap-4 md:grid-cols-2">
          <Figure src="market-profile/01-quantower-setup/02-create-account.png" alt="quantower.in home page with the Download button" caption="quantower.in: create an account and download" />
          <Figure src="market-profile/01-quantower-setup/01-quantower-pricing.png" alt="Quantower India pricing page: Free, Lite ₹800, Advanced ₹2500" caption="Pricing page: choose Advanced → Equity" />
        </div>
        <Figure
          src="market-profile/01-quantower-setup/04-order-payment-coupon.png"
          alt="Order payment: ₹2950 without coupon, ₹2802 with coupon PRT5"
          caption="Order payment before and after applying PRT5"
          width="md"
        />
      </Section>

      <Section title="What the subscription includes">
        <div className="card-elevated my-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
            <Database className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold">Real-time tick data from True Data</p>
            <p className="text-[15px] text-muted-foreground">
              From an NSE-approved vendor, provided along with the monthly Quantower subscription. The monthly subscription
              is the participant's responsibility.
            </p>
          </div>
        </div>
        <p className="font-medium">Included without extra cost:</p>
        <IconGrid
          cols={3}
          items={[
            { icon: Rewind, title: "Chart replay", body: "Market Profile, order flow and candlestick chart replay.", hue: "accent" },
            { icon: FlaskConical, title: "Simulation trade", body: "Paper trading for crypto, commodity, equity and futures.", hue: "violet" },
            { icon: Handshake, title: "Broker integration", body: "Place orders through Dhan, Fyers, Zerodha, 5paisa and others, free of cost.", hue: "green" },
            { icon: AppWindow, title: "Window customisation", body: "Arrange the windows as you need.", hue: "teal" },
            { icon: ScanSearch, title: "Scanner", body: "Scanner facility available.", hue: "amber" },
            { icon: Bot, title: "Algo integration", body: "Algo integration facility available.", hue: "navy" },
          ]}
        />
        <Figure src="market-profile/01-quantower-setup/03-system-requirements.png" alt="System requirement, software specification and capabilities" caption="Requirements, specification and capabilities, from the class" width="md" />
      </Section>

      <Section title="TPO and order-flow tick settings: Nifty and Bank Nifty">
        <p>Set these in the TPO chart (and the order-flow chart) for each profile timeframe:</p>
        <div className="my-6 grid gap-4 lg:grid-cols-2">
          <SettingsCard
            title="Daily"
            rows={[
              ["Build from", "30 Minutes", "30 Minutes"],
              ["Profile aggregation", "1 Day", "1 Day"],
              ["History range", "3 Months", "3 Months"],
              ["Custom step (ticks)", "120", "70"],
            ]}
          />
          <SettingsCard
            title="Weekly"
            rows={[
              ["Build from", "180 Minutes", "180 Minutes"],
              ["Profile aggregation", "1 Week", "1 Week"],
              ["History range", "3 Months", "3 Months"],
              ["Custom step (ticks)", "180", "105"],
            ]}
          />
          <SettingsCard
            title="Monthly"
            rows={[
              ["Build from", "12 Hour", "12 Hour"],
              ["Profile aggregation", "1 Month", "1 Month"],
              ["History range", "3 Months", "3 Months"],
              ["Custom step (ticks)", "240", "140"],
            ]}
          />
        </div>
        <div className="card-elevated my-6 grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2">
          <OfaTick name="Bank Nifty" ticks={50} />
          <OfaTick name="Nifty" ticks={30} />
        </div>
        <Callout kind="tip" title="Why a TPO is 24 points in Bank Nifty and 7 in Nifty">
          <p>
            Custom step (ticks) × index tick size = TPO height. Daily Bank Nifty: 120 × 0.20 = <strong>24 points</strong>.
            Daily Nifty: 70 × 0.10 = <strong>7 points</strong>. These match the TPO heights in Session 3.
          </p>
        </Callout>
        <Figure src="market-profile/01-quantower-setup/05-tick-settings-nifty-banknifty.png" alt="TPO and order flow tick size settings for Nifty and Bank Nifty" caption="Tick size setting values for Nifty and Bank Nifty, from the class" width="md" />
      </Section>

      <Section title="Tick size settings for stocks">
        <p>
          For stocks the tick size depends on the price band. The order-flow custom step is <strong>1% of the stock
          price</strong>, divided by how much larger the new tick is.
        </p>
        <Compare
          columns={["Stock price", "Old tick", "New tick", "Difference", "Custom step (new)"]}
          rows={[
            ["₹1 – ₹1,000", "0.05", "0.05", "No change", "1% of stock price"],
            ["₹1,001 – ₹5,000", "0.05", "0.10", "2×", "1% of stock price ÷ 2"],
            ["₹5,001 – ₹10,000", "0.05", "0.50", "10×", "1% of stock price ÷ 10"],
            ["₹10,001 – ₹20,000", "0.05", "1.00", "20×", "1% of stock price ÷ 20"],
            ["Above ₹20,001", "0.05", "5.00", "100×", "1% of stock price ÷ 100"],
          ]}
          caption="Old calculation was 1% of stock price for every band"
        />
        <StockTickCalculator />
        <Callout kind="note" title="Exchange tick sizes for stocks">
          <p>
            Below ₹250: 0.01 · ₹251–₹1,000: 0.05 · ₹1,001–₹5,000: 0.10 · ₹5,001–₹10,000: 0.50 · ₹10,001–₹20,000: 1.00 ·
            above ₹20,001: 5.00. These apply to both the cash market (CM) and stock F&O.
          </p>
        </Callout>
        <Compare
          columns={["Index level", "Old tick", "Revised tick"]}
          rows={[
            ["0 – 15,000", "0.05", "0.05 (unchanged)"],
            ["15,000 – 30,000", "0.05", "0.10"],
            ["Above 30,000", "0.05", "0.20"],
          ]}
          caption="Index tick sizes: first revision 11 April 2025 (EOD) on the 28 March 2025 close, reviewed monthly after that"
        />
        <Figure src="market-profile/01-quantower-setup/06-tick-size-stocks.png" alt="TPO and order flow tick size settings for stocks" caption="Tick size setting values for stocks, from the class" width="md" />
      </Section>

      <Section title="Other settings">
        <IconGrid
          cols={3}
          items={[
            { icon: Palette, title: "Colours & template", body: "Colours used and the saved template.", hue: "violet", tag: "Pending" },
            { icon: Keyboard, title: "Hotkeys", body: "Any shortcuts set up.", hue: "amber", tag: "Pending" },
            { icon: LayoutGrid, title: "Workspace", body: "Panels and their layout.", hue: "navy", tag: "Pending" },
          ]}
        />
        <Pending title="More settings">Share any other settings windows and they will be added here.</Pending>
      </Section>
    </>
  );
}

function SupportCard() {
  return (
    <div className="card-elevated my-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#128C7E]">
        <Headset className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantower India support</p>
        <p className="font-display text-2xl font-bold tracking-wide">
          <Phone className="mr-1.5 inline h-5 w-5 align-[-2px] text-muted-foreground" />
          74000 07514
        </p>
        <p className="text-sm text-muted-foreground">WhatsApp, for help with installation, licence or settings.</p>
      </div>
      <a
        href="https://wa.me/917400007514"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1ebe5b]"
      >
        <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
      </a>
    </div>
  );
}

function PlanCard(props: { name: string; price: string; tone: "muted" | "accent" | "bull"; points: string[]; chosen?: boolean }) {
  const head = { muted: "bg-secondary text-foreground", accent: "bg-accent text-white", bull: "bg-bull text-white" }[props.tone];
  return (
    <div
      className={cn(
        "card-elevated relative flex flex-col overflow-hidden rounded-2xl border bg-card",
        props.chosen ? "border-bull ring-2 ring-bull/40" : "border-border",
      )}
    >
      <div className={cn("px-5 py-4", head)}>
        <p className="flex flex-wrap items-center justify-between gap-2 font-display text-lg font-bold">
          {props.name}
          {props.chosen && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-sans text-xs font-bold text-bull shadow">
              <Crown className="h-3.5 w-3.5" /> Choose this
            </span>
          )}
        </p>
        <p className="mt-1 font-display text-3xl font-bold">
          {props.price}
          {props.price !== "Free" && <span className="ml-1 text-sm font-medium opacity-80">/ month + GST</span>}
        </p>
      </div>
      <ul className="flex-1 space-y-2 p-5 text-[15px]">
        {props.points.map((p) => (
          <li key={p} className="flex gap-2">
            <Check className={cn("mt-1 h-4 w-4 shrink-0", props.chosen ? "text-bull" : "text-muted-foreground")} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceBreakdown() {
  return (
    <div className="card-elevated my-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <PriceStep label="Advanced – Equity" value="₹2,500" sub="per month" />
        <Op>+ GST</Op>
        <PriceStep label="Including GST" value="₹2,950" sub="actual price" />
        <Op>− 5%</Op>
        <PriceStep label="With coupon PRT5" value="₹2,802" sub="you pay" highlight />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Coupon / refer code:</span>
        <CouponCode code="PRT5" />
        <span className="text-sm text-muted-foreground">Pay with Razorpay after applying it.</span>
      </div>
    </div>
  );
}

function PriceStep({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl px-4 py-3", highlight ? "bg-bull text-white shadow-lg" : "bg-secondary/70")}>
      <p className={cn("text-xs font-medium", highlight ? "text-white/80" : "text-muted-foreground")}>{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className={cn("text-xs", highlight ? "text-white/80" : "text-muted-foreground")}>{sub}</p>
    </div>
  );
}

function Op({ children }: { children: ReactNode }) {
  return <span className="font-display text-lg font-bold text-muted-foreground">{children}</span>;
}

function CouponCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-gold bg-gold/10 px-3 py-1 font-mono text-lg font-bold tracking-widest text-foreground hover:bg-gold/20"
      title="Copy code"
    >
      {code}
      {copied ? <Check className="h-4 w-4 text-bull" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

function SettingsCard({ title, rows }: { title: string; rows: [string, string, string][] }) {
  return (
    <div className="card-elevated overflow-x-auto rounded-2xl border border-border bg-card">
      <p className="bg-primary px-4 py-2.5 text-center font-display font-bold uppercase tracking-wider text-primary-foreground">{title} TPO</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary text-left">
            <th className="px-3 py-2 font-medium text-muted-foreground">Setting</th>
            <th className="whitespace-nowrap px-3 py-2 font-display font-semibold text-violet-700">Bank Nifty</th>
            <th className="px-3 py-2 font-display font-semibold text-accent">Nifty</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, bn, n]) => {
            const step = k.startsWith("Custom step");
            return (
              <tr key={k} className={cn("border-t border-border", step && "bg-gold/10")}>
                <td className="px-3 py-2 text-muted-foreground">{k}</td>
                <td className={cn("whitespace-nowrap px-3 py-2 font-mono", step && "text-lg font-bold")}>{bn}</td>
                <td className={cn("whitespace-nowrap px-3 py-2 font-mono", step && "text-lg font-bold")}>{n}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OfaTick({ name, ticks }: { name: string; ticks: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-border p-5 sm:border-r sm:last:border-r-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order-flow (OFA) tick setting</p>
        <p className="font-display text-lg font-semibold">{name}</p>
      </div>
      <p className="font-display text-3xl font-bold">
        {ticks}
        <span className="ml-1 text-sm font-medium text-muted-foreground">ticks</span>
      </p>
    </div>
  );
}

const BANDS = [
  { upTo: 1000, tick: 0.05, factor: 1, label: "₹1 – ₹1,000" },
  { upTo: 5000, tick: 0.1, factor: 2, label: "₹1,001 – ₹5,000" },
  { upTo: 10000, tick: 0.5, factor: 10, label: "₹5,001 – ₹10,000" },
  { upTo: 20000, tick: 1, factor: 20, label: "₹10,001 – ₹20,000" },
  { upTo: Infinity, tick: 5, factor: 100, label: "Above ₹20,001" },
];

/** Type a stock price → its band, new tick size and custom step, from the table above. */
function StockTickCalculator() {
  const [price, setPrice] = useState("2400");
  const p = Number(price.replace(/,/g, ""));
  const valid = Number.isFinite(p) && p > 0;
  const band = BANDS.find((b) => p <= b.upTo) ?? BANDS[BANDS.length - 1];
  const step = valid ? (p * 0.01) / band.factor : 0;
  return (
    <div className="card-elevated my-6 rounded-2xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 font-display text-lg font-semibold">
        <Calculator className="h-5 w-5 text-accent" /> Stock tick calculator
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Stock price (₹)</span>
          <input
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-40 rounded-lg border border-input bg-background px-3 py-2 font-mono text-lg outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        {valid ? (
          <div className="flex flex-wrap gap-3">
            <Result label="Price band" value={band.label} />
            <Result label="New tick size" value={band.tick.toFixed(2)} />
            <Result label="Custom step (ticks)" value={formatStep(step)} strong />
            <Result label="≈ points per step" value={formatStep(step * band.tick)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a price above 0.</p>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Custom step = 1% of price ÷ {valid ? band.factor : "factor"}. Round it to a whole number in the chart settings.
      </p>
    </div>
  );
}

function formatStep(n: number) {
  return n >= 10 ? n.toFixed(0) : n.toFixed(2).replace(/\.?0+$/, "");
}

function Result({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-xl px-3 py-2", strong ? "bg-accent text-white" : "bg-secondary/70")}>
      <p className={cn("text-[11px]", strong ? "text-white/80" : "text-muted-foreground")}>{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}

