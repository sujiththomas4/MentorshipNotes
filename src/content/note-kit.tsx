import {
  AnnotatedFigure,
  Callout,
  Columns,
  Compare,
  Figure,
  Flow,
  Hl,
  LevelMap,
  MentorQuote,
  MiniProfile,
  Panel,
  ProfileChart,
  Scenarios,
  Section,
  ShapeGallery,
  Steps,
  Terms,
} from "@/components/notes";
/*
 * Reference page (/note-kit): every building block, with made-up example data.
 * A session file uses the same blocks, plus `export const meta: SessionMeta`.
 */
export default function NoteKit() {
  return (
    <>
      <Callout kind="note" title="This is a reference page">
        <p>
          The numbers and wording below are placeholders to show how each element looks. Real sessions will be written
          from your draft notes and screenshots.
        </p>
      </Callout>

      <Section title="Text and highlights">
        <p>
          Normal paragraphs, <strong>bold text</strong>, and <Hl>highlighted terms</Hl>. A term can also be marked{" "}
          <Hl tone="bull">bullish</Hl> or <Hl tone="bear">bearish</Hl>.
        </p>
        <ul>
          <li>Bullet lists for quick points</li>
          <li>Numbered lists work the same way</li>
        </ul>
        <MentorQuote>A line the mentor said that is worth keeping word for word.</MentorQuote>
      </Section>

      <Section title="Callouts">
        <Callout kind="definition">
          <p>
            <strong>Point of Control (POC)</strong>: the price with the most TPOs in the profile.
          </p>
        </Callout>
        <Callout kind="rule">
          <p>A rule to follow every time.</p>
        </Callout>
        <Callout kind="tip">
          <p>A practical tip or shortcut.</p>
        </Callout>
        <Callout kind="warning">
          <p>A common mistake to avoid.</p>
        </Callout>
      </Section>

      <Section title="TPO profile chart">
        <p>
          Type the letters per price. The chart works out the POC, the 70% value area, the initial balance (A and B
          periods, in blue) and single prints (dashed) by itself. Levels can be overridden to match the mentor's chart.
        </p>
        <ProfileChart
          title="Example day"
          data={`
            22540 H
            22530 GH
            22520 GHI
            22510 FGHI
            22500 CFGHIJ
            22490 BCDEFIJ
            22480 ABCDEFJ
            22470 ABCDEJ
            22460 ABDE
            22450 AB
            22440 A
            22430 A
          `}
          marks={[
            { price: 22540, text: "Selling tail?", tone: "bear" },
            { price: 22435, text: "Buying tail", tone: "bull" },
          ]}
          caption="Letters are 30-minute periods. Blue letters = initial balance."
        />
      </Section>

      <Section title="Profile shapes">
        <ShapeGallery>
          <MiniProfile shape="normal" label="Normal" note="Balanced, POC in the middle" />
          <MiniProfile shape="p" label="p-shape" note="Heavy at the top" />
          <MiniProfile shape="b" label="b-shape" note="Heavy at the bottom" />
          <MiniProfile shape="trend" label="Trend" note="Thin and elongated" />
          <MiniProfile shape="double" label="Double distribution" note="Two areas of value" />
          <MiniProfile counts={[1, 3, 5, 3, 1]} label="Custom" note="Any counts, top to bottom" />
        </ShapeGallery>
      </Section>

      <Section title="Level map">
        <LevelMap
          title="Where did today open?"
          bands={[{ from: 22460, to: 22520, label: "Yesterday's value area" }]}
          levels={[
            { price: 22520, label: "VAH" },
            { price: 22490, label: "POC", tone: "gold" },
            { price: 22460, label: "VAL" },
          ]}
          markers={[
            { price: 22560, label: "Open above value", tone: "bull" },
            { price: 22480, label: "Open inside value", tone: "neutral" },
            { price: 22420, label: "Open below value", tone: "bear" },
          ]}
        />
      </Section>

      <Section title="Scenarios">
        <Scenarios
          items={[
            { when: "price opens above value and holds", then: "example reading for the bullish case", tone: "bull" },
            { when: "price opens below value and holds", then: "example reading for the bearish case", tone: "bear" },
            { when: "price opens inside value", then: "example reading for a balanced day", tone: "neutral" },
            { when: "any other condition", then: "tag text can be set per card", tone: "neutral", tag: "Custom tag" },
          ]}
        />
      </Section>

      <Section title="Tables, steps and flows">
        <Compare
          columns={["Feature", "Case A", "Case B"]}
          rows={[
            ["Range", "Narrow", "Wide"],
            ["Bias", { v: "Up", tone: "bull" }, { v: "Down", tone: "bear" }],
          ]}
          caption="Any comparison, with coloured cells where it helps"
        />
        <Steps
          items={[
            { title: "First step", body: "What to check first." },
            { title: "Second step", body: "What to check next." },
            { title: "Decide", body: "Act on what the steps showed." },
          ]}
        />
        <Flow items={["Condition", "Confirmation", "Action"]} />
        <Terms
          items={[
            { term: "Initial balance", abbr: "IB", def: "Example definition text." },
            { term: "Value area", abbr: "VA", def: "Example definition text." },
          ]}
        />
      </Section>

      <Section title="Side by side">
        <Columns>
          <Panel title="Bullish case" tone="bull">
            <p>Notes for one side.</p>
          </Panel>
          <Panel title="Bearish case" tone="bear">
            <p>Notes for the other side.</p>
          </Panel>
        </Columns>
      </Section>

      <Section title="Screenshots">
        <p>
          Put images in <code>public/screenshots/</code>. Click an image to see it full size.
        </p>
        <Figure src="_sample/chart.svg" alt="Sample chart" caption="A screenshot with a caption" />
        <AnnotatedFigure
          src="_sample/chart.svg"
          alt="Sample chart with markers"
          marks={[
            { x: 14, y: 72, text: "Numbered markers placed on the screenshot…" },
            { x: 76, y: 22, text: "…explained one by one underneath." },
          ]}
        />
      </Section>
    </>
  );
}
