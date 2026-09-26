import { DirectionToggle, Field, Panel, SwingEditorShell, inputCls, type Setter } from "@/social/instagram/swing-trade/editor";
import { SwingFundamentalsArtwork } from "./artwork";
import { crore, defaultData, exampleData, mergeData, peCompare, percent, type SwingFundamentalsData } from "./data";

const STORE_KEY = "social:Instagram_SwingTradeFundamentals";

const SECTORS = ["Banking", "Financial Services", "IT", "Pharma", "FMCG", "Auto", "Auto Ancillary", "Capital Goods", "Metals", "Energy", "Oil & Gas", "Power", "Infrastructure", "Realty", "Cement", "Chemicals", "Telecom", "Consumer Durables", "Textiles", "Media"];

export function SwingFundamentalsEditor() {
  return (
    <SwingEditorShell<SwingFundamentalsData>
      storeKey={STORE_KEY}
      defaults={defaultData}
      merge={(raw) => mergeData(raw as Partial<Record<keyof SwingFundamentalsData, unknown>> | null)}
      example={{ label: "Load example (sample numbers)", data: exampleData }}
      Artwork={SwingFundamentalsArtwork}
      filePrefix="swing-fundamentals"
      jsonTemplate="swing-trade-fundamentals"
      chart={{ note: "Upload the stock's chart. Without an image the chart box shows a placeholder.", illustrative: false }}
      extraText={(data, set) => (
        <Field label="Banner (under the title)">
          <input value={data.banner} onChange={(e) => set("banner", e.target.value)} className={inputCls} placeholder="TRADE SETUP" />
        </Field>
      )}
    >
      {(data, set) => <FundamentalsPanel data={data} set={set} />}
    </SwingEditorShell>
  );
}

function FundamentalsPanel({ data, set }: { data: SwingFundamentalsData; set: Setter<SwingFundamentalsData> }) {
  const pe = peCompare(data);
  const input = (k: keyof SwingFundamentalsData, placeholder: string, decimal = true) => (
    <input value={data[k] as string} onChange={(e) => set(k, e.target.value)} className={inputCls} placeholder={placeholder} inputMode={decimal ? "decimal" : undefined} />
  );
  return (
    <Panel title="Fundamentals" note="Numbers are shown as ₹… Cr and …% on the post; anything that is not a number is shown as typed.">
      <DirectionToggle value={data.direction} onChange={(v) => set("direction", v)} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Sector">
          <input value={data.sector} onChange={(e) => set("sector", e.target.value)} className={inputCls} list="sf-sector" placeholder="e.g. Capital Goods" />
          <datalist id="sf-sector">
            {SECTORS.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </Field>
        <Field label="Market cap (₹ Cr)">{input("marketCap", "e.g. 48250")}</Field>
        <Field label="Sales (₹ Cr)">{input("sales", "e.g. 12640")}</Field>
        <Field label="ROCE (%)">{input("roce", "e.g. 24.6")}</Field>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        On the post: {data.sector.trim() || "—"} · {crore(data.marketCap)} · {crore(data.sales)} · {percent(data.roce)}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Time frame">
          <input value={data.timeframe} onChange={(e) => set("timeframe", e.target.value)} className={inputCls} list="sf-tf" />
          <datalist id="sf-tf">
            {["Daily", "Weekly", "Monthly", "4H", "Hourly"].map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </Field>
        <Field label="Net profit (₹ Cr)">{input("netProfit", "e.g. 1385")}</Field>
        <Field label="Promoter holding (%)">{input("promoterHolding", "e.g. 56.2")}</Field>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Company PE">{input("companyPe", "e.g. 32.4")}</Field>
        <Field label="Industry PE">{input("industryPe", "e.g. 41.8")}</Field>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Shown as “{pe.value}”{pe.relation && <> · the company trades {pe.relation} its industry&apos;s PE</>}.
      </p>
    </Panel>
  );
}
