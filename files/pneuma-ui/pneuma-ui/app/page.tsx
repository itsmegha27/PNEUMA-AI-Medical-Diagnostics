import Link from "next/link";
import { AppShell } from "@/components/shell";
import { Button, Ledger, PrototypeNotice } from "@/components/ui";
import { Burn, Lightbox, ScanOverlay } from "@/components/viewer";
import { Radiograph, AttributionLayer } from "@/lib/radiograph";
import { PneumaApi } from "@/lib/api/client";

const STEPS: [string, string, string][] = [
  ["First", "The film goes on the box",
   "Drop a radiograph or pick a specimen. Window it with brightness and contrast, zoom and pan — the image stays the largest thing on screen."],
  ["Then", "Features, then a vote",
   "The image is resampled and normalised, intensity and texture descriptors are extracted, and the forest votes. You watch each step as it happens."],
  ["Finally", "A result you can interrogate",
   "Class, probability, confidence band, the regions that carried weight and the features behind them — all on the same screen as the film."],
];

export default async function OverviewPage() {
  const m = await PneumaApi.metrics();
  const stats: [string, string, string][] = [
    [(m.accuracy * 100).toFixed(2), "Accuracy", "held-out test split"],
    [(m.precision * 100).toFixed(2), "Precision", "pneumonia class"],
    [(m.recall * 100).toFixed(2), "Recall", "pneumonia class"],
    [(m.f1 * 100).toFixed(2), "F1", "harmonic mean"],
  ];

  return (
    <AppShell crumb="Overview">
      {/* hero — the film bleeds off the right edge */}
      <div className="grid items-center gap-8 py-[clamp(36px,5vw,72px)] pl-[clamp(20px,4.2vw,64px)] pr-[clamp(20px,4.2vw,64px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,.86fr)] lg:pr-0">
        <div className="relative z-[2] max-w-[620px]">
          <h1 className="type-display mb-[22px]">See what the image reveals.</h1>
          <p className="max-w-[46ch] text-[clamp(16px,1.35vw,18px)] leading-[1.6] text-ink-2">
            Pneuma reads a chest radiograph, returns a normal or pneumonia classification with its
            probability, and shows you which regions of the film moved the decision.
          </p>
          <div className="mt-[30px] flex flex-wrap items-center gap-3">
            <Link href="/workspace"><Button>Analyze an X-ray</Button></Link>
            <Link href="/insights"><Button variant="ghost">How the model performs</Button></Link>
          </div>
          <div className="mt-[26px] max-w-[44ch] border-t border-line pt-4">
            <p className="text-[12.5px] leading-[1.5] text-ink-3">
              Random-forest classifier over image-derived features. Test accuracy{" "}
              {(m.accuracy * 100).toFixed(2)}% on a {m.testSize ?? "held-out"}-image split — useful for
              research and teaching, not for diagnosis.
            </p>
          </div>
        </div>

        <Lightbox className="order-first aspect-[4/3] lg:order-none lg:aspect-[4/5] lg:max-h-[min(74vh,720px)] lg:rounded-r-none">
          <Radiograph seed={7272} finding="PNEUMONIA" severity={0.66} className="absolute inset-0 h-full w-full" />
          <span className="absolute inset-0 z-[4]" style={{ mixBlendMode: "screen" }}>
            <AttributionLayer regions={[{ x: 274, y: 322, r: 40, weight: 0.41 },
                                        { x: 132, y: 268, r: 26, weight: 0.17 }]} className="h-full w-full" />
          </span>
          <ScanOverlay active />
          <Burn at="tl"><b className="block font-medium text-film">Pneuma</b>specimen film · synthetic</Burn>
          <Burn at="tr">PA upright<b className="block font-medium text-film">1024 × 1280</b></Burn>
          <Burn at="bl">W 2048 &nbsp; L 1024</Burn>
          <Burn at="br">attribution on</Burn>
        </Lightbox>
      </div>

      <div className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
        {stats.map(([v, k, s], i) => (
          <div key={k} className={`px-[clamp(20px,4.2vw,64px)] pb-6 pt-[22px] ${i < 3 ? "lg:border-r lg:border-line" : ""} ${i % 2 === 0 ? "border-r border-line" : ""} ${i < 2 ? "border-b border-line lg:border-b-0" : ""}`}>
            <span className="type-num block text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.1]">
              {v}<span className="text-[.5em] text-ink-3">%</span>
            </span>
            <span className="mt-1.5 block text-[12.5px] text-ink-2">{k}</span>
            <span className="type-label mt-[3px] block">{s}</span>
          </div>
        ))}
      </div>

      <div className="px-[clamp(20px,4.2vw,64px)] py-[clamp(40px,5.4vw,78px)]">
        <Ledger label="The read" note="Three stages between an uploaded film and an explained result.">
          <div className="grid gap-6 md:grid-cols-3 md:gap-10">
            {STEPS.map(([n, h, b]) => (
              <div key={h} className="border-t border-ink pt-4">
                <span className="font-mono text-[11px] text-ink-3">{n}</span>
                <h4 className="type-h3 mb-[7px] mt-2.5 text-base">{h}</h4>
                <p className="text-[13.5px] leading-[1.55] text-ink-2">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <PrototypeNotice>
              Pneuma is a research prototype. Its output is not a diagnosis, the severity index is
              image-derived and has no clinical meaning, and every film shown in this build is synthetic.
              Do not use it to make care decisions.
            </PrototypeNotice>
          </div>
        </Ledger>
      </div>
    </AppShell>
  );
}
