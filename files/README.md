# PNEUMA — UI

Chest-radiograph classification front end. Next.js 14 (app router) · TypeScript · Tailwind.

## Design

"The light box." The page is a cool, film-toned paper surface; every radiograph lives
inside a true-black backlit slab that spills light onto the paper around it. That slab is
the only bold element and it is the hero on every screen. Everything else is hairlines,
a left margin-ledger of instrument labels, and asymmetric placement.

Type is one grotesque (Archivo) used across its *width* axis — condensed at display sizes,
normal for reading — plus IBM Plex Mono for instrument readouts only.

Run `npm i && npm run dev`.

## Connecting your Python backend

All backend knowledge lives in **`lib/api/`**. Nothing else in the app imports `fetch`.

1. `lib/config.ts` — set `USE_MOCK = false` and `API_BASE` to your service.
2. `lib/api/http-adapter.ts` — already written against the contract below; adjust field
   names there if your service differs. **Do not spread backend shapes into components.**
3. Components consume `PneumaApi` from `lib/api/client.ts` only.

### Expected contract

`POST /analyze` — multipart, field `file` →

```jsonc
{
  "label": "PNEUMONIA",                 // "NORMAL" | "PNEUMONIA"
  "probabilities": { "NORMAL": 0.22, "PNEUMONIA": 0.78 },
  "confidence": 0.78,                   // probability of the winning class
  "severityIndex": 61,                  // 0-100, image-derived, or null
  "regions": [ { "x": 274, "y": 322, "r": 40, "weight": 0.41 } ],  // 400x500 film space
  "features": [ { "name": "...", "detail": "...", "contribution": 0.24 } ],
  "narrative": "…",
  "modelVersion": "rf-v0.3"
}
```

`GET /metrics` →

```jsonc
{ "accuracy": 0.6859, "precision": 0.7321, "recall": 0.7846, "f1": 0.7574,
  "confusion": { "tn": 122, "fp": 112, "fn": 84, "tp": 306 }, "testSize": 624,
  "splits": [ { "name": "Train split", "normal": null, "pneumonia": null } ] }
```

`GET /dataset` → `[{ "id": "SPC-0413", "label": "NORMAL", "previewSeed": 4131 }]`
(swap `previewSeed` for a real `imageUrl` when you serve images.)

### Figures currently hard-coded

`lib/api/mock-adapter.ts` carries the reported metrics (68.59 / 73.21 / 78.46 / 75.74) and a
confusion matrix **derived** from them on the 624-film split — 122 / 112 / 84 / 306, which
reproduces all four metrics exactly. Replace with the backend's own counts. Train and
validation split sizes are `null` placeholders and render as em dashes until `/metrics`
supplies them. No other clinical or model number is invented anywhere in this codebase.

### Films

Every radiograph in this build is **synthetic**, drawn as SVG by `lib/radiograph.tsx`.
When you serve real images, render `<img>` inside `<Lightbox>` instead — the viewer's
windowing, zoom, pan and overlays are agnostic to what fills the film layer.
