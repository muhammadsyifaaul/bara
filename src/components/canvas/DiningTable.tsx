"use client";

import { useMemo, useEffect } from "react";
import * as THREE from "three";

/**
 * Shared constant: Y position of the plate's top surface in DiningTable local space.
 * Counter top sits at y=0, counter height=0.08 so top face = +0.04.
 * Plate group is placed at y=0.04. Plate rim top = 0.115 (from LatheGeometry profile).
 * So food surface = 0.04 + 0.115 = 0.155.
 * Exported so BrassCloche and SignatureDishes can reference it.
 */
export const PLATE_TOP_Y = 0.155; // local to DiningTable group

/** Procedural walnut woodgrain — warmer palette */
function makeWoodgrainTexture(): THREE.CanvasTexture {
  const W = 512, H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Warm walnut base #7D4E2D
  ctx.fillStyle = "#7D4E2D";
  ctx.fillRect(0, 0, W, H);

  // Highlight wash — golden undertone
  const baseGrad = ctx.createLinearGradient(0, 0, W, H);
  baseGrad.addColorStop(0,   "rgba(163,107,65,0.18)");
  baseGrad.addColorStop(0.5, "rgba(125,78,45,0.0)");
  baseGrad.addColorStop(1,   "rgba(163,107,65,0.14)");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, W, H);

  // Grain lines — #543118 dark streaks with #A36B41 light highlights
  for (let i = 0; i < 160; i++) {
    const y = (i / 160) * H;
    const isDark = i % 3 !== 0;
    const baseHue = isDark ? 20 : 28;
    const baseLightness = isDark ? (12 + (i % 5) * 4) : (38 + (i % 4) * 6);
    const alpha = isDark ? (0.08 + (i % 4) * 0.03) : (0.12 + (i % 3) * 0.04);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 6) {
      const wy = y + Math.sin(x * 0.018 + i * 0.65) * 4.5 + Math.sin(x * 0.045 + i * 1.2) * 1.8 + (Math.random() - 0.5) * 1.2;
      ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = `hsla(${baseHue}, 55%, ${baseLightness}%, ${alpha})`;
    ctx.lineWidth = isDark ? (0.6 + (i % 3) * 0.5) : (1.0 + (i % 2) * 0.8);
    ctx.stroke();
  }

  // Knot whorls
  for (let k = 0; k < 3; k++) {
    const kx = 60 + Math.random() * (W - 120);
    const ky = 60 + Math.random() * (H - 120);
    const r  = 22 + Math.random() * 18;
    for (let ring = 0; ring < 5; ring++) {
      const gr = ctx.createRadialGradient(kx, ky, ring * r * 0.18, kx, ky, (ring + 1) * r * 0.22);
      gr.addColorStop(0,   `rgba(32,15,6,${0.18 - ring * 0.03})`);
      gr.addColorStop(0.6, `rgba(84,49,24,${0.08 - ring * 0.01})`);
      gr.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.ellipse(kx, ky, r + ring * 6, (r + ring * 6) * 0.65, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Final warm highlight gloss
  const glossGrad = ctx.createLinearGradient(0, 0, 0, H);
  glossGrad.addColorStop(0,    "rgba(255,210,160,0.06)");
  glossGrad.addColorStop(0.35, "rgba(255,200,140,0.10)");
  glossGrad.addColorStop(0.65, "rgba(255,200,140,0.07)");
  glossGrad.addColorStop(1,    "rgba(200,140,80,0.04)");
  ctx.fillStyle = glossGrad;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Stoneware plate via LatheGeometry */
export function StonewarePlate() {
  const plateGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0.00,  0.000),
      new THREE.Vector2(0.09,  0.000),
      new THREE.Vector2(0.09,  0.012),
      new THREE.Vector2(0.11,  0.015),
      new THREE.Vector2(0.38,  0.030),
      new THREE.Vector2(0.44,  0.065),
      new THREE.Vector2(0.46,  0.090),
      new THREE.Vector2(0.46,  0.105),
      new THREE.Vector2(0.44,  0.115),
      new THREE.Vector2(0.42,  0.112),
      new THREE.Vector2(0.10,  0.072),
      new THREE.Vector2(0.02,  0.060),
      new THREE.Vector2(0.00,  0.058),
    ];
    return new THREE.LatheGeometry(points, 64);
  }, []);

  const glazeGeo = useMemo(() => new THREE.CircleGeometry(0.28, 48), []);

  useEffect(() => () => { plateGeo.dispose(); glazeGeo.dispose(); }, [plateGeo, glazeGeo]);

  return (
    <group>
      <mesh geometry={plateGeo} receiveShadow castShadow>
        <meshStandardMaterial color="#D4C5B0" roughness={0.72} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
      {/* Sauce glaze pool at plate well depth ~y=0.062 */}
      <mesh geometry={glazeGeo} position={[0, 0.062, 0]} rotation-x={-Math.PI / 2}>
        <meshStandardMaterial color="#C8B090" roughness={0.06} metalness={0.12} transparent opacity={0.78} />
      </mesh>
    </group>
  );
}

export default function DiningTable() {
  const woodTex = useMemo(() => {
    if (typeof window === "undefined") return null;
    return makeWoodgrainTexture();
  }, []);

  useEffect(() => () => { woodTex?.dispose(); }, [woodTex]);

  const counterGeo  = useMemo(() => new THREE.BoxGeometry(3.4, 0.08, 1.2), []);
  const fasciaGeo   = useMemo(() => new THREE.BoxGeometry(3.4, 0.22, 0.04), []);

  useEffect(() => () => { counterGeo.dispose(); fasciaGeo.dispose(); }, [counterGeo, fasciaGeo]);

  return (
    <group>
      {/* ── Walnut counter top (top face at y=+0.04) ─────────────── */}
      <mesh geometry={counterGeo} position={[0, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial
          map={woodTex ?? undefined}
          color="#7D4E2D"
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>

      {/* ── Front fascia ─────────────────────────────────────────── */}
      <mesh geometry={fasciaGeo} position={[0, -0.15, 0.62]} receiveShadow>
        <meshStandardMaterial
          map={woodTex ?? undefined}
          color="#5C3418"
          roughness={0.52}
          metalness={0.04}
        />
      </mesh>

      {/* ── Brass edge inlay strip ───────────────────────────────── */}
      <mesh position={[0, 0.041, 0.6]}>
        <boxGeometry args={[3.4, 0.006, 0.014]} />
        <meshStandardMaterial color="#C88A36" metalness={0.92} roughness={0.16} />
      </mesh>

      {/* ── Stoneware plate — top at y=0.04+0.115=0.155 ─────────── */}
      <group position={[0, 0.04, 0]}>
        <StonewarePlate />
      </group>
    </group>
  );
}
