import { Fragment } from "react";
import type { ModelMetrics } from "@/lib/types";

const p1 = (n: number) => (n * 100).toFixed(2);
const dash = (n: number | null) => (n == null ? "—" : String(n));

export function MetricGrid({ m }: { m: ModelMetrics }) {
  const items = [
    { v: p1(m.accuracy), k: "Accuracy",
      d: m.confusion && m.testSize
        ? `${m.confusion.tn + m.confusion.tp} of ${m.testSize} films classified correctly.`
        : "Share of films classified correctly." },
    { v: p1(m.precision), k: "Precision", d: "Of films called pneumonia, this share truly were." },
    { v: p1(m.recall), k: "Recall", d: "Of true pneumonia films, this share were caught." },
    { v: p1(m.f1), k: "F1", d: "Balance of the two above." },
  ];
  return (
    <div className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
      {items.map((i, n) => (
        <div key={i.k}
          className={`px-6 pb-7 pt-[26px] ${n < 3 ? "lg:border-r lg:border-line" : ""} ${n % 2 === 0 ? "border-r border-line" : ""} ${n < 2 ? "border-b border-line lg:border-b-0" : ""}`}>
          <span className="type-num block text-[clamp(30px,3.4vw,44px)] font-medium leading-none">
            {i.v}<span className="ml-0.5 text-[.5em] text-ink-3">%</span>
          </span>
          <span className="mt-[9px] block text-[13px]">{i.k}</span>
          <span className="mt-1 block text-[11.5px] leading-[1.45] text-ink-3">{i.d}</span>
        </div>
      ))}
    </div>
  );
}

export function ConfusionMatrix({ m }: { m: ModelMetrics }) {
  if (!m.confusion) {
    return <p className="text-[13.5px] text-ink-3">Awaiting counts from <code>/metrics</code>.</p>;
  }
  const { tn, fp, fn, tp } = m.confusion;
  const cells = [
    { v: tn, k: "True negative", pct: tn / (tn + fp), tone: "normal", d: 0.1 },
    { v: fp, k: "False positive — healthy film called pneumonia", pct: fp / (tn + fp), tone: "pneumonia", d: 0.07 },
    { v: fn, k: "False negative — missed pneumonia", pct: fn / (fn + tp), tone: "pneumonia", d: 0.05 },
    { v: tp, k: "True positive", pct: tp / (fn + tp), tone: "normal", d: 0.16 },
  ];
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[420px] grid-cols-[96px_1fr_1fr] gap-px border border-line bg-line">
        <div className="bg-paper px-4 py-3.5" />
        {["Predicted normal", "Predicted pneumonia"].map((h) => (
          <div key={h} className="flex items-end bg-paper px-4 py-3.5 font-mono text-[10.5px] text-ink-3">{h}</div>
        ))}
        {["Actually normal", "Actually pneumonia"].map((row, r) => (
          <Fragment key={row}>
            <div className="flex items-center bg-paper px-4 py-3.5 font-mono text-[10.5px] text-ink-3">{row}</div>
            {cells.slice(r * 2, r * 2 + 2).map((c) => (
              <div key={c.k} className="relative flex min-h-[104px] flex-col justify-end bg-paper px-4 py-3.5">
                <span className="absolute inset-0"
                  style={{ background: c.tone === "normal" ? "var(--green)" : "var(--red)", opacity: c.d }} />
                <span className="type-num absolute right-4 top-3.5 text-[10.5px] text-ink-3">
                  {(c.pct * 100).toFixed(1)}%
                </span>
                <span className={`type-num relative text-[30px] font-medium leading-none ${c.tone === "normal" ? "text-normal" : "text-pneumonia"}`}>
                  {c.v}
                </span>
                <span className="relative mt-1.5 text-[11.5px] text-ink-3">{c.k}</span>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function DatasetDistribution({ m }: { m: ModelMetrics }) {
  return (
    <>
      <div>
        {m.splits.map((s) => {
          const known = s.normal != null && s.pneumonia != null;
          const total = known ? s.normal! + s.pneumonia! : null;
          return (
            <div key={s.name}
              className={`grid grid-cols-[1fr_72px] items-center gap-4 border-b border-line py-[13px] last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)_92px] ${known ? "" : "text-ink-3"}`}>
              <span className="text-[13.5px]">{s.name}</span>
              <span className="col-span-2 flex h-[22px] overflow-hidden rounded-sm bg-sunken sm:col-span-1"
                style={known ? undefined : {
                  background: "repeating-linear-gradient(45deg,var(--sunken),var(--sunken) 5px,transparent 5px,transparent 10px)",
                }}>
                {known && <>
                  <i className="block h-full bg-normal/[.55]" style={{ width: `${(s.normal! / total!) * 100}%` }} />
                  <i className="block h-full bg-pneumonia/[.55]" style={{ width: `${(s.pneumonia! / total!) * 100}%` }} />
                </>}
              </span>
              <span className="type-num text-right text-xs text-ink-2">{dash(total)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-6">
        {[["Normal", "var(--green)", m.splits[0]?.normal], ["Pneumonia", "var(--red)", m.splits[0]?.pneumonia]]
          .map(([k, c, n]) => (
            <span key={String(k)} className="type-label flex items-center gap-[7px]">
              <i className="h-[9px] w-[9px] rounded-sm opacity-[.55]" style={{ background: String(c) }} />
              {String(k)} · {dash(n as number | null)}
            </span>
          ))}
      </div>
    </>
  );
}

export function SpecSheet({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid max-w-[620px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[150px_minmax(0,1fr)] gap-5 border-b border-line py-[11px] last:border-b-0">
          <dt className="text-[12.5px] text-ink-3">{k}</dt>
          <dd className="m-0 font-mono text-[12.5px]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
