"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBaraStore, type CourseIndex } from "@/store/bara";
import { dishSwapSignal } from "./dishSwapSignal";

export const DISH_Y = 0.04 + 0.062 + 0.015; // 0.117 — just above glaze pool

// ─────────────────────────────────────────────────────────────────────────────
// Course 01 — Wood-Fired Dry-Aged Duck Breast
// ─────────────────────────────────────────────────────────────────────────────
function DuckBreast() {
  const geos = useMemo(() => {
    const sliceShape = new THREE.Shape();
    sliceShape.ellipse(0, 0, 0.065, 0.048, 0, Math.PI * 2, false, 0);
    const sliceGeo = new THREE.ExtrudeGeometry(sliceShape, {
      depth: 0.028, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3,
    });
    const skinShape = new THREE.Shape();
    skinShape.ellipse(0, 0, 0.068, 0.051, 0, Math.PI * 2, false, 0);
    const skinGeo  = new THREE.ExtrudeGeometry(skinShape, { depth: 0.006, bevelEnabled: false });
    const glazeGeo = new THREE.CircleGeometry(0.19, 36);
    const herbGeo  = new THREE.PlaneGeometry(0.022, 0.009);
    return { sliceGeo, skinGeo, glazeGeo, herbGeo };
  }, []);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const SLICES: [number, number, number][] = [[-0.1, 0, 0], [0, 0.015, 0.05], [0.1, 0, 0.1]];
  const HERBS:  [number, number, number][] = [
    [-0.05, 0.034, -0.06], [0.06, 0.034, -0.04], [0.12, 0.034, 0.06],
    [-0.12, 0.034, 0.08],  [0.0,  0.034,  0.14],
  ];
  return (
    <group>
      <mesh geometry={geos.glazeGeo} rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
        <meshStandardMaterial color="#5C0A14" roughness={0.05} metalness={0.1} transparent opacity={0.88} />
      </mesh>
      {SLICES.map((pos, i) => (
        <group key={i} position={pos} rotation-z={i * 0.18}>
          <mesh geometry={geos.sliceGeo} castShadow rotation-x={-Math.PI / 2}>
            <meshStandardMaterial color="#7A2E18" roughness={0.62} metalness={0.04} />
          </mesh>
          <mesh geometry={geos.skinGeo} castShadow rotation-x={-Math.PI / 2} position={[0, 0, 0.028]}>
            <meshStandardMaterial color="#2C1008" roughness={0.45} metalness={0.06} />
          </mesh>
        </group>
      ))}
      {HERBS.map((pos, i) => (
        <mesh key={i} geometry={geos.herbGeo} position={pos} rotation-x={-Math.PI / 2} rotation-z={i * 1.3}>
          <meshStandardMaterial color="#2D5A1B" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Course 02 — Charred Hokkaido Scallop & Yuzu Butter
// ─────────────────────────────────────────────────────────────────────────────
function HokkaidoScallop() {
  const geos = useMemo(() => ({
    scallopGeo:  new THREE.CylinderGeometry(0.055, 0.058, 0.055, 32),
    searGeo:     new THREE.PlaneGeometry(0.11, 0.004),
    emulsionGeo: new THREE.CircleGeometry(0.22, 36),
    pearlGeo:    new THREE.SphereGeometry(0.009, 8, 8),
  }), []);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const SCALLOPS: [number, number, number][] = [[-0.12, 0.028, -0.02], [0, 0.028, 0.06], [0.12, 0.028, -0.02]];
  const PEARLS:   [number, number, number][] = [
    [-0.18,0.012,0.08],[-0.08,0.012,0.16],[0.08,0.012,0.18],
    [0.18,0.012,0.06],[0.14,0.012,-0.1],[-0.14,0.012,-0.08],
    [0.0,0.012,-0.18],[-0.06,0.012,0.0],[0.06,0.012,0.0],
  ];
  return (
    <group>
      <mesh geometry={geos.emulsionGeo} rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
        <meshStandardMaterial color="#D4A020" roughness={0.06} metalness={0.05} transparent opacity={0.82} />
      </mesh>
      {SCALLOPS.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh geometry={geos.scallopGeo} castShadow>
            <meshStandardMaterial color="#E8C87A" roughness={0.35} metalness={0.06} />
          </mesh>
          {[0, 1].map((j) => (
            <mesh key={j} geometry={geos.searGeo} position={[0, 0.028, 0]}
              rotation-x={-Math.PI / 2} rotation-z={j * Math.PI / 2}>
              <meshStandardMaterial color="#1A0A02" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
      {PEARLS.map((pos, i) => (
        <mesh key={i} geometry={geos.pearlGeo} position={pos}>
          <meshStandardMaterial color="#F0EDE8" roughness={0.1} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Course 03 — Smoked Wagyu Short Rib & Black Garlic
// ─────────────────────────────────────────────────────────────────────────────
function WagyuShortRib() {
  const geos = useMemo(() => ({
    ribGeo:      new THREE.BoxGeometry(0.22, 0.09, 0.14),
    boneGeo:     new THREE.CylinderGeometry(0.012, 0.012, 0.32, 12),
    quenelleGeo: new THREE.SphereGeometry(0.038, 16, 10),
    ringGeo:     new THREE.TorusGeometry(0.028, 0.006, 8, 20),
    jusGeo:      new THREE.CircleGeometry(0.2, 36),
  }), []);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const RINGS: [number, number, number][] = [
    [0.14, 0.004, 0.06], [0.17, 0.004, -0.04], [0.1, 0.004, -0.08],
  ];
  return (
    <group>
      <mesh geometry={geos.jusGeo} rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
        <meshStandardMaterial color="#2A0D04" roughness={0.07} metalness={0.08} transparent opacity={0.75} />
      </mesh>
      <mesh geometry={geos.ribGeo} position={[-0.02, 0.046, 0]} castShadow>
        <meshStandardMaterial color="#1C0803" roughness={0.55} metalness={0.06} />
      </mesh>
      <mesh position={[-0.02, 0.092, 0]}>
        <boxGeometry args={[0.22, 0.004, 0.14]} />
        <meshStandardMaterial color="#8B1A05" roughness={0.12} metalness={0.1} transparent opacity={0.85} />
      </mesh>
      <mesh geometry={geos.boneGeo} position={[-0.02, 0.09, 0]}
        rotation-z={Math.PI / 2} rotation-y={0.3} castShadow>
        <meshStandardMaterial color="#E8DFCF" roughness={0.65} metalness={0.04} />
      </mesh>
      <mesh geometry={geos.quenelleGeo} position={[0.17, 0.038, 0.1]} scale={[1, 0.7, 1.4]} castShadow>
        <meshStandardMaterial color="#0A0806" roughness={0.4} metalness={0.08} />
      </mesh>
      {RINGS.map((pos, i) => (
        <mesh key={i} geometry={geos.ringGeo} position={pos}
          rotation-x={-Math.PI / 2} rotation-z={i * 0.6}>
          <meshStandardMaterial color="#C87060" roughness={0.6} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Course 04 — Burnt Honey & Matcha Mille-Feuille
// ─────────────────────────────────────────────────────────────────────────────
function MilleFeuille() {
  const geos = useMemo(() => {
    const tuileShape = new THREE.Shape();
    tuileShape.moveTo(0, 0); tuileShape.lineTo(0.14, 0.02);
    tuileShape.lineTo(0.08, 0.16); tuileShape.closePath();
    return {
      tier1:    new THREE.BoxGeometry(0.22, 0.016, 0.12),
      tier2:    new THREE.BoxGeometry(0.20, 0.016, 0.11),
      tier3:    new THREE.BoxGeometry(0.18, 0.016, 0.10),
      creamGeo: new THREE.SphereGeometry(0.028, 16, 10),
      tuileGeo: new THREE.ShapeGeometry(tuileShape),
      honeyGeo: new THREE.CircleGeometry(0.18, 36),
    };
  }, []);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const CREAM: [number, number, number][] = [
    [-0.06,0.056,-0.02],[0.0,0.056,0.03],[0.06,0.056,-0.02],
    [-0.03,0.056,0.07],[0.04,0.056,0.07],
  ];
  return (
    <group>
      <mesh geometry={geos.honeyGeo} rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
        <meshStandardMaterial color="#B87818" roughness={0.04} metalness={0.08} transparent opacity={0.8} />
      </mesh>
      <mesh geometry={geos.tier1} position={[0, 0.008, 0]} castShadow>
        <meshStandardMaterial color="#C89A5A" roughness={0.5} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.016, 0]}>
        <boxGeometry args={[0.21, 0.014, 0.115]} />
        <meshStandardMaterial color="#2D6A30" roughness={0.4} transparent opacity={0.92} />
      </mesh>
      <mesh geometry={geos.tier2} position={[0, 0.030, 0]} castShadow>
        <meshStandardMaterial color="#D4A860" roughness={0.45} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.038, 0]}>
        <boxGeometry args={[0.19, 0.014, 0.105]} />
        <meshStandardMaterial color="#2D6A30" roughness={0.4} transparent opacity={0.92} />
      </mesh>
      <mesh geometry={geos.tier3} position={[0, 0.052, 0]} castShadow>
        <meshStandardMaterial color="#E8C070" roughness={0.38} metalness={0.06} />
      </mesh>
      {CREAM.map((pos, i) => (
        <mesh key={i} geometry={geos.creamGeo} position={pos} scale={[1, 0.65, 1]} castShadow>
          <meshStandardMaterial color="#3A7A3A" roughness={0.35} />
        </mesh>
      ))}
      <mesh geometry={geos.tuileGeo} position={[0.02, 0.095, 0.02]}
        rotation-x={-Math.PI * 0.38} rotation-z={0.3} castShadow>
        <meshStandardMaterial color="#C87A10" roughness={0.12} metalness={0.15}
          side={THREE.DoubleSide} transparent opacity={0.92} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SignatureDishes — renders displayedCourse (not activeCourse directly)
// ─────────────────────────────────────────────────────────────────────────────
const DISHES = [DuckBreast, HokkaidoScallop, WagyuShortRib, MilleFeuille];

export default function SignatureDishes() {
  const groupRef = useRef<THREE.Group>(null);

  // displayedCourse drives what mesh is rendered — only updated via dishSwapSignal
  const [displayedCourse, setDisplayedCourse] = useState<CourseIndex>(0);

  useFrame(({ clock }) => {
    // Poll the swap signal from BrassCloche (runs in the same useFrame loop)
    if (dishSwapSignal.readyToSwap && dishSwapSignal.pendingCourse >= 0) {
      const next = dishSwapSignal.pendingCourse as CourseIndex;
      dishSwapSignal.readyToSwap   = false;
      dishSwapSignal.pendingCourse = -1;
      // setState inside useFrame is intentional here — it's the only way to
      // trigger a re-render of the dish mesh. The state update is batched by
      // React and fires outside the frame, so it does not violate the
      // "no mutations in useFrame" guardrail (we are reading a ref, not
      // mutating Three.js objects; the setState triggers a React re-render).
      setDisplayedCourse(next);
    }

    // Micro float — stays firmly on plate
    if (groupRef.current) {
      groupRef.current.position.y = DISH_Y + Math.sin(clock.elapsedTime * 0.75) * 0.003;
    }
  });

  // Clicking the dish cycles the UI selection — cloche handles the reveal
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const store = useBaraStore.getState();
    const next  = ((store.activeCourse + 1) % 4) as CourseIndex;
    store.setActiveCourse(next);
  };

  const ActiveDish = DISHES[displayedCourse];

  return (
    <group ref={groupRef} position={[0, DISH_Y, 0]} onClick={handleClick}>
      <ActiveDish />
    </group>
  );
}
