import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { seeded, useAutoFit } from "../shared";
import { rupees, savings, type AzPhoto, type AzollaData } from "./data";
import "./artwork.css";

/*
 * Azolla carousel slides (design-briefs/azolla-poultry-carousel.md) as HTML at 1080 × 1350, like
 * the other Bethlehem Valley posts (exported with html-to-image). Positions follow the brief.
 * Photo slots without a photo show a drawn Azolla illustration. SVG colours are real values.
 */

export const AZ = {
  navy950: "#07142A",
  navy900: "#0B1D3A",
  navy800: "#12294D",
  grid: "#1A3563",
  cream: "#F4EFE6",
  body: "#E3E9F2",
  muted: "#9DB0CB",
  azolla: "#8BD136",
  azollaDark: "#5E9E1F",
  yellow: "#F2B632",
  red: "#E5484D",
};

/* ---------- small pieces ---------- */

/** Text with *stars* around the green accent words. */
export function Accent({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="acc">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** Icons (64 grid, currentColor strokes). */
const ICONS: Record<string, string> = {
  fern: '<path d="M32 58V10" stroke-width="4"/><path d="M32 16c-6 0-10 3-10 7 5 1 9-1 10-7zM32 16c6 0 10 3 10 7-5 1-9-1-10-7zM32 28c-8 0-13 4-13 9 7 1 12-2 13-9zM32 28c8 0 13 4 13 9-7 1-12-2-13-9zM32 41c-9 0-15 4-15 10 8 1 14-3 15-10zM32 41c9 0 15 4 15 10-8 1-14-3-15-10z" stroke-width="3.2"/>',
  float:
    '<path d="M6 40c5 0 5 4 10 4s5-4 10-4 5 4 10 4 5-4 10-4 5 4 10 4" stroke-width="4"/><path d="M6 52c5 0 5 4 10 4s5-4 10-4 5 4 10 4 5-4 10-4 5 4 10 4" stroke-width="3" opacity=".6"/><path d="M20 36c0-8 5-14 12-14s12 6 12 14" stroke-width="4"/><path d="M26 28c2-4 4-6 6-6M38 28c-2-4-4-6-6-6" stroke-width="3"/>',
  nitrogen:
    '<circle cx="32" cy="34" r="20" stroke-width="4"/><path d="M24 42V26l16 16V26" stroke-width="4"/><path d="M32 4v8M28 8l4 4 4-4" stroke-width="3.4"/>',
  pit: '<rect x="8" y="20" width="48" height="30" rx="3" stroke-width="4"/><path d="M8 34c6 0 6 3 12 3s6-3 12-3 6 3 12 3 6-3 12-3" stroke-width="3"/><path d="M4 20h56" stroke-width="4"/>',
  egg: '<path d="M32 8c-11 0-18 17-18 28a18 18 0 0 0 36 0C50 25 43 8 32 8z" stroke-width="4"/>',
  mineral:
    '<path d="M32 6 54 19v26L32 58 10 45V19z" stroke-width="4"/><path d="M10 19l22 13 22-13M32 32v26" stroke-width="3"/>',
  yolk: '<path d="M14 40c-8-4-8-16 2-19 2-10 16-13 22-6 10-2 17 8 13 16 6 6 1 17-9 16-5 7-18 7-22 0-4 0-6-3-6-7z" stroke-width="3.6"/><circle cx="32" cy="34" r="9" stroke-width="3.6"/>',
  feed: '<path d="M18 12h28l-4 8 6 34H16l6-34z" stroke-width="4"/><path d="M22 20h20M24 34h16" stroke-width="3"/>',
  drop: '<path d="M32 8C24 21 15 30 15 40a17 17 0 0 0 34 0C49 30 40 21 32 8Z" stroke-width="4"/>',
  shade:
    '<circle cx="24" cy="22" r="9" stroke-width="3.6"/><path d="M24 5v4M9 22H5M12 10 9 7M36 10l3-3" stroke-width="3"/><path d="M8 40h48M8 48h48M16 34v22M32 34v22M48 34v22" stroke-width="3"/>',
  thermo:
    '<path d="M26 38V12a6 6 0 0 1 12 0v26a11 11 0 1 1-12 0z" stroke-width="4"/><path d="M32 22v24" stroke-width="4"/>',
  rupee:
    '<path d="M18 12h28M18 22h28M22 12c14 0 16 20 0 20h-4l22 22" stroke-width="5"/>',
  comment: '<path d="M10 14h44v30H28L16 54V44h-6z" stroke-width="4"/>',
  hen: '<path d="M13 33c0 12 8 20 20 20s18-8 17-20" stroke-width="3.6"/><path d="M13 33c-4-8-2-17 5-21 1 8 5 13 12 15" stroke-width="3.6"/><path d="M50 33c0-7-4-11-4-17 0-5 3-8 7-8 3 0 5 3 5 6l4 2-4 2c-1 5-4 9-8 15" stroke-width="3.6"/><path d="M29 53v6M37 53v6" stroke-width="3.6"/>',
  shield:
    '<path d="M32 7 52 15v15c0 13-8 22-20 27C20 52 12 43 12 30V15L32 7Z" stroke-width="4"/><path d="m22 32 7 7 14-15" stroke-width="4"/>',
  growth:
    '<path d="M8 56h48" stroke-width="4"/><path d="M16 50V40M28 50V32M40 50V26" stroke-width="7"/><path d="M12 30 26 19l9 6 17-15M43 10h9v9" stroke-width="4"/>',
};
export const AZ_ICON_NAMES: Record<string, string> = {
  "": "No icon",
  fern: "Azolla frond",
  float: "Floats on water",
  nitrogen: "Nitrogen (N)",
  pit: "Pit",
  egg: "Egg / protein",
  mineral: "Mineral",
  yolk: "Egg yolk",
  feed: "Feed sack",
  drop: "Water drop",
  shade: "Shade",
  thermo: "Temperature",
  rupee: "Rupee",
  comment: "Comment",
  hen: "Hen",
  shield: "Shield",
  growth: "Growth",
};

export function AzIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  if (!ICONS[name]) return null;
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M3 12h17M14 6l6 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ---------- drawn Azolla (fallback for photo slots) ---------- */

const GREENS = ["#3F8424", "#4E9A2A", "#5FAE32", "#6DBB3C", "#7CC444"];

/** One frond cluster: overlapping round lobes with a light highlight. */
function frond(cx: number, cy: number, r: number, rnd: () => number) {
  const n = 6 + Math.floor(rnd() * 4);
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd();
    const d = r * (0.35 + rnd() * 0.35);
    const lr = r * (0.42 + rnd() * 0.22);
    s += `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d).toFixed(1)}" r="${lr.toFixed(1)}" fill="${GREENS[Math.floor(rnd() * GREENS.length)]}"/>`;
  }
  s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.45).toFixed(1)}" fill="#8BD14A"/>`;
  s += `<circle cx="${(cx - r * 0.2).toFixed(1)}" cy="${(cy - r * 0.25).toFixed(1)}" r="${(r * 0.18).toFixed(1)}" fill="#C8EC8A" opacity=".55"/>`;
  return s;
}

/** Close-up: a dense cluster in the middle fading into dark water. */
function macroSvg(w: number, h: number, seed: string) {
  const rnd = seeded(seed);
  let s = `<defs><radialGradient id="azw-${seed}" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#16303A"/><stop offset="1" stop-color="#060F16"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#azw-${seed})"/>`;
  for (let i = 0; i < 14; i++)
    s += `<ellipse cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" rx="${(40 + rnd() * 120).toFixed(0)}" ry="${(8 + rnd() * 18).toFixed(0)}" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="2"/>`;
  const step = 46;
  for (let y = -step / 2; y < h + step; y += step * 0.8)
    for (let x = -step / 2; x < w + step; x += step) {
      const px = x + (rnd() - 0.5) * step;
      const py = y + (rnd() - 0.5) * step;
      const dx = (px - w / 2) / (w * 0.5);
      const dy = (py - h * 0.55) / (h * 0.5);
      const p = 1.05 - Math.sqrt(dx * dx * 0.7 + dy * dy * 1.6);
      if (rnd() > p) continue;
      s += frond(px, py, 16 + rnd() * 22 * Math.max(0.5, p), rnd);
    }
  for (let i = 0; i < 40; i++)
    s += `<circle cx="${(w * 0.2 + rnd() * w * 0.6).toFixed(0)}" cy="${(h * 0.3 + rnd() * h * 0.5).toFixed(0)}" r="${(1.5 + rnd() * 3).toFixed(1)}" fill="#fff" opacity=".5"/>`;
  return s;
}

/** A lined pit seen from above, `cover` 0–1 of the water covered. */
function pitSvg(w: number, h: number, cover: number, seed: string) {
  const rnd = seeded(seed);
  const m = 22;
  let s = `<rect width="${w}" height="${h}" fill="#3A2E22"/>`;
  for (let i = 0; i < 60; i++)
    s += `<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(2 + rnd() * 5).toFixed(1)}" fill="${rnd() > 0.5 ? "#4A3B2B" : "#2E241A"}"/>`;
  s += `<rect x="${m - 8}" y="${m - 8}" width="${w - 2 * m + 16}" height="${h - 2 * m + 16}" rx="4" fill="#111418"/>`;
  s += `<rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" fill="#1B2B2C"/>`;
  for (let i = 0; i < 8; i++)
    s += `<path d="M${m} ${(m + rnd() * (h - 2 * m)).toFixed(0)}q${(w / 3).toFixed(0)} ${((rnd() - 0.5) * 30).toFixed(0)} ${(w - 2 * m).toFixed(0)} 0" stroke="#fff" stroke-opacity=".05" fill="none" stroke-width="3"/>`;
  const step = 24;
  for (let y = m + 6; y < h - m; y += step * 0.85)
    for (let x = m + 6; x < w - m; x += step) {
      if (rnd() > cover) continue;
      const r = (cover > 0.8 ? 12 : 8) + rnd() * 6;
      s += frond(
        Math.min(w - m - r * 0.6, x + (rnd() - 0.5) * 10),
        Math.min(h - m - r * 0.6, y + (rnd() - 0.5) * 10),
        r,
        rnd,
      );
    }
  // bamboo edges
  const bam = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9A7A45" stroke-width="10" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#C9A564" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
  s +=
    bam(m - 12, m - 12, w - m + 12, m - 12) +
    bam(m - 12, h - m + 12, w - m + 12, h - m + 12) +
    bam(m - 12, m - 12, m - 12, h - m + 12) +
    bam(w - m + 12, m - 12, w - m + 12, h - m + 12);
  return s;
}

function Drawn({
  kind,
  w,
  h,
  cover = 1,
  seed,
}: {
  kind: "macro" | "pit";
  w: number;
  h: number;
  cover?: number;
  seed: string;
}) {
  const html = useMemo(
    () => (kind === "macro" ? macroSvg(w, h, seed) : pitSvg(w, h, cover, seed)),
    [kind, w, h, cover, seed],
  );
  return (
    <svg
      className="drawn"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** A photo slot: the photo (fit / zoom / focus point) or the drawn fallback. */
function Slot({
  p,
  className,
  style,
  fallback,
  children,
}: {
  p: AzPhoto;
  className: string;
  style?: CSSProperties;
  fallback: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={`ph ${className}`} style={style}>
      {p.src ? (
        <img
          src={p.src}
          alt=""
          style={{
            objectFit: p.fit,
            objectPosition: `${p.x}% ${p.y}%`,
            transform: `scale(${p.zoom / 100})`,
            transformOrigin: `${p.x}% ${p.y}%`,
          }}
        />
      ) : (
        fallback
      )}
      {children}
    </div>
  );
}

/* ---------- frame ---------- */

function TopBar({ d, n, total }: { d: AzollaData; n: number; total: number }) {
  const two = (v: number) => String(v).padStart(2, "0");
  return (
    <div className="top">
      <span>
        {d.brandLine}
        {d.series && (
          <>
            <b className="x"> × </b>
            {d.series}
          </>
        )}
      </span>
      <span className="pg">
        <b>{two(n)}</b> / {two(total)}
      </span>
    </div>
  );
}

function Footer({ text, arrow }: { text: string; arrow: boolean }) {
  return (
    <div className="foot">
      {text && (
        <span>
          {text} {arrow && <Arrow />}
        </span>
      )}
    </div>
  );
}

function Headline({
  l1,
  l2,
  top = 130,
}: {
  l1: string;
  l2: string;
  top?: number;
}) {
  return (
    <div className="hl" style={{ top }}>
      {l1 && (
        <div className="bname">
          <Accent text={l1} />
        </div>
      )}
      {l2 && (
        <div className="bname">
          <Accent text={l2} />
        </div>
      )}
    </div>
  );
}

/* ---------- slides ---------- */

function Slide1({ d }: { d: AzollaData }) {
  const s = d.s1;
  return (
    <>
      <Slot
        p={s.photo}
        className="full"
        fallback={<Drawn kind="macro" w={1080} h={1350} seed="s1" />}
      >
        <div className="shade35" />
        <div className="fade" style={{ top: 480 }} />
      </Slot>
      <div className="badge">
        <AzIcon name="rupee" className="bico" />
        {s.badge && <span>{s.badge}</span>}
      </div>
      {s.eyebrow && <div className="eyebrow s1e">{s.eyebrow}</div>}
      <div className="hl s1h">
        {s.title1 && (
          <div className="bname">
            <Accent text={s.title1} />
          </div>
        )}
        {s.stat && <div className="bname stat">{s.stat}</div>}
        {s.title3 && (
          <div className="bname">
            <Accent text={s.title3} />
          </div>
        )}
      </div>
      <div className="s1b">
        {s.sub && <p className="body">{s.sub}</p>}
        {s.ml && (
          <p className="ml" lang="ml">
            {s.ml}
          </p>
        )}
        {s.pill && (
          <span className="pill">
            {s.pill} <Arrow />
          </span>
        )}
      </div>
    </>
  );
}

function Slide2({ d }: { d: AzollaData }) {
  const s = d.s2;
  return (
    <>
      <Slot
        p={s.photo}
        className="band"
        fallback={<Drawn kind="macro" w={1080} h={480} seed="s2" />}
      >
        <div className="fadeTop" />
        <div className="fadeBot" />
      </Slot>
      <Headline l1={s.title1} l2={s.title2} />
      {s.callout && (
        <>
          <p className="callout">{s.callout}</p>
          <svg className="leader" viewBox="0 0 1080 1350" aria-hidden="true">
            <path
              d="M688 300 L620 300 L590 470"
              fill="none"
              stroke={AZ.yellow}
              strokeWidth="3"
            />
            <circle cx="590" cy="470" r="16" fill={AZ.yellow} opacity=".3" />
            <circle cx="590" cy="470" r="9" fill={AZ.yellow} />
          </svg>
        </>
      )}
      <div className="s2low">
        <div className="facts">
          {s.facts.map((f, i) => (
            <div key={i} className="card">
              <AzIcon name={f.icon} className="cico" />
              <div className="ct">{f.title}</div>
              <div className="cb">{f.text}</div>
            </div>
          ))}
        </div>
        <div className="statement">
          <i />
          <div>
            {s.statement1 && <div>{s.statement1}</div>}
            {s.statement2 && <div className="y">{s.statement2}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

function Slide3({ d }: { d: AzollaData }) {
  const s = d.s3;
  return (
    <>
      <Headline l1={s.title1} l2={s.title2} />
      <Slot
        p={s.photo}
        className="panel p3"
        fallback={<Drawn kind="macro" w={952} h={380} seed="s3" />}
      >
        {s.photoLabel && (
          <div className="strip">
            <span>{s.photoLabel}</span>
          </div>
        )}
      </Slot>
      <div className="stats">
        {s.stats.map((c, i) => (
          <div key={i} className="card stat">
            <div className="sv">
              <AzIcon name={c.icon} className="sico" />
              <span className={`bname ${c.icon ? "word" : ""}`}>{c.value}</span>
            </div>
            <div className="sl">{c.label}</div>
            <div className="st">{c.text}</div>
          </div>
        ))}
      </div>
      {s.rule && <p className="rule">{s.rule}</p>}
    </>
  );
}

function Slide4({ d }: { d: AzollaData }) {
  const s = d.s4;
  const xs = [56, 390, 724];
  return (
    <>
      <Headline l1={s.title1} l2={s.title2} />
      {s.sub && <div className="sub s4s">{s.sub}</div>}
      {s.days.map((day, i) => (
        <div key={i}>
          <div className="dayl" style={{ left: xs[i] }}>
            {day.day}
          </div>
          <Slot
            p={day.photo}
            className="panel pit"
            style={{ left: xs[i] }}
            fallback={
              <Drawn
                kind="pit"
                w={300}
                h={420}
                cover={[0.12, 0.5, 1][i]}
                seed={`pit${i}`}
              />
            }
          />
          <div className="stage" style={{ left: xs[i] }}>
            {day.stage}
          </div>
        </div>
      ))}
      <svg className="leader" viewBox="0 0 1080 1350" aria-hidden="true">
        {[356, 690].map((x) => (
          <g key={x}>
            <line
              x1={x}
              y1={710}
              x2={x + 34}
              y2={710}
              stroke={AZ.yellow}
              strokeWidth="3"
            />
            <circle cx={x + 17} cy={710} r="9" fill={AZ.yellow} />
          </g>
        ))}
      </svg>
      {s.note && <p className="note">{s.note}</p>}
      {s.needs && (
        <p className="needs">
          {s.needs.split("•").map((part, i) => (
            <span key={i}>
              {i > 0 && <b> • </b>}
              {part.trim()}
            </span>
          ))}
        </p>
      )}
      {s.warning && (
        <div className="warn">
          <span>{s.warning}</span>
        </div>
      )}
    </>
  );
}

function Slide5({ d }: { d: AzollaData }) {
  const s = d.s5;
  const v = savings(s);
  const after = 880 * (1 - s.replaceMax / 100);
  const range =
    s.replaceMin === s.replaceMax
      ? `${s.replaceMax}%`
      : `${s.replaceMin}–${s.replaceMax}%`;
  const loHi =
    s.replaceMin === s.replaceMax
      ? rupees(v.hi)
      : `${rupees(v.lo)} – ${Math.round(v.hi).toLocaleString("en-IN")}`;
  const kg = Math.round(v.feedKg).toLocaleString("en-IN");
  const birds = s.birds.toLocaleString("en-IN");
  const fill = (t: string) => t.replace(/\{birds\}/g, birds);
  return (
    <>
      <Headline l1={s.title1} l2={s.title2} />
      {s.sub && <div className="sub s5s">{fill(s.sub)}</div>}
      <div className="calc">
        {[
          [
            "hen",
            `${birds} ${s.birdWord} × ${s.feedPerBird} g a day`,
            `${kg} kg feed`,
            false,
          ],
          ["feed", `Feed at ₹ ${s.feedPrice} / kg`, rupees(v.bill), false],
          ["fern", `Replace ${range} with Azolla`, loHi, true],
        ].map(([icon, label, value, green], i) => (
          <div key={i} className="row">
            <AzIcon name={icon as string} className="rico" />
            <span className="rl">{label as string}</span>
            <span className={`rv${green ? " g" : ""}`}>{value as string}</span>
          </div>
        ))}
      </div>
      <div className="bars">
        <div className="blabel">WITHOUT AZOLLA</div>
        <div className="bar before" style={{ width: 880 }}>
          <span>{rupees(v.bill)}</span>
        </div>
        <div className="blabel">WITH AZOLLA ({s.replaceMax}%)</div>
        <div className="barrow">
          <div className="bar after" style={{ width: after }}>
            <span>{rupees(v.bill - v.hi)}</span>
          </div>
          <div className="saved" style={{ width: 880 - after }}>
            SAVED
          </div>
        </div>
      </div>
      <div className="big">
        <div className="bigv">UP TO {rupees(v.hi)} / MONTH*</div>
        <div className="bigy">
          ≈ {rupees(Math.round(v.year / 500) * 500)} a year for {birds}{" "}
          {s.birdWord}
        </div>
      </div>
      {s.footnote && <p className="footnote">{s.footnote}</p>}
    </>
  );
}

function Slide6({ d }: { d: AzollaData }) {
  const s = d.s6;
  return (
    <>
      <Slot
        p={s.photo}
        className="top700"
        fallback={<Drawn kind="macro" w={1080} h={700} seed="s6" />}
      >
        <div className="fade" style={{ top: 360 }} />
      </Slot>
      <Headline l1={s.title1} l2={s.title2} top={640} />
      <div className="cbox">
        <span className="av">
          <AzIcon name="hen" className="avi" />
        </span>
        <span className="typed">{s.comment}</span>
        <i className="caret" />
        <span className="send">
          <Arrow />
        </span>
      </div>
      {s.cta && (
        <p className="cta">
          <Accent text={s.cta} />
        </p>
      )}
      {s.includes && <p className="incl">{s.includes}</p>}
    </>
  );
}

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6];

/** Slide `slide` (0–5) with its place `n` of `total` in the carousel. */
export const AzollaSlide = forwardRef<
  HTMLDivElement,
  { data: AzollaData; slide: number; n: number; total: number }
>(function AzollaSlide({ data: d, slide, n, total }, ref) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  useAutoFit(root, [d, slide], 1);
  const Body = SLIDES[slide] ?? Slide1;
  const footer = [d.s1, d.s2, d.s3, d.s4, d.s5, d.s6][slide]?.footer ?? "";
  const isLast = n === total;
  return (
    <div ref={root} className={`bvz canvas s${slide + 1}`}>
      <div className="gridbg" />
      <Body d={d} />
      <TopBar d={d} n={n} total={total} />
      <Footer
        text={isLast && d.handle ? `${d.handle}  •  ${footer}` : footer}
        arrow={!isLast}
      />
    </div>
  );
});
