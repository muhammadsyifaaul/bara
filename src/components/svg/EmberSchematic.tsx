export default function EmberSchematic() {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Coffee-Wood & Coconut Shell Embers schematic"
      className="w-full h-full"
    >
      {/* ── Firebox outline ──────────────────────────────────────── */}
      <rect x="20" y="80" width="200" height="80" rx="4"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />

      {/* Grate bars */}
      {[0,1,2,3,4,5].map((i) => (
        <line key={i}
          x1={36 + i * 30} y1="160" x2={36 + i * 30} y2="80"
          stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.18"
          strokeDasharray="4 3"
        />
      ))}

      {/* ── Ember bed stones (ellipses) ──────────────────────────── */}
      {[
        [50,148,18,7],[85,152,14,6],[118,146,20,8],[152,151,15,6],
        [185,147,16,7],[68,138,12,5],[105,136,16,6],[140,140,13,5],[170,138,11,5],
      ].map(([cx,cy,rx,ry],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
          fill="none" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
      ))}

      {/* ── Glowing ember cores ──────────────────────────────────── */}
      {[
        [50,145,"#D94E28"],[118,143,"#C88A36"],[185,144,"#D94E28"],
        [85,149,"#C88A36"],[152,148,"#D94E28"],
      ].map(([cx,cy,color],i) => (
        <circle key={i} cx={Number(cx)} cy={Number(cy)} r="4"
          fill={String(color)} fillOpacity="0.7" />
      ))}

      {/* ── Rising heat lines ────────────────────────────────────── */}
      {[55,100,145,190].map((x,i) => (
        <path key={i}
          d={`M${x} 78 Q${x+6} 60 ${x} 42 Q${x-6} 24 ${x} 10`}
          stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.2"
          strokeDasharray="2 4" fill="none"
        />
      ))}

      {/* ── Log cross-section (top left) ─────────────────────────── */}
      <circle cx="45" cy="108" r="12"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" fill="none" />
      <circle cx="45" cy="108" r="7"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.2" fill="none" />
      <circle cx="45" cy="108" r="3"
        fill="currentColor" fillOpacity="0.15" />
      {/* annual ring label */}
      <line x1="58" y1="108" x2="72" y2="108"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
      <text x="74" y="111" fontSize="6" fill="currentColor" fillOpacity="0.5"
        fontFamily="var(--font-mono)">COFFEE WOOD</text>

      {/* ── Coconut-shell fragment ────────────────────────────────── */}
      <path d="M185 95 Q195 88 205 95 Q210 105 200 110 Q190 112 183 105 Z"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" fill="none" />
      <line x1="183" y1="99" x2="170" y2="99"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
      <text x="130" y="102" fontSize="6" fill="currentColor" fillOpacity="0.5"
        fontFamily="var(--font-mono)">COCONUT SHELL</text>

      {/* ── Temperature annotation ───────────────────────────────── */}
      <text x="20" y="72" fontSize="8" fill="currentColor" fillOpacity="0.6"
        fontFamily="var(--font-mono)" fontWeight="600">680°C EMBER CORE</text>
      <line x1="20" y1="75" x2="220" y2="75"
        stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />

      {/* ── Bottom label ─────────────────────────────────────────── */}
      <text x="120" y="174" fontSize="6" textAnchor="middle"
        fill="currentColor" fillOpacity="0.4" fontFamily="var(--font-mono)">
        FIG. 1 — FIREBOX CROSS-SECTION
      </text>
    </svg>
  );
}
