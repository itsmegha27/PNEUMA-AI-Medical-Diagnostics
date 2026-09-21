"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell";
import { Button, EmptyState } from "@/components/ui";
import { HistoryTable } from "@/components/history-table";
import { readHistory, writeHistory } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";

/** Demo rows so the table can be reviewed before any run exists. */
const DEMO = (now: number): HistoryEntry[] => [
  { id: "AN-7F2K91", studyName: "SPC-0727", at: now - 4 * 60_000, label: "PNEUMONIA", confidence: 0.912, status: "complete", previewSeed: 7272, previewLabel: "PNEUMONIA" },
  { id: "AN-6D1X04", studyName: "chest_ap_0442.png", at: now - 52 * 60_000, label: "NORMAL", confidence: 0.681, status: "review", previewSeed: 4420, previewLabel: "NORMAL" },
  { id: "AN-6C9M77", studyName: "SPC-1180", at: now - 5 * 3_600_000, label: "PNEUMONIA", confidence: 0.743, status: "complete", previewSeed: 1180, previewLabel: "PNEUMONIA" },
  { id: "AN-6B4T20", studyName: "SPC-2094", at: now - 26 * 3_600_000, label: "NORMAL", confidence: 0.864, status: "complete", previewSeed: 2094, previewLabel: "NORMAL" },
];

export default function HistoryPage() {
  const [rows, setRows] = useState<HistoryEntry[] | null>(null);
  const router = useRouter();

  useEffect(() => { setRows(readHistory()); }, []);

  const set = (next: HistoryEntry[]) => { writeHistory(next); setRows(next); };

  return (
    <AppShell crumb="History">
      <div className="px-[clamp(20px,4.2vw,64px)] pb-5 pt-[clamp(30px,4vw,52px)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="type-h2">Analysis history</h2>
            <p className="mt-2.5 max-w-[62ch] text-sm text-ink-2">
              Every run from this browser, newest first. Stored locally; nothing leaves the device
              in this build.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => set([...DEMO(Date.now()), ...(rows ?? [])])}>
              Load sample runs
            </Button>
            <Button variant="ghost" size="sm" onClick={() => set([])}>Clear history</Button>
          </div>
        </div>
      </div>

      <div className="px-[clamp(20px,4.2vw,64px)] pb-16">
        {rows === null ? (
          <p className="type-label">Reading local history…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No analyses yet"
            body="Runs you complete in the workspace are listed here with their film, classification and confidence."
            action={<Button size="sm" onClick={() => router.push("/workspace")}>Analyze an X-ray</Button>}
          />
        ) : (
          <HistoryTable rows={rows} onOpen={() => router.push("/workspace")} />
        )}
      </div>
    </AppShell>
  );
}
