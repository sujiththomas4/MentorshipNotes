# Azolla for Poultry — Instagram Carousel · SVG Asset & Design Specification

A 6-slide carousel for Bethlehem Valley: grab attention with the poultry feed bill, explain Azolla,
show how it helps and how fast it grows, show the saving, and end with **Comment "AZOLLA"**.
Visual style follows the two reference slides (dark navy, condensed poster headlines, green + yellow
accents, photo panels, honest "not guaranteed" notes).

| # | Slide | Job |
|---|---|---|
| 01 | Hook: feed is your biggest cost | Stop the scroll |
| 02 | What exactly is Azolla? | Explain in one look |
| 03 | Why it helps your birds | Nutrition, in 4 cards |
| 04 | How fast can Azolla grow? | Day 1 → 7 → 15 |
| 05 | What can you save? | The cost-saving visual |
| 06 | Comment "AZOLLA" | Call to action |

> Copy in this file is ready to use. Numbers marked **[verify]** must be checked against your own
> feed price, bird count and local guidance before posting (see section 11).

---

## 1. Canvas

- **Artboard:** `1080 × 1350 px` (Instagram feed 4:5). Every slide uses the same artboard.
- **SVG viewBox:** `0 0 1080 1350`
- **Safe margin:** `64 px` left / right, `56 px` top, `48 px` bottom. Keep all text inside
  `x 64 → 1016`, `y 56 → 1302`.
- **Instagram crop:** the grid preview shows the centre `1080 × 1080`; keep the headline inside
  `y 135 → 1215` so the slide still reads in the grid.
- **Export:** PNG, 1080 × 1350, sRGB, no transparency. File names `azolla-01-hook.png` … `azolla-06-comment.png`.

---

## 2. Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--navy-950` | `#07142A` | Page background (outer) |
| `--navy-900` | `#0B1D3A` | Page background (centre glow) |
| `--navy-800` | `#12294D` | Cards, panels |
| `--grid` | `#1A3563` | Background grid lines (opacity 0.45) |
| `--cream` | `#F4EFE6` | Headlines (white parts) |
| `--white` | `#FFFFFF` | Small labels on photos |
| `--body` | `#E3E9F2` | Body text |
| `--muted` | `#9DB0CB` | Captions, footnotes, top bar |
| `--azolla` | `#8BD136` | Accent headline word ("AZOLLA"), positive numbers |
| `--azolla-dark` | `#5E9E1F` | Green shadows, chart "after" bar edge |
| `--yellow` | `#F2B632` | Eyebrows, labels, dividers, page number, connector dots |
| `--red` | `#E5484D` | Warnings / "not guaranteed" lines |
| `--line` | `#F2B632` @ 60% | Thin horizontal rules |

**Ratio per slide:** navy 55–65 % · photos 25–35 % · cream text 5–8 % · green 3–5 % · yellow 2–4 % · red ≤ 2 %.
Yellow and green are accents only; never a large background.

### Background (all slides)

```svg
<radialGradient id="bg" cx="50%" cy="35%" r="75%">
  <stop offset="0" stop-color="#0B1D3A"/>
  <stop offset="1" stop-color="#07142A"/>
</radialGradient>
<pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
  <path d="M54 0H0V54" fill="none" stroke="#1A3563" stroke-width="1"/>
</pattern>
<!-- <rect width="1080" height="1350" fill="url(#bg)"/>
     <rect width="1080" height="1350" fill="url(#grid)" opacity="0.45"/> -->
```

### Photo fade (photos that bleed into the background)

```svg
<linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0.55" stop-color="#07142A" stop-opacity="0"/>
  <stop offset="1" stop-color="#07142A" stop-opacity="1"/>
</linearGradient>
```

---

## 3. Typography

Free Google Fonts (SIL OFL). Embed them in the SVG (`@font-face` with base64) or convert text to
outlines before export.

| Role | Font | Weight | Case | Tracking |
|---|---|---|---|---|
| Headline | **Anton** | 400 (it is a heavy face) | UPPERCASE | `-1 px` |
| Sub-headline / labels | **Barlow Condensed** | 700 | UPPERCASE | `1 px` |
| Body | **Barlow** | 500 | Sentence case | `0` |
| Top bar / footer / spaced caps | **Barlow** | 600 | UPPERCASE | `5 px` |
| Big numbers | **Anton** | 400 | — | `-1 px` |
| Malayalam (optional second line) | **Noto Sans Malayalam** | 600 | — | `0` |

### Type scale (px at 1080 × 1350)

| Element | Size | Line height | Colour |
|---|---:|---:|---|
| Headline (2–3 lines) | `124` | `0.92` | `--cream`, accent word `--azolla` |
| Headline big stat (slide 1) | `190` | `0.9` | `--azolla` |
| Sub-headline (yellow line under headline) | `40` | `1.1` | `--yellow` |
| Section label (card titles) | `36` | `1.1` | `--yellow` |
| Body | `30` | `1.3` | `--body` |
| Card value (big number) | `84` | `1.0` | `--azolla` |
| Card caption | `24` | `1.25` | `--muted` |
| Photo labels (DAY 1, STARTER) | `30` | `1.0` | `--white`, `--yellow` for day |
| Warning line | `44` | `1.1` | `--red` |
| Footnote | `20` | `1.35` | `--muted` |
| Top bar | `22` | `1` | `--muted`, page number `--yellow` |
| Footer "swipe" line | `22` | `1` | `--muted` |

**Rules:** headline max width `920 px`; if a line is too long, reduce to minimum `96 px`, then wrap.
One accent colour per headline. Max 3 weights on a slide. Never set body text on a busy photo.
Headline shadow (optional): `0 4 0 rgba(0,0,0,0.35)`.

---

## 4. Shared elements (every slide)

### 4.1 Top bar — `g#topbar`

| Item | x | y (baseline) | Spec |
|---|---:|---:|---|
| Brand line | 64 | 84 | `BETHLEHEM VALLEY  ×  POULTRY TIPS`, Barlow 600 22 px, tracking 5, `--muted`; the `×` in `--yellow` |
| Page number | 1016 (text-anchor end) | 84 | `01` Barlow 700 26 px `--yellow` + ` / 06` Barlow 500 26 px `--muted` |

### 4.2 Footer — `g#footer`

- Rule: `x 64 → 1016`, `y 1282`, 1.5 px, `--yellow` @ 60 %.
- Text right-aligned at `x 1016`, `y 1318`: e.g. `SWIPE: WHAT IS AZOLLA  →`, Barlow 600 22 px, tracking 5, `--muted`.
- Arrow: 22 px, stroke 2.5, `--muted`.

### 4.3 Photo panels

- Corner radius `18 px`, no border, drop shadow `0 12 28 rgba(0,0,0,0.45)`.
- Photos inside panels: `preserveAspectRatio="xMidYMid slice"` with a `clipPath` of the rounded rect.
- Label strip on a photo: dark gradient at the bottom 30 % (`#000` 0 → 0.55), label text white.

### 4.4 Connector dots (slides 2, 4)

- Line 3 px `--yellow`; end dot `r 9` `--yellow` with a `r 16` ring `--yellow` @ 30 %.

### 4.5 Icons (outlined, 64 × 64 grid, stroke 4, round caps, `currentColor`)

| id | Meaning | Used on |
|---|---|---|
| `ic-fern` | Azolla frond | 2, 6 |
| `ic-float` | Frond on a water line | 2 |
| `ic-nitrogen` | "N₂" in a circle with an arrow down | 2, 3 |
| `ic-pit` | Rectangle pit with water line | 2, 4 |
| `ic-protein` | Egg / drumstick | 3 |
| `ic-mineral` | Hexagon / crystal | 3 |
| `ic-yolk` | Fried egg | 3 |
| `ic-feed` | Feed sack | 1, 3, 5 |
| `ic-drop` | Water drop | 4 |
| `ic-shade` | Sun behind net | 4 |
| `ic-thermo` | Thermometer | 4 |
| `ic-rupee` | ₹ in a circle | 1, 5 |
| `ic-comment` | Speech bubble | 6 |
| `ic-hen` | Hen side view | 1, 3, 6 |

Icon circles (where used): diameter `72 px`, fill `--navy-800`, stroke `2 px --yellow` @ 50 %, icon 40 px `--azolla`.

---

## 5. Slide 01 — Hook: "Feed is your biggest cost"

**Goal:** stop the scroll with the pain point; tease Azolla without explaining it yet.

### Layout

| Layer / id | Geometry | Spec |
|---|---|---|
| `photo-hens` | `x 0 y 0 w 1080 h 1350`, full bleed | Photo **P1**; apply `fadeDown` from `y 520`, plus overall navy overlay `#07142A` @ 35 % |
| `topbar` | — | page `01 / 06` |
| `eyebrow` | x 64, y 640 | `POULTRY FARMERS, READ THIS` Barlow Condensed 700, 40 px, `--yellow`, tracking 2 |
| `headline` | x 64, y 760 / 950 / 1060 (baselines) | Line 1 `FEED TAKES` Anton 124 `--cream` · Line 2 `60–70%` Anton 190 `--azolla` · Line 3 `OF YOUR COST.` Anton 124 `--cream` |
| `sub` | x 64, y 1140, max w 760 | `What if a plant that grows on water could cut that bill?` Barlow 500, 34 px, `--body` |
| `tease-pill` | x 64, y 1180, w 330, h 64, r 32 | Fill `--azolla`; text `MEET AZOLLA  →` Barlow Condensed 700, 32 px, `--navy-950`, centred |
| `rupee-badge` | centre (900, 620), r 88 | Ring 6 px `--yellow`; `ic-rupee` 90 px `--yellow`; small caption under it `THE FEED BILL`, Barlow 600 18 px tracking 4 `--muted` |
| `footer` | — | `SWIPE: WHAT IS AZOLLA  →` |

**Malayalam option (line under `sub`, x 64, y 1180 → move pill to y 1210):**
`തീറ്റച്ചെലവ് കുറയ്ക്കാൻ ഒരു വഴി!` Noto Sans Malayalam 600, 30 px, `--yellow`.

---

## 6. Slide 02 — "What exactly is Azolla?"

| Layer / id | Geometry | Spec |
|---|---|---|
| `headline` | x 64, baselines y 250 / 368 | `WHAT EXACTLY` Anton 124 `--cream` · `IS ` `--cream` + `AZOLLA?` `--azolla` |
| `callout` | text x 700, y 300, max w 316 | `A tiny fern that floats and grows on water.` Barlow 500, 28 px, `--body`; connector from (690, 292) down to the photo at (600, 470) |
| `photo-azolla-macro` | `x 0 y 400 w 1080 h 480`, full width, fades top and bottom into navy (two 90 px gradients) | Photo **P2** |
| `facts` | 3 cards, y 910, each w 296 h 170, gap 24, from x 64 | Card fill `--navy-800`, r 16, stroke 1.5 `--yellow` @ 35 % |
| — card 1 | icon `ic-float` | Title `FLOATS ON WATER` (Barlow Condensed 700, 30, `--yellow`) · body `No field needed. A small pit is enough.` (Barlow 500, 22, `--body`) |
| — card 2 | icon `ic-nitrogen` | `MAKES ITS OWN NITROGEN` · `Lives with a blue-green alga (Anabaena) that fixes nitrogen from the air.` |
| — card 3 | icon `ic-pit` | `GROWS FAST, ALL YEAR` · `With water, partial shade and a little cow dung.` |
| `statement` | x 64, y 1150; yellow bar x 64 y 1112 w 8 h 110 | Line 1 `NOT A WEED FOR POULTRY.` Barlow Condensed 700, 44, `--cream` · Line 2 `A HOME-GROWN FEED SUPPLEMENT.` 44, `--yellow`; text starts x 92 |
| `footer` | — | `SWIPE: WHY IT HELPS YOUR BIRDS  →` |

---

## 7. Slide 03 — "Why it helps your birds"

| Layer / id | Geometry | Spec |
|---|---|---|
| `headline` | x 64, baselines y 250 / 368 | `WHY IT HELPS` `--cream` · `YOUR ` `--cream` + `BIRDS` `--azolla` |
| `photo-hens-azolla` | `x 64 y 410 w 952 h 380`, panel r 18 | Photo **P3**; bottom label strip: `Fresh Azolla, washed, mixed with the usual feed` Barlow 500 24 `--white` at x 92, y 760 |
| `cards` | 2 × 2 grid, from x 64 y 820, each w 464 h 172, gap 24 | Fill `--navy-800`, r 16 |
| — card 1 | value `20–30%` (Anton 84 `--azolla`) | caption `PROTEIN in dry Azolla` (Barlow Condensed 700 26 `--yellow`) · `Rich in essential amino acids.` (Barlow 500 22 `--muted`) **[verify]** |
| — card 2 | icon `ic-mineral` + value `MINERALS` (Anton 60 `--azolla`) | `Calcium · Phosphorus · Iron` · `Good for bones and eggshells.` |
| — card 3 | icon `ic-yolk` + value `CAROTENE` (Anton 60 `--azolla`) | `Natural pigments` · `Richer yolk colour in layers.` |
| — card 4 | value `5–10%` (Anton 84 `--azolla`) | `OF DAILY FEED` · `Commonly recommended share to replace.` **[verify]** |
| `rule-line` | x 64, y 1228 | `Wash well  •  Start with small amounts  •  Increase slowly` Barlow 600, 26 px, tracking 2, `--yellow`, dots `--muted` |
| `footer` | — | `SWIPE: HOW FAST IT GROWS  →` |

---

## 8. Slide 04 — "How fast can Azolla grow?"

Follows reference slide "04 / 07".

| Layer / id | Geometry | Spec |
|---|---|---|
| `headline` | x 64, baselines y 250 / 368 | `HOW FAST CAN` `--cream` · `AZOLLA ` `--azolla` + `GROW?` `--cream` |
| `sub` | x 64, y 424 | `CAN DOUBLE IN 3–10 DAYS IN GOOD CONDITIONS` Barlow Condensed 700, 40, `--yellow` **[verify]** |
| `day-labels` | centres x 206 / 540 / 874, y 488 | `DAY 1` · `AROUND DAY 7` · `DAY 10–15`, Barlow Condensed 700, 30, `--yellow` |
| `photos` | 3 panels, y 510, w 300 h 420, x 56 / 390 / 724, r 14 | Photos **P4a / P4b / P4c** (same pit, same angle) |
| `connectors` | between panels at y 720 | Short 3 px `--yellow` line + dot (section 4.4) |
| `stage-labels` | centres as above, y 980 | `STARTER` · `SPREADING` · `FULL MAT`, Anton 40, `--cream` |
| `stage-note` | centre x 874, y 1016, max w 300 | `Start harvesting daily once the mat covers the water.` Barlow 500, 20, `--muted`, centred |
| `needs` | centred x 540, y 1098 | `WATER 10 CM  •  PARTIAL SHADE  •  20–30 °C  •  COW DUNG  •  DAILY HARVEST` Barlow 600, 24, tracking 3, `--body`, dots `--yellow` |
| `rules` | lines at y 1128 and y 1232, x 64 → 1016 | 1.5 px `--red` @ 70 % |
| `warning` | centred x 540, y 1200 | `YIELD VARIES. MEASURE YOUR OWN PIT.` Anton 52, `--red` |
| `footer` | — | `NEXT: WHAT CAN YOU SAVE?  →` |

---

## 9. Slide 05 — "What can you save?" (the cost-saving visual)

Numbers are an **example**; make every value a variable so you can put in your own.

### Example inputs (variables)

| Variable | Example | Note |
|---|---:|---|
| `birds` | 100 layers | your flock |
| `feedPerBird` | 115 g / day | typical layer intake is about 110–120 g **[verify]** |
| `feedPrice` | ₹ 40 / kg | **your** feed price **[verify]** |
| `replacePct` | 5 % → 10 % | share of feed replaced by Azolla **[verify]** |

Formulas: `feedKgMonth = birds × feedPerBird × 30 / 1000` → 345 kg · `bill = feedKgMonth × feedPrice` →
₹ 13,800 · `saving = bill × replacePct` → ₹ 690 – ₹ 1,380 per month · ×10 for 1,000 birds → ₹ 6,900 – ₹ 13,800.

### Layout

| Layer / id | Geometry | Spec |
|---|---|---|
| `headline` | x 64, baselines y 250 / 368 | `WHAT CAN` `--cream` · `YOU ` `--cream` + `SAVE?` `--azolla` |
| `sub` | x 64, y 424 | `EXAMPLE: 100 LAYING HENS FOR ONE MONTH` Barlow Condensed 700, 40, `--yellow` |
| `calc-card` | x 64, y 470, w 952, h 300, r 18, fill `--navy-800` | 3 rows, each 100 px high, divided by 1 px `--grid` lines |
| — row 1 | icon `ic-hen` | `100 hens × 115 g a day` (Barlow 500 30 `--body`) · right-aligned `345 kg feed` (Anton 52 `--cream`) |
| — row 2 | icon `ic-feed` | `Feed at ₹ 40 / kg` · `₹ 13,800` (Anton 52 `--cream`) |
| — row 3 | icon `ic-fern` | `Replace 5–10% with Azolla` · `₹ 690 – 1,380` (Anton 52 `--azolla`) |
| `bars` | chart area x 64 → 1016, y 810 → 1080 | Two horizontal bars, h 70, r 10, label left (Barlow Condensed 700 28) |
| — bar "Without Azolla" | y 850, w 880 | fill `--muted` @ 55 %, value `₹ 13,800` at bar end, Anton 40 `--cream` |
| — bar "With Azolla (10%)" | y 960, w 792 (= 90 %) | fill `--azolla`; the missing 10 % drawn as a dashed outline 2 px `--azolla`, with label `SAVED` Barlow Condensed 700 24 `--azolla` inside it |
| `big-saving` | centred x 540, y 1150 | `UP TO ₹ 1,380 / MONTH*` Anton 76 `--azolla`; under it `≈ ₹ 16,500 a year for 100 hens` Barlow 500 28 `--body` (y 1192) |
| `footnote` | x 64, first baseline y 1228, 2 lines, max w 952 | `*Example with sample prices. Use your own bird count and feed price. Fresh Azolla is about 90% water, so the real saving depends on how much feed it actually replaces.` Barlow 500 20 `--muted` |
| `footer` | — | `LAST: HOW TO GET STARTED  →` |

Optional photo instead of the bar chart (if you prefer an image): **P5**, `x 64 y 800 w 952 h 300`, r 18,
with the bars moved onto a translucent `--navy-950` @ 70 % strip over the photo.

---

## 10. Slide 06 — Comment "AZOLLA"

| Layer / id | Geometry | Spec |
|---|---|---|
| `photo-hand` | `x 0 y 0 w 1080 h 700`, full width, `fadeDown` from y 380 | Photo **P6** |
| `headline` | x 64, baselines y 760 / 878 | `WANT TO START` `--cream` · `YOUR OWN ` `--cream` + `AZOLLA?` `--azolla` |
| `comment-box` | x 64, y 930, w 952, h 120, r 60 | Fill `--cream`; left avatar circle r 34 at (130, 990) fill `--azolla` with `ic-hen` white 36 px; typed text `AZOLLA` Anton 64 `--navy-950` at x 190, y 1014; caret 4 × 56 `--azolla` right after the text; send button circle r 40 at (956, 990) fill `--yellow`, arrow `--navy-950` |
| `hand-tap` (optional) | near (960, 1060) | Small tap/pointer icon `--cream`, 64 px |
| `cta-line` | x 64, y 1110 | `Comment ` `--body` + `AZOLLA` Barlow Condensed 700 `--azolla` + ` and we'll send you the product details.` Barlow 500 34 `--body`, max w 952 (2 lines) |
| `includes` | x 64, y 1210 | `[Starter culture]  •  [Pit sheet]  •  [Setup guide]  •  [Price]` Barlow 600, 26, `--yellow`; **replace with what you actually offer** |
| `handle` | right x 1016, y 1318 (footer slot) | `@bethlehemvalley  •  SAVE THIS POST` Barlow 600 22 tracking 5 `--muted` |

Instagram caption suggestion (not on the image):
`Feed is the biggest cost on a poultry farm. Azolla is a small water fern you can grow at home and mix into the feed. Comment AZOLLA for the details. 🌱🐔`

---

## 11. Facts used, and what to verify

| Claim on the slides | Status |
|---|---|
| Feed is 60–70 % of the cost of raising poultry | Widely cited in extension material **[verify for your farm]** |
| Azolla is a small floating water fern (in India mostly *Azolla pinnata*) | Established |
| It lives with the cyanobacterium *Anabaena azollae*, which fixes nitrogen from the air | Established |
| 20–30 % crude protein on a dry-weight basis | Typical published range; varies with growing conditions **[verify]** |
| Contains minerals (Ca, P, Fe) and carotenoids | Established; amounts vary |
| Commonly recommended to replace about 5–10 % of poultry feed | Extension guidance; higher shares can reduce performance **[verify with a vet / KVK]** |
| Can double in about 3–10 days in good conditions | Published range for good conditions **[verify]** |
| Grows best with ~10 cm water, partial shade, about 20–30 °C | Typical guidance |
| Fresh Azolla is about 90 % water | Established |
| ₹ figures on slide 5 | **Example only**; recalculate with your numbers |

Do not claim "doubles your profit", "10× growth" or a fixed daily yield. Keep the footnotes.

---

## 12. Photo assets

Generate or shoot these. All: photorealistic, natural daylight, Kerala backyard farm feel, shallow depth
of field, **no text, no logos, no watermark**. Export at the listed size (or larger, same ratio).

| id | Slot size | Subject | Prompt |
|---|---|---|---|
| **P1** | 1080 × 1350 | Layer hens at a feeder | "Close-up of brown layer hens eating from a long metal feeder in a clean backyard poultry shed in Kerala, soft morning light from the side, dark moody background, feed pellets visible, shallow depth of field, photorealistic, 4:5, no text" |
| **P2** | 1080 × 480 (shoot 2160 × 960) | Azolla macro on water | "Macro photo of fresh green Azolla pinnata fronds floating on dark still water, water droplets on the leaves, a dense cluster in the centre and smaller clusters fading into darkness, dramatic low light, photorealistic, wide 9:4, no text" |
| **P3** | 952 × 380 | Hens eating Azolla | "Brown hens pecking fresh green Azolla spread in a shallow wooden tray on a farm, one hen in focus, bright natural light, green background blur, photorealistic, wide 5:2, no text" |
| **P4a** | 300 × 420 | Pit, day 1 | "Top-down photo of a small rectangular Azolla pit lined with black silpaulin sheet and bamboo edges, clear water with only a few scattered tiny Azolla clusters, daylight, photorealistic, 5:7, no text" |
| **P4b** | 300 × 420 | Same pit, ~day 7 | "Same rectangular black-lined Azolla pit from the same top-down angle, water about half covered with spreading green Azolla clusters, photorealistic, 5:7, no text" |
| **P4c** | 300 × 420 | Same pit, day 10–15 | "Same rectangular black-lined Azolla pit from the same top-down angle, water fully covered by a thick bright green Azolla mat, photorealistic, 5:7, no text" |
| **P5** (optional) | 952 × 300 | Feed sack + Azolla | "A poultry feed sack beside a basin of fresh green Azolla and a few rupee coins on a wooden table, farm background blurred, warm light, photorealistic, wide 3:1, no text on the sack" |
| **P6** | 1080 × 700 | Hands holding Azolla | "Two hands of a farmer holding a handful of fresh wet green Azolla above an Azolla pit, water dripping, green background blur, soft light, photorealistic, 3:2, no text" |

Tips: P4a/b/c must look like the **same pit** — generate one image and edit the coverage, or photograph
your own pit on day 1, 7 and 15 (real photos are more convincing for this post).

---

## 13. SVG layer order (each slide)

```text
<svg viewBox="0 0 1080 1350">
  <defs>  bg, grid, fadeDown, photo clipPaths, shadows, icon symbols (#ic-*), embedded fonts  </defs>
  <g id="background"/>      navy gradient + grid
  <g id="photos"/>          full-bleed / panel photos with clips and fades
  <g id="topbar"/>
  <g id="headline"/>
  <g id="content"/>         callouts, cards, bars, comment box (slide-specific)
  <g id="warning"/>         red / yellow statement lines
  <g id="footer"/>
</svg>
```

Keep every block in its own group with the ids above so text and photos can be swapped per post.

### Suggested IDs

```text
bg, grid, topbar, pageNo, headline, headlineAccent, sub, callout, calloutLine,
photoMain, photoDay1, photoDay7, photoDay15, factCard1-3, statCard1-4,
calcCard, barBefore, barAfter, bigSaving, footnote, commentBox, commentText,
ctaLine, includes, footer
```

---

## 14. Spacing

8 px grid. Headline → sub: 40–56 px. Sub → photo: 24–40 px. Photo → cards: 24–32 px. Card padding: 28 px.
Gap between cards: 24 px. Last content → footer rule: at least 32 px.

---

## 15. Accessibility & tone

- White/cream and green on navy, and navy on yellow/green, all have strong contrast. Do not put
  `--muted` text on photos.
- Alt text per slide, e.g. slide 2: "Close-up of green Azolla fern floating on water."
- Tone: practical and honest, like the references — show ranges, say "example", avoid guarantees.
