import { API_BASE } from "@/lib/config";
import type { AnalysisResult, AnalyzeRequest, DatasetItem, ModelMetrics } from "@/lib/types";

/**
 * The real backend. Written against the contract in README.md — if your Python
 * service names fields differently, translate HERE and nowhere else, so the
 * components never learn about the wire format.
 */
async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`${path} failed (${res.status})`);
  return (await res.json()) as T;
}

export async function httpAnalyze(req: AnalyzeRequest): Promise<AnalysisResult> {
  if (!req.file) throw new Error("No file to analyze");
  const body = new FormData();
  body.append("file", req.file);
  return json<AnalysisResult>("/analyze", { method: "POST", body });
}

export const httpMetrics = () => json<ModelMetrics>("/metrics");
export const httpDataset = () => json<DatasetItem[]>("/dataset");
