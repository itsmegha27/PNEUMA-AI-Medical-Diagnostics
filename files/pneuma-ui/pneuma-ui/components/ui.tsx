import type { ReactNode } from "react";
import type { ClassLabel, ConfidenceBand } from "@/lib/types";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/* ── Button ──────────────────────────────────────────────────────────── */
export function Button({
  variant = "primary", size = "md", className, children, ...rest
}: { variant?: "primary" | "ghost"; size?: "md" | "sm" } &
  React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "inline-flex items-center gap-2.5 rounded-ctl type-strong transition-all duration-150",
        "active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
        size === "md" ? "h-11 px-5 text-sm" : "h-8 px-3 text-[12.5px]",
        variant === "primary"
          ? "bg-ink text-paper hover:shadow-[0_8px_22px_-10px_rgba(16,24,32,.7)]"
          : "border border-line-strong text-ink hover:bg-raised hover:border-ink-3",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── Chip / Tag / Band ───────────────────────────────────────────────── */
export function Chip({ tone = "neutral", dot, children }:
  { tone?: "neutral" | "warn"; dot?: string; children: ReactNode }) {
  return (
    <span className={cx(
      "inline-flex h-[23px] items-center gap-[7px] rounded-[2px] border px-[9px] font-mono text-[10.5px] whitespace-nowrap",
      tone === "warn" ? "border-uncertain/40 bg-uncertain/10 text-uncertain" : "border-line-strong text-ink-2",
    )}>
      {dot && <i className="h-[5px] w-[5px] rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  );
}

export function ClassTag({ label }: { label: ClassLabel }) {
  const normal = label === "NORMAL";
  return (
    <span className={cx(
      "inline-flex h-[22px] items-center rounded-[2px] px-2 font-mono text-[10.5px]",
      normal ? "bg-normal/10 text-normal" : "bg-pneumonia/10 text-pneumonia",
    )}>{label.toLowerCase()}</span>
  );
}

export function BandPill({ band }: { band: ConfidenceBand }) {
  const copy = { high: "high", moderate: "moderate", low: "low — treat as undecided" }[band];
  return (
    <span className={cx(
      "inline-flex items-center rounded-[2px] px-[7px] py-0.5 font-mono text-[10.5px]",
      band === "high" ? "bg-info/10 text-info" : "bg-uncertain/12 text-uncertain",
    )}>{copy}</span>
  );
}

/* ── Meter ───────────────────────────────────────────────────────────── */
export function Meter({ value, tone = "ink", className }:
  { value: number; tone?: "ink" | "info" | "normal" | "pneumonia" | "uncertain"; className?: string }) {
  const bg = { ink: "bg-ink", info: "bg-info", normal: "bg-normal",
               pneumonia: "bg-pneumonia", uncertain: "bg-uncertain" }[tone];
  return (
    <span className={cx("block h-[3px] overflow-hidden rounded-sm bg-sunken", className)}>
      <i className={cx("block h-full transition-[width] duration-700 ease-reveal", bg)}
         style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  );
}

/* ── Ledger: the margin column that runs down every section ──────────── */
export function Ledger({ label, note, children }:
  { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="grid gap-5 md:grid-cols-[118px_minmax(0,1fr)] md:gap-11">
      <div className="pt-[5px]">
        <span className="type-label block">{label}</span>
        {note && <p className="mt-[7px] text-xs leading-[1.5] text-ink-3">{note}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ── States ──────────────────────────────────────────────────────────── */
export function EmptyState({ title, body, action }:
  { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-ctl border border-dashed border-line-strong px-7 py-11 text-center">
      <h4 className="type-h3 mb-[7px]">{title}</h4>
      <p className="mx-auto mb-[18px] max-w-[40ch] text-[13px] leading-[1.55] text-ink-3">{body}</p>
      {action}
    </div>
  );
}

export function ErrorBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-ctl border border-pneumonia/40 bg-pneumonia/10 px-[17px] py-[15px]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
        className="mt-px h-[17px] w-[17px] shrink-0 text-pneumonia">
        <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" strokeLinecap="round" />
        <circle cx="12" cy="16.4" r=".9" fill="currentColor" stroke="none" />
      </svg>
      <div>
        <h5 className="type-strong mb-1 text-[13.5px] text-pneumonia">{title}</h5>
        <p className="text-[12.5px] leading-[1.5] text-ink-2">{body}</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span className={cx("block animate-shim rounded-sm", className)}
      style={{ background: "linear-gradient(90deg,var(--sunken) 25%,var(--raised) 50%,var(--sunken) 75%)",
               backgroundSize: "200% 100%" }} />
  );
}

/** The standing warning. Appears once per surface, never decorated. */
export function PrototypeNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-t border-line-strong py-4">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
        className="mt-0.5 h-[15px] w-[15px] shrink-0 text-uncertain">
        <path d="M12 9v5" strokeLinecap="round" />
        <circle cx="12" cy="17.2" r=".9" fill="currentColor" stroke="none" />
        <path d="M10.3 3.9 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          strokeLinejoin="round" />
      </svg>
      <p className="max-w-[70ch] text-[12.5px] leading-[1.55] text-ink-2">{children}</p>
    </div>
  );
}
