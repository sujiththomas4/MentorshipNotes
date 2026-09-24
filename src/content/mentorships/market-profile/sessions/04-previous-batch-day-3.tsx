import { Clock, Crosshair, Hourglass, Layers, Sunrise, Target, Timer } from "lucide-react";
import {
  AnnotatedFigure,
  Callout,
  CandleToProfile,
  Columns,
  Compare,
  Figure,
  Flow,
  IconGrid,
  Panel,
  Pending,
  ProfileBuilder,
  ProfileChart,
  Scenarios,
  Section,
  StatStrip,
  Steps,
  TermCards,
  Terms,
} from "@/components/notes";
import { Link } from "@tanstack/react-router";
import type { SessionMeta } from "@/content";

/*
 * Screenshots for this session: public/screenshots/market-profile/04-previous-batch-day-3/
 */
export const meta: SessionMeta = {
  number: 4,
  title: "Previous Batch Day 3",
  kind: "recorded",
  status: "draft",
  summary:
    "The 13 TPO periods (A to M), candlestick chart vs market profile, a selling tail day and next-day rejection, why the day candle lacks context, tracking option sellers with the ODX profile, the market profile terminology with the value area, the POC and its types, fair vs unfair value, tails and poor highs, and trend identification with value migration.",
  tags: ["recorded", "previous batch", "TPO periods", "selling tail", "ODX"],
  recording: {
    url: "https://us06web.zoom.us/rec/share/qcLZuY5wYrPKChVPiffNvTysMwSpEJrKwuRSgbPrPD6U3Zw8Bj-IsihuW4xVksrP.OqOH8O1KfIuSya6v",
    passcode: "3India@1408",
    date: "2026-08-14",
    note: "Previous batch class recording of Day 3, for basic familiarisation and terminology.",
  },
  keyPoints: [
    "The trading day has 13 TPO periods: A (9:15–9:45) to L (2:45–3:15) are 30 minutes each; M (3:15–3:30) is only 15 minutes.",
    "Each letter is one 30-minute candle. The candlestick chart lays the periods out by time; the market profile stacks the same periods by price.",
    "Selling tail day: a long column of single prints at the top of the profile shows sellers rejected those prices.",
    "Next day the market was rejected again at the selling tail: sellers are positioned in the selling tail area, so context is important.",
    "A day candle alone cannot give this context; the profile shows where the rejection happened.",
    "The ODX profile and ODX range profile are used to track option sellers.",
    "Value area (fair price in intraday): where 68–70% of the market was spent in a day, the attractive price for buyers and sellers. VAH is its top edge, VAL its bottom edge.",
    "When the market opened below the previous day's VAL, it trended on the downside.",
    "Open inside the previous day's VAH & VAL: it can go sideways, or be rejected and leave a selling tail. It is a probability only, not a sure shot.",
    "Fair value = the value area around the POC. Above it is premium (costly, unfair) value; below it is discount (cheap, unfair) value.",
    "Short-term participants bring the market from unfair value back to fair value (sell costly, buy cheap): responsive activity, the expected behaviour.",
    "If the market goes away from fair value (buying in premium or selling in discount), long-term players are coming: initiative activity, unexpected behaviour.",
    "POC = where most time was spent in a day, the fairest price in intraday. It attracts price, so it can be used as a target.",
    "A POC is valid until a later profile crosses it. Untouched = valid (virgin POC); once touched the next day, it is invalid.",
    "POC types: up to 8 TPOs = POC, more than 9 TPOs = Prominent POC (PPOC), untouched POC = Virgin POC (VPOC).",
    "PPOC has more magnetic power: more transactions happened there. A PPOC day is evidence of smart money hiding and adding.",
    "To know who was adding at a PPOC, wait for the next day: opening above = buyers; opening below the previous day's low = sellers.",
    "PPOC (9 TPOs or more) is the short-term player's reference: short-term money creates value there and brings the short-term trend (value migration).",
    "Example (range-bound day): seller presence at a PPOC was confirmed by the next day opening below VAL and going down.",
    "If the market opens between two PPOCs, either one acts as support or resistance. POC, VPOC and VPPOC are the real support and resistance.",
    "Example: after emotional selling left single prints, the market went back to the untouched POC in 2 days. The POC attracts price, so it works as a target.",
    "Selling tail = single TPOs on top of the profile (selling pressure); buying tail = single TPOs at the bottom (buying pressure). The longer the tail, the stronger the pressure.",
    "Key note: a tail created at the starting point of a swing is very important. The market can come back and take support (buying tail) or resistance (selling tail) there.",
    "Poor high / poor low = no tail. Higher high = good high (finished business); lower low = good low.",
    "Poor high: the top is unfinished business of the buyer. Price is likely to come back to revisit / repair it, and it can break.",
    "Poor high / low = a day high or low without a tail or excess. Types: normal (can be ignored) and AB poor high/low (important).",
    "AB poor high/low: +1 to 2 ticks/TPOs at the high or low where two periods ended. It acts as support/resistance and is used as a target; more powerful than a normal poor high/low.",
    "The 5-day revisit (Auction Market Theory) is only theory, not a trading rule. If not revisited in 5 days, the area becomes strong support/resistance.",
    "Tail = 2 TPOs at the top or bottom of the profile; excess = more than 2 TPOs.",
    "Identify the trend with VALUE migration, not price movement: value built higher day after day = uptrend; value built lower = downtrend.",
    "Terminology: TPO, value area, VAH, VAL, POC, single print, buying tail, selling tail, virgin POC, half back and PPOC.",
  ],
};

/** The day's periods: letter, start and end time. */
const TIMES: [string, string, string][] = [
  ["A", "9:15", "9:45"],
  ["B", "9:45", "10:15"],
  ["C", "10:15", "10:45"],
  ["D", "10:45", "11:15"],
  ["E", "11:15", "11:45"],
  ["F", "11:45", "12:15"],
  ["G", "12:15", "12:45"],
  ["H", "12:45", "1:15"],
  ["I", "1:15", "1:45"],
  ["J", "1:45", "2:15"],
  ["K", "2:15", "2:45"],
  ["L", "2:45", "3:15"],
  ["M", "3:15", "3:30"],
];

// rainbow like the TPO chart
const HUE = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#a3e635", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"];

/*
 * Each period's range, read from the slide's market profile (row 0 = bottom). Opens and
 * closes chain (each period opens at the previous close) and are illustrative.
 */
const DAY = [
  { letter: "A", low: 2, high: 13, open: 4, close: 7 },
  { letter: "B", low: 0, high: 7, open: 7, close: 2 },
  { letter: "C", low: 2, high: 9, open: 2, close: 8 },
  { letter: "D", low: 6, high: 11, open: 8, close: 10 },
  { letter: "E", low: 10, high: 18, open: 10, close: 16 },
  { letter: "F", low: 11, high: 16, open: 16, close: 12 },
  { letter: "G", low: 7, high: 14, open: 12, close: 9 },
  { letter: "H", low: 9, high: 13, open: 9, close: 12 },
  { letter: "I", low: 9, high: 13, open: 12, close: 10 },
  { letter: "J", low: 5, high: 11, open: 10, close: 6 },
  { letter: "K", low: 3, high: 9, open: 6, close: 4 },
  { letter: "L", low: 0, high: 7, open: 4, close: 1 },
  { letter: "M", low: 1, high: 5, open: 1, close: 3 },
];

// illustrative Nifty-style prices: one row = one TPO = 7 points
const BASE = 23300;
const px = (row: number) => BASE + row * 7;

export default function PreviousBatchDay3() {
  return (
    <>
      <StatStrip
        items={[
          { icon: Clock, value: "13", label: "TPO periods, A to M", hue: "accent" },
          { icon: Sunrise, value: "9:15", label: "A starts at the open", hue: "green" },
          { icon: Timer, value: "30 min", label: "each period, A to L", hue: "violet" },
          { icon: Hourglass, value: "15 min", label: "M only: 3:15 – 3:30", hue: "amber" },
        ]}
      />

      <Section title="The day's periods, A to M">
        <p>
          Each 30-minute period of the day gets a letter, starting with <strong>A at 9:15</strong>. The last period,{" "}
          <strong>M</strong>, runs only 15 minutes, to the 3:30 close.
        </p>
        <div className="my-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {TIMES.map(([l, s, e], i) => (
            <div key={l} className="card-elevated flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-lg font-bold text-[#0f1729]"
                style={{ backgroundColor: HUE[i] }}
              >
                {l}
              </span>
              <span className="font-mono text-xs leading-tight">
                {s}
                <span className="block text-muted-foreground">{e}</span>
                {l === "M" && <span className="block font-sans font-semibold text-amber-700">15 min</span>}
              </span>
            </div>
          ))}
        </div>
        <TimeBar />
      </Section>

      <Section title="Normal candlestick chart vs market profile chart">
        <p>
          The same 13 periods, drawn two ways. The candlestick chart lays them out <strong>by time</strong>, one candle per
          period. The market profile puts the same letters <strong>by price</strong>, side by side, so you see where the
          market spent its time.
        </p>
        <CandleToProfile periods={DAY} dayCandle caption="Ranges read from the slide's profile; opens, closes and prices are illustrative." />
        <Columns>
          <Panel title="Candlestick chart">
            <p>Open, high, low and close of each period, left to right in time order. Good for seeing the direction.</p>
          </Panel>
          <Panel title="Market profile chart">
            <p>The same periods stacked at each price. Good for seeing value: where the day was accepted.</p>
          </Panel>
        </Columns>
        <Compare
          columns={["", "Candlestick chart", "Market profile chart"]}
          rows={[
            ["Organised by", "Time", "Price"],
            ["One period is", "One candle", "One letter column"],
            ["Shows best", "Direction, momentum", "Value, acceptance, rejection"],
          ]}
        />
        <Figure
          src="market-profile/04-previous-batch-day-3/01-candlestick-vs-market-profile.png"
          alt="Slide: period times A to M, a normal candlestick chart and the market profile chart of the same day"
          caption="Period times, candlestick chart and market profile chart, from the recording"
          width="md"
        />
      </Section>

      <Section title="Watch the day build">
        <ProfileBuilder
          title="The slide's day, period by period"
          step={7}
          periods={DAY.map((d, i) => ({
            letter: d.letter,
            start: TIMES[i][1],
            end: TIMES[i][2],
            low: px(d.low),
            high: px(d.high),
          }))}
          caption="Shape from the slide; prices are illustrative (7 points per row, like Nifty)."
        />
      </Section>

      <Section title="Selling tail day">
        <p>
          On a <strong>selling tail day</strong> the market opens, the A period auctions up and gets sold off hard. It leaves
          a long column of <strong>single prints at the top</strong> of the profile: prices where buyers could not hold
          and sellers took over. That is the selling tail.
        </p>
        <p>
          The next day the market came back up towards that area and was{" "}
          <strong>rejected again at the selling tail</strong>, leaving another tail. Sellers are positioned in the selling tail area, and the following days could not get
          back above it.
        </p>
        <SellingTailDiagram />
        <Callout kind="rule" title="Context first">
          <p>
            A selling tail from an earlier day marks where sellers are positioned. When price comes back to that area,
            watch for rejection there. Without this context you would not know the area matters.
          </p>
        </Callout>
        <div className="grid gap-4 md:grid-cols-2">
          <Figure
            src="market-profile/04-previous-batch-day-3/02-selling-tail-next-day.png"
            alt="Two daily profiles: a selling tail on day 1 and a rejection tail the next day"
            caption="Selling tail, then next-day rejection at the tail"
            width="md"
          />
          <Figure
            src="market-profile/04-previous-batch-day-3/03-selling-tail-following-days.png"
            alt="The following days stay below the next-day selling tail"
            caption="The following days stay below the line"
          />
        </div>
        <AnnotatedFigure
          src="market-profile/04-previous-batch-day-3/04-sellers-in-selling-tail-area.png"
          alt="Daily profiles with the selling tail area bracketed"
          caption="Sellers are positioned in the selling tail area"
          marks={[
            { x: 7, y: 16, text: "Day 1: the selling tail, a long column of A single prints at the top." },
            { x: 32, y: 32, text: "Next day: rejected again at the tail, leaving another selling tail." },
            { x: 64, y: 22, text: "The selling tail area (bracketed in class): sellers are positioned here." },
            { x: 74, y: 44, text: "The following days stay below the line." },
          ]}
        />
      </Section>

      <Section title="Why context matters: the day candle vs the profile">
        <p>
          The same days as daily candles show two red candles, a small candle and a green candle. The{" "}
          <strong>day candle alone cannot give this context</strong>: it does not show the selling tail, or that sellers
          are waiting in that area.
        </p>
        <Columns>
          <Panel title="Day candle" tone="bear">
            <p>Open, high, low, close. A wick shows price went there, not whether sellers are positioned there.</p>
          </Panel>
          <Panel title="Market profile" tone="bull">
            <p>The single prints of the selling tail show exactly where price was rejected, and where to expect sellers next time.</p>
          </Panel>
        </Columns>
        <Figure
          src="market-profile/04-previous-batch-day-3/06-profiles-vs-day-candles.png"
          alt="The same days as market profiles (left) and as daily candles (right)"
          caption="Profiles (left) vs day candles (right): the candles hide the selling tail"
        />
      </Section>

      <Section title="Tracking option sellers: ODX profile">
        <p>
          The <strong>ODX profile</strong> and the <strong>ODX range profile</strong> are used to track option sellers.
          They show call and put values strike by strike, next to the price chart, so you can see at which strikes option
          activity is heaviest while price moves in its range.
        </p>
        <IconGrid
          cols={2}
          items={[
            { icon: Layers, title: "ODX profile", body: "Call and put values at every strike, to track option sellers.", hue: "accent" },
            { icon: Crosshair, title: "ODX range profile", body: "The same view for a selected range, to track option sellers there.", hue: "violet" },
          ]}
        />
        <AnnotatedFigure
          src="market-profile/04-previous-batch-day-3/07-odx-profile.png"
          alt="Price chart ranging next to ODX ladders of call and put values by strike, 14-08-26"
          caption="ODX profile next to the price chart, 14-08-26, from the recording"
          marks={[
            { x: 22, y: 50, text: "Price moving in a range (boxed in class)." },
            { x: 69, y: 5, text: "Strike prices from 24,000 to 24,750, with CALL and PUT values in crores (Cr) and lakhs (L)." },
            { x: 58, y: 60, text: "Calls circled: 24,300 call −68.52 Cr is highlighted, the biggest (most negative) value in this column." },
            { x: 74, y: 64, text: "Puts circled: 24,300 put −56.73 Cr is highlighted." },
            { x: 88, y: 45, text: "Second CALL / PUT ladder: 24,350 call 20.05 Cr and 24,400 put −19.05 Cr highlighted." },
          ]}
        />
      </Section>

      <Section title="Market Profile terminology">
        <p>The terms used throughout the course. Each sketch highlights the part of the profile the term refers to.</p>
        <TermCards
          items={[
            { kind: "tpo", term: "TPO", abbr: "Time Price Opportunity", def: "One letter at one price: the market traded at that price during that 30-minute period." },
            { kind: "value-area", term: "Value area", abbr: "VA · fair price in intraday", def: "The area where 68–70% of the day's market activity was spent: the attractive price for both buyers and sellers." },
            { kind: "vah", term: "Value area high", abbr: "VAH", def: "The top edge of the value area." },
            { kind: "val", term: "Value area low", abbr: "VAL", def: "The bottom edge of the value area." },
            { kind: "poc", term: "Point of control", abbr: "POC", def: "Where most time was spent in a day: the fairest price in intraday. Up to 8 TPOs." },
            { kind: "single-print", term: "Single print", def: "Prices with only one TPO: the market moved through them fast, one-sided." },
            { kind: "buying-tail", term: "Buying tail", def: "Single TPOs at the bottom of the profile. Shows buying pressure: the longer the tail, the stronger." },
            { kind: "selling-tail", term: "Selling tail", def: "Single TPOs at the top of the profile. Shows selling pressure: the longer the tail, the stronger." },
            { kind: "selling-tail", term: "Tail / excess", def: "Tail = 2 single TPOs at the top or bottom of the profile. Excess = more than 2." },
            { kind: "virgin-poc", term: "Virgin point of control", abbr: "VPOC", def: "An untouched POC: no later profile has crossed it yet, so it is still valid." },
            { kind: "half-back", term: "Half back", def: "The exact 50% mark of the profile's total height, shown as red TPOs." },
            { kind: "poc", term: "Prominent point of control", abbr: "PPOC", def: "A POC with 9 TPOs or more: the short-term player's reference (see Point of control below)." },
          ]}
        />
        <Figure
          src="market-profile/04-previous-batch-day-3/08-terminology-list.png"
          alt="Slide: Market Profile terminology list"
          caption="Terminology slide from the recording"
          width="md"
        />
      </Section>

      <Section title="Selling tail, buying tail">
        <p>Read the market profile chart <strong>horizontally</strong>, row by row, and look for single TPOs at the ends.</p>
        <div className="my-6 grid gap-4 md:grid-cols-2">
          <div className="card-elevated rounded-2xl border border-bear/30 bg-card p-5">
            <p className="font-display text-lg font-bold text-bear">Selling tail</p>
            <p className="mt-1 text-[15px]">Single TPOs printed on the <strong>top</strong> of the profile.</p>
            <p className="mt-3 rounded-xl bg-bear/8 px-3 py-2 text-sm">
              <strong>Benefit:</strong> identifies the <strong>selling pressure</strong>. A long selling tail = strong selling pressure.
            </p>
          </div>
          <div className="card-elevated rounded-2xl border border-bull/30 bg-card p-5">
            <p className="font-display text-lg font-bold text-bull">Buying tail</p>
            <p className="mt-1 text-[15px]">Single TPOs printed on the <strong>bottom</strong> of the profile.</p>
            <p className="mt-3 rounded-xl bg-bull/8 px-3 py-2 text-sm">
              <strong>Benefit:</strong> identifies the <strong>buying pressure</strong>. A long buying tail = strong buying pressure.
            </p>
          </div>
        </div>

        <Callout kind="rule" title="Key note: tails at a swing starting point">
          <p>
            A tail created at the <strong>starting point of a swing</strong> is very important. The market can come back
            to it later and take <strong>support</strong> (a buying tail at a swing low) or <strong>resistance</strong> (a
            selling tail at a swing high).
          </p>
        </Callout>
        <SwingTailDiagram />
        <h3>Tail vs excess</h3>
        <TailExcessDiagram />
        <Compare
          columns={["", "Tail", "Excess"]}
          rows={[
            ["Single TPOs at the top or bottom", "2 TPOs", "More than 2 TPOs"],
            ["Where", "Upside or down side of the profile", "Upside or down side of the profile"],
          ]}
          caption="As defined on the slide"
        />
        <Callout kind="note" title="Another definition heard elsewhere">
          <p>
            Some sources say <strong>excess</strong> is when the <strong>A or B period</strong> letters are in the tail. This
            differs from the slide (which counts TPOs), so it is in{" "}
            <Link to="/mentorships/$mentorship/to-check" params={{ mentorship: "market-profile" }}>
              To be checked
            </Link>{" "}
            to confirm with the mentor.
          </p>
        </Callout>
        <AnnotatedFigure
          src="market-profile/04-previous-batch-day-3/17-selling-tail-buying-tail.png"
          alt="Slide: selling tail and buying tail definitions and benefits, tail vs excess, with two profiles"
          caption="Selling tail and buying tail, from the recording"
          marks={[
            { x: 18, y: 42, text: "Selling tail: a long column of A single prints at the top of the profile." },
            { x: 25, y: 88, text: "Buying tail: A single prints at the bottom of the second profile." },
          ]}
        />
      </Section>
      <Section title="Good high / poor high">
        <p>
          A <strong>poor high</strong> or <strong>poor low</strong> is where there is <strong>no tail</strong>. Before
          learning them, it is important to understand the <strong>good high</strong> and the <strong>good low</strong>.
        </p>
        <HighsDiagram />
        <div className="my-6 grid gap-4 md:grid-cols-2">
          <div className="card-elevated rounded-2xl border border-bull/30 bg-card p-5">
            <p className="eyebrow text-bull">Finished business</p>
            <p className="mt-1 font-display text-lg font-bold">Good high · good low</p>
            <p className="mt-2 text-[15px] leading-relaxed">
              <strong>Higher high = good high.</strong> The market goes higher because the business there is finished, so
              each new high is called a good high. In the same way, a <strong>lower low = good low</strong>.
            </p>
          </div>
          <div className="card-elevated rounded-2xl border border-amber-400/50 bg-card p-5">
            <p className="eyebrow text-amber-700">Unfinished business</p>
            <p className="mt-1 font-display text-lg font-bold">Poor high</p>
            <p className="mt-2 text-[15px] leading-relaxed">
              The market closed below the good high and made a lower low without creating a new high, so the top is{" "}
              <strong>unfinished business of the buyer</strong>. The buyer is still interested, and to finish the business
              may bring price back to that high: a <strong>revisit / repair</strong>, and it can break. This unfinished
              high is called a <strong>poor high</strong>.
            </p>
          </div>
        </div>
        <Callout kind="tip" title="What to expect">
          <p>A poor high is a level price is likely to come back to (revisit / repair). A good high is finished business.</p>
        </Callout>
        <Callout kind="definition" title="Poor high / poor low">
          <p>
            Any <strong>high or low</strong> of the day's profile <strong>without a tail or excess</strong> is a poor high /
            poor low.
          </p>
        </Callout>

        <h3>Types: normal vs AB poor high / low</h3>
        <div className="my-6 grid gap-4 md:grid-cols-2">
          <div className="card-elevated rounded-2xl border border-border bg-card p-5 opacity-80">
            <p className="font-display text-lg font-bold text-muted-foreground line-through decoration-2">Normal poor high / poor low</p>
            <p className="mt-2 text-[15px] text-muted-foreground">Can be ignored in trading (struck out on the slide).</p>
          </div>
          <div className="card-elevated rounded-2xl border-2 border-gold bg-card p-5">
            <p className="font-display text-lg font-bold">AB poor high / AB poor low</p>
            <p className="mt-2 text-[15px]">
              <strong>Important.</strong> More powerful than a normal poor high/low, and <strong>used as a target</strong> in
              trading.
            </p>
          </div>
        </div>
        <AbPoorLowDiagram />
        <Steps
          items={[
            { title: "Unfinished business", body: "The area where unfinished business happened: +1 to 2 ticks or TPOs at the high or low, and two periods ended there." },
            { title: "Support / resistance → target", body: "A poor high or low acts as support or resistance, so it can be used as a target." },
            { title: "An anomaly", body: "Per Auction Market Theory the market will revisit or repair it within 5 days. If not revisited in 5 days, the area becomes strong support or resistance." },
            { title: "Strong poor high / low", body: "Determined by seeing the market close at the opposite side." },
            { title: "AB beats normal", body: "An AB poor high/low is more powerful than a normal poor high/low." },
          ]}
        />
        <Callout kind="warning" title="The 5-day revisit is only theory">
          <p>
            We are <strong>not trading based on the 5-day revisit</strong>; it is just to understand the concept. What we
            use in trading is the <strong>AB poor high / low as a target</strong>. Normal poor highs can be ignored.
          </p>
        </Callout>
        <div className="grid gap-4 md:grid-cols-2">
          <Figure
            src="market-profile/04-previous-batch-day-3/19-poor-high-types.png"
            alt="Slide: types of poor high and poor low; normal poor high struck out, AB poor high / AB poor low"
            caption="Types of poor high / poor low"
          />
          <Figure
            src="market-profile/04-previous-batch-day-3/20-ab-poor-high-low.png"
            alt="Slide: AB poor high / AB poor low rules, with an AB poor low and normal poor highs marked on charts"
            caption="AB poor low vs normal poor highs, from the recording"
          />
        </div>
        <Figure
          src="market-profile/04-previous-batch-day-3/18-good-high-poor-high.png"
          alt="Sketch: good high (finished business) vs poor high (unfinished business, revisit / repair)"
          caption="Good high vs poor high, from the recording"
          width="md"
        />
      </Section>
      <Section title="Value area: the fair price">
        <div className="my-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-center text-primary-foreground shadow-lg">
          <Target className="h-7 w-7 text-gold" />
          <p className="font-display text-xl font-semibold md:text-2xl">
            Value area = <span className="rounded-md bg-gold px-2 py-0.5 text-primary">~70%</span> of where the market spent
            its time
          </p>
        </div>
        <p>
          The <strong>value area</strong> (the <strong>fair price</strong> in intraday) is the area where 68 to 70% of the
          market was spent in a day. It is the <strong>attractive price for both buyers and sellers</strong>: the range
          where they agreed to trade. Its top edge is the <strong>VAH</strong> and its bottom edge the <strong>VAL</strong>.
        </p>
        <ProfileChart
          title="Value area on a profile (illustrative)"
          ib=""
          showSingles={false}
          data={`
            23480 BC
            23473 BC
            23466 BC
            23459 BCD
            23452 ABCD
            23445 ABDFG
            23438 ABDEFGI
            23431 ABDEFGHIJK
            23424 ABDEFGHIJK
            23417 ABEFGHIJKL
            23410 AEFHJKL
            23403 EKLM
            23396 LM
            23389 M
          `}
          caption="Shaded band = value area (~70% of TPOs), with VAH at the top and VAL at the bottom."
        />
        <h3>Open below the previous day's VAL</h3>
        <p>
          The market <strong>opened below the previous day's VAL</strong>, outside and below yesterday's value, and then
          the market was <strong>trending on the downside</strong>.
        </p>
        <OpenBelowValDiagram />
        <Scenarios
          items={[
            {
              tag: "Open below previous VAL",
              tone: "bear",
              when: "the market opens below the previous day's VAL",
              then: "it trended on the downside, away from yesterday's value.",
            },
          ]}
        />
        <h3>Open inside the previous day's VAH & VAL</h3>
        <p>
          When the market <strong>opens inside the previous day's value area</strong> (between yesterday's VAH and VAL),
          it may go <strong>sideways</strong>. It can also be <strong>rejected</strong>: in the second example the market
          opened inside value, was rejected, and created a <strong>selling tail</strong>.
        </p>
        <Scenarios
          items={[
            {
              tag: "Open inside value · sideways",
              tone: "neutral",
              when: "the market opens inside the previous day's VAH & VAL",
              then: "it can go sideways, rotating within yesterday's value.",
            },
            {
              tag: "Open inside value · rejected",
              tone: "bear",
              when: "it opens inside value but is rejected",
              then: "it can leave a selling tail and move down.",
            },
          ]}
        />
        <Callout kind="warning" title="Probability only, not a sure shot">
          <p>These openings show what is likely, not what will happen. Always read how the day develops.</p>
        </Callout>
        <Pending images title="Sideways example (image 1)">
          The sideways example screenshot didn't come through. Share it again to add it here.
        </Pending>
        <AnnotatedFigure
          src="market-profile/04-previous-batch-day-3/10-open-inside-value-selling-tail.png"
          alt="Next day opens inside the previous day's value area, is rejected and leaves a selling tail"
          caption="Open inside the previous day's VAH & VAL, rejected, with a selling tail"
          marks={[
            { x: 22, y: 30, text: "Previous day's profile and value area." },
            { x: 62, y: 23, text: "Next day opens inside the previous value (circled in class)…" },
            { x: 62, y: 50, text: "…is rejected and moves down, leaving a selling tail (the long single-print column)." },
          ]}
        />
        <Callout kind="note" title="To study: balance vs imbalance opening">
          <p>
            Balance openings and imbalance openings need to be studied to get the full idea. Added to{" "}
            <Link to="/mentorships/$mentorship/to-check" params={{ mentorship: "market-profile" }}>
              To be checked
            </Link>
            .
          </p>
        </Callout>
        <AnnotatedFigure
          src="market-profile/04-previous-batch-day-3/09-value-area-vah-val.png"
          alt="Slide: value area, VAH and VAL marked on three daily profiles"
          caption="VAH and VAL on three days, from the recording"
          marks={[
            { x: 45, y: 37, text: "Day 1: VAH (ticked in class)." },
            { x: 43, y: 73, text: "Day 1: VAL (ticked in class)." },
            { x: 62, y: 70, text: "Day 2: VAH, with its value area below." },
            { x: 81, y: 20, text: "Day 3: VAH at the top of its value area…" },
            { x: 80, y: 52, text: "…and VAL at the bottom." },
          ]}
        />
      </Section>

      <Section title="Point of control (POC)">
        <div className="my-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-center text-primary-foreground shadow-lg">
          <Crosshair className="h-7 w-7 text-gold" />
          <p className="font-display text-xl font-semibold md:text-2xl">
            POC = where most time was spent in a day: the <span className="rounded-md bg-gold px-2 py-0.5 text-primary">fairest price</span> in intraday
          </p>
        </div>
        <Columns>
          <Panel title="Use of POC">
            <p>
              The POC will <strong>attract the price</strong>, so it can be used as a <strong>target</strong>.
            </p>
          </Panel>
          <Panel title="Validity of POC">
            <p>
              A POC stays <strong>valid until a later profile crosses it</strong>. Untouched, it is valid; once a next day's
              profile touches or crosses it, that POC is no longer valid.
            </p>
          </Panel>
        </Columns>
        <PocValidityDiagram />

        <h3>Example: POC as a target after emotional selling</h3>
        <p>
          A day of <strong>emotional selling</strong>: price was sold off in one direction, leaving a long column of{" "}
          <strong>single prints</strong>, and the day closed near its low. The POC from the earlier profile stayed above,
          untouched. The market then <strong>opened and went back to the POC in 2 days</strong>: the POC attracted the
          price, just as a target should.
        </p>
        <Flow items={["Emotional selling", "Single prints created", "POC left untouched above", "Back to the POC in 2 days"]} />
        <div className="mx-auto max-w-md">
          <AnnotatedFigure
            src="market-profile/04-previous-batch-day-3/16-emotional-selling-back-to-poc.png"
            alt="Daily profiles: emotional selling with single prints, then price returns to the POC within two days"
            caption="Emotional selling, then back to the POC in 2 days, from the recording"
            marks={[
              { x: 30, y: 17.6, text: "The POC of the earlier profile (the fairest price)." },
              { x: 12, y: 42, text: "Emotional selling: a long column of single prints." },
              { x: 25, y: 85, text: "Closed near the low (circled in class)." },
              { x: 62, y: 17.6, text: "Two days later price is back at the POC level (circled in class)." },
            ]}
          />
        </div>

        <h3>The three POC types</h3>
        <div className="my-6 grid gap-4 md:grid-cols-3">
          <PocTypeCard abbr="POC" name="Point of Control" rule="Up to 8 TPOs" counts={[1, 3, 5, 7, 8, 6, 4, 2]} />
          <PocTypeCard abbr="PPOC" name="Prominent Point of Control" rule="9 TPOs or more" counts={[1, 3, 5, 8, 11, 7, 4, 2]} />
          <PocTypeCard abbr="VPOC" name="Virgin Point of Control" rule="Untouched POC" counts={[1, 3, 5, 7, 6, 4, 2]} virgin />
        </div>
        <Callout kind="definition" title="Untouched POC = Virgin POC">
          <p>
            A POC that no later profile has touched is a <strong>virgin POC (VPOC)</strong>. It is still valid, and price
            is attracted to it.
          </p>
        </Callout>
        <h3>PPOC: the strongest magnet</h3>
        <Callout kind="rule" title="Key note: PPOC has more magnetic power">
          <p>
            The <strong>magnetic power is more in a PPOC</strong>: more transactions happened there, so it pulls price
            harder than a normal POC.
          </p>
        </Callout>
        <p>
          A <strong>PPOC day is evidence of smart money activity</strong>. The big players are hiding and keep on adding
          positions at that price. The question is who was adding: <strong>buyers or sellers</strong>? The PPOC day alone
          does not tell you, so <strong>wait for the next day</strong> and see where it opens.
        </p>
        <PpocNextDayDiagram />
        <Scenarios
          items={[
            { tag: "Next day opens above", tone: "bull", when: "the next day opens above", then: "buyers were the ones adding at the PPOC." },
            { tag: "Next day opens below the low", tone: "bear", when: "the next day opens below the previous day's low", then: "sellers were the ones adding at the PPOC." },
            {
              tag: "Opens between VAH and VAL",
              tone: "neutral",
              when: "the next day opens in the middle, between VAH and VAL",
              then: "not covered yet: do we wait again? (in To be checked)",
            },
          ]}
        />
        <AnnotatedFigure
          src="market-profile/04-previous-batch-day-3/13-poc-types-charts.png"
          alt="Slide: POC types on charts: a POC of up to 8 TPOs, a PPOC of 11 TPOs, and virgin POCs across days"
          caption="POC types on real charts, from the recording"
          marks={[
            { x: 5, y: 74, text: "A normal POC: up to 8 TPOs (circled)." },
            { x: 50, y: 70, text: "A PPOC: more than 9 TPOs; this one is 11 (circled, count shown under the profile)." },
            { x: 80, y: 42, text: "Virgin POCs: untouched POCs carried forward across the following days." },
          ]}
        />
        <h3>PPOC: short-term players and value migration</h3>
        <p>
          A <strong>PPOC (9 TPOs or more)</strong> is the <strong>short-term player's reference</strong>. Short-term money
          creates the value area there and then brings the <strong>short-term trend</strong>, so value migrates away from
          it. Where the next day opens relative to the PPOC day shows the direction.
        </p>
        <Callout kind="note" title="Example: range-bound day">
          <p>
            Short-term smart money <strong>seller</strong> presence in the previous day's market, with a PPOC (more than 9
            TPOs at the POC), was <strong>confirmed by the next day opening below VAL and going down</strong>. Value
            migrated lower and the market closed on the downside.
          </p>
        </Callout>
        <AnnotatedFigure
          src="market-profile/04-previous-batch-day-3/15-ppoc-value-migration-example.png"
          alt="Slide: PPOC as short-term player reference, value migration, example of sellers confirmed by opening below VAL"
          caption="PPOC example on a range-bound day, from the recording"
          marks={[
            { x: 6, y: 25, text: "The PPOC day (range bound): sellers building value at the PPOC." },
            { x: 17, y: 80, text: "Next day opens below VAL and goes down: seller presence confirmed." },
            { x: 38, y: 55, text: "Value keeps migrating lower on the following days." },
          ]}
        />

        <h3>Real support and resistance</h3>
        <p>
          If the market <strong>opens in between two PPOCs</strong>, either one of the PPOCs acts as{" "}
          <strong>support or resistance</strong>.
        </p>
        <BetweenPpocsDiagram />
        <div className="my-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-center text-primary-foreground shadow-lg">
          <p className="font-display text-lg font-semibold md:text-xl">The real support and resistance as per Market Profile:</p>
          {["POC", "VPOC", "VPPOC"].map((l) => (
            <span key={l} className="rounded-lg bg-gold px-3 py-1 font-mono text-lg font-bold text-primary">
              {l}
            </span>
          ))}
        </div>
        <Terms
          items={[
            { term: "POC", def: "Point of control: where most time was spent." },
            { term: "VPOC", def: "Virgin POC: a POC no later profile has touched." },
            { term: "VPPOC", def: "Virgin PPOC: a prominent POC (9+ TPOs) that is still untouched." },
          ]}
        />
        <Figure
          src="market-profile/04-previous-batch-day-3/14-between-two-ppocs.png"
          alt="Slide: if the market opens between two PPOCs, either acts as support or resistance; POC, VPOC and VPPOC are the real support and resistance"
          caption="From the recording"
        />
        <Figure
          src="market-profile/04-previous-batch-day-3/12-poc-types.png"
          alt="Slide: point of control, its use as a target, its validity and the three POC types"
          caption="Point of control slide, from the recording"
          width="md"
        />
      </Section>
      <Section title="Fair value / unfair value">
        <p>
          The profile splits prices into three zones. The <strong>value area around the POC is fair value</strong>{" "}
          (about 70%, 34% on each side of the POC). Above it is <strong>premium value</strong>: the highest, costly price,
          which is unfair. Below it is <strong>discount value</strong>: the lowest, cheap price, also unfair.
        </p>
        <FairValueDiagram />
        <div className="my-6 grid gap-4 lg:grid-cols-2">
          <div className="card-elevated rounded-2xl border border-bull/30 bg-card p-5">
            <p className="eyebrow text-bull">Responsive activity · expected behaviour</p>
            <p className="mt-2 text-[15px] leading-relaxed">
              <strong>Short-term participants</strong> bring the market from unfair value back to fair value: they{" "}
              <strong className="text-bear">sell at the costly price</strong> (premium) and{" "}
              <strong className="text-bull">buy at the cheap price</strong> (discount). This is responsive activity, and it
              is the expected behaviour.
            </p>
          </div>
          <div className="card-elevated rounded-2xl border border-amber-400/50 bg-card p-5">
            <p className="eyebrow text-amber-700">Initiative activity · unexpected behaviour</p>
            <p className="mt-2 text-[15px] leading-relaxed">
              If someone <strong>buys in the premium price</strong> or <strong>sells in the discount price</strong>, the
              market moves <strong>away from fair value</strong>. That is unexpected behaviour, and an indication that{" "}
              <strong>long-term players are coming</strong> in.
            </p>
          </div>
        </div>
        <Compare
          columns={["", "Responsive activity", "Initiative activity"]}
          rows={[
            ["Who", "Short-term participants", "Long-term players"],
            ["Direction", { v: "Unfair value → fair value", tone: "bull" }, { v: "Away from fair value", tone: "bear" }],
            ["At premium", "Sell (costly price)", "Buy"],
            ["At discount", "Buy (cheap price)", "Sell"],
            ["Behaviour", "Expected", "Unexpected"],
          ]}
        />
        <Figure
          src="market-profile/04-previous-batch-day-3/11-fair-value-unfair-value.png"
          alt="Slide: fair value / unfair value, premium and discount value, responsive and initiative activity"
          caption="Fair value / unfair value slide, from the recording"
          width="md"
        />      </Section>

      <Section title="Trend identification with value migration">
        <div className="my-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-center text-primary-foreground shadow-lg">
          <p className="font-display text-xl font-semibold md:text-2xl">
            Identify the trend by <span className="rounded-md bg-gold px-2 py-0.5 text-primary">VALUE</span> migration, not
            by price movement
          </p>
        </div>
        <p>
          In Market Profile the trend is read from where <strong>value</strong> (each day's value area and POC) moves from
          day to day, instead of from price movement. When each day's value is built <strong>lower</strong> than the day
          before, value is migrating down. When it is built <strong>higher</strong>, value is migrating up.
        </p>
        <ValueMigrationDiagram />
        <Compare
          columns={["Value migration", "Reads as"]}
          rows={[
            [{ v: "Each day's value higher", tone: "bull" }, "Uptrend"],
            [{ v: "Each day's value lower", tone: "bear" }, "Downtrend"],
          ]}
        />
        <AnnotatedFigure
          src="market-profile/04-previous-batch-day-3/22-value-migration-nifty-example.png"
          alt="NIFTY-I daily profiles from 17 Feb to 10 Mar 2025: value migrates lower, then higher"
          caption="NIFTY-I daily profiles, 17-02-25 to 10-03-25, from the recording"
          marks={[
            { x: 8, y: 25, text: "Mid-February: value built around 22,900–22,950." },
            { x: 40, y: 50, text: "Value migrates lower day after day: downtrend." },
            { x: 64, y: 88, text: "Early March: value at the lows, around 22,200." },
            { x: 86, y: 45, text: "Value migrates higher again: uptrend, back to about 22,700." },
          ]}
        />
        <Figure
          src="market-profile/04-previous-batch-day-3/21-trend-value-migration-title.png"
          alt="Slide: Trend identification with value migration"
          caption="Topic slide, from the recording"
          width="md"
        />
      </Section>
    </>
  );
}

/** 9:15 to 3:30 as one bar, each period's width proportional to its length. */
function TimeBar() {
  return (
    <figure className="my-6">
      <div className="card-elevated overflow-x-auto rounded-2xl border border-border bg-card p-4">
        <div className="flex min-w-[640px] overflow-hidden rounded-lg">
          {TIMES.map(([l], i) => (
            <div
              key={l}
              className="flex h-10 items-center justify-center border-r border-white/60 font-display text-sm font-bold text-[#0f1729] last:border-r-0"
              style={{ backgroundColor: HUE[i], flexGrow: l === "M" ? 1 : 2, flexBasis: 0 }}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex min-w-[640px] justify-between font-mono text-[11px] text-muted-foreground">
          <span>9:15</span>
          <span>11:15</span>
          <span>1:15</span>
          <span>3:30</span>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">The trading day, 9:15 to 3:30: twelve 30-minute periods and a 15-minute M.</figcaption>
    </figure>
  );
}

/*
 * Illustrative: day 1 leaves a selling tail; day 2 is rejected at the tail with its own
 * tail; later days stay below. Each entry: first row (0 = top) and widths per row.
 */
const DAYS: { label: string; x: number; start: number; widths: number[]; tail: number }[] = [
  { label: "Day 1", x: 40, start: 0, widths: [1, 1, 1, 1, 1, 1, 1, 1, 3, 6, 9, 10, 8, 5, 3], tail: 8 },
  { label: "Next day", x: 200, start: 7, widths: [1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5, 6, 8, 9, 10, 9, 7, 5, 3, 2], tail: 7 },
  { label: "Day 3", x: 360, start: 17, widths: [1, 3, 5, 6, 5, 3, 2, 1], tail: 0 },
  { label: "Day 4", x: 470, start: 14, widths: [2, 4, 6, 7, 6, 5, 3, 2, 1], tail: 0 },
];

function SellingTailDiagram() {
  const R = 11;
  const C = 10;
  const top = 34;
  const y = (row: number) => top + row * R;
  const zoneBottom = 14; // the next day's tail ends above this row
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 640 360" className="block h-auto w-full min-w-[520px]" role="img" aria-label="Selling tail and next-day rejection">
            <rect x={30} y={y(0) - 4} width={600} height={zoneBottom * R + 4} rx={8} className="fill-bear/10" />
            <text x={620} y={y(0) + 12} textAnchor="end" className="fill-bear text-[12px] font-semibold">
              Selling tail area: sellers positioned
            </text>
            <line x1={30} x2={630} y1={y(zoneBottom)} y2={y(zoneBottom)} strokeDasharray="6 4" strokeWidth={2} className="stroke-bear" />
            <text x={620} y={y(zoneBottom) + 16} textAnchor="end" className="fill-muted-foreground text-[11px]">
              later days stay below this line
            </text>

            {DAYS.map((d) => (
              <g key={d.label}>
                {d.widths.map((w, i) => {
                  const isTail = i < d.tail;
                  return (
                    <rect
                      key={i}
                      x={d.x}
                      y={y(d.start + i) + 1}
                      width={w * C}
                      height={R - 2}
                      rx={2}
                      className={isTail ? "fill-bear" : "fill-accent/55"}
                    />
                  );
                })}
                <text x={d.x} y={y(26) + 22} className="fill-muted-foreground text-[11px] font-semibold">
                  {d.label}
                </text>
              </g>
            ))}

            {/* callouts */}
            <path d={`M58 ${y(3)} H110`} className="stroke-bear" strokeWidth={1.5} />
            <text x={114} y={y(3) + 4} className="fill-bear text-[11.5px] font-semibold">
              selling tail (A single prints)
            </text>
            <path d={`M218 ${y(10)} H250`} className="stroke-bear" strokeWidth={1.5} />
            <text x={254} y={y(10) + 4} className="fill-bear text-[11.5px] font-semibold">
              next day: rejected at the tail
            </text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Illustrative. Red = single prints (the tails). The shaded band is where sellers are waiting.
      </figcaption>
    </figure>
  );
}

/** Previous day's profile with its value area; the next day opens below VAL and trends down. */
function OpenBelowValDiagram() {
  const R = 12;
  const y = (row: number) => 16 + row * R;
  const prev = [1, 2, 4, 6, 8, 9, 10, 9, 7, 5, 3, 2];
  const vah = 3;
  const val = 9;
  // next day: opens below VAL, then a thin trending profile going down
  const next = [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 3];
  const nextStart = val + 2;
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 640 330" className="block h-auto w-full min-w-[520px]" role="img" aria-label="Open below previous VAL, then a downtrend">
            <rect x={60} y={y(vah)} width={140} height={(val - vah + 1) * R} rx={4} className="fill-accent/12" />
            {prev.map((n, i) => (
              <rect key={i} x={64} y={y(i) + 1} width={n * 12} height={R - 2} rx={2} className={i === 6 ? "fill-gold" : i >= vah && i <= val ? "fill-accent/70" : "fill-accent/35"} />
            ))}
            <line x1={60} x2={620} y1={y(vah)} y2={y(vah)} strokeDasharray="5 4" className="stroke-accent" />
            <line x1={60} x2={620} y1={y(val + 1)} y2={y(val + 1)} strokeDasharray="5 4" strokeWidth={2} className="stroke-bear" />
            <text x={54} y={y(vah)} textAnchor="end" dominantBaseline="central" className="fill-accent font-mono text-[11px] font-bold">VAH</text>
            <text x={54} y={y(val + 1)} textAnchor="end" dominantBaseline="central" className="fill-bear font-mono text-[11px] font-bold">VAL</text>
            <text x={64} y={y(13) + 14} className="fill-muted-foreground text-[11px] font-semibold">Previous day</text>

            {next.map((n, i) => (
              <rect key={`n${i}`} x={330} y={y(nextStart + i) + 1} width={n * 12} height={R - 2} rx={2} className="fill-bear/75" />
            ))}
            <circle cx={318} cy={y(nextStart) + R / 2} r={6} className="fill-bear" stroke="white" strokeWidth={2} />
            <text x={306} y={y(nextStart) + R / 2} textAnchor="end" dominantBaseline="central" className="fill-bear text-[12px] font-bold">
              Open below VAL
            </text>
            <path d={`M400 ${y(nextStart) + 4} L470 ${y(nextStart + next.length) - 4}`} strokeWidth={3} className="stroke-bear" />
            <path d={`M470 ${y(nextStart + next.length) - 4} l-12 -3 l6 -9 z`} className="fill-bear" />
            <text x={482} y={y(nextStart + 6)} className="fill-bear text-[12.5px] font-semibold">
              trending on the downside
            </text>
            <text x={330} y={y(nextStart + next.length) + 16} className="fill-muted-foreground text-[11px] font-semibold">Next day</text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Illustrative. The next day opens below the previous day's VAL and trends down, away from yesterday's value.
      </figcaption>
    </figure>
  );
}

/** Premium / fair / discount zones with responsive arrows back to the POC and initiative arrows away. */
function FairValueDiagram() {
  const Z = { premTop: 20, vah: 110, poc: 170, val: 230, discBot: 320 };
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 700 350" className="block h-auto w-full min-w-[560px]" role="img" aria-label="Fair value and unfair value zones">
            <rect x={20} y={Z.premTop} width={400} height={Z.vah - Z.premTop} rx={8} className="fill-bear/12" />
            <rect x={20} y={Z.vah} width={400} height={Z.val - Z.vah} rx={0} className="fill-accent/12" />
            <rect x={20} y={Z.val} width={400} height={Z.discBot - Z.val} rx={8} className="fill-bull/12" />

            <text x={34} y={Z.premTop + 26} className="fill-bear text-[13px] font-bold">PREMIUM VALUE</text>
            <text x={34} y={Z.premTop + 44} className="fill-muted-foreground text-[11px]">highest · costly price · unfair</text>
            <text x={34} y={Z.discBot - 30} className="fill-bull text-[13px] font-bold">DISCOUNT VALUE</text>
            <text x={34} y={Z.discBot - 12} className="fill-muted-foreground text-[11px]">lowest · cheap price · unfair</text>

            <line x1={20} x2={420} y1={Z.vah} y2={Z.vah} strokeWidth={2} className="stroke-accent" />
            <line x1={20} x2={420} y1={Z.val} y2={Z.val} strokeWidth={2} className="stroke-accent" />
            <line x1={20} x2={420} y1={Z.poc} y2={Z.poc} strokeWidth={3} className="stroke-gold" />
            <text x={410} y={Z.vah - 6} textAnchor="end" className="fill-accent font-mono text-[12px] font-bold">VAH</text>
            <text x={410} y={Z.val + 16} textAnchor="end" className="fill-accent font-mono text-[12px] font-bold">VAL</text>
            <text x={410} y={Z.poc - 6} textAnchor="end" className="fill-gold font-mono text-[12px] font-bold">POC</text>
            <text x={34} y={(Z.vah + Z.poc) / 2 + 4} className="fill-muted-foreground text-[11px]">34% value</text>
            <text x={34} y={(Z.poc + Z.val) / 2 + 4} className="fill-muted-foreground text-[11px]">34% value</text>
            <text x={200} y={Z.poc + 22} textAnchor="middle" className="fill-accent text-[15px] font-bold">FAIR VALUE · ~70%</text>

            {/* responsive: back to POC */}
            <path d={`M300 ${Z.premTop + 30} V${Z.poc - 12}`} strokeWidth={3} className="stroke-bull" />
            <path d={`M300 ${Z.poc - 6} l-7 -12 h14 z`} className="fill-bull" />
            <path d={`M300 ${Z.discBot - 30} V${Z.poc + 34}`} strokeWidth={3} className="stroke-bull" />
            <path d={`M300 ${Z.poc + 28} l-7 12 h14 z`} className="fill-bull" />
            <text x={310} y={Z.premTop + 70} className="fill-bear text-[11.5px] font-semibold">sell at costly price</text>
            <text x={310} y={Z.discBot - 56} className="fill-bull text-[11.5px] font-semibold">buy at cheap price</text>

            {/* initiative: away */}
            <path d={`M425 ${Z.premTop + 40} L520 ${Z.premTop + 4}`} strokeWidth={3} strokeDasharray="6 4" className="stroke-amber-500" />
            <path d={`M530 ${Z.premTop} l-14 -1 l5 12 z`} className="fill-amber-500" />
            <path d={`M425 ${Z.discBot - 40} L520 ${Z.discBot - 4}`} strokeWidth={3} strokeDasharray="6 4" className="stroke-amber-500" />
            <path d={`M530 ${Z.discBot} l-14 1 l5 -12 z`} className="fill-amber-500" />
            <text x={540} y={Z.premTop + 22} className="fill-foreground text-[11.5px] font-semibold">buy in premium</text>
            <text x={540} y={Z.premTop + 38} className="fill-amber-700 text-[11px]">unexpected · initiative</text>
            <text x={540} y={Z.discBot - 30} className="fill-foreground text-[11.5px] font-semibold">sell in discount</text>
            <text x={540} y={Z.discBot - 14} className="fill-amber-700 text-[11px]">unexpected · initiative</text>

            <text x={440} y={Z.poc - 4} className="fill-bull text-[12px] font-bold">Responsive activity</text>
            <text x={440} y={Z.poc + 12} className="fill-muted-foreground text-[11px]">short-term participants,</text>
            <text x={440} y={Z.poc + 26} className="fill-muted-foreground text-[11px]">expected behaviour</text>
          </svg>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-bull" /> responsive: back to fair value (expected)</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0 w-5 border-t-2 border-dashed border-amber-500" /> initiative: away from fair value (long-term players)</span>
        </div>
      </div>
    </figure>
  );
}

function PocTypeCard(props: { abbr: string; name: string; rule: string; counts: number[]; virgin?: boolean }) {
  const R = 12;
  const max = Math.max(...props.counts);
  const poc = props.counts.indexOf(max);
  return (
    <div className="card-elevated flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
      <svg viewBox={`0 0 170 ${props.counts.length * R + 8}`} className="h-auto w-full max-w-[180px]" aria-hidden>
        {props.counts.map((n, i) => (
          <g key={i}>
            {Array.from({ length: n }, (_, k) => (
              <rect key={k} x={6 + k * 10} y={4 + i * R} width={9} height={R - 2} rx={1.5} className={i === poc ? "fill-gold" : "fill-accent/40"} />
            ))}
          </g>
        ))}
        {props.virgin && (
          <line x1={6 + max * 10 + 2} x2={168} y1={4 + poc * R + (R - 2) / 2} y2={4 + poc * R + (R - 2) / 2} strokeDasharray="4 3" strokeWidth={2} className="stroke-gold" />
        )}
        {!props.virgin && (
          <text x={6 + max * 10 + 6} y={4 + poc * R + (R - 2) / 2} dominantBaseline="central" className="fill-gold font-mono text-[10px] font-bold">
            {max} TPOs
          </text>
        )}
      </svg>
      <p className="mt-3 font-mono text-lg font-bold text-gold">{props.abbr}</p>
      <p className="font-display font-semibold">{props.name}</p>
      <p className="mt-1 rounded-full bg-secondary px-3 py-0.5 text-sm font-medium">{props.rule}</p>
    </div>
  );
}

/** Day 1's POC stays valid (virgin) while later days stay away, and stops being valid once crossed. */
function PocValidityDiagram() {
  const R = 11;
  const y = (row: number) => 16 + row * R;
  const day1 = [1, 2, 4, 6, 8, 6, 4, 2, 1];
  const pocRow = 4;
  const days: { x: number; start: number; counts: number[]; label: string }[] = [
    { x: 190, start: 7, counts: [1, 3, 5, 6, 4, 2], label: "Day 2: stays below" },
    { x: 320, start: 6, counts: [1, 2, 4, 5, 3, 1], label: "Day 3: stays below" },
    { x: 450, start: 1, counts: [1, 2, 3, 5, 6, 5, 3, 2], label: "Day 4: crosses the POC" },
  ];
  const crossX = 450;
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 640 210" className="block h-auto w-full min-w-[520px]" role="img" aria-label="POC validity">
            {day1.map((n, i) => (
              <rect key={i} x={40} y={y(i) + 1} width={n * 12} height={R - 2} rx={2} className={i === pocRow ? "fill-gold" : "fill-accent/45"} />
            ))}
            <line x1={40 + 8 * 12 + 4} x2={crossX + 4} y1={y(pocRow) + R / 2} y2={y(pocRow) + R / 2} strokeDasharray="6 4" strokeWidth={2.5} className="stroke-gold" />
            <text x={200} y={y(pocRow) - 4} className="fill-gold text-[11.5px] font-bold">
              Day 1 POC · untouched = valid (virgin POC)
            </text>
            <line x1={crossX + 4} x2={620} y1={y(pocRow) + R / 2} y2={y(pocRow) + R / 2} strokeDasharray="2 5" strokeWidth={1.5} className="stroke-muted-foreground/50" />
            <text x={560} y={y(pocRow) - 4} textAnchor="middle" className="fill-bear text-[11.5px] font-bold">
              crossed → no longer valid
            </text>
            <path d={`M${crossX - 4} ${y(pocRow) - 4} l16 16 M${crossX + 12} ${y(pocRow) - 4} l-16 16`} strokeWidth={2.5} className="stroke-bear" />

            <text x={40} y={y(10) + 14} className="fill-muted-foreground text-[11px] font-semibold">Day 1</text>
            {days.map((d) => (
              <g key={d.label}>
                {d.counts.map((n, i) => (
                  <rect key={i} x={d.x} y={y(d.start + i) + 1} width={n * 12} height={R - 2} rx={2} className="fill-accent/35" />
                ))}
                <text x={d.x} y={y(15) + 4} className="fill-muted-foreground text-[11px] font-semibold">{d.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Illustrative. The POC stays valid while untouched; once a later profile crosses it, it is no longer valid.
      </figcaption>
    </figure>
  );
}

/** A PPOC day, then three possible next-day opens. */
function PpocNextDayDiagram() {
  const R = 11;
  const y = (row: number) => 44 + row * R;
  const counts = [1, 2, 3, 4, 6, 8, 11, 8, 6, 4, 3, 2, 1];
  const ppoc = 6;
  const vah = 3;
  const val = 9;
  const low = counts.length;
  const opens = [
    { x: 360, row: -1.6, label: "Opens above", sub: "buyers were there", cls: "fill-bull", stroke: "stroke-bull" },
    { x: 480, row: 6, label: "Opens between VAH & VAL", sub: "wait again? (to check)", cls: "fill-amber-500", stroke: "stroke-amber-500" },
    { x: 600, row: low + 1, label: "Opens below the low", sub: "sellers were there", cls: "fill-bear", stroke: "stroke-bear" },
  ];
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 740 260" className="block h-auto w-full min-w-[560px]" role="img" aria-label="PPOC day and next-day open">
            <rect x={66} y={y(vah)} width={140} height={(val - vah + 1) * R} rx={4} className="fill-accent/10" />
            {counts.map((n, i) => (
              <rect key={i} x={70} y={y(i) + 1} width={n * 11} height={R - 2} rx={2} className={i === ppoc ? "fill-gold" : "fill-accent/45"} />
            ))}
            <text x={70 + 11 * 11 + 6} y={y(ppoc) + R / 2} dominantBaseline="central" className="fill-gold font-mono text-[11px] font-bold">
              PPOC · 11 TPOs
            </text>
            {[
              { r: 0, t: "day high" },
              { r: vah, t: "VAH" },
              { r: val + 1, t: "VAL" },
              { r: low, t: "day low" },
            ].map((l) => (
              <g key={l.t}>
                <line x1={66} x2={720} y1={y(l.r)} y2={y(l.r)} strokeDasharray="3 4" className="stroke-muted-foreground/40" />
                <text x={62} y={y(l.r)} textAnchor="end" dominantBaseline="central" className="fill-muted-foreground font-mono text-[9.5px]">
                  {l.t}
                </text>
              </g>
            ))}
            <text x={70} y={y(low) + 26} className="fill-muted-foreground text-[11px] font-semibold">PPOC day (smart money adding)</text>
            <line x1={320} x2={320} y1={10} y2={245} className="stroke-border" strokeWidth={2} />
            <text x={330} y={252} className="fill-muted-foreground text-[10.5px] font-semibold uppercase tracking-wider">Next day's open</text>
            {opens.map((o) => (
              <g key={o.label}>
                <circle cx={o.x} cy={y(o.row) + R / 2} r={7} className={o.cls} stroke="white" strokeWidth={2} />
                <text x={o.x + 12} y={y(o.row) + R / 2 - 5} className={`${o.cls} text-[11.5px] font-bold`}>{o.label}</text>
                <text x={o.x + 12} y={y(o.row) + R / 2 + 9} className="fill-muted-foreground text-[10.5px]">{o.sub}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Illustrative. Where the next day opens shows who was adding at the PPOC.
      </figcaption>
    </figure>
  );
}

/** Two PPOC lines with price opening between them and bouncing off either one. */
function BetweenPpocsDiagram() {
  const top = 50;
  const bot = 190;
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 640 240" className="block h-auto w-full min-w-[500px]" role="img" aria-label="Opening between two PPOCs">
            <line x1={30} x2={610} y1={top} y2={top} strokeWidth={3} className="stroke-gold" />
            <line x1={30} x2={610} y1={bot} y2={bot} strokeWidth={3} className="stroke-gold" />
            <text x={36} y={top - 10} className="fill-gold font-mono text-[12px] font-bold">PPOC · resistance</text>
            <text x={36} y={bot + 22} className="fill-gold font-mono text-[12px] font-bold">PPOC · support</text>
            <circle cx={120} cy={120} r={7} className="fill-accent" stroke="white" strokeWidth={2} />
            <text x={132} y={124} className="fill-accent text-[12px] font-bold">open in between</text>
            <path d="M120 120 L200 90 L240 104 L300 62 L340 80 L380 120 L420 150 L460 134 L520 182 L560 150 L600 128" className="fill-none stroke-foreground/75" strokeWidth={2.4} strokeLinejoin="round" />
            <path d="M300 62 l0 -10" className="stroke-bear" strokeWidth={2} />
            <text x={300} y={top - 10} textAnchor="middle" className="fill-bear text-[11px] font-semibold">rejected at resistance</text>
            <text x={520} y={bot + 22} textAnchor="middle" className="fill-bull text-[11px] font-semibold">holds at support</text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Illustrative. Opening between two PPOCs: the upper one can act as resistance, the lower one as support.
      </figcaption>
    </figure>
  );
}

/** Two small profiles: one with a 2-TPO tail, one with a longer excess, at both ends. */
function TailExcessDiagram() {
  const C = 14;
  const box = (x: number, y: number, cls: string, k: string) => <rect key={k} x={x} y={y} width={C - 2} height={C - 2} rx={2} className={cls} />;
  const profile = (x0: number, singles: number, label: string, sub: string) => {
    const body = [2, 4, 6, 7, 6, 4, 2];
    const rows: { n: number; single: boolean }[] = [
      ...Array.from({ length: singles }, () => ({ n: 1, single: true })),
      ...body.map((n) => ({ n, single: false })),
      ...Array.from({ length: singles }, () => ({ n: 1, single: true })),
    ];
    const top = 20 + (5 - singles) * C;
    return (
      <g>
        {rows.map((r, i) =>
          Array.from({ length: r.n }, (_, k) =>
            box(x0 + k * C, top + i * C, r.single ? (i < singles ? "fill-bear" : "fill-bull") : "fill-accent/45", `${i}-${k}`),
          ),
        )}
        <path d={`M${x0 - 8} ${top} v${singles * C - 2}`} strokeWidth={2} className="stroke-bear" />
        <path d={`M${x0 - 8} ${top + (singles + body.length) * C} v${singles * C - 2}`} strokeWidth={2} className="stroke-bull" />
        <text x={x0 - 14} y={top + (singles * C) / 2} textAnchor="end" dominantBaseline="central" className="fill-bear text-[11px] font-semibold">
          {singles} TPOs
        </text>
        <text x={x0 - 14} y={top + (singles + body.length) * C + (singles * C) / 2} textAnchor="end" dominantBaseline="central" className="fill-bull text-[11px] font-semibold">
          {singles} TPOs
        </text>
        <text x={x0} y={306} className="fill-foreground font-display text-[14px] font-bold">{label}</text>
        <text x={x0} y={322} className="fill-muted-foreground text-[11px]">{sub}</text>
      </g>
    );
  };
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 560 334" className="mx-auto block h-auto w-full min-w-[420px] max-w-2xl" role="img" aria-label="Tail versus excess">
            {profile(110, 2, "Tail", "2 single TPOs at an end")}
            {profile(360, 5, "Excess", "more than 2 single TPOs")}
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Red = selling side (top), green = buying side (bottom).
      </figcaption>
    </figure>
  );
}

/** A buying tail starts a swing up and later acts as support; a selling tail starts a swing down and later acts as resistance. */
function SwingTailDiagram() {
  const path = "M20 150 L80 120 L120 138 L170 232 L220 180 L260 196 L330 70 L380 96 L430 44 L480 120 L520 104 L570 214 L610 176 L650 190 L690 60";
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 720 280" className="block h-auto w-full min-w-[560px]" role="img" aria-label="Tails at swing points act as support and resistance">
            {/* buying tail zone at the swing low, carried forward */}
            <rect x={150} y={208} width={560} height={30} rx={4} className="fill-bull/12" />
            <line x1={150} x2={710} y1={208} y2={208} strokeDasharray="5 4" className="stroke-bull" />
            {/* selling tail zone at the swing high, carried forward */}
            <rect x={410} y={30} width={300} height={30} rx={4} className="fill-bear/12" />
            <line x1={410} x2={710} y1={60} y2={60} strokeDasharray="5 4" className="stroke-bear" />

            <path d={path} className="fill-none stroke-foreground/75" strokeWidth={2.4} strokeLinejoin="round" />

            {/* tails drawn as single-print columns at the swing points */}
            {[0, 1, 2].map((k) => (
              <rect key={`b${k}`} x={162} y={210 + k * 9} width={8} height={7} rx={1.5} className="fill-bull" />
            ))}
            {[0, 1, 2].map((k) => (
              <rect key={`s${k}`} x={422} y={34 + k * 9} width={8} height={7} rx={1.5} className="fill-bear" />
            ))}

            <text x={180} y={258} className="fill-bull text-[12px] font-bold">Buying tail at the swing low</text>
            <text x={440} y={24} className="fill-bear text-[12px] font-bold">Selling tail at the swing high</text>

            <circle cx={570} cy={214} r={8} className="fill-none stroke-bull" strokeWidth={2.5} />
            <text x={708} y={258} textAnchor="end" className="fill-bull text-[11.5px] font-semibold">comes back → takes support</text>
            <circle cx={690} cy={60} r={8} className="fill-none stroke-bear" strokeWidth={2.5} />
            <text x={688} y={86} textAnchor="end" className="fill-bear text-[11.5px] font-semibold">comes back → resistance</text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Illustrative. Tails at the start of a swing stay important: price can return and react there.
      </figcaption>
    </figure>
  );
}

/** Good high (sharp peak, finished) vs poor high (flat top, price returns to repair it). */
function HighsDiagram() {
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 700 270" className="block h-auto w-full min-w-[540px]" role="img" aria-label="Good high versus poor high">
            <text x={170} y={24} textAnchor="middle" className="fill-bull font-display text-[15px] font-bold">GOOD HIGH</text>
            <text x={170} y={42} textAnchor="middle" className="fill-muted-foreground text-[11px]">finished business</text>
            <path d="M40 240 L70 190 L85 205 L115 140 L130 155 L160 60 L175 150 L185 135 L215 185 L230 175 L260 240" className="fill-none stroke-bull" strokeWidth={3} strokeLinejoin="round" />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={152} y={62 + k * 10} width={8} height={8} rx={1.5} className="fill-bear" />
            ))}
            <text x={186} y={78} className="fill-bear text-[10.5px] font-semibold">tail</text>

            <line x1={350} x2={350} y1={20} y2={250} className="stroke-border" strokeWidth={2} />

            <text x={530} y={24} textAnchor="middle" className="fill-amber-700 font-display text-[15px] font-bold">POOR HIGH</text>
            <text x={530} y={42} textAnchor="middle" className="fill-muted-foreground text-[11px]">unfinished business · no tail</text>
            <path d="M390 240 L420 170 L435 185 L465 100 L480 100 L495 100 L510 130 L525 118 L560 200 L580 188 L610 240" className="fill-none stroke-foreground/75" strokeWidth={3} strokeLinejoin="round" />
            <rect x={462} y={94} width={36} height={12} rx={3} className="fill-amber-400/40" />
            <line x1={465} x2={680} y1={100} y2={100} strokeDasharray="6 4" strokeWidth={2} className="stroke-amber-500" />
            <path d="M610 240 L640 170 L655 180 L672 104" className="fill-none stroke-amber-500" strokeWidth={3} strokeDasharray="6 4" />
            <path d="M672 100 l-8 10 h12 z" className="fill-amber-500" />
            <text x={560} y={90} className="fill-amber-700 text-[11.5px] font-semibold">revisit / repair</text>
            <text x={420} y={96} textAnchor="end" className="fill-amber-700 text-[10.5px] font-semibold">flat top</text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Illustrative. A good high ends with a tail; a poor high has a flat top that price tends to come back to.
      </figcaption>
    </figure>
  );
}

/** A profile whose low is flat: A and B both end at the same price with no tail. */
function AbPoorLowDiagram() {
  const C = 16;
  const rows = ["C", "CD", "BCDE", "ABCDEF", "ABCDEFG", "ABDEFG", "ABDEF", "ABDE", "ABD", "AB", "AB"];
  const hue: Record<string, string> = { A: "#ef4444", B: "#f97316", C: "#f59e0b", D: "#eab308", E: "#a3e635", F: "#22c55e", G: "#14b8a6" };
  const y0 = 16;
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <svg viewBox="0 0 520 230" className="mx-auto block h-auto w-full max-w-xl" role="img" aria-label="AB poor low">
          <rect x={40} y={8} width={150} height={rows.length * C + 16} rx={10} fill="#0f1729" />
          {rows.map((r, i) =>
            [...r].map((ch, j) => (
              <g key={`${i}${j}`}>
                <rect x={50 + j * C} y={y0 + i * C} width={C - 2} height={C - 2} rx={2} fill={hue[ch]} />
                <text x={50 + j * C + (C - 2) / 2} y={y0 + i * C + (C - 2) / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="#0f1729">
                  {ch}
                </text>
              </g>
            )),
          )}
          <rect x={47} y={y0 + 9 * C - 3} width={2 * C + 4} height={2 * C + 4} rx={4} fill="none" stroke="#38bdf8" strokeWidth={2.5} />
          <line x1={90} x2={500} y1={y0 + 11 * C - 1} y2={y0 + 11 * C - 1} strokeDasharray="6 4" strokeWidth={2} className="stroke-gold" />
          <text x={210} y={y0 + 6 * C} className="fill-foreground text-[13px] font-bold">AB poor low</text>
          <text x={210} y={y0 + 7 * C + 2} className="fill-muted-foreground text-[11.5px]">A and B both end here: flat low, no tail</text>
          <text x={500} y={y0 + 11 * C + 16} textAnchor="end" className="fill-gold text-[11.5px] font-semibold">unfinished business → target</text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">Illustrative. Compare the AB poor low on the slide (boxed).</figcaption>
    </figure>
  );
}

/** Daily value areas stepping lower, then higher, with the POC marked in each. */
function ValueMigrationDiagram() {
  // value area top and bottom (in price rows, 0 = top) per day
  const days = [
    [2, 5], [3, 6], [5, 8], [7, 10], [9, 12], [11, 14], [12, 15], [10, 13], [8, 11], [6, 9], [4, 7],
  ];
  const R = 14;
  const W = 46;
  const y = (row: number) => 20 + row * R;
  const turn = 6;
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 620 290" className="block h-auto w-full min-w-[520px]" role="img" aria-label="Value migrating lower then higher">
            {days.map(([a, b], i) => {
              const x = 20 + i * (W + 6);
              const down = i <= turn;
              const poc = Math.round((a + b) / 2);
              return (
                <g key={i}>
                  <rect x={x} y={y(a)} width={W} height={(b - a + 1) * R} rx={5} className={down ? "fill-bear/25" : "fill-bull/25"} />
                  <rect x={x} y={y(poc) + R / 2 - 2} width={W} height={4} rx={2} className="fill-gold" />
                  <text x={x + W / 2} y={280} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
                    D{i + 1}
                  </text>
                </g>
              );
            })}
            <path d={`M${20 + W / 2} ${y(3)} L${20 + turn * (W + 6) + W / 2} ${y(13) + 8}`} strokeWidth={2.5} strokeDasharray="6 4" className="stroke-bear" />
            <path d={`M${20 + turn * (W + 6) + W / 2} ${y(13) + 8} L${20 + 10 * (W + 6) + W / 2} ${y(5)}`} strokeWidth={2.5} strokeDasharray="6 4" className="stroke-bull" />
            <text x={30} y={y(13) + 4} className="fill-bear text-[12.5px] font-bold">value migrating lower</text>
            <text x={30} y={y(13) + 20} className="fill-muted-foreground text-[11px]">downtrend</text>
            <text x={400} y={y(2)} className="fill-bull text-[12.5px] font-bold">value migrating higher</text>
            <text x={400} y={y(2) + 16} className="fill-muted-foreground text-[11px]">uptrend</text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Illustrative. Each box is one day's value area, the gold line its POC. The trend follows where value moves.
      </figcaption>
    </figure>
  );
}