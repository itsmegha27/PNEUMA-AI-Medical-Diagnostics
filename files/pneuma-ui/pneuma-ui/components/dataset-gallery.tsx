"use client";

import { useState } from "react";
import { Radiograph } from "@/lib/radiograph";
import type { ClassLabel, DatasetItem } from "@/lib/types";
import { Burn, Lightbox } from "./viewer";
import { ClassTag, EmptyState } from "./ui";

type Filter = "all" | ClassLabel;

export function DatasetGallery({ items, onPick }:
  { items: DatasetItem[]; onPick?: (i: DatasetItem) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = items.filter((i) => filter === "all" || i.label === filter);

  return (
    <>
      <div className="mb-6 inline-flex overflow-hidden rounded-ctl border border-line-strong" role="group" aria-label="Filter by class">
        {([["all", `All ${items.length}`], ["NORMAL", "Normal"], ["PNEUMONIA", "Pneumonia"]] as [Filter, string][])
          .map(([f, label], i) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}
              className={`h-8 px-[15px] font-mono text-[11px] transition-colors ${i < 2 ? "border-r border-line" : ""}
                ${filter === f ? "bg-ink text-paper" : "text-ink-2 hover:bg-raised"}`}>
              {label}
            </button>
          ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState title="No films in this class" body="Change the filter to see the rest of the specimen set." />
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(172px,1fr))" }}>
          {shown.map((g) => (
            <button key={g.id} onClick={() => onPick?.(g)} className="group block w-full text-left">
              <Lightbox className="aspect-[4/5] transition-transform duration-200 group-hover:-translate-y-[3px]">
                <Radiograph seed={g.previewSeed} finding={g.label} severity={g.severity} className="h-full w-full" />
                <Burn at="tl">{g.id}</Burn>
              </Lightbox>
              <span className="mt-[9px] flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-ink-3">{g.id}</span>
                <ClassTag label={g.label} />
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
