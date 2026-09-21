"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Chip } from "./ui";
import { USE_MOCK, MODEL_VERSION } from "@/lib/config";

const NAV = [
  { href: "/", label: "Overview", icon: <><path d="M4 19V9l8-5 8 5v10" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 19h16" strokeLinecap="round" /></> },
  { href: "/workspace", label: "Workspace", icon: <><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M8 3.5v17M16 3.5v17M3.5 9h17M3.5 15h17" opacity=".5" /></> },
  { href: "/insights", label: "Model insights", icon: <path d="M4 20V9M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" /> },
  { href: "/history", label: "History", icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" /></> },
  { href: "/dataset", label: "Dataset", icon: <><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></> },
];

/** Slim vertical rail on desktop; a bottom bar below 720px. */
function Rail() {
  const path = usePathname();
  return (
    <aside className="fixed inset-x-0 bottom-0 z-[60] flex w-full items-center justify-around border-t border-line bg-raised px-1 pb-[calc(6px+env(safe-area-inset-bottom,0px))] pt-1.5
                      sm:sticky sm:inset-auto sm:top-0 sm:h-screen sm:w-[68px] sm:flex-col sm:justify-start sm:border-r sm:border-t-0 sm:px-0 sm:pb-3.5 sm:pt-[18px]">
      <div className="mb-[26px] hidden h-8 w-8 place-items-center sm:grid">
        <svg viewBox="0 0 26 26" fill="none" className="h-[26px] w-[26px]" aria-label="Pneuma">
          <path d="M13 2v22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M13 6C9.5 6 4 9 4 15c0 4 1.6 6 3.8 6 2 0 3.2-1.3 3.6-3.4.4-2.2.6-5 .6-8.6"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 6c3.5 0 9 3 9 9 0 4-1.6 6-3.8 6-2 0-3.2-1.3-3.6-3.4-.4-2.2-.6-5-.6-8.6"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <nav aria-label="Sections" className="flex w-full items-center justify-around sm:flex-col sm:gap-0.5">
        {NAV.map((n) => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} aria-label={n.label}
              aria-current={active ? "page" : undefined}
              className={`group relative grid h-11 w-11 place-items-center rounded-ctl transition-colors
                ${active ? "text-ink" : "text-ink-3 hover:bg-sunken hover:text-ink"}`}>
              {active && <span className="absolute bottom-[-6px] left-3 right-3 h-0.5 bg-ink sm:inset-y-3 sm:left-[-12px] sm:right-auto sm:h-auto sm:w-0.5" />}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-[19px] w-[19px]">{n.icon}</svg>
              <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-[3px] bg-ink px-2 py-1 font-mono text-[11px] text-paper opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 sm:block">
                {n.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col items-center gap-2.5 sm:flex">
        <span className="font-mono text-[10px] tracking-wider text-ink-3" style={{ writingMode: "vertical-rl" }}>
          {MODEL_VERSION}
        </span>
        <span className="h-[7px] w-[7px] rounded-full bg-normal" title="Adapter responding" />
      </div>
    </aside>
  );
}

function TopBar({ crumb }: { crumb: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3.5 border-b border-line px-[clamp(20px,4.2vw,64px)] backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--paper) 86%, transparent)" }}>
      <span className="font-mono text-[11px] text-ink-2">
        <b className="font-medium text-ink">Pneuma</b> {crumb}
      </span>
      <span className="flex-1" />
      {USE_MOCK && <Chip dot="var(--blue)">Mock adapter</Chip>}
      <Chip tone="warn">Prototype — not for clinical use</Chip>
    </header>
  );
}

export function AppShell({ crumb, children }: { crumb: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen sm:grid-cols-[68px_minmax(0,1fr)]">
      <Rail />
      <div className="flex min-w-0 flex-col pb-16 sm:pb-0">
        <TopBar crumb={crumb} />
        {children}
      </div>
    </div>
  );
}
