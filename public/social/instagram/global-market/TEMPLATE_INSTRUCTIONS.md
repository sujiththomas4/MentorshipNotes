# INDIAN TRADERS — GLOBAL MARKET SENTIMENTS
## Locked-logo 7-slide HTML template specification

## 1. Purpose
Create a reusable seven-slide Instagram carousel based on the supplied Global Market Sentiments reference.

The design is the source of truth. Do not redesign it when changing data.

## 2. Exact Instagram output
Every slide must be:
- **1080 × 1350 px**
- **4:5 portrait**
- PNG
- sRGB
- native pixel output
- no post-export stretching
- minimum 60 px safe margin

CSS canvas:

```css
.canvas {
  width: 1080px;
  height: 1350px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
```

## 3. Locked logo rule
Use ONLY:
`assets/indian-traders-locked-logo.png`

This is the exact locked Variant 6 shield logo:
- shield border
- white bull
- white bear
- green/red market accents
- white INDIAN TRADERS wordmark

**Do not recolor, redraw, stylize, add shading, or substitute another logo.**

The logo is intentionally smaller in this version so it does not dominate the market information.

Recommended HTML:

```html
<img class="logo" src="assets/indian-traders-locked-logo.png" alt="Indian Traders">
```

Recommended size:
- height: approximately **92 px**
- top: approximately **43 px**
- left: approximately **55 px**

The exact size may be tuned by a few pixels only to preserve balance; do not make it visually dominant.

## 4. Slide set

### Slide 1 — Cover
- GLOBAL MARKET
- SENTIMENTS
- Key Global Cues | Market Direction | What to Watch
- six sentiment tiles
- world/market background
- date chip
- Indian Traders logo
- Swipe footer

### Slide 2 — DOW
- DOW
- (U.S. Stock Market)
- BULLISH
- Value: 39,061.00
- Change: +1.23% ▲
- chart
- description
- 2/6

### Slide 3 — CRUDE OIL
- CRUDE OIL
- (WTI)
- BEARISH
- Value: $72.14
- Change: -1.56% ▼
- chart
- description
- 3/6

### Slide 4 — Dollar Index
- Dollar Index
- (DXY)
- NEUTRAL
- Value: 105.32
- Change: +0.12% ▲
- chart
- description
- 4/6

### Slide 5 — Gift Nifty
- Gift Nifty
- (NSE Futures)
- BULLISH
- Value: 22,482.50
- Change: +0.86% ▲
- chart
- description
- 5/6

### Slide 6 — Previous Day OI Buildup
- Previous Day
- OI Buildup
- BEARISH
- Value: +12.4%
- Direction: More Shorts
- (Net OI Change)
- description
- 6/6

### Slide 7 — Pre-Open Market
- Pre-Open Market
- (Today)
- NEUTRAL
- Value: —
- Change: —
- chart
- description
- 7/6 in the supplied reference

## 5. Layout
Keep:
- logo top-left
- date chip top-right
- instrument icon + name on the upper content row
- status pill on the right
- large rounded metric card
- thin blue-gray borders
- chart inside the metric card
- commentary below
- slide number bottom-left
- Swipe → bottom-right

## 6. Color system
Approximate reference palette:
```css
--bg: #031321;
--panel: #061b2b;
--border: #54728b;
--text: #f5f7fa;
--muted: #b9c7d3;
--bull: #20e878;
--bear: #ff3d48;
--neutral: #8292a2;
```

No gold.

## 7. Typography
Use Inter or a close modern sans-serif.
- headings: 800
- values: 800
- labels: 500–600
- descriptions: 500
- footer: 500

## 8. Assets
Use the supplied assets exactly where applicable:
- `assets/indian-traders-locked-logo.png`
- `assets/indian-traders-locked-shield-emblem.png`
- `assets/calendar.png`
- `assets/dow_flag.png`
- `assets/crude_oil_icon.png`
- `assets/dollar_index_icon.png`
- `assets/gift_nifty_flag.png`
- `assets/oi_buildup_icon.png`
- `assets/pre_open_icon.png`
- `assets/dow_chart.png`
- `assets/crude_oil_chart.png`
- `assets/dollar_index_chart.png`
- `assets/gift_nifty_chart.png`
- `assets/pre_open_chart.png`

## 9. Data editing
All editable content belongs in:
`data/market_data.json`

The HTML should not require layout edits when market values change.

## 10. Folder workflow
Use:
```text
YYYY-MM-DD/
  01_cover_initial.png
  02_dow_initial.png
  03_crude_oil_initial.png
  04_dollar_index_initial.png
  05_gift_nifty_initial.png
  06_oi_buildup_initial.png
  07_pre_open_initial.png
```

## 11. Export
Recommended production workflow:
1. Open `index.html` in Chromium/Chrome.
2. Set viewport to 1080 × 1350.
3. Render the required slide.
4. Capture ONLY `.canvas`.
5. Export PNG at exactly 1080 × 1350.
6. Do not capture browser chrome.
7. Do not resize after export.

For automation, Playwright/Chromium can capture each `.canvas` element at native size.

## 12. Quality checklist
- [ ] 1080 × 1350
- [ ] 4:5
- [ ] 60 px safe margin respected
- [ ] exact locked shield logo
- [ ] white bull and white bear
- [ ] logo small and not dominant
- [ ] no gold
- [ ] no logo recoloring
- [ ] no stretched icons/charts
- [ ] no clipped text
- [ ] PNG output
- [ ] sRGB
- [ ] one file per carousel slide
