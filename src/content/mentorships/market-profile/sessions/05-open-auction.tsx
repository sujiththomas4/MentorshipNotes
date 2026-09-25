import { Link } from "@tanstack/react-router";
import { AnnotatedFigure, Callout, Figure, Pending, Scenarios, Section, Steps } from "@/components/notes";
import type { SessionMeta } from "@/content";

/*
 * Screenshots for this session: public/screenshots/market-profile/05-open-auction/
 */
export const meta: SessionMeta = {
  number: 5,
  title: "Open Auction",
  status: "draft",
  summary:
    "Open auction: inside the range it lets the market go sideways with false breakouts; outside the range not covered yet. Also the volume profile's max volume level, where the market went and was rejected.",
  tags: ["opening types", "open auction", "volume profile"],
  keyPoints: [
    "Today's movement is predicted from the previous day's value area and today's opening.",
    "The current day's value area is the developing value area: not used in the current day, but important for the next day.",
    "Important: an open auction inside the range lets the market go sideways, with false breakouts.",
    "Volume profile: the max volume level is shown in yellow. The market went back there and was rejected.",
    "Tip, AB poor low: after B, if the high of A or B breaks up, the market is trending up.",
    "Tip, AB poor high: after B, if the market closes below the low of A or B, the market is trending down.",
    "UFA = unfinished auction.",
    "Anomalies matter when building the market context. Examples: tail or excess, gaps at the open, long-term excess (unfilled gap with an OD opening), gaps between / inside candles (order flow only), poor high / low, single prints, structural anomalies in a day or merged profile.",
  ],
};

export default function Content() {
  return (
    <>
      <Callout kind="warning" title="Reminder: sir asked to remind him">
        <ul>
          <li>
            <strong>Emotional</strong>: Nifty, 24
          </li>
          <li>
            <strong>Open auction inside the range</strong>: Aug 25
          </li>
        </ul>
      </Callout>
      <Section title="2. Open Auction">
        <Callout kind="rule" title="Reading today's movement">
          <p>
            Today's movement is predicted from two things: the <strong>previous day's value area</strong> and{" "}
            <strong>today's opening</strong>.
          </p>
        </Callout>
        <Callout kind="definition" title="Developing value area">
          <p>
            The current day's value area is called the <strong>developing value area</strong>. It is not used during
            the current day, but it is important for the <strong>next day</strong>.
          </p>
        </Callout>
        <h3>Open auction inside the range</h3>
        <Callout kind="rule" title="Important point">
          <p>
            An open auction inside the range lets the market go <strong>sideways</strong>, with{" "}
            <strong>false breakouts</strong>.
          </p>
        </Callout>
        <h3>Open auction outside the range</h3>
        <Pending>Not covered yet. Notes to be added.</Pending>
      </Section>

      <Section title="Volume profile: max volume level">
        <Callout kind="note" title="Max volume in yellow">
          <p>
            In the volume profile, the level with the maximum volume is shown in yellow. The market went back to
            that level and was rejected.
          </p>
        </Callout>
        <AnnotatedFigure
          src="market-profile/05-open-auction/01-volume-profile-max-volume-rejection.png"
          alt="Volume profile with the max volume level in yellow; a later profile rises to it and is rejected"
          caption="Max volume level (yellow) and the rejection there"
          width="md"
          marks={[
            { x: 38, y: 30, text: "Max volume level, shown in yellow." },
            { x: 86, y: 33, text: "The market went up to that level and was rejected." },
          ]}
        />
      </Section>

      <Section title="AB poor high / low: trend tip">
        <Callout kind="tip" title="After the B period">
          <p>With an AB poor high or low, watch what happens after B: it tells the trend.</p>
        </Callout>
        <Scenarios
          items={[
            {
              tag: "AB poor low",
              tone: "bull",
              when: "the high of A or B breaks up (after B)",
              then: "the market is trending up.",
            },
            {
              tag: "AB poor high",
              tone: "bear",
              when: "the market closes below the low of A or B",
              then: "the market is trending down.",
            },
          ]}
        />
        <p>
          What an AB poor high / low is:{" "}
          <Link
            to="/mentorships/$mentorship/$session"
            params={{ mentorship: "market-profile", session: "04-previous-batch-day-3" }}
            hash="good-high-poor-high"
          >
            Session 4, good high / poor high
          </Link>
          .
        </p>
      </Section>

      <Section title="UFA: unfinished auction">
        <Callout kind="definition" title="UFA">
          <p>
            UFA = unfinished auction. (Written as "unfinished action" in the class notes; UFA is the usual short
            form of unfinished auction.)
          </p>
        </Callout>
        <AnnotatedFigure
          src="market-profile/05-open-auction/02-ufa-unfinished-auction.png"
          alt="Order flow chart with an area bracketed and marked UFA, and a line drawn up to a circled level at the top"
          caption="UFA marked on the order flow chart, from the class"
          width="md"
          marks={[
            { x: 25, y: 36, text: "Arrow pointing at the UFA area." },
            { x: 20, y: 58, text: "The area bracketed and marked UFA (unfinished auction)." },
            { x: 94, y: 4, text: "Line drawn up to the circled level at the top (yellow line)." },
          ]}
        />
      </Section>

      <Section title="Anomaly in market profile">
        <p>
          <strong>What is an "anomaly" in market profile, and why it matters when building the market context.</strong>
        </p>
        <h3>Anomaly examples</h3>
        <Steps
          items={[
            { title: "Tail or excess", body: "Pointed at in class." },
            { title: "Gaps during market opening" },
            { title: "Long-term excess", body: "A gap with an OD opening that is not filled." },
            {
              title: "Gaps between candles and gaps inside candles",
              body: "Can only be observed in order flow.",
            },
            { title: "Poor high and poor low" },
            { title: "Single prints" },
            { title: "Structural anomalies in a day profile or a merged profile" },
          ]}
        />
        <Figure
          src="market-profile/05-open-auction/03-anomaly-examples.png"
          alt="Slide: What is an anomaly in market profile and its importance during making market context, with seven anomaly examples"
          caption="Anomaly examples, from the class slide"
          width="md"
        />
      </Section>
    </>
  );
}
