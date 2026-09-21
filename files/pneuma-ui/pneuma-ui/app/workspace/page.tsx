"use client";

import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/shell";
import { Button, ErrorBox, Ledger } from "@/components/ui";
import {
  Burn, Lightbox, ViewerToolbar, XrayViewer, DEFAULT_WINDOW, type Study, type Windowing,
} from "@/components/viewer";
import { AnalysisPanel } from "@/components/analysis";
import { Explainability } from "@/components/explainability";
import { Radiograph } from "@/lib/radiograph";
import { SPECIMENS } from "@/lib/api/client";
import { useAnalysis } from "@/hooks/useAnalysis";
import { appendRun } from "@/lib/history";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/config";

export default function WorkspacePage() {
  const [study, setStudy] = useState<Study | null>(null);
  const [w, setW] = useState<Windowing>(DEFAULT_WINDOW);
  const [attribution, setAttribution] = useState(false);
  const [uploadError, setUploadError] = useState<{ title: string; body: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const xaiRef = useRef<HTMLDivElement>(null);

  const { phase, step, timings, result, error, run, reset } = useAnalysis();

  const load = useCallback((s: Study) => {
    setStudy(s); setW(DEFAULT_WINDOW); setAttribution(false); setUploadError(null); reset(true);
  }, [reset]);

  const loadFile = useCallback((file: File) => {
    if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      setUploadError({ title: "That file can't be read as a radiograph",
        body: "Pneuma accepts single-frame JPEG, PNG or WebP images. Export the study to an image and try again." });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError({ title: "That file is larger than 12 MB",
        body: "Downsample the film or export it at a lower quality, then upload it again." });
      return;
    }
    load({ key: `${file.name}:${file.size}`, name: file.name, src: URL.createObjectURL(file), file, hint: null });
  }, [load]);

  const onRun = useCallback(async () => {
    if (!study) return;
    const res = await run({ key: study.key, hint: study.hint ?? null, file: study.file });
    if (res) {
      setAttribution(true);
      appendRun(res, { name: study.name, previewSeed: study.seed ?? null,
                       previewLabel: study.finding ?? res.label });
    }
  }, [run, study]);

  return (
    <AppShell crumb="Workspace">
      <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_372px]">
        <div className="min-w-0 px-[clamp(20px,4.2vw,64px)] py-[clamp(20px,4.2vw,64px)] lg:pr-7">

          <Lightbox
            className={`aspect-[4/5] w-full sm:aspect-square sm:max-h-[min(66vh,760px)]`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
          >
            <XrayViewer
              study={study} windowing={w} onWindow={setW}
              analysing={phase === "running"}
              regions={result?.regions ?? []} showAttribution={attribution && !!result}
              dropzone={
                <div className="absolute inset-0 z-[4] grid place-items-center">
                  <div className="max-w-[360px] rounded-ctl border border-dashed border-line-slab p-7 text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3}
                      className="mx-auto h-[30px] w-[30px] text-film-muted">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 16l4.5-4.5a2 2 0 0 1 2.8 0L15 16" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="15.5" cy="8.5" r="1.6" />
                    </svg>
                    <h4 className="type-strong mb-1.5 mt-3.5 text-[15px] text-film">
                      Put a chest radiograph on the box
                    </h4>
                    <p className="text-[12.5px] leading-[1.5] text-film-muted">
                      Drag a PA or AP film here, or browse for one. JPEG or PNG, up to 12 MB.
                    </p>
                    <div className="my-3 font-mono text-[10px] uppercase tracking-[.08em] text-film-muted">or</div>
                    <button onClick={() => load({ ...SPECIMENS[1], key: SPECIMENS[1].id, name: SPECIMENS[1].id,
                        seed: SPECIMENS[1].previewSeed, finding: SPECIMENS[1].label,
                        hint: { truth: SPECIMENS[1].label, severity: SPECIMENS[1].severity } })}
                      className="border-b border-line-slab pb-px text-[12.5px] text-film hover:border-film">
                      Load a specimen film instead
                    </button>
                  </div>
                </div>
              }
            />
            <Burn at="tl"><b className="block font-medium text-film">Pneuma</b>{study ? "study loaded" : "no study loaded"}</Burn>
            <Burn at="tr">rf v0.3<b className="block font-medium text-film">{study?.name ?? "—"}</b></Burn>
            <Burn at="bl">zoom {Math.round(w.zoom * 100)}% · br {w.brightness} · ct {w.contrast}</Burn>
            <Burn at="br">{w.invert ? "inverted" : "W 2048  L 1024"}</Burn>

            <ViewerToolbar w={w} onChange={setW} onReset={() => setW(DEFAULT_WINDOW)}
              attribution={attribution} onAttribution={() => setAttribution((a) => !a)}
              visible={!!study} />
          </Lightbox>

          {/* specimen strip + file controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="type-label mr-1">Specimens</span>
              {SPECIMENS.map((s) => (
                <button key={s.id} title={`${s.id} — labelled ${s.label.toLowerCase()}`}
                  aria-pressed={study?.key === s.id}
                  onClick={() => load({ key: s.id, name: s.id, seed: s.previewSeed, finding: s.label,
                    severity: s.severity, hint: { truth: s.label, severity: s.severity } })}
                  className={`h-[52px] w-[52px] overflow-hidden rounded-sm border bg-slab transition-transform hover:-translate-y-0.5
                    ${study?.key === s.id ? "border-ink" : "border-transparent hover:border-line-strong"}`}>
                  <Radiograph seed={s.previewSeed} finding={s.label} severity={s.severity} className="h-full w-full" />
                </button>
              ))}
            </div>
            <div className="flex gap-2.5">
              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>Browse files</Button>
              <Button variant="ghost" size="sm" disabled={!study}
                onClick={() => { setStudy(null); reset(false); setAttribution(false); }}>Clear</Button>
            </div>
            <input ref={fileRef} type="file" hidden accept={ACCEPTED_TYPES.join(",")}
              onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          </div>

          {uploadError && <div className="mt-3.5"><ErrorBox {...uploadError} /></div>}

          <div ref={xaiRef} className="pb-5 pt-[clamp(40px,5.4vw,78px)]">
            <hr className="mb-7 h-px border-0 bg-line" />
            <Ledger label="Explainability"
              note="What the classifier looked at, and how much each descriptor moved the vote.">
              <Explainability study={study} result={result} />
            </Ledger>
          </div>
        </div>

        <AnalysisPanel
          phase={phase} step={step} timings={timings} result={result} error={error}
          canRun={!!study} onRun={onRun}
          onExplain={() => xaiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      </div>
    </AppShell>
  );
}
