import { useId } from "react";
import { prng } from "./rng";
import type { ClassLabel, Region } from "./types";

/**
 * Synthetic PA chest film, drawn as SVG. Used everywhere a real image is not yet
 * available so the product can be designed and reviewed without shipping patient
 * data. Film space is 400 x 500 — region coordinates share it.
 */
export function Radiograph({
  seed = 1, finding = "NORMAL", severity = 0.5, className,
}: { seed?: number; finding?: ClassLabel; severity?: number; className?: string }) {
  const u = useId().replace(/[:]/g, "");
  const r = prng(seed);
  const j = (m: number) => (r() - 0.5) * m;

  const ribs: string[] = [];
  for (let i = 0; i < 9; i++) {
    const y0 = 116 + i * 25 + j(3);
    const y1 = y0 + 52 + i * 4;
    const x1 = 200 - (92 + i * 3.4 + j(4));
    ribs.push(`M197 ${y0.toFixed(1)} C 162 ${(y0 - 7).toFixed(1)}, ${(x1 + 22).toFixed(1)} ${(y0 + 6).toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`);
  }
  const RibCage = () => (
    <g fill="none" stroke="#dfe9f0" strokeWidth={4.4} strokeLinecap="round" opacity={0.17}>
      {ribs.map((d, i) => <path key={i} d={d} />)}
    </g>
  );

  const spine = Array.from({ length: 13 }, (_, i) => (
    <rect key={i} x={191} y={74 + i * 22} width={18} height={17} rx={3} fill="#cfdde6" opacity={0.16 + r() * 0.05} />
  ));

  const consolidation: JSX.Element[] = [];
  if (finding === "PNEUMONIA") {
    const n = severity > 0.7 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const left = r() > 0.45;
      const cx = left ? 120 + j(34) : 282 + j(34);
      const cy = 290 + r() * 90;
      const rx = 34 + r() * 22 + severity * 14;
      consolidation.push(
        <ellipse key={`o${i}`} cx={cx} cy={cy} rx={rx} ry={rx * 0.78} fill="#eef5f9"
          opacity={0.17 + severity * 0.2} filter={`url(#b-${u})`} />,
      );
      for (let k = 0; k < 5; k++)
        consolidation.push(
          <circle key={`o${i}-${k}`} cx={cx + j(rx * 1.5)} cy={cy + j(rx * 1.4)} r={6 + r() * 11}
            fill="#f4fafd" opacity={0.06 + r() * 0.09} filter={`url(#b-${u})`} />,
        );
    }
  }

  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className}
      role="img" aria-label={`Synthetic chest radiograph, ${finding.toLowerCase()}`}>
      <defs>
        <radialGradient id={`g-${u}`} cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor="#b9cfdd" stopOpacity=".30" />
          <stop offset="58%" stopColor="#8ea7b6" stopOpacity=".16" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`l-${u}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#000" stopOpacity=".82" />
          <stop offset="100%" stopColor="#000" stopOpacity=".18" />
        </radialGradient>
        <filter id={`b-${u}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" /></filter>
        <filter id={`s-${u}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" /></filter>
        <filter id={`n-${u}`}>
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" /></filter>
      </defs>

      <rect width={400} height={500} fill="#07080a" />
      <ellipse cx={200} cy={250} rx={178} ry={238} fill={`url(#g-${u})`} />
      <path d="M56 96 Q118 58 196 78 L196 96 Z" fill="#c3d6e2" opacity=".14" filter={`url(#s-${u})`} />
      <path d="M344 96 Q282 58 204 78 L204 96 Z" fill="#c3d6e2" opacity=".14" filter={`url(#s-${u})`} />
      <ellipse cx={126} cy={252} rx={74} ry={142} fill={`url(#l-${u})`} />
      <ellipse cx={276} cy={252} rx={74} ry={142} fill={`url(#l-${u})`} />
      <RibCage />
      <g transform="translate(400,0) scale(-1,1)"><RibCage /></g>
      <rect x={190} y={70} width={20} height={300} fill="#b9cddb" opacity=".10" />
      {spine}
      <path d="M196 296 C 196 236 214 224 240 232 C 268 240 276 292 262 326 C 248 358 210 356 200 336 Z"
        fill="#dce9f1" opacity=".16" filter={`url(#s-${u})`} />
      <path d="M44 392 Q120 344 196 400 L196 468 L44 468 Z" fill="#cfe0ea" opacity=".19" filter={`url(#s-${u})`} />
      <path d="M356 384 Q284 340 204 396 L204 468 L356 468 Z" fill="#cfe0ea" opacity=".17" filter={`url(#s-${u})`} />
      {consolidation}
      <rect width={400} height={500} filter={`url(#n-${u})`} opacity={0.055}
        style={{ mixBlendMode: "soft-light" }} />
    </svg>
  );
}

/** Region-attribution overlay. Hot regions read red, warm amber, cool blue. */
export function AttributionLayer({ regions, className }: { regions: Region[]; className?: string }) {
  const u = useId().replace(/[:]/g, "");
  if (!regions.length) return null;
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <defs>
        <filter id={`ab-${u}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" /></filter>
      </defs>
      {regions.map((g, i) => {
        const c = g.weight >= 0.34 ? "#ff5a46" : g.weight >= 0.2 ? "#ffab2e" : "#4d9bff";
        return (
          <g key={i}>
            <circle cx={g.x} cy={g.y} r={g.r * 1.5} fill={c} opacity={0.1 + g.weight * 0.34} filter={`url(#ab-${u})`} />
            <circle cx={g.x} cy={g.y} r={g.r} fill="none" stroke={c} strokeWidth={1} opacity={0.75} />
            <circle cx={g.x} cy={g.y} r={g.r * 1.52} fill="none" stroke={c} strokeWidth={0.8}
              strokeDasharray="3 4" opacity={0.5} />
            <path d={`M${g.x + g.r * 1.52} ${g.y} h18`} stroke={c} strokeWidth={0.8} opacity={0.6} />
            <text x={g.x + g.r * 1.52 + 22} y={g.y + 3.4} fill={c} fontFamily="var(--font-mono), monospace"
              fontSize={10} opacity={0.95}>{`R${i + 1} ${g.weight.toFixed(2)}`}</text>
          </g>
        );
      })}
    </svg>
  );
}
