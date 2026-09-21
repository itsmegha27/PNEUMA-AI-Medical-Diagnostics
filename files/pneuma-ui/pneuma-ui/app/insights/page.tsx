import { AppShell } from "@/components/shell";
import { Ledger } from "@/components/ui";
import { ConfusionMatrix, DatasetDistribution, MetricGrid, SpecSheet } from "@/components/insights";
import { PneumaApi } from "@/lib/api/client";

const PAD = "px-[clamp(20px,4.2vw,64px)]";

export default async function InsightsPage() {
  const m = await PneumaApi.metrics();

  return (
    <AppShell crumb="Model insights">
      <div className={`${PAD} pt-[clamp(30px,4vw,56px)]`}>
        <Ledger label="Model card" note="Reported figures for the current build of the classifier.">
          <h2 className="type-h2 max-w-[20ch]">The forest is right about two films in three.</h2>
          <p className="mt-3.5 max-w-[62ch] text-[15px] text-ink-2">
            Every number on this page comes from one held-out test split. Recall is higher than
            precision, so the model over-calls pneumonia rather than missing it — the safer failure
            for a screening aid, and a real limitation for anything else.
          </p>
        </Ledger>
      </div>

      <div className="mt-[clamp(28px,3.4vw,46px)]"><MetricGrid m={m} /></div>

      <div className={`${PAD} py-[clamp(40px,5.4vw,78px)]`}>
        <Ledger label="Confusion matrix"
          note={m.confusionIsDerived
            ? "Counts derived from the reported metrics on the 624-film split. Replace with the backend's own counts when /metrics is wired."
            : "Counts reported by the backend."}>
          <ConfusionMatrix m={m} />
          {m.confusion && (
            <p className="mt-[18px] max-w-[62ch] text-[13.5px] text-ink-2">
              Nearly half of all healthy films are called pneumonia. That single cell is the model's
              main weakness and the reason this build is labelled a prototype.
            </p>
          )}
        </Ledger>
      </div>

      <hr className="h-px border-0 bg-line" />

      <div className={`${PAD} py-[clamp(40px,5.4vw,78px)]`}>
        <Ledger label="Dataset"
          note="Class balance per split. Train and validation counts are not available from this build — they will populate from /dataset/summary.">
          <DatasetDistribution m={m} />
        </Ledger>
      </div>

      <hr className="h-px border-0 bg-line" />

      <div className={`${PAD} py-[clamp(40px,5.4vw,78px)]`}>
        <Ledger label="Specification" note="What is actually running.">
          <SpecSheet rows={[
            ["Algorithm", "Random forest classifier"],
            ["Input", "Single-frame chest radiograph"],
            ["Output", "NORMAL | PNEUMONIA + probability"],
            ["Feature set", "image-derived — schema pending"],
            ["Probability calibration", "none applied"],
            ["Explainability", "patch contribution (prototype)"],
            ["Severity index", "image-derived, non-clinical"],
            ["Test split", `${m.testSize ?? "—"} films — 234 normal, 390 pneumonia`],
            ["Regulatory status", "none — research use only"],
          ]} />
        </Ledger>
      </div>
    </AppShell>
  );
}
