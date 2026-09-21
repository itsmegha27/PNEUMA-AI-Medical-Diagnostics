"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Radiograph, AttributionLayer } from "@/lib/radiograph";
import type { ClassLabel, Region } from "@/lib/types";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/* ── Lightbox: the backlit slab every film sits on ──────────────────── */
export function Lightbox({ className, children, ...rest }:
  { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("relative isolate overflow-hidden rounded-slab bg-slab shadow-spill", className)} {...rest}>
      {children}
      <span className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 45%, rgba(190,225,255,.055), transparent 62%)" }} />
      {["a", "b", "c", "d"].map((k) => (
        <span key={k} className={cx("pointer-events-none absolute z-[3] h-3.5 w-3.5 border border-line-slab",
          k === "a" && "left-2 top-2 border-b-0 border-r-0",
          k === "b" && "right-2 top-2 border-b-0 border-l-0",
          k === "c" && "bottom-2 left-2 border-r-0 border-t-0",
          k === "d" && "bottom-2 right-2 border-l-0 border-t-0")} />
      ))}
    </div>
  );
}

/** Text burned into the film. Uppercase belongs here and nowhere else. */
export function Burn({ at, children }:
  { at: "tl" | "tr" | "bl" | "br"; children: ReactNode }) {
  return (
    <div className={cx(
      "pointer-events-none absolute z-[3] font-mono text-[9.5px] uppercase tracking-[.11em] text-film-muted",
      at === "tl" && "left-[13px] top-3", at === "tr" && "right-[13px] top-3 text-right",
      at === "bl" && "bottom-3 left-[13px]", at === "br" && "bottom-3 right-[13px] text-right")}
      style={{ textShadow: "0 0 10px rgba(0,0,0,.9)" }}>
      {children}
    </div>
  );
}

/* ── Scan overlay: one orchestrated motion, only while analysing ────── */
export function ScanOverlay({ active }: { active: boolean }) {
  return (
    <div className={cx("pointer-events-none absolute inset-0 z-[5] transition-opacity duration-300",
      active ? "opacity-100" : "opacity-0")}>
      <div className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "linear-gradient(var(--line-slab) 1px,transparent 1px),linear-gradient(90deg,var(--line-slab) 1px,transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(circle at 50% 50%, #000 20%, transparent 72%)",
        }} />
      <div className="absolute inset-x-0 h-[120px] animate-sweep"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(150,205,255,.13) 45%, rgba(190,225,255,.5) 50%, rgba(150,205,255,.13) 55%, transparent)" }} />
    </div>
  );
}

/* ── Windowing state ────────────────────────────────────────────────── */
export interface Windowing { zoom: number; x: number; y: number; brightness: number; contrast: number; invert: boolean }
export const DEFAULT_WINDOW: Windowing = { zoom: 1, x: 0, y: 0, brightness: 100, contrast: 100, invert: false };

export function useWindowing() {
  const [w, setW] = useState<Windowing>(DEFAULT_WINDOW);
  const reset = useCallback(() => setW(DEFAULT_WINDOW), []);
  const filter = `brightness(${w.brightness}%) contrast(${w.contrast}%)${w.invert ? " invert(1)" : ""}`;
  return { w, setW, reset, filter };
}

/* ── Viewer ─────────────────────────────────────────────────────────── */
export interface Study {
  key: string; name: string;
  /** Either a synthetic specimen or an uploaded object URL. */
  seed?: number; finding?: ClassLabel; severity?: number; src?: string; file?: File;
  hint?: { truth: ClassLabel; severity: number } | null;
}

export function XrayViewer({
  study, windowing, onWindow, analysing, regions, showAttribution, dropzone,
}: {
  study: Study | null;
  windowing: Windowing;
  onWindow: (w: Windowing) => void;
  analysing: boolean;
  regions: Region[];
  showAttribution: boolean;
  dropzone: ReactNode;
}) {
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const filter = `brightness(${windowing.brightness}%) contrast(${windowing.contrast}%)${windowing.invert ? " invert(1)" : ""}`;

  return (
    <div
      className="absolute inset-0"
      onPointerDown={(e) => {
        if (!study) return;
        drag.current = { sx: e.clientX, sy: e.clientY, ox: windowing.x, oy: windowing.y };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        onWindow({ ...windowing, x: drag.current.ox + (e.clientX - drag.current.sx),
                                 y: drag.current.oy + (e.clientY - drag.current.sy) });
      }}
      onPointerUp={() => { drag.current = null; }}
      onWheel={(e) => {
        if (!study) return;
        onWindow({ ...windowing, zoom: Math.min(6, Math.max(0.5, windowing.zoom * (e.deltaY < 0 ? 1.08 : 0.93))) });
      }}
      style={{ cursor: study ? (drag.current ? "grabbing" : "grab") : "default" }}
    >
      <div className="absolute inset-0 origin-center transition-transform duration-200"
        style={{ transform: `translate(${windowing.x}px,${windowing.y}px) scale(${windowing.zoom})` }}>
        <div className="absolute inset-0" style={{ filter }}>
          {study?.src
            ? <img src={study.src} alt="Uploaded chest radiograph" className="h-full w-full object-contain" />
            : study
              ? <Radiograph seed={study.seed ?? 1} finding={study.finding ?? "NORMAL"}
                  severity={study.severity ?? 0.4} className="h-full w-full" />
              : null}
        </div>
      </div>

      <div className={cx("pointer-events-none absolute inset-0 z-[4] transition-opacity duration-500",
        showAttribution ? "opacity-100" : "opacity-0")} style={{ mixBlendMode: "screen" }}>
        <AttributionLayer regions={regions} className="h-full w-full" />
      </div>

      <ScanOverlay active={analysing} />
      {!study && dropzone}
    </div>
  );
}

/* ── Toolbar ────────────────────────────────────────────────────────── */
const Tb = ({ label, pressed, onClick, children }:
  { label: string; pressed?: boolean; onClick: () => void; children: ReactNode }) => (
  <button aria-label={label} aria-pressed={pressed} onClick={onClick}
    className={cx("grid h-[30px] w-[30px] place-items-center rounded-ctl transition-colors",
      pressed ? "bg-white/[.14] text-white" : "text-film-muted hover:bg-white/[.08] hover:text-film")}>
    {children}
  </button>
);

export function ViewerToolbar({ w, onChange, onReset, attribution, onAttribution, visible }: {
  w: Windowing; onChange: (w: Windowing) => void; onReset: () => void;
  attribution: boolean; onAttribution: () => void; visible: boolean;
}) {
  const zoom = (f: number) => onChange({ ...w, zoom: Math.min(6, Math.max(0.5, w.zoom * f)) });
  return (
    <div role="toolbar" aria-label="Viewer controls"
      className={cx("absolute bottom-3.5 left-1/2 z-[6] flex -translate-x-1/2 items-center gap-0.5 rounded-slab border border-line-slab p-[5px] text-film backdrop-blur-xl transition-all duration-200",
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0")}
      style={{ background: "rgba(16,19,21,.82)" }}>
      <Tb label="Zoom out" onClick={() => zoom(1 / 1.25)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[15px] w-[15px]"><path d="M5 12h14" strokeLinecap="round" /></svg>
      </Tb>
      <span className="min-w-[44px] text-center font-mono text-[10.5px] text-film-muted">{Math.round(w.zoom * 100)}%</span>
      <Tb label="Zoom in" onClick={() => zoom(1.25)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[15px] w-[15px]"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
      </Tb>
      <Tb label="Fit to view" onClick={() => onChange({ ...w, zoom: 1, x: 0, y: 0 })}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[15px] w-[15px]"><path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Tb>
      <span className="mx-[5px] h-[18px] w-px bg-line-slab" />
      {(["brightness", "contrast"] as const).map((k) => (
        <label key={k} className="flex items-center gap-[7px] px-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[.08em] text-film-muted">{k === "brightness" ? "Br" : "Ct"}</span>
          <input type="range" min={40} max={k === "brightness" ? 180 : 220} value={w[k]}
            aria-label={k} onChange={(e) => onChange({ ...w, [k]: Number(e.target.value) })}
            className="h-4 w-[72px] cursor-ew-resize appearance-none bg-transparent
                       [&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-line-slab
                       [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-[9px] [&::-webkit-slider-thumb]:w-[9px]
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-film" />
        </label>
      ))}
      <span className="mx-[5px] h-[18px] w-px bg-line-slab" />
      <Tb label="Invert greyscale" pressed={w.invert} onClick={() => onChange({ ...w, invert: !w.invert })}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[15px] w-[15px]"><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" stroke="none" /></svg>
      </Tb>
      <Tb label="Toggle region attribution" pressed={attribution} onClick={onAttribution}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[15px] w-[15px]"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinejoin="round" /><circle cx="12" cy="12" r="2.8" /></svg>
      </Tb>
      <Tb label="Reset windowing" onClick={onReset}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[15px] w-[15px]"><path d="M4 12a8 8 0 1 1 2.6 5.9" strokeLinecap="round" /><path d="M4 18v-5h5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Tb>
    </div>
  );
}
