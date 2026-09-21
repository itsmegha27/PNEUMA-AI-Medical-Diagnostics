"use client";

import { useCallback, useRef, useState } from "react";
import { PneumaApi } from "@/lib/api/client";
import type { AnalysisResult, AnalyzeRequest } from "@/lib/types";

/** Ordered stages shown while the forest works. Durations are presentation only. */
export const PIPELINE: { label: string; ms: number }[] = [
  { label: "Decode and validate", ms: 420 },
  { label: "Resample to 224 x 224", ms: 520 },
  { label: "Normalise intensity", ms: 480 },
  { label: "Extract intensity and texture features", ms: 900 },
  { label: "Random-forest ensemble vote", ms: 760 },
  { label: "Aggregate region attribution", ms: 620 },
];

/** The network call fires on this stage; the rest is staged feedback. */
const CALL_AT = 4;

export type AnalysisPhase = "empty" | "ready" | "running" | "complete" | "error";

export function useAnalysis() {
  const [phase, setPhase] = useState<AnalysisPhase>("empty");
  const [step, setStep] = useState(-1);
  const [timings, setTimings] = useState<number[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  const reset = useCallback((hasStudy: boolean) => {
    setPhase(hasStudy ? "ready" : "empty");
    setStep(-1); setTimings([]); setResult(null); setError(null);
  }, []);

  const run = useCallback(async (req: AnalyzeRequest) => {
    if (busy.current) return;
    busy.current = true;
    setPhase("running"); setResult(null); setError(null);

    const reduced = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const marks: number[] = [];
    let payload: AnalysisResult | null = null;

    try {
      for (let i = 0; i < PIPELINE.length; i++) {
        setStep(i);
        const ms = reduced ? 60 : PIPELINE[i].ms * (0.75 + Math.random() * 0.5);
        if (i === CALL_AT) payload = await PneumaApi.analyze(req);
        await new Promise((r) => setTimeout(r, ms));
        marks[i] = Math.round(ms);
        setTimings([...marks]);
      }
      setStep(-1); setResult(payload); setPhase("complete");
      return payload;
    } catch (e) {
      setStep(-1);
      setError(e instanceof Error ? e.message : "The classifier did not respond");
      setPhase("error");
      return null;
    } finally {
      busy.current = false;
    }
  }, []);

  return { phase, step, timings, result, error, run, reset };
}
