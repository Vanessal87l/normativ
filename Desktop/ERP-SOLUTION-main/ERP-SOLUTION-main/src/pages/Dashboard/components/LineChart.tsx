export default function LineChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const w = 820;
  const h = 260;
  const pad = 36;

  const max = Math.max(1, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));

  const x = (i: number) => {
    if (data.length <= 1) return pad;
    return pad + (i * (w - pad * 2)) / (data.length - 1);
  };
  const y = (v: number) => {
    const t = (v - min) / (max - min || 1);
    return h - pad - t * (h - pad * 2);
  };

  const dPath = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(p.value).toFixed(2)}`)
    .join(" ");

  return (
    <div className="w-full overflow-x-auto glass text-white">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {/* grid */}
        {Array.from({ length: 5 }, (_, i) => {
          const yy = pad + (i * (h - pad * 2)) / 4;
          return (
            <line
              key={i}
              x1={pad}
              x2={w - pad}
              y1={yy}
              y2={yy}
              stroke="rgba(15,23,42,0.08)"
            />
          );
        })}

        {/* line */}
        <path d={dPath} fill="none" stroke="rgba(15,23,42,0.85)" strokeWidth="2.5" />

        {/* points */}  
        {data.map((p, i) => (
          <g key={p.label + i}>
            <circle cx={x(i)} cy={y(p.value)} r="4" fill="#fff" stroke="rgba(15,23,42,0.85)" strokeWidth="2" />
          </g>
        ))}

        {/* x labels */}
        {data.map((p, i) => (
          <text
            key={p.label + "_t"}
            x={x(i)}
            y={h - 12}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(15,23,42,0.55)"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
