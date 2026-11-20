export default function StonewareSchematic() {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hand-Thrown Lombok Stoneware schematic"
      className="w-full h-full"
    >
      {/* ── Plate profile (lathe cross-section) ──────────────────── */}
      {/* Outer rim left */}
      <path d="M50 60 Q46 65 44 80 L44 110 Q44 118 50 120 L120 125"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="none" />
      {/* Outer rim right */}
      <path d="M190 60 Q194 65 196 80 L196 110 Q196 118 190 120 L120 125"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="none" />
      {/* Plate top surface */}
      <path d="M50 60 Q70 52 120 50 Q170 52 190 60"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="none" />
      {/* Foot ring */}
      <path d="M94 125 L94 132 Q94 136 100 136 L140 136 Q146 136 146 132 L146 125"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" fill="none" />

      {/* ── Well (sauce pool) ────────────────────────────────────── */}
      <ellipse cx="120" cy="78" rx="38" ry="12"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" fill="none" />
      <ellipse cx="120" cy="78" rx="22" ry="6"
        stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.18" fill="none" />

      {/* ── Glaze drip lines ─────────────────────────────────────── */}
      {[80,100,120,140,160].map((x,i) => (
        <path key={i}
          d={`M${x} 60 Q${x+3} ${70+i} ${x+1} ${75+i*2}`}
          stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
      ))}

      {/* ── Dimension annotations ────────────────────────────────── */}
      {/* Diameter */}
      <line x1="44" y1="145" x2="196" y2="145"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" />
      <line x1="44" y1="140" x2="44" y2="150"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" />
      <line x1="196" y1="140" x2="196" y2="150"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" />
      <text x="120" y="155" fontSize="6" textAnchor="middle"
        fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-mono)">∅ 28 cm</text>

      {/* Depth callout */}
      <line x1="196" y1="60" x2="210" y2="60"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" />
      <line x1="196" y1="125" x2="210" y2="125"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" />
      <line x1="208" y1="60" x2="208" y2="125"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.2" />
      <text x="216" y="96" fontSize="6" textAnchor="start"
        fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-mono)">3.2 cm</text>

      {/* ── Clay composition tag ──────────────────────────────────── */}
      <line x1="82" y1="58" x2="60" y2="34"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" />
      <circle cx="60" cy="34" r="1.5"
        fill="currentColor" fillOpacity="0.3" />
      <text x="30" y="30" fontSize="5.5"
        fill="currentColor" fillOpacity="0.45" fontFamily="var(--font-mono)">LOMBOK STONEWARE</text>
      <text x="30" y="38" fontSize="5"
        fill="currentColor" fillOpacity="0.35" fontFamily="var(--font-mono)">CONE 10 · 1280°C</text>

      {/* ── Glaze tag ────────────────────────────────────────────── */}
      <line x1="158" y1="58" x2="176" y2="36"
        stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" />
      <circle cx="176" cy="36" r="1.5"
        fill="currentColor" fillOpacity="0.3" />
      <text x="150" y="32" fontSize="5.5"
        fill="currentColor" fillOpacity="0.45" fontFamily="var(--font-mono)">ASH GLAZE</text>
      <text x="150" y="40" fontSize="5"
        fill="currentColor" fillOpacity="0.35" fontFamily="var(--font-mono)">RICE HUSK / FELDSPAR</text>

      {/* ── Title ────────────────────────────────────────────────── */}
      <text x="20" y="13" fontSize="8"
        fill="currentColor" fillOpacity="0.6" fontFamily="var(--font-mono)" fontWeight="600">
        HAND-THROWN STONEWARE
      </text>

      {/* ── Figure caption ───────────────────────────────────────── */}
      <text x="120" y="174" fontSize="6" textAnchor="middle"
        fill="currentColor" fillOpacity="0.4" fontFamily="var(--font-mono)">
        FIG. 3 — PLATE PROFILE · LATHE SECTION
      </text>
    </svg>
  );
}
