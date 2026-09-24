import type { CheckItem } from "@/content";

/*
 * Things to study later or ask the mentor. Newest first is not required; the page groups
 * open items before answered ones. Set status: "answered" and fill in `answer` when known.
 */
export const toCheck: CheckItem[] = [
  {
    question: "Poor high: \"within five days\" - does the market usually revisit / repair a poor high within five days? What if it does not?",
    context: "The note on poor high ended with \"so within five days\".",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "answered",
    answer: "Per Auction Market Theory it is revisited or repaired within 5 days; if not, the area becomes strong support/resistance. But this is only theory: we do not trade based on the 5-day revisit.",
  },
  {
    question: "Good low / poor low: is it the mirror of good high / poor high (unfinished business of the seller at the bottom)?",
    context: "The note covered good high, poor high and \"lower low = good low\".",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "answered",
    answer: "Yes: any high or low of the day without a tail or excess is a poor high/low. The AB poor low (A and B ending at the low) is the one used as a target.",
  },
  {
    question: "Excess: is it more than 2 single TPOs at the end of the profile, or is it when the A or B period is in the tail?",
    context: "The slide says tail = 2 TPOs and excess = more than 2 TPOs. Another source says excess is when A or B comes in the tail.",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "open",
  },
  {
    question: "PPOC day: if the next day opens in the middle, between VAH and VAL, how do we know who was adding? Do we need to wait again?",
    context: "Opening above = buyers were there; opening below the previous day's low = sellers. The middle case was not covered. Also check: \"opens above\" means above the previous day's high, or above the value area? The range-bound example confirmed sellers with an open below VAL (not below the low), so which level is the rule?",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "open",
  },
  {
    question: "Balance opening vs imbalance opening: how to recognise each, and how to trade them?",
    context: "Came up with the open-inside-value examples. Needs more study to get the full idea.",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "open",
  },
  {
    question: "Open inside the previous day's VAH & VAL: how often does it turn sideways vs get rejected?",
    context: "The mentor said it is a probability only, not a sure shot. One example went sideways, another was rejected and left a selling tail.",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "open",
  },
  {
    question: "Fair value slide: the label reads \"INITIATIVE ACTIVITY – SM…\" but the webcam covers the rest. What is the full text?",
    context: "Next to \"If someone buys in premium price is unexpected behaviour\".",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "open",
  },
  {
    question: "What does PPOC stand for, and how is it used?",
    context: "Listed on the terminology slide without a definition.",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "answered",
    answer: "Prominent Point of Control: a POC with more than 9 TPOs (up to 8 TPOs is a normal POC).",
  },
  {
    question: "POC types: which type is a POC with exactly 9 TPOs?",
    context: "The slide says up to 8 TPOs = POC and more than 9 TPOs = PPOC, which leaves 9 in between.",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "answered",
    answer: "PPOC. A later slide defines PPOC as \"9 TPO or more\".",
  },
  {
    question: "ODX profile: what do the highlighted strikes and the negative call / put values mean for option sellers?",
    session: "04-previous-batch-day-3",
    added: "2026-09-24",
    status: "open",
  },
  {
    question: "Split profile: is the white arrow the open of each period or only the day's open? Which gaps are ignored: between periods or between days?",
    session: "03-live-1",
    added: "2026-09-23",
    status: "open",
  },
  {
    question: "Market clock: at how many days does a balance count as mature?",
    context: "The Bank Nifty example was at 41 days and called mature.",
    session: "03-live-1",
    added: "2026-09-23",
    status: "open",
  },
  {
    question: "Early breakout confirmation: what exactly to look for in the merged profile's POC?",
    context: "Checks noted: merge profiles, higher lows, POC, where the market opens.",
    session: "03-live-1",
    added: "2026-09-23",
    status: "open",
  },
  {
    question: "Stocks priced below ₹250 (exchange tick 0.01): what custom step to use in order flow?",
    session: "01-quantower-setup",
    added: "2026-09-23",
    status: "open",
  },
];
