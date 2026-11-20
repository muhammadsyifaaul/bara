export default function AgingChamberSchematic() {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Dry-Aging Microclimate Chamber schematic"
      className="w-full h-full"
    >
      {/* ── Chamber outline ──────────────────────────────────────── */}
      <rect x="30" y="20" width="180" height="130" rx="6"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      {/* Door */}
      <rect x="30" y="20" width="50" height="130" rx="6"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"
        strokeDasharray="3 3" />
      {/* Door handle */}
      <line x1="72" y1="82" x2="72" y2="96"
        stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />

      {/* ── Himalayan salt wall (right side, hatched) ─────────────── */}
      {[0,1,2,3,4,5,6,7].map((i) => (
        <line key={i}
          x1="195" y1={24 + i * 16} x2="208" y2={24 + i * 16}
          stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeLinecap="round" />
      ))}
      <rect x="196" y="20" width="14" height="130"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.2" fill="none" />
      <text x="203" y="175" fontSize="5.5" textAnchor="middle"
        fill="currentColor" fillOpacity="0.4" fontFamily="var(--font-mono)">SALT WALL</text>

      {/* ── Hanging cuts (3 rib sections) ────────────────────────── */}
      {[90, 125, 160].map((x, i) => (
        <g key={i}>
          {/* Hook */}
          <path d={`M${x} 30 Q${x+4} 22 ${x+8} 30`}
            stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="none" />
          {/* Hanging wire */}
          <line x1={x+4} y1="30" x2={x+4} y2="44"
            stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
          {/* Meat block */}
          <rect x={x-4} y="44" width="16" height="52" rx="3"
            stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" fill="none" />
          {/* Marbling lines */}
          <line x1={x-2} y1={54+i*4} x2={x+10} y2={58+i*4}
            stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <line x1={x-1} y1={66+i*2} x2={x+9} y2={70+i*2}
            stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          {/* Bone end */}
          <ellipse cx={x+4} cy="97" rx="4" ry="2"
            stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" fill="none" />
        </g>
      ))}

      {/* ── Airflow arrows ───────────────────────────────────────── */}
      {[55, 75].map((y, i) => (
        <g key={i}>
          <line x1="82" y1={y} x2="94" y2={y}
            stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" markerEnd="url(#arr)" />
        </g>
      ))}
      <defs>
        <marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0 0 L4 2 L0 4" fill="none"
            stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
        </marker>
      </defs>

      {/* ── Annotation callouts ──────────────────────────────────── */}
      {/* Temp */}
      <line x1="30" y1="118" x2="14" y2="118"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
      <text x="12" y="118" fontSize="6" textAnchor="end"
        fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-mono)">2°C</text>

      {/* Humidity */}
      <line x1="30" y1="130" x2="14" y2="130"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
      <text x="12" y="133" fontSize="6" textAnchor="end"
        fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-mono)">78% RH</text>

      {/* Airflow speed */}
      <text x="80" y="47" fontSize="6"
        fill="currentColor" fillOpacity="0.45" fontFamily="var(--font-mono)">0.5 m/s</text>

      {/* ── Title ────────────────────────────────────────────────── */}
      <text x="20" y="13" fontSize="8"
        fill="currentColor" fillOpacity="0.6" fontFamily="var(--font-mono)" fontWeight="600">
        45-DAY AGING CHAMBER
      </text>

      {/* ── Figure caption ───────────────────────────────────────── */}
      <text x="120" y="174" fontSize="6" textAnchor="middle"
        fill="currentColor" fillOpacity="0.4" fontFamily="var(--font-mono)">
        FIG. 2 — MICROCLIMATE CROSS-SECTION
      </text>
    </svg>
  );
}
