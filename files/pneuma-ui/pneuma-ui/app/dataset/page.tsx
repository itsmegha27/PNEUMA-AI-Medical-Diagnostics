"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell";
import { Skeleton } from "@/components/ui";
import { DatasetGallery } from "@/components/dataset-gallery";
import { PneumaApi } from "@/lib/api/client";
import type { DatasetItem } from "@/lib/types";

export default function DatasetPage() {
  const [items, setItems] = useState<DatasetItem[] | null>(null);
  const router = useRouter();

  useEffect(() => { PneumaApi.dataset().then(setItems).catch(() => setItems([])); }, []);

  return (
    <AppShell crumb="Dataset">
      <div className="px-[clamp(20px,4.2vw,64px)] pb-[22px] pt-[clamp(30px,4vw,52px)]">
        <h2 className="type-h2">Specimen films</h2>
        <p className="mt-2.5 max-w-[62ch] text-sm text-ink-2">
          Synthetic radiographs generated in the browser, labelled to mirror the test split. Swap this
          grid for your own served dataset when the API is connected.
        </p>
      </div>

      <div className="px-[clamp(20px,4.2vw,64px)] pb-16">
        {items === null ? (
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(172px,1fr))" }}>
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}
          </div>
        ) : (
          <DatasetGallery items={items} onPick={() => router.push("/workspace")} />
        )}
      </div>
    </AppShell>
  );
}
