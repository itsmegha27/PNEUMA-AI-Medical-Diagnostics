import { prng, hashString } from "@/lib/rng";
import { MODEL_VERSION } from "@/lib/config";
import type {
  AnalysisResult, AnalyzeRequest, DatasetItem, ModelMetrics, ClassLabel,
} from "@/lib/types";

/**
 * Placeholder descriptor names. The real feature schema comes from the backend —
 * these exist so the explainability layout can be built and reviewed.
 */
const FEATURE_NAMES: [string, string][] = [
  ["Lower-zone mean intensity", "Average brightness below the hila"],
  ["Texture entropy", "Local disorder across the lung fields"],
  ["Left-right intensity ratio", "Asymmetry between the two lungs"],
  ["Edge density", "Sharpness of vessel and fissure margins"],
  ["Histogram skew", "Shape of the greyscale distribution"],
  ["Upper/lower zone ratio", "Vertical distribution of opacity"],
];

export const SPECIMENS: DatasetItem[] = [
  { id: "SPC-0413", previewSeed: 4131, label: "NORMAL", severity: 0.12 },
  { id: "SPC-0727", previewSeed: 7272, label: "PNEUMONIA", severity: 0.71 },
  { id: "SPC-1180", previewSeed: 1180, label: "PNEUMONIA", severity: 0.44 },
  { id: "SPC-2094", previewSeed: 2094, label: "NORMAL", severity: 0.19 },
];

export const GALLERY: DatasetItem[] = Array.from({ length: 12 }, (_, i) => {
  const label: ClassLabel = [0, 3, 5, 8, 11].includes(i) ? "NORMAL" : "PNEUMONIA";
  return {
    id: `SPC-${String(1000 + i * 137).padStart(4, "0")}`,
    previewSeed: 300 + i * 91,
    label,
    severity: label === "PNEUMONIA" ? 0.3 + (i % 5) * 0.14 : 0.1,
  };
});

export function mockAnalyze(req: AnalyzeRequest): AnalysisResult {
  const r = prng(hashString(req.key));
  const label: ClassLabel = req.hint?.truth ?? (r() > 0.46 ? "PNEUMONIA" : "NORMAL");
  const p = 0.54 + r() * 0.42;
  const probabilities =
    label === "PNEUMONIA" ? { NORMAL: 1 - p, PNEUMONIA: p } : { NORMAL: p, PNEUMONIA: 1 - p };

  const regions =
    label === "PNEUMONIA"
      ? [
          { x: r() > 0.5 ? 128 : 274, y: 300 + r() * 60, r: 34 + r() * 14, weight: 0.3 + r() * 0.22 },
          { x: r() > 0.5 ? 268 : 134, y: 250 + r() * 70, r: 26 + r() * 12, weight: 0.14 + r() * 0.14 },
        ]
      : [{ x: 200, y: 262, r: 44, weight: 0.11 + r() * 0.06 }];

  const raw = FEATURE_NAMES.map(([name, detail]) => ({ name, detail, contribution: r() }))
    .sort((a, b) => b.contribution - a.contribution);
  const total = raw.reduce((s, f) => s + f.contribution, 0);
  const features = raw.slice(0, 5).map((f) => ({ ...f, contribution: f.contribution / total }));

  const severity = req.hint?.severity ?? (label === "PNEUMONIA" ? 0.3 + r() * 0.6 : null);

  return {
    label,
    probabilities,
    confidence: p,
    severityIndex: severity === null ? null : Math.round(severity * 100),
    regions,
    features,
    narrative:
      label === "PNEUMONIA"
        ? `The strongest contribution came from raised mean intensity in the ${
            regions[0].x < 200 ? "right" : "left"
          } lower zone, where the film is brighter and less textured than the opposite side. Combined with a skewed greyscale histogram, this pushed the forest toward PNEUMONIA.`
        : "Intensity is evenly distributed between the two lung fields and the lower zones stay dark, with vessel margins sharp throughout. No patch contributed strongly, so the forest settled on NORMAL with the margin shown above.",
    modelVersion: MODEL_VERSION,
  };
}

/**
 * Reported figures for the current build. The confusion matrix is DERIVED from
 * them on the 624-film test split: 122/112/84/306 reproduces accuracy 68.59%,
 * precision 73.21%, recall 78.46% and F1 75.74% exactly. Replace with the
 * backend's own counts as soon as /metrics is wired. Train and validation split
 * sizes are unknown and stay null.
 */
export const MOCK_METRICS: ModelMetrics = {
  accuracy: 0.6859,
  precision: 0.7321,
  recall: 0.7846,
  f1: 0.7574,
  confusion: { tn: 122, fp: 112, fn: 84, tp: 306 },
  testSize: 624,
  confusionIsDerived: true,
  splits: [
    { name: "Test split", normal: 234, pneumonia: 390 },
    { name: "Train split", normal: null, pneumonia: null },
    { name: "Validation split", normal: null, pneumonia: null },
  ],
};
