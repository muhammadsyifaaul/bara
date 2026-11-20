"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

import DiningTable from "./DiningTable";
import BrassCloche from "./BrassCloche";
import SignatureDishes from "./SignatureDishes";
import HearthAndSmoke from "./HearthAndSmoke";
import { useBaraStore } from "@/store/bara";
import { useScrollCamera } from "@/hooks/useScrollCamera";

/** Cursor wind vector shared with smoke shader */
export const windRef = { x: 0, y: 0 };

/**
 * Camera proxy — GSAP ScrollTrigger writes position/target floats here every
 * frame; CameraDriver reads them inside useFrame (zero React state mutations).
 */
export const cameraProxyRef = {
  posX: 0, posY: 1.05, posZ: 4.2,
  targetX: 0, targetY: 0.25, targetZ: 0,
};

// ── Breakpoint helper ─────────────────────────────────────────────────────────
function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

// ── Lighting ──────────────────────────────────────────────────────────────────
function SceneLighting() {
  const { ambiance } = useBaraStore();
  const isDinner = ambiance === "dinner";

  return (
    <>
      <hemisphereLight
        args={[
          isDinner ? "#3A1800" : "#FFF0D0",
          isDinner ? "#1A0800" : "#7D4E2D",
          isDinner ? 0.4 : 0.9,
        ]}
      />
      <directionalLight
        position={[2, 5, 3]}
        color={isDinner ? "#FFB347" : "#FFF5DC"}
        intensity={isDinner ? 1.6 : 1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight
        position={[2, 1, 4]}
        color={isDinner ? "#7A3800" : "#F4D090"}
        intensity={isDinner ? 0.5 : 0.75}
      />
      <directionalLight
        position={[-3, 2, -1]}
        color={isDinner ? "#2A1800" : "#E8D5A0"}
        intensity={isDinner ? 0.25 : 0.35}
      />
      <pointLight position={[0, -0.5, -1.6]} color="#D94E28"
        intensity={isDinner ? 3.0 : 1.4} distance={7} decay={2} />
      <spotLight position={[0, 4, 1.5]} color="#FFF8E7"
        intensity={isDinner ? 0.8 : 0.6} angle={0.32} penumbra={0.6} />
      <pointLight position={[0, 0.2, 1.2]} color="#D4A060"
        intensity={isDinner ? 0.3 : 0.6} distance={3} decay={2} />
    </>
  );
}

// ── Camera driver — reads cameraProxyRef every frame via useFrame ─────────────
const _lookAt = new THREE.Vector3();
const _pos    = new THREE.Vector3();

function CameraDriver() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(cameraProxyRef.posX, cameraProxyRef.posY, cameraProxyRef.posZ);
    camera.lookAt(cameraProxyRef.targetX, cameraProxyRef.targetY, cameraProxyRef.targetZ);
  }, [camera]);

  useFrame((_, delta) => {
    const dt  = Math.min(delta, 0.05);
    const spd = 1 - Math.exp(-5 * dt);

    _pos.set(cameraProxyRef.posX, cameraProxyRef.posY, cameraProxyRef.posZ);
    _lookAt.set(cameraProxyRef.targetX, cameraProxyRef.targetY, cameraProxyRef.targetZ);

    camera.position.lerp(_pos, spd);

    const dummy = camera.clone();
    dummy.position.copy(camera.position);
    dummy.lookAt(_lookAt);
    camera.quaternion.slerp(dummy.quaternion, spd);
  });

  return null;
}

// ── Responsive scene group ────────────────────────────────────────────────────
// Desktop: offset right (x=1.1) so scene clears left-column UI.
// Mobile (<768px): center the scene (x=0, pull back Z, raise Y slightly)
// and scale down slightly so it fits without clipping.
function SceneGroup({ mobile }: { mobile: boolean }) {
  // Mobile: center at x=0, pull camera back (handled via FOV on Canvas),
  // scale the group down a touch so counter fits narrow screens.
  const posX   = mobile ? 0.0  : 1.1;
  const posY   = mobile ? -0.3 : -0.5;
  const scaleV = mobile ? 0.72 : 1.0;

  return (
    <group position={[posX, posY, 0]} scale={scaleV}>
      <DiningTable />
      <SignatureDishes />
      <BrassCloche />
      <HearthAndSmoke />
      <ContactShadows
        position={[0, -0.001, 0]}
        opacity={0.5}
        scale={4.5}
        blur={2.0}
        far={1.8}
        color="#080503"
      />
    </group>
  );
}

// ── FOV sync — widen FOV on mobile so counter fits ───────────────────────────
function FovSync({ mobile }: { mobile: boolean }) {
  const { camera } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = mobile ? 56 : 42;
    cam.updateProjectionMatrix();
  }, [camera, mobile]);
  return null;
}

// ── Inner canvas component ────────────────────────────────────────────────────
function CanvasInner({ mobile }: { mobile: boolean }) {
  useScrollCamera();
  return (
    <>
      <SceneLighting />
      <Environment preset="sunset" environmentIntensity={0.3} />
      <SceneGroup mobile={mobile} />
      <CameraDriver />
      <FovSync mobile={mobile} />
    </>
  );
}

// ── Root canvas ───────────────────────────────────────────────────────────────
export default function SceneCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);

  // Detect mobile on mount + resize — SSR-safe (useState defaults false)
  useEffect(() => {
    const update = () => setMobile(isMobile());
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  // Cursor wind for smoke shader
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      windRef.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      windRef.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none"
      aria-hidden="true"
    >
      <div className="w-full h-full pointer-events-auto">
        <Canvas
          dpr={[1, 2]}
          shadows
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          camera={{ position: [0, 1.05, 4.2], fov: 42, near: 0.1, far: 50 }}
          style={{ background: "transparent" }}
        >
          <CanvasInner mobile={mobile} />
        </Canvas>
      </div>
    </div>
  );
}
