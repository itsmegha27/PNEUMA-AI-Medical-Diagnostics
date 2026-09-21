import type { AnalysisResult, ClassLabel, HistoryEntry } from "./types";

const KEY = "pneuma.history.v1";

export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as HistoryEntry[]; }
  catch { return []; }
}

export function writeHistory(list: HistoryEntry[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 60))); } catch { /* quota or private mode */ }
}

export function appendRun(
  result: AnalysisResult,
  study: { name: string; previewSeed: number | null; previewLabel: ClassLabel },
): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: "AN-" + Date.now().toString(36).toUpperCase().slice(-6),
    studyName: study.name,
    at: Date.now(),
    label: result.label,
    confidence: result.confidence,
    status: result.confidence < 0.7 ? "review" : "complete",
    previewSeed: study.previewSeed,
    previewLabel: study.previewLabel,
  };
  const next = [entry, ...readHistory()];
  writeHistory(next);
  return next;
}

export function relativeTime(ts: number): string {
  const delta = Date.now() - ts;
  if (delta < 60_000) return "just now";
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} min ago`;
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
