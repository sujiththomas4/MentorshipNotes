import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Building,
  CalendarRange,
  ChartCandlestick,
  ChartColumnIncreasing,
  Grid3x3,
  CircleCheck,
  CircleX,
  Combine,
  Eye,
  Gauge,
  HeartPulse,
  ListOrdered,
  MoveHorizontal,
  PackageMinus,
  PackagePlus,
  Route,
  Scale,
  Timer,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";
import {
  AnnotatedFigure,
  analyseProfile,
  BellCurve,
  Callout,
  CandleToProfile,
  Columns,
  Compare,
  CountDial,
  Figure,
  Flow,
  IconBubble,
  IconGrid,
  type Hue,
  type ShapeName,
  MiniProfile,
  Panel,
  Pending,
  ProfileBuilder,
  ProfileChart,
  Scenarios,
  Section,
  SidewaysBell,
  StatStrip,
  Steps,
  Terms,
  WyckoffCycle,
} from "@/components/notes";
import type { SessionMeta } from "@/content";

/*
 * Screenshots for this session: public/screenshots/market-profile/03-live-1/
 * Built from the notes and screenshots shared during the class.
 */
export const meta: SessionMeta = {
  number: 3,
  title: "Live 1",
  date: "2026-09-23",
  kind: "live",
  status: "draft",
  summary: "Merged profiles and the market clock, why order flow is used with market profile, one-way and two-way auctions, the Wyckoff market cycle, what Market Profile is (and is not), why we trade value, not price, the three professional analysis tools, volume on the profile, the bell curve, split and composite profiles, OHLC in a split profile, TPO size and the half back, and how a profile builds period by period.",
  tags: ["live", "Bank Nifty", "merged profile", "market clock", "order flow", "Wyckoff"],
  recording: {
    url: "https://us06web.zoom.us/rec/share/Ig3tg8SXAWaatENqNX0-7mGLMAiyBlxeIa5lbO3x3g9G1C0bi-RtktU_a47o2Pay.0XM_ht0C3PsA59w9",
    passcode: "2Indian@2309",
    date: "2026-09-23",
    note: "2nd day class recording: MP basics and terminology.",
  },
  keyPoints: [
    "When the market consolidates, merge all the consolidation days into one profile, drawn from the left.",
    "If the market opens above the merged profile, it will go.",
    "The count under the merged profile is the market clock: 41 days means the balance is mature, so a trend reversal can happen anytime.",
    "The market clock example is accumulation happening. For early confirmation of the breakout, merge the profiles, look for higher lows and the POC, and see where the market opens.",
    "Market profile uses 30-minute periods, so it is difficult to trade intraday with it alone; order flow is used to set the stop loss and target.",
    "Auctions are one-way (one side in control) or two-way (buyers and sellers both active).",
    "Accumulation is heavy orders collected with limit orders: to buy 5 lakh they need 5 lakh sellers, so they keep the market in a range until the orders fill.",
    "Once the orders are fully accumulated, big market buy orders are placed: the breakout happens, retailers join and the market goes up further.",
    "Distribution at the top: big players keep sell limit orders and also short the market, so it goes down, retailers participate and it goes down further.",
    "If the big player wants the market higher, they re-accumulate at the top and bring it up again. It depends on their plan.",
    "Market Profile is a visualisation tool for traders' behaviour and price behaviour: it records market activity as a price distribution and shows what the market as a crowd is doing. An MP trader is a value-based trader.",
    "Price and candles can be manipulated: a big red candle had 28 lots more buyers (delta +28) and the market went up. That is why we read value, not price or candle colour.",
    "Three professional analysis tools: Market Profile (price + time), Volume Profile (volume + price: where most volume traded) and Order Flow Analysis (the orders inside each candle).",
    "Volume is added to the profile chart and high volume shows in yellow. High volume at the VAH, VAL or POC is super important.",
    "A market profile follows the bell curve on its side: about 68% lies within one standard deviation, which is why the value area is about 70%.",
    "Each 30-minute candle becomes one letter column; putting the letters side by side at each price builds the market profile.",
    "The split 30-min profile matches the 30-min candles; the composite day profile matches the day candle.",
    "In a split profile: high = top of the letter column, low = bottom, open = the white arrow, close = the white line. B's open is A's close.",
    "Gaps are ignored in market profile: it is a context-building tool, not a trading tool.",
    "1 TPO height = 24 points in Bank Nifty and 7 points in Nifty.",
    "The half back is the exact 50% mark of the profile's total height, shown as red TPOs.",
    "A market profile builds with time: every 30-minute period adds its letter at every price it traded, so the profile grows through the day.",
    "Market Profile is not an indicator and not a strategy: we approach the market based on value, not based on price.",
    "Wyckoff market cycle: Accumulation (cause) → Mark Up (effect) → Distribution (cause) → Mark Down (effect).",
  ],
};

/** rough shape of the merged Bank Nifty profile in the screenshot, top to bottom */
const MERGED = [3, 4, 5, 6, 7, 8, 10, 12, 16, 18, 17, 16, 18, 20, 22, 24, 21, 18, 13, 10, 8, 6, 5, 4, 3, 2, 1, 1];

export default function Live1() {
  return (
    <>
      <StatStrip
        items={[
          { icon: ChartCandlestick, value: "Bank Nifty", label: "BANKNIFTY-I · daily TPO", hue: "accent" },
          { icon: Combine, value: "Merged", label: "consolidation days in one profile", hue: "violet" },
          { icon: CalendarRange, value: "41", label: "days in the merged profile", hue: "amber" },
          { icon: TriangleAlert, value: "Mature", label: "trend reversal can come anytime", hue: "red" },
        ]}
      />

      <Section title="Merged profile">
        <p>
          When the market has been consolidating, all the consolidation days are <strong>merged into one profile</strong>,
          drawn from the left of those days. Instead of many small daily profiles, you see the whole balance area as one
          shape.
        </p>

        <div className="card-elevated my-6 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              [1, 2, 3, 4, 3, 2, 1],
              [1, 3, 4, 5, 3, 1, 1],
              [2, 3, 5, 4, 2, 1, 1],
              [1, 2, 4, 3, 3, 2, 1],
            ].map((c, i) => (
              <MiniProfile key={i} counts={c} label={`Day ${i + 1}`} />
            ))}
          </div>
          <div className="flex flex-col items-center gap-1 px-2 text-xs font-medium text-muted-foreground">
            <ArrowRight className="h-8 w-8 text-accent" />
            merge
          </div>
          <MiniProfile counts={MERGED} label="Merged profile" note="all consolidation days together" />
        </div>

        <AnnotatedFigure
          src="market-profile/03-live-1/01-banknifty-merged-profile.png"
          alt="Bank Nifty daily TPO chart in Quantower with the consolidation days merged into one profile marked 41"
          caption="BANKNIFTY-I daily TPO chart in Quantower, shared during the class"
          marks={[
            { x: 62, y: 55, text: "The merged profile: all the consolidating days combined into one, drawn from the left." },
            { x: 63.6, y: 93, text: "41: the number of days in the merged profile (the market clock)." },
            { x: 45, y: 23, text: "Top of the merged balance. An open above it means the market will go." },
            { x: 35, y: 20, text: "Earlier daily profiles, before the merged consolidation." },
          ]}
        />
      </Section>


      <Section title="Market clock">
        <Columns>
          <div className="card-elevated flex items-center justify-center rounded-2xl border border-border bg-card p-6">
            <CountDial value="41" unit="days" label="in the merged profile" hue="amber" />
          </div>
          <div className="space-y-4">
            <Panel title="Counting the days">
              <p>
                The number under the merged profile counts the days inside it. The more days, the older (more mature) the
                balance.
              </p>
            </Panel>
            <Callout kind="warning" title="41 days: the balance is mature">
              <p>At 41 days the balance is getting mature, so a trend reversal can happen anytime.</p>
            </Callout>
          </div>
        </Columns>
        <Callout kind="note" title="The market clock is an example of accumulation">
          <p>
            The 41-day merged profile in the screenshot is <strong>accumulation happening</strong>: big players filling
            their orders inside the range (see <a href="#market-cycle-wyckoff-logic">Wyckoff logic</a> below).
          </p>
        </Callout>
      </Section>

      <Section title="Early confirmation of the breakout">
        <p>
          To get an <strong>early confirmation</strong> that accumulation is turning into a breakout, merge the profiles
          and check these, in order:
        </p>
        <ConfirmDiagram />
        <Steps
          items={[
            { title: "Merge the profiles", body: "Combine all the consolidation days into one merged profile." },
            { title: "Look for higher lows", body: "Lows inside the merged profile rising one after another." },
            { title: "Check the POC", body: "Where the point of control of the merged profile sits." },
            { title: "See where the market opens", body: "An open above the merged profile confirms the breakout." },
          ]}
        />
        <Scenarios
          items={[
            {
              when: "the market opens above the merged profile",
              then: "it will go: the breakout is confirmed and price leaves the balance",
              tone: "bull",
              tag: "Open above",
            },
          ]}
        />
      </Section>

      <Section title="Order flow with market profile">
        <Columns>
          <Panel title="Market profile alone">
            <p>
              <Timer className="mr-1 inline h-4 w-4 align-[-2px] text-accent" /> Built from 30-minute periods, so it is
              difficult to trade intraday with it alone.
            </p>
          </Panel>
          <Panel title="Add order flow">
            <p>
              <Zap className="mr-1 inline h-4 w-4 align-[-2px] text-gold" /> Order flow is used alongside market profile
              to place the <strong>stop loss</strong> and <strong>target</strong>.
            </p>
          </Panel>
        </Columns>
        <Flow items={["Market profile (30-min periods)", "+ Order flow", "Stop loss & target for intraday trades"]} />
      </Section>

      <Section title="One-way and two-way auction">
        <p>The market auctions in two ways:</p>
        <div className="my-6 grid gap-4 md:grid-cols-2">
          <AuctionCard
            icon={ArrowUpRight}
            hue="accent"
            title="One-way auction"
            body="One side is in control, so price keeps moving in one direction."
            shape="trend"
          />
          <AuctionCard
            icon={ArrowLeftRight}
            hue="green"
            title="Two-way auction"
            body="Buyers and sellers are both active, so price rotates back and forth."
            shape="normal"
          />
        </div>
      </Section>

      <Section title="Market cycle: Wyckoff logic">
        <p>The market moves through four phases. Each sideways phase is the cause; the move that follows is its effect.</p>
        <IconGrid
          cols={4}
          items={[
            { icon: PackagePlus, title: "Accumulation", body: "Sideways range at the bottom where heavy orders are collected.", hue: "green", tag: "Cause" },
            { icon: TrendingUp, title: "Mark Up", body: "Price rises out of accumulation.", hue: "accent", tag: "Effect" },
            { icon: PackageMinus, title: "Distribution", body: "Sideways range at the top: sell limit orders and shorts.", hue: "amber", tag: "Cause" },
            { icon: TrendingDown, title: "Mark Down", body: "Price falls out of distribution.", hue: "red", tag: "Effect" },
          ]}
        />
        <Flow items={["Accumulation", "Mark Up", "Distribution", "Mark Down", "Accumulation again"]} />

        <h3>Why accumulation happens</h3>
        <p>
          Accumulation is basically <strong>heavy orders being accumulated with limit orders</strong>. A big buyer cannot
          put market orders. To buy 5 lakh, they need 5 lakh sellers, so they keep the market in a range until all the
          orders are filled.
        </p>
        <div className="card-elevated my-6 rounded-2xl border border-border bg-card p-5">
          <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <AccStep icon={Building} hue="green" title="Big buyer" big="5 lakh" sub="to buy" />
            <Arrow />
            <AccStep icon={ListOrdered} hue="accent" title="Limit orders only" big="No" sub="market orders" />
            <Arrow />
            <AccStep icon={Users} hue="red" title="Needs sellers" big="5 lakh" sub="sellers to match" />
          </div>
          <div className="mt-5 rounded-xl bg-secondary/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <MoveHorizontal className="h-4 w-4 text-bull" /> Market kept in a range while orders fill
              </span>
              <span className="text-xs text-muted-foreground">then Mark Up</span>
            </div>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-card ring-1 ring-border">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                <span
                  key={k}
                  className="h-full flex-1 border-r border-card last:border-r-0"
                  style={{ backgroundColor: `color-mix(in oklch, var(--color-bull) ${20 + k * 10}%, transparent)` }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Every swing inside the range fills more of the buy orders.</p>
          </div>
        </div>

        <h3>Once the orders are filled: the breakout</h3>
        <p>
          When the full orders are accumulated, they place some <strong>high market buy orders</strong>. The breakout
          happens, <strong>retailers join</strong>, and the market goes up further. This is where price leaves the
          accumulation range and Mark Up begins.
        </p>
        <BreakoutDiagram />
        <Flow items={["Orders fully accumulated", "Big market buy orders", "Breakout", "Retailers join", "Market goes up further"]} />

        <h3>At the top: distribution or re-accumulation</h3>
        <p>
          Once the market has gone up, what happens next depends on the big player's plan. They either distribute and take
          the market down, or re-accumulate and bring it up further.
        </p>
        <ForkDiagram />
        <Scenarios
          items={[
            {
              tag: "Distribution at the top",
              tone: "bear",
              when: "the big player wants to exit",
              then: "they keep sell limit orders and also short the market. The market goes down, retailers participate, and it goes down further.",
            },
            {
              tag: "Re-accumulation",
              tone: "bull",
              when: "the big player wants the market to go further up",
              then: "they re-accumulate and bring the market up again.",
            },
          ]}
        />
        <Callout kind="tip" title="It is based on their plan">
          <p>A range at the top is not automatically distribution. The big player's plan decides whether it becomes distribution or re-accumulation.</p>
        </Callout>
        <WyckoffCycle title="Wyckoff market cycle, redrawn" caption="Events marked along the price path, as on the slide" />
        <Compare
          columns={["Phase", "Events on the slide"]}
          rows={[
            [{ v: "Accumulation", tone: "bull" }, "Selling Climax · Spring · Low volume failed sell-off (Test)"],
            [{ v: "Mark Up", tone: "bull" }, "Jump the Creek · Low volume sell-offs"],
            [{ v: "Distribution", tone: "bear" }, "Buying Climax · Failed Rally · Test · Low volume rally"],
            [{ v: "Mark Down", tone: "bear" }, "Break the Ice · Break out with volume"],
          ]}
        />
        <Figure
          src="market-profile/03-live-1/02-wyckoff-market-cycle.png"
          alt="Slide: Market cycle, Wyckoff logic with the four market phases"
          caption="Market cycle slide from the class"
          width="md"
        />
      </Section>

      <Section title="What is Market Profile?">
        <IconGrid
          cols={3}
          items={[
            {
              icon: UsersRound,
              title: "A visualisation tool",
              body: "To understand traders' behaviour and price behaviour.",
              hue: "accent",
            },
            {
              icon: HeartPulse,
              title: "Price distribution",
              body: "Records market activity as a price distribution, giving more meaningful information about traders' behaviour and emotions.",
              hue: "violet",
            },
            {
              icon: ChartColumnIncreasing,
              title: "The crowd",
              body: "Helps intraday and short-term traders understand what the market as a crowd is doing.",
              hue: "teal",
            },
          ]}
        />
        <div className="my-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-center text-primary-foreground shadow-lg">
          <Scale className="h-7 w-7 text-gold" />
          <p className="font-display text-xl font-semibold md:text-2xl">
            An MP trader is a <span className="rounded-md bg-gold px-2 py-0.5 text-primary">VALUE</span> based trader
          </p>
        </div>
        <Figure
          src="market-profile/03-live-1/04-what-is-market-profile.png"
          alt="Slide: What is Market Profile? Three points and 'MP trader is VALUE based trader'"
          caption="Slide from the class"
          width="md"
        />
      </Section>

      <Section title="What Market Profile is not">
        <div className="my-6 grid gap-4 sm:grid-cols-2">
          <NotCard icon={Gauge} article="an" label="Indicator" />
          <NotCard icon={Route} article="a" label="Strategy" />
        </div>
        <p>
          Market Profile is neither an indicator nor a strategy. It is a way of reading the market:{" "}
          <strong>we approach the market based on value, not based on price.</strong>
        </p>
        <div className="card-elevated my-6 grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
          <div className="flex items-start gap-4 border-b border-border bg-bull/6 p-5 md:border-b-0 md:border-r">
            <CircleCheck className="h-8 w-8 shrink-0 text-bull" />
            <div>
              <p className="font-display text-xl font-bold text-bull">Based on value</p>
              <p className="mt-1 text-[15px] text-muted-foreground">
                Where the market accepts trade: the value area (fair price) and the POC.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5">
            <CircleX className="h-8 w-8 shrink-0 text-muted-foreground/60" />
            <div>
              <p className="font-display text-xl font-bold text-muted-foreground line-through decoration-bear decoration-2">
                Based on price
              </p>
              <p className="mt-1 text-[15px] text-muted-foreground">Not the price level on its own.</p>
            </div>
          </div>
        </div>
        <Figure
          src="market-profile/03-live-1/03-what-market-profile-is-not.png"
          alt="Slide: What Market profile is not: Indicator, Strategy (both crossed out)"
          caption="Slide from the class"
          width="md"
        />
      </Section>

      <Section title="Why value, not price: candle manipulation">
        <p>
          We look for value because <strong>price and candles can easily be manipulated</strong>. A big red candle says the
          market should come down, but it goes up. Inside the red candle there were <strong>28 lots more buyers</strong>{" "}
          than sellers: the candle colour hid what was really happening.
        </p>
        <div className="card-elevated my-6 grid gap-6 rounded-2xl border border-border bg-card p-5 lg:grid-cols-[auto_1fr]">
          <FootprintCandle />
          <div className="flex flex-col justify-center gap-3">
            <div className="flex items-start gap-3 rounded-xl bg-bear/6 p-4">
              <Eye className="mt-0.5 h-5 w-5 shrink-0 text-bear" />
              <div>
                <p className="font-display font-semibold text-bear">What the candle shows</p>
                <p className="text-[15px] text-muted-foreground">A big red candle: sellers won, the market should come down.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-bull/6 p-4">
              <Brain className="mt-0.5 h-5 w-5 shrink-0 text-bull" />
              <div>
                <p className="font-display font-semibold text-bull">What the order flow shows</p>
                <p className="text-[15px] text-muted-foreground">Delta +28: 28 lots more buyers. The market goes up.</p>
              </div>
            </div>
            <Callout kind="warning" title="Price and candle colour manipulation">
              <p>This is an example of price manipulation and candle colour manipulation. Read value and order flow, not the candle colour.</p>
            </Callout>
          </div>
        </div>
        <AnnotatedFigure
          src="market-profile/03-live-1/05-nifty-footprint-red-candle.png"
          alt="NIFTY-I 5-minute footprint chart in Quantower with a red candle circled and its delta of 28 circled below"
          caption="NIFTY-I 5-minute footprint (order flow) chart, 23-09-26, from the class"
          marks={[
            { x: 40.5, y: 38, text: "The red candle (circled in class)." },
            {
              x: 44.5,
              y: 86,
              text: "Its delta, circled in the bottom row: +28, so 28 lots more buyers inside a red candle. The row under it is cumulative delta (1,604 + 28 = 1,632).",
            },
          ]}
        />
      </Section>

      <Section title="Professional analysis tools">
        <p>Three tools, each built from a different mix of market data:</p>
        <div className="my-6 grid gap-4 lg:grid-cols-3">
          <ToolCard title="Market Profile" formula={["Price", "Time"]} hue="accent" art={<MiniTpo />}>
            How long the market traded at each price (TPO letters).
          </ToolCard>
          <ToolCard title="Volume Profile" formula={["Volume", "Price"]} hue="violet" art={<MiniVolume />}>
            How much volume traded at each price. The longest bar is the price where most of the day's volume traded.
          </ToolCard>
          <ToolCard title="Order Flow Analysis" hue="green" art={<MiniFootprint />}>
            The buy and sell orders inside each candle, like the delta +28 in the red candle above.
          </ToolCard>
        </div>
        <Figure
          src="market-profile/03-live-1/06-professional-analysis-tools.png"
          alt="Slide: Professional Analysis Tool: Market Profile (price + time), Volume Profile (volume + price), Order Flow Analysis"
          caption="Slide from the class"
          width="md"
        />
      </Section>

      <Section title="Volume on the profile chart">
        <p>
          Volume is added into the market profile chart. <strong>High volume shows in yellow.</strong> When high volume
          occurs at the <strong>VAH, VAL or POC</strong>, it is super important.
        </p>
        <HighVolumeDiagram />
        <Callout kind="rule" title="High volume at a key level">
          <p>High volume at the VAH, the VAL or the POC is super important. Watch those levels first.</p>
        </Callout>
        <AnnotatedFigure
          src="market-profile/03-live-1/07-nifty-tpo-high-volume.png"
          alt="NIFTY-I daily TPO chart in Quantower with high-volume bars in yellow"
          caption="NIFTY-I daily TPO chart with volume, 23-09-26, from the class"
          marks={[
            { x: 25, y: 13.4, text: "Header for the day: VAH 23,478 · POC 23,457 · VAL 23,429." },
            { x: 35.4, y: 60, text: "A high-volume bar (yellow), pointed out in class." },
            { x: 70, y: 61, text: "Another high-volume bar, ticked in class." },
          ]}
        />
      </Section>

      <Section title="Standard deviation and the bell curve">
        <p>
          A market profile follows the <strong>bell curve</strong> (normal distribution). Turn the curve on its side and
          it has the same shape as a balanced profile: most trading in the middle, thinning out towards the extremes.
        </p>
        <BellCurve title="Standard deviation levels" />
        <div className="card-elevated my-6 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col items-center gap-2">
            <SidewaysBell />
            <span className="text-xs font-medium text-muted-foreground">bell curve on its side</span>
          </div>
          <span className="font-display text-2xl font-bold text-muted-foreground">≈</span>
          <div className="w-32">
            <MiniProfile shape="normal" label="Balanced profile" />
          </div>
        </div>
        <Callout kind="definition" title="Value area ≈ one standard deviation">
          <p>
            About 68% of a bell curve lies within one standard deviation of the middle. That is why the value area is
            about 70% of the day's TPOs.
          </p>
        </Callout>
        <Figure
          src="market-profile/03-live-1/08-standard-deviation-bell-curve.png"
          alt="Slide: Standard deviation levels and bell curve in market profile"
          caption="Slide from the class"
          width="md"
        />
      </Section>

      <Section title="30-min candle vs market profile: split and composite">
        <p>
          Both charts use the same 30-minute periods. Each candle becomes <strong>one letter column</strong> covering its
          range; put the letters side by side at each price and you get the market profile.
        </p>
        <CandleToProfile dayCandle caption="Same periods (A to H). Prices are illustrative." />
        <Compare
          columns={["Profile", "Matches", "What it shows"]}
          rows={[
            ["Split 30-min profile", "30-min candles", "Each period in its own letter column"],
            ["Composite day profile", "The day candle", "All the day's periods collapsed into one profile"],
          ]}
        />
        <Columns>
          <Panel title="30-min candle chart">
            <p>Shows open, high, low and close of each period, in time order.</p>
          </Panel>
          <Panel title="Market profile chart">
            <p>Shows how much time the market spent at each price: where value is.</p>
          </Panel>
        </Columns>
        <Figure
          src="market-profile/03-live-1/09-30min-candle-vs-market-profile.png"
          alt="Slide: 30 min candle vs Market Profile chart"
          caption="Slide from the class"
          width="md"
        />
        <Figure
          src="market-profile/03-live-1/10-composite-and-split-profile.png"
          alt="Slide: Current day composite profile and split profile, next to the day candle and 30-min candles"
          caption="Composite day profile / day candle and split 30-min profile / 30-min candles, from the class"
          width="md"
        />
      </Section>

      <Section title="Open, high, low and close in a split profile">
        <p>
          In a split profile each period's letter column shows the same four prices as its candle. Take the A period:
        </p>
        <OhlcDiagram />
        <Terms
          items={[
            { term: "High", def: "The top of the period's letter column." },
            { term: "Low", def: "The bottom of the period's letter column." },
            { term: "Open", def: "Marked with the white arrow for the day's open. After that, each period opens at the previous period's close." },
            { term: "Close", def: "The white line under a letter. B's open is A's close." },
          ]}
        />
        <Callout kind="note" title="Gaps are ignored">
          <p>
            Gaps are ignored in market profile, because it is a <strong>context-building tool, not a trading tool</strong>.
          </p>
        </Callout>
        <Figure
          src="market-profile/03-live-1/11-open-close-high-low-split-profile.png"
          alt="Slide: How to find out open, close, high and low in an MP split profile chart"
          caption="Slide from the class"
          width="md"
        />
      </Section>

      <Section title="TPO size and half back">
        <p>
          One TPO is one letter at one price. Its height, the price range one box covers, depends on the instrument:
        </p>
        <StatStrip
          items={[
            { icon: Grid3x3, value: "24 pts", label: "1 TPO height in Bank Nifty", hue: "violet" },
            { icon: Grid3x3, value: "7 pts", label: "1 TPO height in Nifty", hue: "accent" },
          ]}
        />
        <TpoStack />
        <Callout kind="definition" title="Half back">
          <p>
            The <strong>half back</strong> is the exact half mark (50%) of the total height of the profile. It is shown as
            RED coloured TPOs.
          </p>
        </Callout>
        <ProfileChart
          title="Half back on a profile (illustrative)"
          showHalfBack
          ib=""
          showSingles={false}
          data={`
            22610 E
            22603 E
            22596 CDE
            22589 ACDEL
            22582 ACDEL
            22575 ABCDEFGKL
            22568 ABCDEFGKL
            22561 ABCDFGKLM
            22554 ABDFGKLM
            22547 ABDGKLM
            22540 ABDGKM
            22533 ABGJKM
            22526 ABGJK
            22519 ABGJ
            22512 ABGHJ
            22505 ABGHIJ
            22498 AHIJ
            22491 HI
            22484 HI
            22477 HI
            22470 H
          `}
          caption="Nifty-style rows 7 points apart. The half back sits halfway between the day's high and low."
        />
        <Figure
          src="market-profile/03-live-1/12-tpo-height-and-half-back.png"
          alt="Slide: TPO height (24 points Bank Nifty, 7 points Nifty) and half back"
          caption="Slide from the class"
          width="md"
        />
      </Section>

      <Section title="How a profile builds, period by period">
        <p>
          A market profile is created from <strong>time and TPOs</strong>. Every 30 minutes a new period starts, and its
          letter is printed at every price it traded. Press play, or tap a letter, to watch the day's profile grow from A
          (9:15) to H (1:15).
        </p>
        <ProfileBuilder
          title="Building the profile from the slide"
          step={2.5}
          periods={[
            { letter: "A", start: "9:15", end: "9:45", low: 9325, high: 9355 },
            { letter: "B", start: "9:45", end: "10:15", low: 9327.5, high: 9340 },
            { letter: "C", start: "10:15", end: "10:45", low: 9320, high: 9337.5 },
            { letter: "D", start: "10:45", end: "11:15", low: 9322.5, high: 9337.5 },
            { letter: "E", start: "11:15", end: "11:45", low: 9325, high: 9335 },
            { letter: "F", start: "11:45", end: "12:15", low: 9310, high: 9330 },
            { letter: "G", start: "12:15", end: "12:45", low: 9317.5, high: 9330 },
            { letter: "H", start: "12:45", end: "1:15", low: 9320, high: 9342.5 },
          ]}
          caption="Price ranges read from the slide's final (H) column; rows are 2.5 points apart."
        />
        <Callout kind="tip" title="What to notice">
          <p>
            A builds the first tall column. Later periods overlap A around the middle, so the rows there get longer: that is
            where the POC and value area form. F makes new lows below A, adding a thin tail at the bottom.
          </p>
        </Callout>
        <Figure
          src="market-profile/03-live-1/13-profile-building-by-time.png"
          alt="Table: how the market profile builds from 9:15 to 1:15, period A to H"
          caption="How the profile builds with time and TPOs, from the class"
          width="md"
        />
      </Section>

      <Section title="Questions and answers">
        <Pending title="Q&A">Any questions asked in the class, with the answers given.</Pending>
      </Section>
    </>
  );
}

function AuctionCard(props: { icon: LucideIcon; hue: Hue; title: string; body: string; shape: ShapeName }) {
  return (
    <div className="card-elevated flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <IconBubble icon={props.icon} hue={props.hue} />
          <p className="font-display text-lg font-semibold">{props.title}</p>
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{props.body}</p>
      </div>
      <div className="w-28 shrink-0">
        <MiniProfile shape={props.shape} />
      </div>
    </div>
  );
}

function AccStep(props: { icon: LucideIcon; hue: Hue; title: string; big: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
      <IconBubble icon={props.icon} hue={props.hue} size="lg" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{props.title}</p>
        <p className="font-display text-2xl font-bold leading-tight">{props.big}</p>
        <p className="text-sm text-muted-foreground">{props.sub}</p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-muted-foreground">
      <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
    </div>
  );
}

/** Accumulation range → big market buy → breakout → retailers join → markup, with volume under it. */
function BreakoutDiagram() {
  const range: [number, number][] = [
    [40, 205], [70, 175], [100, 235], [135, 178], [170, 232], [205, 180], [240, 235], [275, 178], [310, 230], [345, 182], [380, 200],
  ];
  const up: [number, number][] = [[380, 200], [430, 132], [458, 150], [560, 88], [588, 104], [720, 26]];
  const line = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  // volume: quiet in the range, a spike at the breakout, then retail participation
  const vol = [8, 10, 7, 12, 9, 8, 11, 10, 9, 12, 10, 9, 11, 10, 9, 64, 30, 26, 34, 28, 36, 30, 32, 27, 33, 29, 31, 28];
  const SPIKE = 15; // bar under the breakout
  const marks = [
    { x: 380, y: 200, n: 1, text: "Orders fully accumulated", dx: 10, dy: 22, anchor: "start" as const },
    { x: 430, y: 132, n: 2, text: "Big market buy orders → breakout", dx: -12, dy: -12, anchor: "end" as const },
    { x: 560, y: 88, n: 3, text: "Retailers join", dx: -16, dy: -14, anchor: "end" as const },
    { x: 720, y: 26, n: 4, text: "Market goes up further", dx: -14, dy: 4, anchor: "end" as const },
  ];
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 760 330" className="block h-auto w-full min-w-[560px]" role="img" aria-label="Breakout after accumulation">
            <rect x={36} y={168} width={348} height={74} rx={8} className="fill-bull/10" />
            <g className="stroke-bull/60" strokeDasharray="5 4" strokeWidth={1.5}>
              <line x1={36} x2={384} y1={172} y2={172} />
              <line x1={36} x2={384} y1={238} y2={238} />
            </g>
            <text x={46} y={160} className="fill-bull text-[12px] font-semibold">
              Accumulation range · limit orders
            </text>
            <path d={line(range)} className="fill-none stroke-foreground/70" strokeWidth={2.2} strokeLinejoin="round" />
            <path d={line(up)} className="fill-none stroke-bull" strokeWidth={3.2} strokeLinejoin="round" />

            {vol.map((h, i) => {
              const x = 40 + i * 25;
              const spike = i === SPIKE;
              return (
                <rect
                  key={i}
                  x={x}
                  y={320 - h}
                  width={14}
                  height={h}
                  rx={2}
                  className={spike ? "fill-bull" : i > SPIKE ? "fill-accent/50" : "fill-muted-foreground/25"}
                />
              );
            })}
            <text x={40} y={250 + 2} className="fill-muted-foreground text-[10.5px]" dy={12}>
              Volume
            </text>
            <text x={40 + SPIKE * 25 + 7} y={320 - 64 - 6} textAnchor="middle" className="fill-bull text-[10.5px] font-semibold">
              spike
            </text>

            {marks.map((m) => (
              <g key={m.n}>
                <circle cx={m.x} cy={m.y} r={10} className="fill-gold" stroke="white" strokeWidth={2} />
                <text x={m.x} y={m.y} textAnchor="middle" dominantBaseline="central" className="fill-white text-[11px] font-bold">
                  {m.n}
                </text>
                <text x={m.x + m.dx} y={m.y + m.dy} textAnchor={m.anchor} className="fill-foreground text-[12.5px] font-medium">
                  {m.text}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Quiet volume while orders fill in the range, a spike on the big market buy orders, then retail participation.
      </figcaption>
    </figure>
  );
}

/** After a markup: a range at the top that either distributes (down) or re-accumulates (up). */
function ForkDiagram() {
  const line = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const rise: [number, number][] = [[20, 300], [70, 250], [90, 262], [160, 190], [180, 202], [250, 150]];
  const range: [number, number][] = [[250, 150], [275, 122], [300, 176], [325, 124], [350, 174], [375, 122], [400, 176], [425, 124], [450, 172], [470, 150]];
  const up: [number, number][] = [[470, 150], [530, 100], [548, 112], [640, 58], [660, 70], [740, 26]];
  const down: [number, number][] = [[470, 150], [530, 206], [548, 194], [640, 262], [660, 250], [740, 316]];
  const marks = [
    { x: 530, y: 100, text: "Re-accumulate", cls: "fill-bull", dx: -6, dy: -14, anchor: "end" as const },
    { x: 740, y: 26, text: "Brought up further", cls: "fill-bull", dx: -12, dy: 4, anchor: "end" as const },
    { x: 530, y: 206, text: "Sell limit orders + short", cls: "fill-bear", dx: -6, dy: 22, anchor: "end" as const },
    { x: 640, y: 262, text: "Retailers participate", cls: "fill-bear", dx: -8, dy: 22, anchor: "end" as const },
    { x: 740, y: 316, text: "Down further", cls: "fill-bear", dx: -12, dy: 4, anchor: "end" as const },
  ];
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 760 340" className="block h-auto w-full min-w-[560px]" role="img" aria-label="Distribution or re-accumulation at the top">
            <rect x={246} y={112} width={228} height={76} rx={8} className="fill-gold/12" />
            <g className="stroke-gold/70" strokeDasharray="5 4" strokeWidth={1.5}>
              <line x1={246} x2={474} y1={118} y2={118} />
              <line x1={246} x2={474} y1={182} y2={182} />
            </g>
            <text x={256} y={104} className="fill-gold text-[12px] font-semibold">
              Range at the top
            </text>
            <text x={20} y={326} className="fill-muted-foreground text-[11px]">
              Mark Up
            </text>

            <path d={line(rise)} className="fill-none stroke-accent" strokeWidth={2.6} strokeLinejoin="round" />
            <path d={line(range)} className="fill-none stroke-foreground/70" strokeWidth={2.2} strokeLinejoin="round" />
            <path d={line(up)} className="fill-none stroke-bull" strokeWidth={2.8} strokeDasharray="8 5" strokeLinejoin="round" />
            <path d={line(down)} className="fill-none stroke-bear" strokeWidth={2.8} strokeDasharray="8 5" strokeLinejoin="round" />

            <g>
              <rect x={484} y={138} width={118} height={24} rx={12} className="fill-primary" />
              <text x={543} y={150} textAnchor="middle" dominantBaseline="central" className="fill-white text-[11px] font-semibold">
                Their plan decides
              </text>
            </g>

            {marks.map((m) => (
              <g key={m.text}>
                <circle cx={m.x} cy={m.y} r={5} className={m.cls} stroke="white" strokeWidth={1.5} />
                <text x={m.x + m.dx} y={m.y + m.dy} textAnchor={m.anchor} className={`${m.cls} text-[12px] font-medium`}>
                  {m.text}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-5 border-t-2 border-dashed border-bull" /> re-accumulation: up again
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-5 border-t-2 border-dashed border-bear" /> distribution: down
          </span>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        The same range at the top can lead either way, depending on the big player's plan.
      </figcaption>
    </figure>
  );
}

/** Merged profile with rising lows and its POC, then an open above it confirming the breakout. */
function ConfirmDiagram() {
  const pts: [number, number][] = [
    [60, 122], [95, 242], [135, 112], [175, 227], [215, 108], [255, 212], [295, 110], [335, 198], [375, 106], [415, 184], [455, 118],
  ];
  const lows = pts.filter((_, i) => i % 2 === 1);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 760 300" className="block h-auto w-full min-w-[560px]" role="img" aria-label="Early confirmation of a breakout">
            <rect x={50} y={96} width={416} height={160} rx={10} className="fill-accent/8" />
            <text x={60} y={86} className="fill-accent text-[12px] font-semibold">
              Merged profile · accumulation
            </text>

            {/* POC */}
            <line x1={50} x2={466} y1={160} y2={160} strokeDasharray="6 4" strokeWidth={2} className="stroke-gold" />
            <rect x={2} y={150} width={44} height={20} rx={6} className="fill-gold" />
            <text x={24} y={160} textAnchor="middle" dominantBaseline="central" className="fill-white text-[11px] font-bold">
              POC
            </text>

            <path d={path} className="fill-none stroke-foreground/75" strokeWidth={2.2} strokeLinejoin="round" />

            {/* higher lows */}
            <line x1={lows[0][0]} y1={lows[0][1] + 6} x2={lows[lows.length - 1][0] + 30} y2={lows[lows.length - 1][1] - 8} strokeDasharray="3 4" strokeWidth={2} className="stroke-bull" />
            {lows.map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r={5} className="fill-bull" stroke="white" strokeWidth={1.5} />
            ))}
            <text x={250} y={250} className="fill-bull text-[12px] font-semibold">
              Higher lows
            </text>

            {/* next day open */}
            <line x1={490} x2={490} y1={30} y2={270} strokeDasharray="2 5" className="stroke-muted-foreground/50" />
            <text x={498} y={284} className="fill-muted-foreground text-[11px]">
              next open
            </text>
            <path d="M520 70 L560 58 L575 66 L640 38 L655 46 L730 18" className="fill-none stroke-bull" strokeWidth={3} strokeLinejoin="round" />
            <circle cx={520} cy={70} r={7} className="fill-bull" stroke="white" strokeWidth={2} />
            <text x={532} y={96} className="fill-bull text-[12.5px] font-semibold">
              Opens above the merged profile
            </text>
            <text x={532} y={114} className="fill-foreground text-[12px]">
              → breakout confirmed
            </text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Higher lows and the POC inside the merged profile, then the open above it, confirm the breakout early.
      </figcaption>
    </figure>
  );
}

function NotCard({ icon: Icon, article, label }: { icon: LucideIcon; article: string; label: string }) {
  return (
    <div className="card-elevated relative flex items-center gap-4 overflow-hidden rounded-2xl border border-bear/30 bg-card p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bear/10 text-bear">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-bear">Not {article}</p>
        <p className="font-display text-2xl font-bold text-muted-foreground line-through decoration-bear decoration-[3px]">
          {label}
        </p>
      </div>
      <CircleX className="ml-auto h-8 w-8 shrink-0 text-bear" />
    </div>
  );
}

/** A red candle with a positive delta underneath, then price going up. */
function FootprintCandle() {
  return (
    <div className="flex flex-col items-center">
      <p className="eyebrow mb-3">The circled candle</p>
      <svg viewBox="0 0 220 200" width={220} height={200} role="img" aria-label="Red candle with delta +28, followed by price going up">
        <rect x={0} y={0} width={220} height={200} rx={14} fill="#0f1729" />
        {/* red candle */}
        <line x1={70} x2={70} y1={40} y2={160} stroke="#ef4444" strokeWidth={3} />
        <rect x={50} y={60} width={40} height={80} rx={4} fill="#ef4444" />
        {/* what came next */}
        <path d="M110 150 L130 132 L145 140 L170 100 L182 108 L205 52" fill="none" stroke="#22c55e" strokeWidth={3} strokeLinejoin="round" />
        <path d="M205 52 l-11 3 l7 8 z" fill="#22c55e" />
        <text x={70} y={186} textAnchor="middle" fill="#cbd5e1" fontSize={12}>
          red candle
        </text>
        <text x={160} y={186} textAnchor="middle" fill="#86efac" fontSize={12}>
          market goes up
        </text>
      </svg>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-lg bg-red-500/12 px-2.5 py-1 text-xs font-semibold text-red-700">Red candle</span>
        <span className="text-muted-foreground">but</span>
        <span className="rounded-lg bg-bull px-2.5 py-1 font-mono text-sm font-bold text-white">Δ +28</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">28 lots more buyers</p>
    </div>
  );
}

const TOOL_HUE: Record<"accent" | "violet" | "green", string> = {
  accent: "var(--color-accent)",
  violet: "oklch(0.52 0.13 300)",
  green: "oklch(0.55 0.11 160)",
};

function ToolCard(props: {
  title: string;
  formula?: string[];
  hue: "accent" | "violet" | "green";
  art: ReactNode;
  children: ReactNode;
}) {
  const c = TOOL_HUE[props.hue];
  return (
    <div className="card-elevated flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex h-36 items-center justify-center" style={{ background: `color-mix(in srgb, ${c} 10%, white)` }}>
        {props.art}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-lg font-bold" style={{ color: c }}>
          {props.title}
        </p>
        {props.formula && (
          <div className="mt-2 flex items-center gap-1.5">
            <Chip2 c={c}>{props.formula[0]}</Chip2>
            <span className="font-bold text-muted-foreground">+</span>
            <Chip2 c={c}>{props.formula[1]}</Chip2>
          </div>
        )}
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{props.children}</p>
      </div>
    </div>
  );
}

function Chip2({ c, children }: { c: string; children: ReactNode }) {
  return (
    <span className="rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: c }}>
      {children}
    </span>
  );
}

function MiniTpo() {
  const rows = ["B", "BC", "ABCD", "ABCDEF", "ACDEFGH", "ADEFG", "AEF", "A"];
  return (
    <svg viewBox="0 0 150 120" width={150} height={120} aria-hidden>
      {rows.map((r, i) =>
        [...r].map((ch, j) => (
          <text
            key={`${i}-${j}`}
            x={20 + j * 15}
            y={14 + i * 14}
            className={`font-mono text-[11px] ${i === 4 ? "fill-gold font-bold" : ch === "A" || ch === "B" ? "fill-accent font-bold" : "fill-foreground/70"}`}
          >
            {ch}
          </text>
        )),
      )}
    </svg>
  );
}

function MiniVolume() {
  const bars = [10, 18, 30, 44, 62, 96, 70, 48, 32, 20, 12];
  return (
    <svg viewBox="0 0 150 120" width={150} height={120} aria-hidden>
      {bars.map((w, i) => (
        <rect key={i} x={6} y={6 + i * 10} width={w * 0.8 + 6} height={8} rx={2} fill={i === 5 ? "var(--color-gold)" : "oklch(0.52 0.13 300 / 0.55)"} />
      ))}
      <text x={126} y={62} textAnchor="middle" className="fill-gold text-[9px] font-semibold">
        most
      </text>
      <text x={126} y={72} textAnchor="middle" className="fill-gold text-[9px] font-semibold">
        volume
      </text>
    </svg>
  );
}

function MiniFootprint() {
  const cells: [number, number][] = [
    [3, 12],
    [8, 21],
    [34, 19],
    [15, 40],
    [6, 2],
  ];
  return (
    <svg viewBox="0 0 150 120" width={150} height={120} aria-hidden>
      <rect x={20} y={6} width={110} height={108} rx={8} fill="#0f1729" />
      {cells.map(([s, b], i) => (
        <g key={i}>
          <rect x={30} y={14 + i * 19} width={38} height={15} rx={3} fill={s > b ? "#7f1d1d" : "#1e293b"} />
          <text x={49} y={25 + i * 19} textAnchor="middle" fill="#fecaca" fontSize={10} fontFamily="monospace">
            {s}
          </text>
          <rect x={82} y={14 + i * 19} width={38} height={15} rx={3} fill={b > s ? "#14532d" : "#1e293b"} />
          <text x={101} y={25 + i * 19} textAnchor="middle" fill="#bbf7d0" fontSize={10} fontFamily="monospace">
            {b}
          </text>
        </g>
      ))}
      <rect x={72} y={14} width={6} height={91} rx={2} fill="#22c55e" />
    </svg>
  );
}

/** A profile with VAH / POC / VAL and yellow high-volume bars, two of them at key levels. */
function HighVolumeDiagram() {
  const counts = [1, 2, 3, 5, 6, 8, 9, 10, 9, 7, 5, 4, 3, 2, 1];
  const rows = counts.map((n, i) => ({ price: counts.length - i, tpos: "x".repeat(n) }));
  const { poc, vahIdx, valIdx } = analyseProfile(rows);
  const R = 18;
  const y = (i: number) => 10 + i * R;
  const hv: { i: number; len: number; key: boolean; text: string }[] = [
    { i: vahIdx, len: 120, key: true, text: "at VAH: super important" },
    { i: poc, len: 170, key: true, text: "at POC: super important" },
    { i: valIdx + 3, len: 70, key: false, text: "high volume" },
  ];
  const levels = [
    { i: vahIdx, label: "VAH", cls: "fill-accent" },
    { i: poc, label: "POC", cls: "fill-gold" },
    { i: valIdx, label: "VAL", cls: "fill-accent" },
  ];
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 640 290" className="block h-auto w-full min-w-[520px]" role="img" aria-label="High volume at key levels">
            <rect x={56} y={y(vahIdx) - 2} width={200} height={(valIdx - vahIdx + 1) * R + 4} rx={6} className="fill-accent/10" />
            {counts.map((n, i) => (
              <rect key={i} x={60} y={y(i) + 2} width={n * 18} height={R - 4} rx={3} className={i === poc ? "fill-gold/70" : "fill-accent/45"} />
            ))}
            {levels.map((l) => (
              <text key={l.label} x={48} y={y(l.i) + R / 2} textAnchor="end" dominantBaseline="central" className={`${l.cls} font-mono text-[12px] font-bold`}>
                {l.label}
              </text>
            ))}
            {hv.map((h) => (
              <g key={h.i}>
                <rect x={270} y={y(h.i) + 3} width={h.len} height={R - 6} rx={3} fill="#facc15" />
                <text x={270 + h.len + 10} y={y(h.i) + R / 2} dominantBaseline="central" className={h.key ? "fill-foreground text-[12.5px] font-semibold" : "fill-muted-foreground text-[12px]"}>
                  {h.key ? "★ " : ""}
                  {h.text}
                </text>
              </g>
            ))}
            <text x={270} y={284} className="fill-muted-foreground text-[11px]">
              yellow = high volume at that price
            </text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        High volume that lines up with the VAH, VAL or POC matters most.
      </figcaption>
    </figure>
  );
}

/** One period (A) as a letter column next to its candle, with high / open / close / low marked. */
function OhlcDiagram() {
  const C = 24;
  const top = 16;
  const y = (row: number) => top + row * C;
  const A = { high: 0, low: 11, open: 8, close: 9 };
  const B = { high: 6, low: 13 };
  const labels = [
    { row: A.high, text: "HIGH" },
    { row: A.open, text: "OPEN" },
    { row: A.close, text: "CLOSE" },
    { row: A.low, text: "LOW" },
  ];
  const candleX = 300;
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 560 360" className="mx-auto block h-auto w-full min-w-[480px] max-w-2xl" role="img" aria-label="Open, high, low and close of the A period">
            <rect x={70} y={4} width={420} height={352} rx={12} fill="#0f1729" />
            {labels.map((l) => (
              <text key={l.text} x={62} y={y(l.row) + C / 2} textAnchor="end" dominantBaseline="central" className="fill-bear text-[12px] font-bold">
                {l.text}
              </text>
            ))}
            {Array.from({ length: A.low - A.high + 1 }, (_, k) => (
              <g key={`a${k}`}>
                <rect x={100} y={y(A.high + k) + 1} width={C - 2} height={C - 2} rx={2} fill="#ef4444" />
                <text x={100 + (C - 2) / 2} y={y(A.high + k) + C / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill="#0f1729">
                  A
                </text>
              </g>
            ))}
            {Array.from({ length: B.low - B.high + 1 }, (_, k) => (
              <g key={`b${k}`}>
                <rect x={126} y={y(B.high + k) + 1} width={C - 2} height={C - 2} rx={2} fill="#f97316" />
                <text x={126 + (C - 2) / 2} y={y(B.high + k) + C / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill="#0f1729">
                  B
                </text>
              </g>
            ))}
            {/* open arrow and close line */}
            <path d={`M84 ${y(A.open) + 5} l12 7 l-12 7 z`} fill="white" />
            <rect x={100} y={y(A.close) + C - 4} width={C - 2} height={3} fill="white" />
            <text x={156} y={y(A.close) + C / 2} dominantBaseline="central" className="text-[11px]" fill="#fdba74">
              ← B opens at A's close
            </text>

            {/* the A candle */}
            <line x1={candleX} x2={candleX} y1={y(A.high) + 2} y2={y(A.low) + C - 2} stroke="#f97316" strokeWidth={2} />
            <rect x={candleX - 14} y={y(A.open) + C / 2} width={28} height={(A.close - A.open) * C} fill="#f97316" rx={2} />
            {[
              { row: A.high, t: "H", dy: 4 },
              { row: A.open, t: "O", dy: C / 2 },
              { row: A.close, t: "C", dy: C / 2 },
              { row: A.low, t: "L", dy: C - 4 },
            ].map((m) => (
              <g key={m.t}>
                <line x1={candleX + 20} x2={candleX + 60} y1={y(m.row) + m.dy} y2={y(m.row) + m.dy} stroke="#94a3b8" strokeDasharray="3 3" />
                <text x={candleX + 68} y={y(m.row) + m.dy} dominantBaseline="central" fill="#e2e8f0" fontSize={12} fontWeight={700}>
                  {m.t}
                </text>
              </g>
            ))}
            <text x={candleX} y={346} textAnchor="middle" fill="#94a3b8" fontSize={11}>
              A as a candle
            </text>
            <text x={124} y={346} textAnchor="middle" fill="#94a3b8" fontSize={11}>
              A and B letter columns
            </text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        White arrow = open · white line = close · top and bottom of the column = high and low.
      </figcaption>
    </figure>
  );
}

/** 8 TPOs stacked vs 1 TPO, with what that means in points. */
function TpoStack() {
  return (
    <div className="card-elevated my-6 flex flex-wrap items-end justify-center gap-10 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col items-center">
        <p className="mb-2 text-sm font-semibold">8 TPOs</p>
        <div className="flex flex-col gap-0.5 border-l-4 border-violet-500 pl-1">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="flex h-7 w-8 items-center justify-center rounded-sm bg-red-500 font-display font-bold text-[#0f1729]">
              A
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="mb-2 text-sm font-semibold">1 TPO</p>
        <span className="flex h-7 w-8 items-center justify-center rounded-sm bg-red-500 font-display font-bold text-[#0f1729]">A</span>
      </div>
      <div className="max-w-xs space-y-2 text-sm">
        <p className="rounded-xl bg-secondary/70 px-3 py-2">
          <b>Bank Nifty:</b> 8 TPOs × 24 = <b>192 points</b> of range
        </p>
        <p className="rounded-xl bg-secondary/70 px-3 py-2">
          <b>Nifty:</b> 8 TPOs × 7 = <b>56 points</b> of range
        </p>
      </div>
    </div>
  );
}