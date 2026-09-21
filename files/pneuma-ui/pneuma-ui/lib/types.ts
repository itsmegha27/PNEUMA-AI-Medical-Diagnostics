/** Shapes the UI renders against. The backend adapter's job is to produce these. */

export type ClassLabel = "NORMAL" | "PNEUMONIA";

/** A weighted patch in film space (the 400 x 500 coordinate system of the viewer). */
export interface Region { x: number; y: number; r: number; weight: number }

/** One descriptor's share of the decision. `contribution` values sum to 1. */
export interface FeatureContribution { name: string; detail: string; contribution: number }

export interface AnalysisResult {
  label: ClassLabel;
  probabilities: Record<ClassLabel, number>;
  /** Probability of the winning class, 0-1. */
  confidence: number;
  /** Image-derived index, 0-100. Not a clinical severity score. Null for normal films. */
  severityIndex: number | null;
  regions: Region[];
  features: FeatureContribution[];
  narrative: string;
  modelVersion: string;
}

export interface ConfusionMatrix { tn: number; fp: number; fn: number; tp: number }

/** `null` counts render as em dashes — used wherever the backend has nothing to give yet. */
export interface SplitSummary { name: string; normal: number | null; pneumonia: number | null }

export interface ModelMetrics {
  accuracy: number; precision: number; recall: number; f1: number;
  confusion: ConfusionMatrix | null;
  testSize: number | null;
  splits: SplitSummary[];
  /** True when `confusion` was reconstructed from the metrics rather than reported. */
  confusionIsDerived: boolean;
}

export interface DatasetItem {
  id: string; label: ClassLabel;
  /** Seed for the synthetic renderer. Replace with `imageUrl` once films are served. */
  previewSeed: number;
  severity: number;
  imageUrl?: string;
}

export type RunStatus = "complete" | "review" | "failed";

export interface HistoryEntry {
  id: string; studyName: string; at: number;
  label: ClassLabel; confidence: number; status: RunStatus;
  previewSeed: number | null; previewLabel: ClassLabel;
}

/** What the workspace hands to the API layer. */
export interface AnalyzeRequest {
  file?: File;
  /** Stable key used by the mock adapter so a given study always scores the same. */
  key: string;
  /** Ground-truth hint for specimen films; ignored by the real backend. */
  hint?: { truth: ClassLabel; severity: number } | null;
}

export type ConfidenceBand = "high" | "moderate" | "low";
export const bandFor = (c: number): ConfidenceBand =>
  c >= 0.85 ? "high" : c >= 0.7 ? "moderate" : "low";
