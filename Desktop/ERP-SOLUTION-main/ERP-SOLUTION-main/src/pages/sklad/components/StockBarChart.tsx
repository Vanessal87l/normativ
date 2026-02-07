import { useMemo } from "react";
import type { ChartPoint } from "../sklad-api/types";

type Props = {
  seriesIn: ChartPoint[];
  seriesOut: ChartPoint[];
  height?: number;
};

export default function StockBarChart({ seriesIn, seriesOut, height = 260 }: Props) {
  const width = 740;
  const pad = 34;

  const merged = useMemo(() => {
    const map = new Map<string, { label: string; inV: number; outV: number }>();

    for (const p of seriesIn) map.set(p.label, { label: p.label, inV: p.value, outV: 0 });
    for (const p of seriesOut) {
      const cur = map.get(p.label);
      if (cur) cur.outV = p.value;
      else map.set(p.label, { label: p.label, inV: 0, outV: p.value });
    }

    return Array.from(map.values());
  }, [seriesIn, seriesOut]);

  const maxV = useMemo(() => {
    let m = 0;
    for (const x of merged) m = Math.max(m, x.inV, x.outV);
    return m || 1;
  }, [merged]);

  const n = merged.length || 1;
  const slot = (width - pad * 2) / n;
  const barW = Math.max(10, slot * 0.28);
  const gap = Math.max(6, slot * 0.08);

  const y = (v: number) => {
    const t = v / maxV;
    return height - pad - t * (height - pad * 2);
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px]" role="img">
      {/* grid */}
      {Array.from({ length: 5 }, (_, i) => {
        const t = i / 4;
        const yy = pad + t * (height - pad * 2);
        return (
          <line
            key={i}
            x1={pad}
            x2={width - pad}
            y1={yy}
            y2={yy}
            stroke="rgba(15,23,42,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* bars */}
      {merged.map((d, i) => {
        const x0 = pad + i * slot + slot / 2;

        const inH = height - pad - y(d.inV);
        const outH = height - pad - y(d.outV);

        const inX = x0 - barW - gap / 2;
        const outX = x0 + gap / 2;

        const inY = y(d.inV);
        const outY = y(d.outV);

        return (
          <g key={d.label}>
            <rect x={inX} y={inY} width={barW} height={inH} rx={10} fill="rgba(15,23,42,0.85)" />
            <rect x={outX} y={outY} width={barW} height={outH} rx={10} fill="rgba(15,23,42,0.25)" />

            <text
              x={x0}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(15,23,42,0.55)"
              fontFamily="ui-sans-serif, system-ui"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
