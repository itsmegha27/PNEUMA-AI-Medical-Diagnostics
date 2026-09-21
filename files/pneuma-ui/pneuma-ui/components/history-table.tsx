"use client";

import { Radiograph } from "@/lib/radiograph";
import { relativeTime } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import { ClassTag, Meter } from "./ui";

const STATUS = {
  complete: ["complete", "bg-info/10 text-info"],
  review: ["needs review", "bg-uncertain/12 text-uncertain"],
  failed: ["failed", "bg-pneumonia/10 text-pneumonia"],
} as const;

export function HistoryTable({ rows, onOpen }:
  { rows: HistoryEntry[]; onOpen?: (e: HistoryEntry) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse">
        <thead>
          <tr>
            {["", "Study", "Recorded", "Classification", "Confidence", "Status", ""].map((h, i) => (
              <th key={i} className="type-label whitespace-nowrap border-b border-line-strong pb-2.5 pr-3.5 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onOpen?.(r)}
              className="group cursor-pointer transition-colors hover:bg-raised">
              <td className="border-b border-line py-3 pr-3.5">
                <span className="block h-11 w-11 overflow-hidden rounded-sm bg-slab">
                  <Radiograph seed={r.previewSeed ?? 99} finding={r.previewLabel} severity={0.6}
                    className="h-full w-full object-cover" />
                </span>
              </td>
              <td className="border-b border-line py-3 pr-3.5 text-[13.5px]">
                <span className="type-strong">{r.studyName}</span>
                <span className="type-label block">{r.id}</span>
              </td>
              <td className="type-num border-b border-line py-3 pr-3.5 text-[12.5px] text-ink-2">
                {relativeTime(r.at)}
              </td>
              <td className="border-b border-line py-3 pr-3.5"><ClassTag label={r.label} /></td>
              <td className="border-b border-line py-3 pr-3.5">
                <span className="flex min-w-[120px] items-center gap-2.5">
                  <Meter value={r.confidence * 100} tone={r.label === "NORMAL" ? "normal" : "pneumonia"} className="flex-1" />
                  <span className="type-num text-xs">{(r.confidence * 100).toFixed(1)}%</span>
                </span>
              </td>
              <td className="border-b border-line py-3 pr-3.5">
                <span className={`inline-flex h-[22px] items-center rounded-[2px] px-2 font-mono text-[10.5px] ${STATUS[r.status][1]}`}>
                  {STATUS[r.status][0]}
                </span>
              </td>
              <td className="border-b border-line py-3 pr-3.5">
                <span className="font-mono text-[11px] text-info opacity-0 transition-opacity group-hover:opacity-100">open</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
