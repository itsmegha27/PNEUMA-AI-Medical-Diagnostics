import { USE_MOCK } from "@/lib/config";
import type { AnalysisResult, AnalyzeRequest, DatasetItem, ModelMetrics } from "@/lib/types";
import { GALLERY, MOCK_METRICS, mockAnalyze } from "./mock-adapter";
import { httpAnalyze, httpDataset, httpMetrics } from "./http-adapter";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * ─────────────────────────────────────────────────────────────────
 *  The only surface the UI is allowed to call. Swap the adapter in
 *  lib/config.ts; no component changes are needed.
 * ─────────────────────────────────────────────────────────────────
 */
export const PneumaApi = {
  async analyze(req: AnalyzeRequest): Promise<AnalysisResult> {
    if (USE_MOCK) { await wait(120); return mockAnalyze(req); }
    return httpAnalyze(req);
  },
  async metrics(): Promise<ModelMetrics> {
    if (USE_MOCK) return MOCK_METRICS;
    return httpMetrics();
  },
  async dataset(): Promise<DatasetItem[]> {
    if (USE_MOCK) return GALLERY;
    return httpDataset();
  },
};

export { SPECIMENS } from "./mock-adapter";
