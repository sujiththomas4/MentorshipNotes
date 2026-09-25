import { forwardRef, useImperativeHandle, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import type { FarmTipData } from "../farm-tip/data";
import { BvIcon, LeafPattern, Lines, PlacedPhoto, themeClass, useAutoFit, type FitResult } from "../shared";
import { BvFooter, BvHeader, FarmTipArtwork, bvGeo, logoSrc, type BvPageNo } from "../farm-tip/artwork";
import { FOLLOW_ACTION_ICONS } from "./data";
import type { BvPage, CoverPage, FeaturesPage, FollowPage, GuidePage, GuideSection, GuideTone, ListItem, PagesLook, PhotoSet, PromoPage, StepsPage } from "./data";
import "../farm-tip/artwork.css";
import "./pages.css";
import { ToonArtwork } from "./toon";

/*
 * One page of a multi-page Bethlehem Valley post. Farm tip pages are the Farm Tip artwork;
 * Cover, Steps, Promotion and Features pages use the same canvas, header and footer with their
 * own middle.
 */

type Props = { look: PagesLook; page: BvPage; n: number; total: number; onFit?: (r: FitResult) => void };

type ListPage = CoverPage | StepsPage | PromoPage | FeaturesPage | GuidePage | FollowPage;

const PHOTO_H = { story: { s: 420, m: 560, l: 700 }, feed: { s: 230, m: 300, l: 380 } } as const;

export const BvPageArtwork = forwardRef<HTMLDivElement, Props>(function BvPageArtwork({ look, page, n, total, onFit }, ref) {
  // the header style this page uses; memoised so the auto-fit only re-runs when the data changes
  const pageLook = useMemo(() => (page.smallHeader ? { ...look, headerStyle: "compact" as const } : look), [look, page.smallHeader]);
  const pageNo = look.pageNumbers ? { n, total } : undefined;
  const tipData = useMemo(() => (page.kind === "tip" ? ({ ...pageLook, ...page } as FarmTipData) : null), [pageLook, page]);
  if (page.kind === "toonCover" || page.kind === "toonIdea") return <ToonArtwork ref={ref} look={look} page={page} n={n} total={total} onFit={onFit} />;
  if (tipData) return <FarmTipArtwork ref={ref} data={tipData} onFit={onFit} page={pageNo} />;
  return <ListArtwork ref={ref} look={pageLook} page={page as ListPage} pageNo={pageNo} onFit={onFit} />;
});

const ListArtwork = forwardRef<HTMLDivElement, { look: PagesLook; page: ListPage; pageNo?: BvPageNo; onFit?: (r: FitResult) => void }>(function ListArtwork(
  { look, page, pageNo, onFit },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  useAutoFit(root, [look, page], 0.55, onFit);
  const g = bvGeo(look);
  const top = g.midTop + (g.feed ? 8 : 16);
  const bottom = g.footerH ? g.H - g.footerH - (g.feed ? 36 : 56) : g.H - g.bottomH;
  return (
    <div ref={root} className={`bv2 canvas pg-${page.kind}${g.feed ? " feed" : ""}${themeClass(look.theme)}`}>
      <BvHeader d={look} hs={g.hs} />
      <section
        className="pbody"
        style={{ top, height: bottom - top, ...(page.kind === "cover" ? coverVars(page) : page.kind === "guide" ? guideVars(page) : page.kind === "follow" ? followVars(page) : {}) }}
      >
        {page.kind === "cover" ? (
          <CoverBody p={page} />
        ) : page.kind === "follow" ? (
          <FollowBody p={page} />
        ) : page.kind === "guide" ? (
          <GuideBody p={page} />
        ) : page.kind === "steps" ? (
          <StepsBody p={page} />
        ) : page.kind === "promo" ? (
          <PromoBody p={page} feed={g.feed} />
        ) : (
          <FeaturesBody p={page} />
        )}
      </section>
      <BvFooter d={look} height={g.footerH} page={pageNo} />
    </div>
  );
});

function Photo({ p }: { p: PhotoSet }) {
  return p.photo ? (
    <PlacedPhoto src={p.photo} zoom={p.photoZoom} x={p.photoX} y={p.photoY} />
  ) : (
    <div className="ph">
      <svg viewBox="0 0 106 92" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="98" height="84" rx="10" stroke="currentColor" strokeWidth="7" />
        <path d="M14 78 40 46l16 18 12-12 24 26Z" fill="currentColor" />
        <circle cx="72" cy="30" r="9" fill="currentColor" />
      </svg>
      <span>ADD YOUR IMAGE HERE</span>
    </div>
  );
}

function StepsBody({ p }: { p: StepsPage }) {
  const marker = (i: number) =>
    p.listStyle === "numbers" ? p.startAt + i : <BvIcon name={p.listStyle === "checks" ? "check" : "leaf"} />;
  return (
    <div className="copy">
      <div>
        <span className="badge">
          <BvIcon name={p.categoryIcon || "check"} />
          {p.category}
        </span>
        {p.meta && <span className="metatxt">{p.meta}</span>}
      </div>
      <h1>
        <Lines text={p.heading} />
      </h1>
      {p.mlHeading.trim() && (
        <div className="mlh ml" lang="ml">
          <Lines text={p.mlHeading} />
        </div>
      )}
      <div className="rule" />
      {p.body.trim() && (
        <p className="body">
          <Lines text={p.body} />
        </p>
      )}
      {p.mlBody.trim() && (
        <p className="mlb ml" lang="ml">
          <Lines text={p.mlBody} />
        </p>
      )}
      {p.showPhoto && (
        <div className="sphoto">
          <Photo p={p} />
        </div>
      )}
      <ol className={`slist ${p.listStyle}${p.cards ? " cards" : ""}`}>
        {p.steps.map((s, i) => (
          <li key={i} className="step">
            <span className="mk">{marker(i)}</span>
            <div className="sx">
              {s.text.trim() && (
                <div className="st">
                  <Lines text={s.text} />
                </div>
              )}
              {s.ml.trim() && (
                <div className="sm ml" lang="ml">
                  <Lines text={s.ml} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {(p.note.trim() || p.mlNote.trim()) && (
        <div className="snote">
          <BvIcon name="lightbulb" />
          <div>
            {p.note.trim() && (
              <div className="nt">
                <Lines text={p.note} />
              </div>
            )}
            {p.mlNote.trim() && (
              <div className="nm ml" lang="ml">
                <Lines text={p.mlNote} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PromoBody({ p, feed }: { p: PromoPage; feed: boolean }) {
  const hl = p.highlights.filter((h) => h.label.trim() || h.value.trim());
  const adv = p.advantages.filter((a) => a.text.trim() || a.ml.trim());
  const rows = [
    p.phone.trim() && { icon: "phone", text: p.phone, cls: "big" },
    p.whatsapp.trim() && { icon: "whatsapp", text: p.whatsapp, cls: "" },
    p.address.trim() && { icon: "pin", text: p.address, cls: "small" },
    p.extra.trim() && { icon: p.extraIcon, text: p.extra, cls: "small" },
  ].filter(Boolean) as { icon: string; text: string; cls: string }[];
  const hasContact = rows.length > 0 || p.contactName.trim() || p.cta.trim();
  return (
    <>
      <div className="pphoto" style={{ height: PHOTO_H[feed ? "feed" : "story"][p.photoSize] }}>
        <Photo p={p} />
        {p.ribbon.trim() && (
          <span className="ribbon">
            <BvIcon name={p.ribbonIcon || "tag"} />
            {p.ribbon}
          </span>
        )}
        {p.price.trim() && (
          <div className="price">
            {p.priceLabel.trim() && <small>{p.priceLabel}</small>}
            <b>{p.price}</b>
            {p.priceNote.trim() && <span>{p.priceNote}</span>}
          </div>
        )}
      </div>

      <div className="copy">
        <h1>
          <Lines text={p.heading} />
        </h1>
        {p.mlHeading.trim() && (
          <div className="mlh ml" lang="ml">
            <Lines text={p.mlHeading} />
          </div>
        )}
        {p.location.trim() && (
          <div className="loc">
            <BvIcon name="pin" />
            {p.location}
          </div>
        )}
        {hl.length > 0 && (
          <div className="hl" style={{ gridTemplateColumns: `repeat(${hl.length}, minmax(0, 1fr))` }}>
            {hl.map((h, i) => (
              <div key={i} className="hli">
                <span className="ic">
                  <BvIcon name={h.icon} />
                </span>
                <div>
                  <small>{h.label}</small>
                  <b>{h.value}</b>
                </div>
              </div>
            ))}
          </div>
        )}
        {adv.length > 0 && (
          <>
            {p.advTitle.trim() && <div className="advh">{p.advTitle}</div>}
            <ul className={`adv${adv.length > 3 ? " two" : ""}`}>
              {adv.map((a, i) => (
                <li key={i}>
                  <span className="ck">
                    <BvIcon name="check" />
                  </span>
                  <div>
                    {a.text.trim() && <div className="at">{a.text}</div>}
                    {a.ml.trim() && (
                      <div className="am ml" lang="ml">
                        {a.ml}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {hasContact && (
        <div className="contact">
          <LeafPattern />
          <div className="cinfo">
            {p.contactTitle.trim() && <div className="clabel">{p.contactTitle}</div>}
            {p.contactName.trim() && <div className="cname">{p.contactName}</div>}
            {rows.map((r, i) => (
              <div key={i} className={`crow ${r.cls}`}>
                <BvIcon name={r.icon} />
                {r.text}
              </div>
            ))}
          </div>
          {(p.cta.trim() || p.mlCta.trim()) && (
            <div className="cta">
              {p.cta.trim() && (
                <span className="pill">
                  <BvIcon name={p.whatsapp.trim() && !p.phone.trim() ? "whatsapp" : "phone"} />
                  {p.cta}
                </span>
              )}
              {p.mlCta.trim() && (
                <span className="ml" lang="ml">
                  {p.mlCta}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function FeaturesBody({ p }: { p: FeaturesPage }) {
  const items = p.features.filter((f) => f.title.trim() || (f.text ?? "").trim() || f.ml.trim());
  return (
    <div className="copy">
      <div>
        <span className="badge">
          <BvIcon name={p.categoryIcon || "star"} />
          {p.category}
        </span>
        {p.meta && <span className="metatxt">{p.meta}</span>}
      </div>
      <h1>
        <Lines text={p.heading} />
      </h1>
      {p.mlHeading.trim() && (
        <div className="mlh ml" lang="ml">
          <Lines text={p.mlHeading} />
        </div>
      )}
      <div className="rule" />
      {p.body.trim() && (
        <p className="body">
          <Lines text={p.body} />
        </p>
      )}
      {p.mlBody.trim() && (
        <p className="mlb ml" lang="ml">
          <Lines text={p.mlBody} />
        </p>
      )}
      {p.showPhoto && (
        <div className={`sphoto size-${p.photoSize}`}>
          <Photo p={p} />
        </div>
      )}
      <div className={`fgrid ${p.layout}`}>
        {items.map((f, i) => (
          <div key={i} className="fcard">
            <span className="fi">
              <BvIcon name={f.icon} />
            </span>
            <div className="fb">
              {f.title.trim() && <div className="ftt">{f.title}</div>}
              {(f.text ?? "").trim() && (
                <div className="ftx">
                  <Lines text={f.text} />
                </div>
              )}
              {f.ml.trim() && (
                <div className="fml ml" lang="ml">
                  <Lines text={f.ml} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {(p.takeaway.trim() || p.mlTakeaway.trim()) && (
        <div className="ftake">
          <LeafPattern />
          <BvIcon name="star" />
          <div>
            {p.takeaway.trim() && (
              <div className="tt">
                <Lines text={p.takeaway} />
              </div>
            )}
            {p.mlTakeaway.trim() && (
              <div className="tm ml" lang="ml">
                <Lines text={p.mlTakeaway} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** The user's size settings (percent) as CSS variables for the cover styles. */
function coverVars(p: CoverPage) {
  const pct = (v: number) => String(Math.min(200, Math.max(40, Number(v) || 100)) / 100);
  return { "--ts": pct(p.titleSize), "--cs": pct(p.coversSize), "--ds": pct(p.textSize), "--bs": pct(p.ctaSize) } as CSSProperties;
}

function CoverBody({ p }: { p: CoverPage }) {
  const center = p.align === "center" ? " center" : "";
  const items = p.covers.filter((c) => c.text.trim() || c.ml.trim());
  const onPhoto = p.banner === "photo";
  const title = (
    <div className={`ctext${center}${onPhoto ? "" : " below"}`}>
      {p.eyebrow.trim() && (
        <span className="ceyebrow">
          <BvIcon name={p.eyebrowIcon || "star"} />
          {p.eyebrow}
        </span>
      )}
      <h1 className={`ctitle ${p.titleFont}`}>
        <Lines text={p.heading} />
      </h1>
      {p.mlHeading.trim() && (
        <div className="cmlt ml" lang="ml">
          <Lines text={p.mlHeading} />
        </div>
      )}
      {!onPhoto && <div className="crule" />}
    </div>
  );
  return (
    <div className="copy">
      {p.banner !== "plain" && (
        <div className="cban" style={{ height: `calc(${Math.min(900, Math.max(200, Number(p.bannerHeight) || 520))}px * var(--k) * var(--fz))` }}>
          {onPhoto && !p.photo ? (
            // no photo yet: a brand-green leaf background instead of the placeholder behind the title
            <div className="cempty">
              <LeafPattern />
            </div>
          ) : (
            <Photo p={p} />
          )}
          {onPhoto && (
            <>
              <div className="shade" />
              {title}
            </>
          )}
        </div>
      )}
      {!onPhoto && title}

      {/* flexible gaps share the free height between the sections */}
      <div className="cgap" />
      {items.length > 0 && (
        <div className={`ccov${center}`}>
          {p.coversTitle.trim() && <div className="clab">{p.coversTitle}</div>}
          <div className={`citems ${p.coversStyle}`}>
            {items.map((c, i) =>
              p.coversStyle === "chips" ? (
                <span key={i} className="chip">
                  <BvIcon name={c.icon} />
                  <span>
                    {c.text}
                    {c.text.trim() && c.ml.trim() && " · "}
                    {c.ml.trim() && (
                      <span className="m ml" lang="ml">
                        {c.ml}
                      </span>
                    )}
                  </span>
                </span>
              ) : (
                <div key={i} className="ci">
                  <span className="n">{p.coversStyle === "list" ? i + 1 : <BvIcon name={c.icon} />}</span>
                  <div>
                    {c.text.trim() && <div className="t">{c.text}</div>}
                    {c.ml.trim() && (
                      <div className="m ml" lang="ml">
                        {c.ml}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {(p.body.trim() || p.mlBody.trim()) && (
        <div className={`cdesc${center}`} style={{ marginTop: items.length ? "calc(30px * var(--k) * var(--fz))" : undefined }}>
          {p.body.trim() && (
            <p>
              <Lines text={p.body} />
            </p>
          )}
          {p.mlBody.trim() && (
            <p className="ml" lang="ml">
              <Lines text={p.mlBody} />
            </p>
          )}
        </div>
      )}

      <div className="cgap" />
      {p.showCta && (p.cta.trim() || p.mlCta.trim()) && (
        <div className={`ccta ${p.ctaAlign}`}>
          <span className={`cbtn ${p.ctaStyle}`}>
            <span>
              {p.cta}
              {p.mlCta.trim() && (
                <span className="ml" lang="ml">
                  {p.mlCta}
                </span>
              )}
            </span>
            <span className="arr">
              <BvIcon name="arrow" />
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- product guide ---------- */

const TONES: Record<GuideTone, string> = { green: "#0B6B48", red: "#C0392B", amber: "#B7791F", blue: "#1F6FA8", purple: "#6B46C1" };

function guideVars(p: GuidePage) {
  const pct = (v: number) => String(Math.min(200, Math.max(40, Number(v) || 100)) / 100);
  return { "--gh": pct(p.headingSize), "--gt": pct(p.textSize), "--tone": TONES[p.tone] ?? TONES.red } as CSSProperties;
}

const filled = (items: ListItem[]) => items.filter((i) => i.text.trim() || i.ml.trim());

function GuideHead({ s, cls = "", icon }: { s: GuideSection; cls?: string; icon: string }) {
  return s.title.trim() ? (
    <div className={`gh ${cls}`}>
      <BvIcon name={icon} />
      {s.title}
    </div>
  ) : null;
}

function GuideList({ items, cls, mark }: { items: ListItem[]; cls: string; mark: string }) {
  return (
    <ul className={`glist ${cls}`}>
      {items.map((it, i) => (
        <li key={i}>
          <span className="mk">
            <BvIcon name={mark} />
          </span>
          <div>
            {it.text.trim() && (
              <div className="t">
                <Lines text={it.text} />
              </div>
            )}
            {it.ml.trim() && (
              <div className="m ml" lang="ml">
                <Lines text={it.ml} />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function GuideChips({ items, crop }: { items: ListItem[]; crop?: boolean }) {
  return (
    <div className="gchips">
      {items.map((it, i) => (
        <span key={i} className={`gchip${crop ? " crop" : ""}`}>
          <BvIcon name={crop ? "sprout" : "bug"} />
          <span>
            {it.text}
            {it.text.trim() && it.ml.trim() && " · "}
            {it.ml.trim() && (
              <span className="m ml" lang="ml">
                {it.ml}
              </span>
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Sections in the page's order; "when" and "when not" next to each other become two side-by-side cards. */
function GuideBody({ p }: { p: GuidePage }) {
  const visible = p.sections.filter((s) => {
    if (!s.show) return false;
    if (s.id === "title" || s.id === "disclaimer") return s.id === "title" || !!(p.disclaimer.trim() || p.mlDisclaimer.trim());
    if (s.id === "dosage") return p.dosage.some((d) => d.label.trim() || d.value.trim());
    return filled(p[s.id]).length > 0;
  });
  const out: ReactNode[] = [];
  for (let i = 0; i < visible.length; i++) {
    const s = visible[i];
    const next = visible[i + 1];
    if ((s.id === "when" && next?.id === "whenNot") || (s.id === "whenNot" && next?.id === "when")) {
      const [a, b] = s.id === "when" ? [s, next] : [next, s];
      out.push(
        <div key="pair" className="gpair">
          <div className="gcard">
            <GuideHead s={a} cls="ok" icon="check" />
            <GuideList items={filled(p.when)} cls="ok" mark="check" />
          </div>
          <div className="gcard no">
            <GuideHead s={b} cls="no" icon="cross" />
            <GuideList items={filled(p.whenNot)} cls="no" mark="cross" />
          </div>
        </div>,
      );
      i++;
      continue;
    }
    out.push(<GuideSectionView key={s.id} s={s} p={p} />);
  }
  // a flexible gap before every section except the first and the bottom disclaimer
  const spaced = out.flatMap((node, i) => (i === 0 || (node as { key?: string }).key === "disclaimer" ? [node] : [<div key={`gap${i}`} className="ggap" />, node]));
  return <div className="copy">{spaced}</div>;
}

function GuideSectionView({ s, p }: { s: GuideSection; p: GuidePage }) {
  switch (s.id) {
    case "title":
      return (
        <div className="gtitle">
          <div>
            {p.typeLabel.trim() && (
              <span className="gbadge">
                <BvIcon name={p.typeIcon || "bug"} />
                {p.typeLabel}
              </span>
            )}
            <h1 className="gname">
              <Lines text={p.heading} />
            </h1>
            {p.mlHeading.trim() && (
              <div className="gml ml" lang="ml">
                <Lines text={p.mlHeading} />
              </div>
            )}
            {p.ingredient.trim() && (
              <div className="ging">
                <BvIcon name="flask" />
                {p.ingredient}
              </div>
            )}
          </div>
          {p.showPhoto && (
            <div className="gphoto">
              <Photo p={p} />
            </div>
          )}
        </div>
      );
    case "targets":
      return (
        <div className="gsec">
          <GuideHead s={s} cls="tone" icon="bug" />
          <GuideChips items={filled(p.targets)} />
        </div>
      );
    case "crops":
      return (
        <div className="gsec">
          <GuideHead s={s} icon="sprout" />
          <GuideChips items={filled(p.crops)} crop />
        </div>
      );
    case "when":
      return (
        <div className="gsec">
          <GuideHead s={s} cls="ok" icon="check" />
          <GuideList items={filled(p.when)} cls="ok" mark="check" />
        </div>
      );
    case "whenNot":
      return (
        <div className="gsec">
          <GuideHead s={s} cls="no" icon="cross" />
          <GuideList items={filled(p.whenNot)} cls="no" mark="cross" />
        </div>
      );
    case "dosage":
      return (
        <div className="gsec">
          <GuideHead s={s} icon="drop" />
          <div className="gfacts">
            {p.dosage
              .filter((d) => d.label.trim() || d.value.trim())
              .map((d, i) => (
                <div key={i} className="gf">
                  <span className="ic">
                    <BvIcon name={d.icon} />
                  </span>
                  <div>
                    <small>{d.label}</small>
                    <b>{d.value}</b>
                  </div>
                </div>
              ))}
          </div>
        </div>
      );
    case "advantages": {
      const items = filled(p.advantages);
      return (
        <div className="gsec">
          <GuideHead s={s} icon="star" />
          <GuideList items={items} cls={`gold${items.length > 3 ? " two" : ""}`} mark="check" />
        </div>
      );
    }
    case "safety":
      return (
        <div className="gsafe">
          <GuideHead s={s} icon="alert" />
          <GuideList items={filled(p.safety)} cls="" mark="alert" />
        </div>
      );
    case "disclaimer":
      return (
        <div className="gdisc">
          <BvIcon name="info" />
          <span>
            {p.disclaimer}
            {p.mlDisclaimer.trim() && (
              <span className="m ml" lang="ml">
                {p.mlDisclaimer}
              </span>
            )}
          </span>
        </div>
      );
  }
}

/* ---------- follow (closing page) ---------- */

function followVars(p: FollowPage) {
  const pct = (v: number) => String(Math.min(200, Math.max(40, Number(v) || 100)) / 100);
  return { "--ts": pct(p.titleSize), "--ds": pct(p.textSize), "--bs": pct(p.buttonSize) } as CSSProperties;
}

function FollowBody({ p }: { p: FollowPage }) {
  const green = p.background === "green";
  const perks = p.perks.filter((c) => c.text.trim() || c.ml.trim());
  const actions = p.actions.filter((a) => a.show && (a.label.trim() || a.ml.trim()));
  return (
    <div className={`copy${green ? " fgreen" : ""}`}>
      {green && <LeafPattern />}
      {p.showLogo && <img className="flogo" src={logoSrc(p.logo)} alt="Bethlehem Valley" />}
      <h1 className="fhead">
        <Lines text={p.heading} />
      </h1>
      {p.mlHeading.trim() && (
        <div className="fml ml" lang="ml">
          <Lines text={p.mlHeading} />
        </div>
      )}
      {p.handle.trim() && (
        <div className="fhandle">
          <BvIcon name="instagram" />
          {p.handle}
        </div>
      )}
      {(p.body.trim() || p.mlBody.trim()) && (
        <div className="fbody">
          {p.body.trim() && (
            <p>
              <Lines text={p.body} />
            </p>
          )}
          {p.mlBody.trim() && (
            <p className="ml" lang="ml">
              <Lines text={p.mlBody} />
            </p>
          )}
        </div>
      )}
      {perks.length > 0 && (
        <div className="fperks">
          {perks.map((c, i) => (
            <span key={i} className="chip">
              <BvIcon name={c.icon} />
              <span>
                {c.text}
                {c.text.trim() && c.ml.trim() && " · "}
                {c.ml.trim() && (
                  <span className="m ml" lang="ml">
                    {c.ml}
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>
      )}
      {actions.length > 0 && (
        <div className="facts">
          {actions.map((a) => (
            <div key={a.id} className="fact">
              <span className="c">
                <BvIcon name={FOLLOW_ACTION_ICONS[a.id]} />
              </span>
              {a.label.trim() && <b>{a.label}</b>}
              {a.ml.trim() && (
                <span className="ml" lang="ml">
                  {a.ml}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {p.showButton && (p.button.trim() || p.mlButton.trim()) && (
        <span className="fbtn">
          <BvIcon name="userplus" />
          <span>
            {p.button}
            {p.mlButton.trim() && (
              <span className="ml" lang="ml">
                {p.mlButton}
              </span>
            )}
          </span>
        </span>
      )}
    </div>
  );
}
