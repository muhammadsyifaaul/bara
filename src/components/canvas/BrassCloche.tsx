"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBaraStore } from "@/store/bara";
import { PLATE_TOP_Y } from "./DiningTable";

// ── Easing helpers ────────────────────────────────────────────────────────────
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}
function easeInCubic(t: number) {
  return t * t * t;
}
// Clamp t to [0,1] before passing to easing
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }

// ── Position / rotation constants ────────────────────────────────────────────
// PLATE_TOP_Y = 0.155 (top of plate rim, exported from DiningTable)
const PLATE_RIM_Y     = 0.165;   // hard floor — rim can NEVER go below this
const REST_Y          = PLATE_RIM_Y;
const OPEN_Y          = REST_Y + 0.88;
const OPEN_ROT        = -0.34;
const OPEN_X          = 0.28;
const LIFT_PARTIAL_Y  = PLATE_RIM_Y + 0.38;  // intermediate Y before tilt begins

// ── Course-swap phase timestamps (seconds) ────────────────────────────────────
// Phase A  0.00 – 0.35  Graceful re-centre & level (still elevated)
// Phase B  0.35 – 0.70  Measured descent onto PLATE_RIM_Y
// Phase C  0.70 – 1.05  Theatrical closed pause (dish swap fires at 0.85 s)
// Phase D  1.05 – 1.75  Slow stately reveal: vertical lift then tilt & glide
const PA_END = 0.35;
const PB_END = 0.70;
const PC_END = 1.05;
const PD_END = 1.75;
// Dish is swapped at this exact moment during the closed pause
const DISH_SWAP_T = 0.85;

// ── Dome LatheGeometry ────────────────────────────────────────────────────────
function useClocheGeometries() {
  return useMemo(() => {
    const domePoints: THREE.Vector2[] = [];
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const angle = (i / N) * Math.PI * 0.5;
      domePoints.push(new THREE.Vector2(
        0.42 * Math.cos(angle),
        0.56 * Math.sin(angle),
      ));
    }
    domePoints.push(new THREE.Vector2(0, 0.56));

    const domeGeo   = new THREE.LatheGeometry(domePoints, 72);
    const rimGeo    = new THREE.TorusGeometry(0.42, 0.013, 16, 72);
    const finialPts = [
      new THREE.Vector2(0.000, 0.000),
      new THREE.Vector2(0.030, 0.000),
      new THREE.Vector2(0.034, 0.014),
      new THREE.Vector2(0.028, 0.030),
      new THREE.Vector2(0.020, 0.044),
      new THREE.Vector2(0.028, 0.058),
      new THREE.Vector2(0.032, 0.074),
      new THREE.Vector2(0.016, 0.092),
      new THREE.Vector2(0.000, 0.094),
    ];
    const finialGeo = new THREE.LatheGeometry(finialPts, 32);
    return { domeGeo, rimGeo, finialGeo };
  }, []);
}

export default function BrassCloche() {
  const groupRef = useRef<THREE.Group>(null);
  const { domeGeo, rimGeo, finialGeo } = useClocheGeometries();

  // ── Zustand → refs (no React state mutations in useFrame) ────────────────
  const openRef          = useRef(false);
  const prevCourseRef    = useRef(0);
  const swapActiveRef    = useRef(false);
  const swapTimerRef     = useRef(0);
  const pendingCourseRef = useRef(-1);
  const dishSwappedRef   = useRef(false);

  // Live animated values (driven by useFrame, never by React state)
  const posXRef = useRef(0);
  const posYRef = useRef(REST_Y);
  const rotZRef = useRef(0);

  // Snapshot the position at swap-start so each phase interpolates from actual state
  const snapXRef = useRef(0);
  const snapYRef = useRef(REST_Y);
  const snapZRef = useRef(0);

  useEffect(() => {
    openRef.current       = useBaraStore.getState().clocheOpen;
    prevCourseRef.current = useBaraStore.getState().activeCourse;

    return useBaraStore.subscribe((s) => {
      openRef.current = s.clocheOpen;
      const course = s.activeCourse;
      if (course !== prevCourseRef.current && !swapActiveRef.current) {
        pendingCourseRef.current = course;
        swapActiveRef.current    = true;
        swapTimerRef.current     = 0;
        dishSwappedRef.current   = false;
        // Snapshot actual position so Phase A starts from wherever the cloche is
        snapXRef.current = posXRef.current;
        snapYRef.current = posYRef.current;
        snapZRef.current = rotZRef.current;
      }
      prevCourseRef.current = course;
    });
  }, []);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);

    // ── Course-swap sequence ──────────────────────────────────────────────
    if (swapActiveRef.current) {
      swapTimerRef.current += dt;
      const t = swapTimerRef.current;

      if (t < PA_END) {
        // Phase A: re-centre & level — cloche stays near its current elevation
        const p = easeInOutCubic(clamp01(t / PA_END));
        posXRef.current = snapXRef.current + (0 - snapXRef.current) * p;
        rotZRef.current = snapZRef.current + (0 - snapZRef.current) * p;
        // Y stays at snapshot elevation, clamped above rim
        posYRef.current = Math.max(PLATE_RIM_Y, snapYRef.current);

      } else if (t < PB_END) {
        // Phase B: measured descent — straight down, z already 0
        const p = easeInOutCubic(clamp01((t - PA_END) / (PB_END - PA_END)));
        posYRef.current = Math.max(
          PLATE_RIM_Y,
          snapYRef.current + (PLATE_RIM_Y - snapYRef.current) * p,
        );
        posXRef.current = THREE.MathUtils.damp(posXRef.current, 0, 18, dt);
        rotZRef.current = THREE.MathUtils.damp(rotZRef.current, 0, 18, dt);

      } else if (t < PC_END) {
        // Phase C: theatrical closed pause — hold perfectly still on rim
        posYRef.current = PLATE_RIM_Y;
        posXRef.current = THREE.MathUtils.damp(posXRef.current, 0, 18, dt);
        rotZRef.current = THREE.MathUtils.damp(rotZRef.current, 0, 18, dt);

        // Swap the dish at the midpoint of the pause
        if (!dishSwappedRef.current && t >= DISH_SWAP_T && pendingCourseRef.current >= 0) {
          useBaraStore.getState().setActiveCourse(pendingCourseRef.current as 0 | 1 | 2 | 3);
          pendingCourseRef.current = -1;
          dishSwappedRef.current   = true;
        }

      } else if (t < PD_END) {
        // Phase D: slow stately reveal
        // First half (~0 – 0.35 s of D): vertical lift to LIFT_PARTIAL_Y
        // Second half (~0.35 s – 0.70 s of D): tilt & glide to open/closed position
        const pFull     = clamp01((t - PC_END) / (PD_END - PC_END)); // 0→1 over full D
        const liftShare = 0.50;  // first 50 % of phase D is pure vertical lift

        const targetY = openRef.current ? OPEN_Y   : REST_Y;
        const targetZ = openRef.current ? OPEN_ROT : 0;
        const targetX = openRef.current ? OPEN_X   : 0;

        if (pFull <= liftShare) {
          // Vertical lift — no tilt yet
          const pLift = easeOutQuart(clamp01(pFull / liftShare));
          posYRef.current = Math.max(
            PLATE_RIM_Y,
            PLATE_RIM_Y + (LIFT_PARTIAL_Y - PLATE_RIM_Y) * pLift,
          );
          posXRef.current = THREE.MathUtils.damp(posXRef.current, 0, 18, dt);
          rotZRef.current = THREE.MathUtils.damp(rotZRef.current, 0, 18, dt);
        } else {
          // Tilt & glide into final open/closed position
          const pGlide = easeOutQuart(clamp01((pFull - liftShare) / (1 - liftShare)));
          posYRef.current = Math.max(
            PLATE_RIM_Y,
            LIFT_PARTIAL_Y + (targetY - LIFT_PARTIAL_Y) * pGlide,
          );
          rotZRef.current = 0 + (targetZ - 0) * pGlide;
          posXRef.current = 0 + (targetX - 0) * pGlide;
        }

      } else {
        // Sequence complete — snap to exact target, release to idle lerp
        swapActiveRef.current = false;
      }

      // Hard rim floor — enforced every tick without exception
      posYRef.current = Math.max(PLATE_RIM_Y, posYRef.current);
      g.position.set(posXRef.current, posYRef.current, 0);
      g.rotation.z = rotZRef.current;
      return;
    }

    // ── Idle open/close — heavy brass damping λ=2.6 ───────────────────────
    const targetY = openRef.current ? OPEN_Y   : REST_Y;
    const targetZ = openRef.current ? OPEN_ROT : 0;
    const targetX = openRef.current ? OPEN_X   : 0;

    // THREE.MathUtils.damp is frame-rate independent: value = damp(from, to, λ, dt)
    const LAMBDA = 2.6;
    posYRef.current = THREE.MathUtils.damp(posYRef.current, targetY, LAMBDA, dt);
    rotZRef.current = THREE.MathUtils.damp(rotZRef.current, targetZ, LAMBDA, dt);
    posXRef.current = THREE.MathUtils.damp(posXRef.current, targetX, LAMBDA, dt);

    // Hard rim floor
    posYRef.current = Math.max(PLATE_RIM_Y, posYRef.current);

    g.position.set(posXRef.current, posYRef.current, 0);
    g.rotation.z = rotZRef.current;
  });

  useEffect(() => () => {
    domeGeo.dispose(); rimGeo.dispose(); finialGeo.dispose();
  }, [domeGeo, rimGeo, finialGeo]);

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    useBaraStore.getState().toggleCloche();
  };

  return (
    <group ref={groupRef} position={[0, REST_Y, 0]} onClick={handleClick}>
      {/* Bell dome */}
      <mesh geometry={domeGeo} castShadow>
        <meshStandardMaterial
          color="#C88A36"
          metalness={0.88}
          roughness={0.22}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Rolled base rim */}
      <mesh geometry={rimGeo} rotation-x={Math.PI / 2} castShadow>
        <meshStandardMaterial color="#C88A36" metalness={0.90} roughness={0.16} />
      </mesh>
      {/* Turned finial knob */}
      <mesh geometry={finialGeo} position={[0, 0.558, 0]} castShadow>
        <meshStandardMaterial color="#C88A36" metalness={0.88} roughness={0.14} />
      </mesh>
    </group>
  );
}
