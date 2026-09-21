"use client";

import { Radiograph, AttributionLayer } from "@/lib/radiograph";
import type { AnalysisResult } from "@/lib/types";
import type { Study } from "./viewer";
import { Burn, Lightbox } from "./viewer";
import { EmptyState, Meter } from "./ui";

function Film({ study, filter }: { study: Study; filter?: string }) {
  return (
    <div className="absolute inset-0" style={{ filter }}>
      {study.src
        ? <img src={study.src} alt="" className="h-full w-full object-contain" />
        : <Radiograph seed={study.seed ?? 1} finding={study.finding ?? "NORMAL"}
            severity={study.severity ?? 0.4} className="h-full w-full" />}
    </div>
  );
}

export function Explainability({ study, result }: { study: Study | null; result: AnalysisResult | null }) {
  if (!study || !result) {
    return (
      <EmptyState
        title="Nothing to explain yet"
        body="Run an analysis and this section fills with the processed film, the regions that carried weight, and the feature contributions behind them."
      />
    );
  }

  const tiles = [
    { key: "src", caption: "As uploaded", note: "Original film, unwindowed.", burn: "SOURCE", filter: undefined },
    { key: "proc", caption: "Model input", note: "Resampled to 224 x 224, greyscale, intensity-normalised.", burn: "PROCESSED", filter: "grayscale(1) contrast(1.28) brightness(1.06)" },
    { key: "attr", caption: "Region attribution", note: "Patch-level contribution map. Prototype method, not Grad-CAM.", burn: "ATTRIBUTION", filter: undefined },
  ];
  const top = result.features[0]?.contribution ?? 1;

  return (
    <>
      <div className="grid gap-3.5 md:grid-cols-3">
        {tiles.map((t) => (
          <figure key={t.key} className="m-0">
            <Lightbox className="aspect-square">
              <Film study={study} filter={t.filter} />
              {t.key === "attr" && (
                <span className="absolute inset-0 z-[4]" style={{ mixBlendMode: "screen" }}>
                  <AttributionLayer regions={result.regions} className="h-full w-full" />
                </span>
              )}
              <Burn at="tl">{t.burn}</Burn>
              {t.key === "proc" && <Burn at="br">224 x 224</Burn>}
              {t.key === "attr" && (
                <Burn at="br">{result.regions.length} region{result.regions.length > 1 ? "s" : ""}</Burn>
              )}
            </Lightbox>
            <figcaption className="mt-[9px]">
              <span className="type-strong text-[13px]">{t.caption}</span>
              <p className="mt-[3px] text-xs leading-[1.45] text-ink-3">{t.note}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="my-[34px] border-l-2 border-info py-0.5 pl-4">
        <p className="max-w-[58ch] text-sm leading-[1.6]">{result.narrative}</p>
        <p className="type-label mt-[9px]">
          Generated from the mock adapter. Replace with the <code>/explain</code> response.
        </p>
      </div>

      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <h3 className="type-h3">Feature contributions</h3>
        <span className="type-label">placeholder names — awaiting backend schema</span>
      </div>
      <div>
        {result.features.map((f) => (
          <div key={f.name}
            className="grid grid-cols-[minmax(0,1fr)_52px] items-center gap-3.5 border-b border-line py-[11px] last:border-b-0 sm:grid-cols-[minmax(0,1fr)_84px_52px]">
            <span className="text-[13.5px]">{f.name}
              <span className="mt-0.5 block text-[11.5px] text-ink-3">{f.detail}</span></span>
            <Meter value={(f.contribution / top) * 100} tone="info" className="hidden sm:block" />
            <span className="type-num text-right text-xs text-ink-2">{(f.contribution * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </>
  );
}
