"use client";

import { useEffect, useRef, useState } from "react";
import { PIPELINE, type AnalysisPhase } from "@/hooks/useAnalysis";
import { bandFor, type AnalysisResult } from "@/lib/types";
import { BandPill, Button, Chip, Meter } from "./ui";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/* ── Pipeline: a real sequence, so numbering is earned ──────────────── */
export function Pipeline({ phase, step, timings }:
  { phase: AnalysisPhase; step: number; timings: number[] }) {
  return (
    <ul className="flex flex-col">
      {PIPELINE.map((s, i) => {
        const done = phase === "complete" || i < step;
        const running = phase === "running" && i === step;
        return (
          <li key={s.label}
            className={`grid grid-cols-[18px_1fr_auto] items-center gap-2.5 py-1.5 text-[12.5px]
              ${running ? "text-ink" : done ? "text-ink-2" : "text-ink-3"}`}>
            <span className="font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
            <span>{s.label}</span>
            {running && <span className="h-[9px] w-[9px] animate-spin rounded-full border-[1.4px] border-line-strong border-t-info" />}
            {done && timings[i] != null && <span className="font-mono text-[10px] text-ink-3">{timings[i]}ms</span>}
          </li>
        );
      })}
    </ul>
  );
}

/* ── Verdict ────────────────────────────────────────────────────────── */
export function Verdict({ result }: { result: AnalysisResult }) {
  const normal = result.label === "NORMAL";
  return (
    <div className="border-b border-line px-[22px] py-[22px]">
      <span className="type-label">Classification</span>
      <p key={result.label + result.confidence}
        className={`animate-reveal text-[clamp(34px,3.6vw,46px)] leading-none ${normal ? "text-normal" : "text-pneumonia"}`}
        style={{ fontVariationSettings: '"wdth" 78, "wght" 640', letterSpacing: "-.02em" }}>
        {result.label}
      </p>
      <p className="mt-2.5 max-w-[34ch] text-[12.5px] leading-[1.5] text-ink-2">
        {normal
          ? "No pneumonia-like pattern found in this film. A negative result does not rule out disease."
          : "Findings consistent with pneumonia in the labelled training distribution. Prototype output — confirm against the film."}
      </p>
    </div>
  );
}

/* ── Confidence, on an exposure-style scale from 50 to 100 ──────────── */
function useCountUp(target: number, deps: unknown[]) {
  const [v, setV] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 620);
      setV(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return v;
}

export function ConfidenceScale({ result }: { result: AnalysisResult }) {
  const target = result.confidence * 100;
  const shown = useCountUp(target, [target]);
  const margin = Math.abs(result.probabilities.PNEUMONIA - result.probabilities.NORMAL) * 100;
  return (
    <section className="border-b border-line px-[22px] py-5">
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <h3 className="type-h3">Confidence</h3>
        <BandPill band={bandFor(result.confidence)} />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="type-num text-[30px] font-medium">{shown.toFixed(1)}%</span>
        <span className="type-label">margin {margin.toFixed(1)} pts</span>
      </div>
      <div className="relative mt-2 h-[22px]">
        <span className="absolute inset-x-0 top-0 h-[3px] bg-sunken" />
        <span className="absolute left-0 top-0 h-[3px] bg-ink transition-[width] duration-700 ease-reveal"
          style={{ width: `${Math.max(0, Math.min(100, (target - 50) * 2))}%` }} />
      </div>
      <div className="flex justify-between font-mono text-[9.5px] text-ink-3">
        {[50, 60, 70, 80, 90, 100].map((t) => <span key={t}>{t}</span>)}
      </div>
    </section>
  );
}

/* ── One diverging axis carries both class probabilities ────────────── */
export function ProbabilityAxis({ result }: { result: AnalysisResult }) {
  const p = result.probabilities.PNEUMONIA;
  return (
    <section className="border-b border-line px-[22px] py-5">
      <h3 className="type-h3 mb-3.5">Class probability</h3>
      <div className="flex justify-between font-mono text-[10.5px]">
        <span className="text-normal">Normal</span><span className="text-pneumonia">Pneumonia</span>
      </div>
      <div className="relative my-[9px] h-[26px] overflow-hidden rounded-sm bg-sunken">
        <span className="absolute inset-y-0 left-0 bg-normal/[.16] transition-[width] duration-700 ease-reveal"
          style={{ width: `${result.probabilities.NORMAL * 100}%` }} />
        <span className="absolute inset-y-0 right-0 bg-pneumonia/[.16] transition-[width] duration-700 ease-reveal"
          style={{ width: `${p * 100}%` }} />
        <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
        <span className="absolute -inset-y-[3px] w-0.5 bg-ink transition-[left] duration-700 ease-reveal"
          style={{ left: `${p * 100}%` }} />
      </div>
      <div className="flex justify-between font-mono text-[11.5px] text-ink-2">
        <span>{pct(result.probabilities.NORMAL)}</span><span>{pct(p)}</span>
      </div>
    </section>
  );
}

/* ── Severity index — labelled prototype everywhere it appears ──────── */
export function SeverityIndex({ result }: { result: AnalysisResult }) {
  const v = result.severityIndex;
  return (
    <section className="border-b border-line px-[22px] py-5">
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <h3 className="type-h3">Severity index</h3><span className="type-label">prototype</span>
      </div>
      <div className="mb-[9px] flex items-baseline gap-2.5">
        <span className="type-num text-[22px]">{v == null ? "n/a" : `${v} / 100`}</span>
        <span className="type-label">
          {v == null ? "not computed for normal films"
            : v > 66 ? "upper third of the index range"
            : v > 33 ? "middle of the index range" : "lower third of the index range"}
        </span>
      </div>
      <Meter value={v ?? 0} tone="uncertain" />
      <p className="type-label mt-2.5 leading-[1.5]">
        Derived from image statistics only. It is not a clinical severity score and must not be read as one.
      </p>
    </section>
  );
}

/* ── The whole right-hand panel ─────────────────────────────────────── */
export function AnalysisPanel({
  phase, step, timings, result, error, canRun, onRun, onExplain,
}: {
  phase: AnalysisPhase; step: number; timings: number[];
  result: AnalysisResult | null; error: string | null;
  canRun: boolean; onRun: () => void; onExplain: () => void;
}) {
  const chip = {
    empty: ["Idle", "var(--ink-3)"], ready: ["Ready", "var(--blue)"],
    running: ["Analyzing", "var(--amber)"], complete: ["Complete", "var(--green)"],
    error: ["Failed", "var(--red)"],
  }[phase];

  return (
    <aside aria-label="Analysis"
      className="sticky top-[52px] min-h-0 border-t border-line bg-raised lg:min-h-[calc(100vh-52px)] lg:border-l lg:border-t-0">
      <section className="border-b border-line px-[22px] pb-5 pt-[22px]">
        <div className="mb-3.5 flex items-baseline justify-between gap-3">
          <h3 className="type-h3">Analysis</h3>
          <Chip dot={chip[1]}>{chip[0]}</Chip>
        </div>
        <Pipeline phase={phase} step={step} timings={timings} />
        <Button className="mt-4 w-full justify-center" disabled={!canRun || phase === "running"} onClick={onRun}>
          {phase === "running" ? "Analyzing…" : phase === "complete" ? "Re-run analysis"
            : phase === "error" ? "Retry analysis" : "Analyze X-ray"}
        </Button>
        <p className="type-label mt-2.5 leading-[1.5]">
          Results come from a mock adapter. Point <code>PneumaApi.analyze()</code> at your Python service
          to use the real forest.
        </p>
      </section>

      {!result && (
        <section className="border-b border-line px-[22px] py-5">
          <p className="text-[13px] leading-[1.6] text-ink-3">
            {phase === "error"
              ? error ?? "The classifier did not respond. Check that the service is running, then retry."
              : phase === "running"
                ? "Reading the film. Each stage is reported above as it completes."
                : "No result yet. The classification, its probability split and the confidence band will appear here once the forest has voted."}
          </p>
        </section>
      )}

      {result && (
        <>
          <Verdict result={result} />
          <ConfidenceScale result={result} />
          <ProbabilityAxis result={result} />
          <SeverityIndex result={result} />
          <section className="px-[22px] py-5">
            <Button variant="ghost" size="sm" className="w-full justify-center" onClick={onExplain}>
              See the explanation
            </Button>
          </section>
        </>
      )}
    </aside>
  );
}
