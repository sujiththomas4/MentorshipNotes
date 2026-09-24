import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeftRight,
  ArrowUpDown,
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  Crosshair,
  ExternalLink,
  Flag,
  Gavel,
  Globe,
  GraduationCap,
  Grid3x3,
  HandCoins,
  Landmark,
  Layers,
  Magnet,
  MoveVertical,
  Scale,
  ScanLine,
  Scissors,
  Store,
  Target,
  Timer,
  UserRound,
  Users,
  Waves,
} from "lucide-react";
import {
  Callout,
  Columns,
  Compare,
  Figure,
  Flow,
  Glossary,
  IconBubble,
  IconGrid,
  type Hue,
  LevelMap,
  MiniProfile,
  Panel,
  ProfileChart,
  Section,
  ShapeGallery,
  StatStrip,
} from "@/components/notes";
import type { SessionMeta } from "@/content";

export const meta: SessionMeta = {
  number: 2,
  title: "Market Profile Terminologies",
  kind: "recorded",
  status: "draft",
  summary: "What Market Profile is, where it came from (Steidlmayer, Jim Dalton), then its vocabulary: TPOs, initial balance, POC, value area, single prints, tails and profile shapes.",
  tags: ["recorded", "terminology", "TPO", "value area"],
  keyPoints: [
    "Market Profile was developed by J. Peter Steidlmayer, a trader at the Chicago Board of Trade, in the 1960s.",
    "Market Profile is a charting tool for observing the two-way auction process that drives all market movement; the Profile is a constantly developing graphic that records and organises auction data.",
    "Jim Dalton, author of Mind over Markets (2013) and Markets in Profile (2007), is a long-time proponent of Market Profile.",
    "Each 30-minute period gets a letter (A, B, C …); every letter printed at a price is one TPO.",
    "The initial balance (IB) is the range of the first hour: the A and B periods.",
    "The point of control (POC) is the price with the most TPOs, the fairest price of the day.",
    "The value area, also called the fair price, holds about 70% of the day's TPOs; its edges are the VAH and VAL.",
    "Single prints show a fast, one-sided move; two or more at an extreme form a tail (rejection).",
    "Time spent at a price means acceptance; a quick move away means rejection.",
  ],
};

export default function Terminologies() {
  return (
    <>
      <Section title="Introduction to Market Profile">
        <IconGrid
          cols={3}
          items={[
            { icon: UserRound, title: "J. Peter Steidlmayer", body: "Developed the Market Profile technique.", hue: "accent" },
            { icon: CalendarDays, title: "The 1960s", body: "When the technique was developed.", hue: "violet" },
            { icon: Landmark, title: "Chicago Board of Trade", body: "Steidlmayer was a trader there.", hue: "teal" },
          ]}
        />

        <Callout kind="definition" title="What Market Profile is">
          <p>
            A unique <strong>charting tool</strong> that lets traders observe the <strong>two-way auction process</strong>{" "}
            that drives all market movement.
          </p>
        </Callout>

        <div className="card-elevated my-6 rounded-2xl border border-border bg-card p-6">
          <p className="eyebrow text-center">The two-way auction</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <AuctionSide icon={HandCoins} title="Buyers" hue="green" />
            <ArrowLeftRight className="h-7 w-7 text-muted-foreground" />
            <div className="flex flex-col items-center rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-lg">
              <Gavel className="h-7 w-7" />
              <span className="mt-1 font-display font-semibold">Auction</span>
            </div>
            <ArrowLeftRight className="h-7 w-7 text-muted-foreground" />
            <AuctionSide icon={Store} title="Sellers" hue="red" />
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-accent" /> drives all market movement
          </p>
        </div>

        <p>
          <strong>Put another way:</strong> the Profile is simply a constantly developing graphic that records and
          organises auction data.
        </p>
        <Flow items={["Auction data", "Recorded", "Organised", "The Profile: a constantly developing graphic"]} />

        <Figure
          src="market-profile/02-market-profile-terminologies/01-market-profile-introduction.png"
          alt="Slide: Market Profile, a technique developed by J. Peter Steidlmayer in the 60s"
          caption="Introduction slide from the recording"
          width="md"
        />

        <h3>Jim Dalton</h3>
        <div className="card-elevated my-5 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-4 border-b border-border bg-secondary/60 px-5 py-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold text-primary-foreground">
              JD
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-bold leading-tight">James F. Dalton</p>
              <p className="text-sm text-muted-foreground">Discretionary trader · long-time proponent of Market Profile</p>
            </div>
            <a
              href="https://jimdaltontrading.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-accent hover:border-accent"
            >
              <Globe className="h-4 w-4" /> jimdaltontrading.com <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            <DaltonFact icon={Award} hue="amber" title="50+ years">
              Has made trading and studying the markets his life's work.
            </DaltonFact>
            <DaltonFact icon={Building2} hue="teal" title="CBOT & CBOE">
              Member of the Chicago Board of Trade and the Chicago Board Options Exchange; Senior Executive Vice
              President of the CBOE during its formative years.
            </DaltonFact>
            <DaltonFact icon={GraduationCap} hue="violet" title="Courses">
              Market Profile Primer, Foundation &amp; Application of the Market Profile, Advanced Nuances &amp;
              Exceptions.
            </DaltonFact>
          </div>
          <div className="grid gap-3 border-t border-border p-5 sm:grid-cols-2">
            <Book title="Mind over Markets" sub="Power Trading with Market Generated Information · Updated Edition" year="2013" />
            <Book title="Markets in Profile" sub="Profiting from the Auction Process" year="2007" />
          </div>
        </div>
        <Figure
          src="market-profile/02-market-profile-terminologies/02-jim-dalton.png"
          alt="Slide: About Jim Dalton, with his website and courses"
          caption="About Jim Dalton, from the recording"
          width="md"
        />
      </Section>

      <Callout kind="note" title="Draft from standard definitions">
        <p>
          The introduction above is from the recording. The sections below still use the standard Market Profile
          definitions; they will be matched to Dr. Sherlymon Abraham's explanation as you share more from the
          recording. Prices in the charts are made-up examples.
        </p>
      </Callout>

      <Section title="The big idea">
        <p>
          A normal chart shows price against time. <strong>Market profile</strong> turns that sideways: it shows{" "}
          <strong>how much time</strong> the market spent at each price. Prices where the market spends a lot of time
          are where buyers and sellers agree, and that area is called <strong>value</strong>.
        </p>
        <Callout kind="definition" title="Value area = Fair price">
          <p>
            The value area is also called the <strong>fair price</strong>: the range where about 70% of the day's trading
            happened, the prices both buyers and sellers accepted as fair.
          </p>
        </Callout>
        <StatStrip
          items={[
            { icon: Timer, value: "30 min", label: "one period = one letter", hue: "accent" },
            { icon: Grid3x3, value: "1 TPO", label: "one letter at one price", hue: "teal" },
            { icon: Clock, value: "A + B", label: "first hour = initial balance", hue: "violet" },
            { icon: Target, value: "~70%", label: "of TPOs = value area (fair price)", hue: "green" },
          ]}
        />
      </Section>

      <Section title="Anatomy of a profile">
        <p>One day's profile with the main parts marked. Blue letters are the initial balance (A and B).</p>
        <ProfileChart
          title="A balanced day"
          data={`
            22600 B
            22590 B
            22580 ABC
            22570 ABCD
            22560 ACDEF
            22550 ACDEFGH
            22540 ADEFGHIJ
            22530 AEFGHIJ
            22520 EGHIJ
            22510 HIJ
            22500 I
            22490 I
          `}
          marks={[
            { price: 22600, text: "Selling tail (B, B)", tone: "bear" },
            { price: 22520, text: "Range extension below IB (E)", tone: "neutral" },
            { price: 22490, text: "Buying tail (I, I)", tone: "bull" },
          ]}
          caption="The shaded band is the value area; the gold row is the POC."
        />
      </Section>

      <Section title="Core terms">
        <Glossary
          items={[
            {
              icon: Grid3x3,
              term: "Time Price Opportunity",
              abbr: "TPO",
              hue: "accent",
              def: "One letter printed at one price. It means the market traded at that price during that period.",
              example: "A row with ABCD has 4 TPOs.",
            },
            {
              icon: Clock,
              term: "Period letters",
              hue: "teal",
              def: "The day is split into 30-minute periods, lettered A, B, C … in order. Each period prints its letter at every price it traded.",
            },
            {
              icon: MoveVertical,
              term: "Initial balance",
              abbr: "IB",
              hue: "violet",
              def: "The high-to-low range of the first hour (A and B periods). It shows the first area both sides accept.",
            },
            {
              icon: ArrowUpDown,
              term: "Range extension",
              hue: "navy",
              def: "When a later period trades beyond the IB high or low. It shows one side taking control after the first hour.",
              example: "E trades below the IB low in the chart above.",
            },
            {
              icon: Crosshair,
              term: "Point of control",
              abbr: "POC",
              hue: "amber",
              def: "The price with the most TPOs (the longest row). The fairest price of the day, where most trading took place.",
            },
            {
              icon: Target,
              term: "Value area",
              abbr: "VA · Fair price",
              hue: "green",
              def: (
                <>
                  The range around the POC that holds about 70% of the day's TPOs. It is also called the{" "}
                  <strong>fair price</strong> area, because these are the prices the market accepted as fair.
                </>
              ),
            },
            {
              icon: Layers,
              term: "Value area high / low",
              abbr: "VAH · VAL",
              hue: "green",
              def: "The top and bottom edges of the value area. They are key reference levels for the next day.",
            },
            {
              icon: ScanLine,
              term: "Single prints",
              hue: "red",
              def: "Prices with only one TPO inside the profile. Price moved through them fast in one direction, with little two-sided trade.",
            },
            {
              icon: Scissors,
              term: "Tail",
              hue: "red",
              def: "Two or more single prints at the high (selling tail) or low (buying tail) of the day: a sign that price was rejected there.",
            },
            {
              icon: Flag,
              term: "Poor high / poor low",
              hue: "amber",
              def: "An extreme with no tail, several TPOs flat at the top or bottom. The auction there looks unfinished and is often revisited.",
            },
            {
              icon: Scale,
              term: "Balance / imbalance",
              hue: "teal",
              def: "Balance: price rotates inside a range around value. Imbalance: price moves directionally to find new value.",
            },
            {
              icon: Users,
              term: "Day timeframe vs other timeframe",
              abbr: "OTF",
              hue: "violet",
              def: "Day-timeframe traders trade within the day. Other-timeframe participants hold longer and cause the big directional moves.",
            },
          ]}
        />
      </Section>

      <Section title="Value area in practice">
        <p>
          Yesterday's VAH, POC and VAL become today's reference levels. Where today's price trades relative to them is
          described as <strong>above value</strong>, <strong>in value</strong> or <strong>below value</strong>.
        </p>
        <LevelMap
          title="Yesterday's value as today's map"
          bands={[{ from: 22520, to: 22570, label: "Value area = fair price (~70% of TPOs)" }]}
          levels={[
            { price: 22570, label: "VAH" },
            { price: 22540, label: "POC", tone: "gold" },
            { price: 22520, label: "VAL" },
          ]}
          markers={[
            { price: 22610, label: "Above value", tone: "bull" },
            { price: 22545, label: "In value", tone: "neutral" },
            { price: 22480, label: "Below value", tone: "bear" },
          ]}
        />
      </Section>

      <Section title="Single prints on a trend day">
        <ProfileChart
          title="An imbalanced (trend) day"
          data={`
            22620 G
            22610 FG
            22600 FG
            22590 EF
            22580 E
            22570 E
            22560 DE
            22550 CD
            22540 BCD
            22530 ABC
            22520 AB
            22510 A
          `}
          marks={[{ price: 22575, text: "Single prints: fast move up in E", tone: "bull" }]}
          caption="A thin, elongated profile: price kept moving to find new value instead of rotating."
        />
      </Section>

      <Section title="Acceptance and rejection">
        <Compare
          columns={["", "Acceptance", "Rejection"]}
          rows={[
            ["What you see", "Many TPOs, price spends time", "Few TPOs, single prints or a tail"],
            ["What it means", { v: "The price is seen as fair", tone: "bull" }, { v: "The price is seen as unfair", tone: "bear" }],
            ["In the profile", "Wide rows, the POC and value area", "Thin rows at the edges"],
          ]}
        />
      </Section>

      <Section title="Profile shapes">
        <ShapeGallery>
          <MiniProfile shape="normal" label="Normal" note="Balanced; POC near the middle" />
          <MiniProfile shape="p" label="p-shape" note="Value built high; long thin bottom" />
          <MiniProfile shape="b" label="b-shape" note="Value built low; long thin top" />
          <MiniProfile shape="trend" label="Trend" note="Thin and elongated" />
          <MiniProfile shape="double" label="Double distribution" note="Two value areas, singles between" />
        </ShapeGallery>
        <Columns>
          <Panel title="Balance" tone="neutral">
            <p>
              <Waves className="mr-1 inline h-4 w-4 align-[-2px]" /> Price rotates up and down around the POC. The
              profile is wide with a clear middle.
            </p>
          </Panel>
          <Panel title="Imbalance" tone="bull">
            <p>
              <Magnet className="mr-1 inline h-4 w-4 align-[-2px]" /> Price moves away to find new value. The profile is
              thin, with single prints along the move.
            </p>
          </Panel>
        </Columns>
      </Section>
    </>
  );
}

function AuctionSide({ icon, title, hue }: { icon: LucideIcon; title: string; hue: "green" | "red" }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary/50 px-5 py-4">
      <IconBubble icon={icon} hue={hue} size="lg" />
      <span className="font-display font-semibold">{title}</span>
    </div>
  );
}

function DaltonFact({ icon, hue, title, children }: { icon: LucideIcon; hue: Hue; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <IconBubble icon={icon} hue={hue} />
      <div>
        <p className="font-display font-semibold">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function Book({ title, sub, year }: { title: string; sub: string; year: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
      <span className="flex h-14 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-white shadow">
        <BookOpen className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display font-semibold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <span className="ml-auto rounded-full bg-card px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground ring-1 ring-border">
        {year}
      </span>
    </div>
  );
}