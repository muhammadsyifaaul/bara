"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBaraStore } from "@/store/bara";
import { dishSwapSignal } from "./dishSwapSignal";

// ── Easing helpers ────────────────────────────────────────────────────────────
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }

// ── Position / rotation constants ────────────────────────────────────────────
const PLATE_RIM_Y    = 0.165;
const REST_Y         = PLATE_RIM_Y;
const OPEN_Y         = REST_Y + 0.88;
const OPEN_ROT       = -0.34;
const OPEN_X         = 0.28;
const LIFT_PARTIAL_Y = PLATE_RIM_Y + 0.38;

// ── Course-swap phase timestamps (seconds) ────────────────────────────────────
// Full sequence (cloche open at swap start):
//   Phase A  0.00 – 0.35  Re-centre & level (stays elevated)
//   Phase B  0.35 – 0.70  Measured descent to PLATE_RIM_Y
//   Phase C  0.70 – 1.05  Closed hold (dish signal fires at 0.85 s)
//   Phase D  1.05 – 1.75  Vertical lift then tilt & glide to open pos
//
// Short sequence (cloche already closed at swap start):
//   Phase C  0.00 – 0.35  Hold closed (dish signal fires at 0.18 s)
//   Phase D  0.35 – 1.05  Vertical lift then reveal
const PA_END      = 0.35;
const PB_END      = 0.70;
const PC_END      = 1.05;
const PD_END      = 1.75;
const DISH_SWAP_T = 0.85;  // within full sequence

// Short sequence (already-closed path)
const SHORT_PC_END      = 0.35;
const SHORT_DISH_SWAP_T = 0.18;
const SHORT_PD_END      = 1.05;

// ── Dome LatheGeometry ────────────────────────────────────────────────────────
function useClocheGeometries() {
  return useMemo(() => {
    const domePoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 40; i++) {
      const angle = (i / 40) * Math.PI * 0.5;
      domePoints.push(new THREE.Vector2(0.42 * Math.cos(angle), 0.56 * Math.sin(angle)));
    }
    domePoints.push(new THREE.Vector2(0, 0.56));
    const domeGeo = new THREE.LatheGeometry(domePoints, 72);
    const rimGeo  = new THREE.TorusGeometry(0.42, 0.013, 16, 72);
    const finialPts = [
      new THREE.Vector2(0.000, 0.000), new THREE.Vector2(0.030, 0.000),
      new THREE.Vector2(0.034, 0.014), new THREE.Vector2(0.028, 0.030),
      new THREE.Vector2(0.020, 0.044), new THREE.Vector2(0.028, 0.058),
      new THREE.Vector2(0.032, 0.074), new THREE.Vector2(0.016, 0.092),
      new THREE.Vector2(0.000, 0.094),
    ];
    const finialGeo = new THREE.LatheGeometry(finialPts, 32);
    return { domeGeo, rimGeo, finialGeo };
  }, []);
}

export default function BrassCloche() {
  const groupRef = useRef<THREE.Group>(null);
  const { domeGeo, rimGeo, finialGeo } = useClocheGeometries();

  // ── Zustand → refs ───────────────────────────────────────────────────────
  const openRef          = useRef(false);
  const prevCourseRef    = useRef(-1);  // -1 = uninitialised
  const swapActiveRef    = useRef(false);
  const swapTimerRef     = useRef(0);
  const pendingCourseRef = useRef(-1);
  const dishSwappedRef   = useRef(false);
  // Track whether the cloche was open when the swap started
  const wasOpenAtSwapRef = useRef(false);

  // Live animated values
  const posXRef = useRef(0);
  const posYRef = useRef(REST_Y);
  const rotZRef = useRef(0);

  // Snapshot of position at swap-start
  const snapXRef = useRef(0);
  const snapYRef = useRef(REST_Y);
  const snapZRef = useRef(0);

  useEffect(() => {
    const init = useBaraStore.getState();
    openRef.current       = init.clocheOpen;
    prevCourseRef.current = init.activeCourse;

    return useBaraStore.subscribe((s) => {
      openRef.current = s.clocheOpen;

      // Trigger swap when activeCourse changes in the store
      if (s.activeCourse !== prevCourseRef.current && !swapActiveRef.current) {
        pendingCourseRef.current = s.activeCourse;
        dishSwappedRef.current   = false;
        wasOpenAtSwapRef.current = openRef.current;
        swapTimerRef.current     = 0;
        swapActiveRef.current    = true;
        // Snapshot actual position
        snapXRef.current = posXRef.current;
        snapYRef.current = posYRef.current;
        snapZRef.current = rotZRef.current;

        // If the cloche was already closed, we still need to show the new dish —
        // signal an open after the reveal so it lifts. We set openCloche() at the
        // end of the short sequence's Phase D (see useFrame below).
      }
      prevCourseRef.current = s.activeCourse;
    });
  }, []);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);

    if (swapActiveRef.current) {
      swapTimerRef.current += dt;
      const t = swapTimerRef.current;

      if (wasOpenAtSwapRef.current) {
        // ── FULL SEQUENCE (cloche was open) ───────────────────────────────
        if (t < PA_END) {
          // Phase A: re-centre & level while elevated
          const p = easeInOutCubic(clamp01(t / PA_END));
          posXRef.current = snapXRef.current * (1 - p);
          rotZRef.current = snapZRef.current * (1 - p);
          posYRef.current = Math.max(PLATE_RIM_Y, snapYRef.current);

        } else if (t < PB_END) {
          // Phase B: measured descent
          const p = easeInOutCubic(clamp01((t - PA_END) / (PB_END - PA_END)));
          posYRef.current = Math.max(PLATE_RIM_Y, snapYRef.current + (PLATE_RIM_Y - snapYRef.current) * p);
          posXRef.current = THREE.MathUtils.damp(posXRef.current, 0, 18, dt);
          rotZRef.current = THREE.MathUtils.damp(rotZRef.current, 0, 18, dt);

        } else if (t < PC_END) {
          // Phase C: closed hold
          posYRef.current = PLATE_RIM_Y;
          posXRef.current = THREE.MathUtils.damp(posXRef.current, 0, 18, dt);
          rotZRef.current = THREE.MathUtils.damp(rotZRef.current, 0, 18, dt);

          if (!dishSwappedRef.current && t >= DISH_SWAP_T && pendingCourseRef.current >= 0) {
            dishSwapSignal.pendingCourse = pendingCourseRef.current;
            dishSwapSignal.readyToSwap  = true;
            pendingCourseRef.current    = -1;
            dishSwappedRef.current      = true;
          }

        } else if (t < PD_END) {
          // Phase D: vertical lift then tilt & glide to open position
          const pFull    = clamp01((t - PC_END) / (PD_END - PC_END));
          const liftEnd  = 0.50;

          if (pFull <= liftEnd) {
            const pL = easeOutQuart(clamp01(pFull / liftEnd));
            posYRef.current = Math.max(PLATE_RIM_Y, PLATE_RIM_Y + (LIFT_PARTIAL_Y - PLATE_RIM_Y) * pL);
            posXRef.current = THREE.MathUtils.damp(posXRef.current, 0, 18, dt);
            rotZRef.current = THREE.MathUtils.damp(rotZRef.current, 0, 18, dt);
          } else {
            const pG = easeOutQuart(clamp01((pFull - liftEnd) / (1 - liftEnd)));
            posYRef.current = Math.max(PLATE_RIM_Y, LIFT_PARTIAL_Y + (OPEN_Y - LIFT_PARTIAL_Y) * pG);
            rotZRef.current = OPEN_ROT * pG;
            posXRef.current = OPEN_X   * pG;
          }
        } else {
          // Full sequence done — ensure open state
          if (!openRef.current) useBaraStore.getState().openCloche();
          swapActiveRef.current = false;
        }

      } else {
        // ── SHORT SEQUENCE (cloche was already closed) ────────────────────
        if (t < SHORT_PC_END) {
          // Brief closed hold — dish signals fires at SHORT_DISH_SWAP_T
          posYRef.current = PLATE_RIM_Y;
          posXRef.current = THREE.MathUtils.damp(posXRef.current, 0, 18, dt);
          rotZRef.current = THREE.MathUtils.damp(rotZRef.current, 0, 18, dt);

          if (!dishSwappedRef.current && t >= SHORT_DISH_SWAP_T && pendingCourseRef.current >= 0) {
            dishSwapSignal.pendingCourse = pendingCourseRef.current;
            dishSwapSignal.readyToSwap  = true;
            pendingCourseRef.current    = -1;
            dishSwappedRef.current      = true;
          }

        } else if (t < SHORT_PD_END) {
          // Lift and reveal (open the cloche)
          const pFull   = clamp01((t - SHORT_PC_END) / (SHORT_PD_END - SHORT_PC_END));
          const liftEnd = 0.45;

          if (pFull <= liftEnd) {
            const pL = easeOutQuart(clamp01(pFull / liftEnd));
            posYRef.current = Math.max(PLATE_RIM_Y, PLATE_RIM_Y + (LIFT_PARTIAL_Y - PLATE_RIM_Y) * pL);
            posXRef.current = THREE.MathUtils.damp(posXRef.current, 0, 18, dt);
            rotZRef.current = THREE.MathUtils.damp(rotZRef.current, 0, 18, dt);
          } else {
            const pG = easeOutQuart(clamp01((pFull - liftEnd) / (1 - liftEnd)));
            posYRef.current = Math.max(PLATE_RIM_Y, LIFT_PARTIAL_Y + (OPEN_Y - LIFT_PARTIAL_Y) * pG);
            rotZRef.current = OPEN_ROT * pG;
            posXRef.current = OPEN_X   * pG;
          }
        } else {
          // Short sequence done — ensure open state is reflected in store
          if (!openRef.current) useBaraStore.getState().openCloche();
          swapActiveRef.current = false;
        }
      }

      posYRef.current = Math.max(PLATE_RIM_Y, posYRef.current);
      g.position.set(posXRef.current, posYRef.current, 0);
      g.rotation.z = rotZRef.current;
      return;
    }

    // ── Idle open/close — heavy brass damping λ=2.6 ───────────────────────
    const targetY = openRef.current ? OPEN_Y   : REST_Y;
    const targetZ = openRef.current ? OPEN_ROT : 0;
    const targetX = openRef.current ? OPEN_X   : 0;
    const LAMBDA  = 2.6;

    posYRef.current = THREE.MathUtils.damp(posYRef.current, targetY, LAMBDA, dt);
    rotZRef.current = THREE.MathUtils.damp(rotZRef.current, targetZ, LAMBDA, dt);
    posXRef.current = THREE.MathUtils.damp(posXRef.current, targetX, LAMBDA, dt);
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
      <mesh geometry={domeGeo} castShadow>
        <meshStandardMaterial color="#C88A36" metalness={0.88} roughness={0.22}
          envMapIntensity={1.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={rimGeo} rotation-x={Math.PI / 2} castShadow>
        <meshStandardMaterial color="#C88A36" metalness={0.90} roughness={0.16} />
      </mesh>
      <mesh geometry={finialGeo} position={[0, 0.558, 0]} castShadow>
        <meshStandardMaterial color="#C88A36" metalness={0.88} roughness={0.14} />
      </mesh>
    </group>
  );
}
