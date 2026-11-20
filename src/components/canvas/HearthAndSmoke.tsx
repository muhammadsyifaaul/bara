"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBaraStore } from "@/store/bara";
import { windRef } from "./SceneCanvas";

// ─────────────────────────────────────────────────────────────────────────────
// GLSL — Blackbody ember shader (pulsing crimson → molten orange)
// ───────────────────────────────────────────────────────────���─────────────────
const EMBER_VERT = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv     = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EMBER_FRAG = /* glsl */`
  precision mediump float;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }

  void main() {
    float n  = noise(vUv * 5.5 + uTime * 0.28);
    float n2 = noise(vUv * 11.0 - uTime * 0.16);
    // Brighter crack: add a sharp glowing crack pattern
    float crack = pow(clamp(noise(vUv * 18.0 + uTime * 0.05), 0.0, 1.0), 3.5);
    float pulse  = 0.5 + 0.5 * sin(uTime * 1.6 + n * 4.5);
    float glow   = n * 0.55 + n2 * 0.35 + crack * 0.3;
    float heat   = mix(glow, pulse, 0.50) * uIntensity;
    heat = clamp(heat, 0.0, 1.0);

    vec3 dark    = vec3(0.08, 0.02, 0.01);   // almost black stone
    vec3 crimson = vec3(0.478, 0.110, 0.047);
    vec3 orange  = vec3(1.000, 0.482, 0.161);
    vec3 bright  = vec3(1.0,   0.78,  0.30);  // white-hot crack

    vec3 color = mix(dark, crimson, smoothstep(0.0, 0.35, heat));
    color      = mix(color, orange, smoothstep(0.35, 0.72, heat));
    color      = mix(color, bright, smoothstep(0.72, 1.0,  heat));

    // Fresnel rim
    float rim = 1.0 - max(dot(vNormal, vec3(0,0,1)), 0.0);
    color *= mix(0.6, 1.1, rim * rim);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// GLSL — fBm aromatic smoke (strict UV-edge zero-alpha)
// ─────────────────────────────────────────────────────────────────────────────
const SMOKE_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SMOKE_FRAG = /* glsl */`
  precision mediump float;
  uniform float uTime;
  uniform vec2  uWind;
  uniform float uOpacity;
  varying vec2  vUv;

  #define PI 3.14159265

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p) {
    float v=0.0; float a=0.5;
    for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.1+vec2(1.7,9.2); a*=0.5; }
    return v;
  }

  void main() {
    // Strict zero-alpha on all four UV edges
    float ex = pow(sin(clamp(vUv.x, 0.0, 1.0) * PI), 2.8);
    float ey = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
    float edgeMask = ex * ey;

    vec2 scroll = vec2(uWind.x * 0.14, -uTime * 0.26);
    vec2 warpUv = vUv + scroll + vec2(fbm(vUv*2.5 + uTime*0.1)*0.20*uWind.x, 0.0);
    float smoke  = fbm(warpUv * 3.2 + vec2(0.0, -uTime * 0.24));

    float shape = smoothstep(0.0, 0.28, vUv.y) * (1.0 - vUv.y * 0.55);
    float alpha = smoke * shape * edgeMask * uOpacity * 0.70;
    alpha = clamp(alpha, 0.0, 1.0);

    vec3 col = mix(vec3(0.88,0.82,0.74), vec3(0.98,0.95,0.90), smoke);
    gl_FragColor = vec4(col, alpha);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Faceted volcanic stone hearth backdrop
// ─────────────────────────────────────────────────────────────────────────────
function EmberBed() {
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const timeRef = useRef(0);

  // Icosahedron gives faceted volcanic look better than sphere
  const stoneData = useMemo<Array<{
    geo: THREE.BufferGeometry;
    pos: [number, number, number];
    scale: [number, number, number];
    intensity: number;
  }>>(() => [
    { geo: new THREE.IcosahedronGeometry(0.095, 1), pos: [-0.58, -0.04, -0.92], scale: [1.10, 0.72, 0.88], intensity: 1.0 },
    { geo: new THREE.IcosahedronGeometry(0.085, 1), pos: [-0.30, -0.05, -0.96], scale: [0.95, 0.68, 0.80], intensity: 0.85 },
    { geo: new THREE.IcosahedronGeometry(0.100, 1), pos: [ 0.00, -0.04, -0.93], scale: [1.05, 0.70, 0.90], intensity: 1.05 },
    { geo: new THREE.IcosahedronGeometry(0.090, 1), pos: [ 0.30, -0.05, -0.96], scale: [0.98, 0.66, 0.82], intensity: 0.90 },
    { geo: new THREE.IcosahedronGeometry(0.095, 1), pos: [ 0.58, -0.04, -0.92], scale: [1.08, 0.72, 0.86], intensity: 1.0  },
    { geo: new THREE.IcosahedronGeometry(0.075, 1), pos: [-0.44, -0.06, -0.98], scale: [0.90, 0.60, 0.78], intensity: 0.80 },
    { geo: new THREE.IcosahedronGeometry(0.080, 1), pos: [ 0.15, -0.06, -0.99], scale: [0.88, 0.62, 0.76], intensity: 0.82 },
    { geo: new THREE.IcosahedronGeometry(0.070, 1), pos: [-0.14, -0.07, -1.00], scale: [0.84, 0.58, 0.72], intensity: 0.75 },
    { geo: new THREE.IcosahedronGeometry(0.078, 1), pos: [ 0.44, -0.06, -0.98], scale: [0.92, 0.62, 0.80], intensity: 0.88 },
    { geo: new THREE.IcosahedronGeometry(0.088, 1), pos: [-0.72, -0.05, -0.90], scale: [1.02, 0.68, 0.84], intensity: 0.95 },
    { geo: new THREE.IcosahedronGeometry(0.088, 1), pos: [ 0.72, -0.05, -0.90], scale: [1.02, 0.68, 0.84], intensity: 0.95 },
    // Smaller fill stones
    { geo: new THREE.IcosahedronGeometry(0.055, 1), pos: [-0.20, -0.07, -1.01], scale: [0.80, 0.55, 0.70], intensity: 0.70 },
    { geo: new THREE.IcosahedronGeometry(0.060, 1), pos: [ 0.60, -0.07, -1.00], scale: [0.82, 0.56, 0.72], intensity: 0.72 },
  ], []);

  const uniforms = useMemo(() =>
    stoneData.map((s) => ({
      uTime:      { value: 0 },
      uIntensity: { value: s.intensity },
    }))
  , [stoneData]);

  useEffect(() => () => {
    stoneData.forEach((s) => s.geo.dispose());
    matRefs.current.forEach((m) => m?.dispose());
  }, [stoneData]);

  useFrame((_, delta) => {
    timeRef.current += Math.min(delta, 0.05);
    uniforms.forEach((u) => { u.uTime.value = timeRef.current; });
  });

  return (
    <>
      {stoneData.map((s, i) => (
        <mesh key={i} geometry={s.geo} position={s.pos} scale={s.scale} castShadow>
          <shaderMaterial
            ref={(el) => { matRefs.current[i] = el; }}
            vertexShader={EMBER_VERT}
            fragmentShader={EMBER_FRAG}
            uniforms={uniforms[i]}
          />
        </mesh>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ~60 drifting golden spark motes
// ─────────────────────────────────────────────────────────────────────────────
function HeartsparksParticles() {
  const COUNT   = 62;
  const ptsRef  = useRef<THREE.Points>(null);

  const { positions, velocities, lifetimes } = useMemo(() => {
    const positions  = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const lifetimes  = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i*3+0]  = (Math.random() - 0.5) * 1.5;
      positions[i*3+1]  = -0.3 + Math.random() * 0.3;
      positions[i*3+2]  = -0.95 + Math.random() * 0.08;
      velocities[i*3+0] = (Math.random() - 0.5) * 0.007;
      velocities[i*3+1] = 0.014 + Math.random() * 0.020;
      velocities[i*3+2] = (Math.random() - 0.5) * 0.004;
      lifetimes[i]      = Math.random();
    }
    return { positions, velocities, lifetimes };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return g;
  }, [positions]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: "#C88A36", size: 0.016, sizeAttenuation: true,
    transparent: true, opacity: 0.9, depthWrite: false,
  }), []);

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  const posAttr  = useMemo(() => geo.getAttribute("position") as THREE.BufferAttribute, [geo]);
  const livePos  = useRef(positions.slice());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < COUNT; i++) {
      livePos.current[i*3+0] += velocities[i*3+0];
      livePos.current[i*3+1] += velocities[i*3+1] * dt * 60;
      livePos.current[i*3+2] += velocities[i*3+2];
      lifetimes[i] += dt * 0.38;
      if (livePos.current[i*3+1] > 1.5 || lifetimes[i] > 1) {
        livePos.current[i*3+0] = (Math.random() - 0.5) * 1.5;
        livePos.current[i*3+1] = -0.3 + Math.random() * 0.2;
        livePos.current[i*3+2] = -0.95 + Math.random() * 0.08;
        lifetimes[i] = 0;
      }
    }
    posAttr.set(livePos.current);
    posAttr.needsUpdate = true;
  });

  return <points ref={ptsRef} geometry={geo} material={mat} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Aromatic smoke ribbons
// ─────────────────────────────────────────────────────────────────────────────
function AromaticSmoke() {
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);

  const makeU = () => ({
    uTime:    { value: 0 },
    uWind:    { value: new THREE.Vector2(0, 0) },
    uOpacity: { value: 0.0 },
  });
  const uniforms = useMemo(() => [makeU(), makeU(), makeU()], []);

  const planeGeo = useMemo(() => new THREE.PlaneGeometry(0.52, 0.95, 1, 1), []);

  // Lunch-mode smoke opacity boost (+15%)
  const ambianceRef = useRef<"lunch" | "dinner">("lunch");
  const opacityTargetRef = useRef(0);

  useEffect(() => {
    ambianceRef.current    = useBaraStore.getState().ambiance;
    opacityTargetRef.current = useBaraStore.getState().clocheOpen
      ? (ambianceRef.current === "lunch" ? 1.15 : 1.0)
      : 0;

    return useBaraStore.subscribe((s) => {
      ambianceRef.current = s.ambiance;
      opacityTargetRef.current = s.clocheOpen
        ? (s.ambiance === "lunch" ? 1.15 : 1.0)
        : 0;
    });
  }, []);

  useEffect(() => () => {
    planeGeo.dispose();
    matRefs.current.forEach((m) => m?.dispose());
  }, [planeGeo]);

  const timeRef = useRef(0);
  useFrame((_, delta) => {
    const dt   = Math.min(delta, 0.05);
    timeRef.current += dt;
    const wind = new THREE.Vector2(windRef.x, windRef.y);
    const target = opacityTargetRef.current;
    const spd    = 2.5;

    uniforms.forEach((u, i) => {
      const mat = matRefs.current[i];
      if (!mat) return;
      mat.uniforms.uTime.value = timeRef.current + i * 1.4;
      mat.uniforms.uWind.value.lerp(wind, 1 - Math.exp(-2 * dt));
      const cur = mat.uniforms.uOpacity.value;
      mat.uniforms.uOpacity.value = cur + (target - cur) * (1 - Math.exp(-spd * dt));
    });
  });

  const sharedProps = {
    vertexShader:   SMOKE_VERT,
    fragmentShader: SMOKE_FRAG,
    transparent:    true,
    depthWrite:     false,
    blending:       THREE.NormalBlending,
    side:           THREE.DoubleSide,
  };

  return (
    <group position={[0, 0.18, 0]}>
      <mesh geometry={planeGeo} position={[ 0.00, 0.47, 0.03]}>
        <shaderMaterial ref={(el) => { matRefs.current[0] = el; }}
          {...sharedProps} uniforms={uniforms[0]} />
      </mesh>
      <mesh geometry={planeGeo} position={[ 0.09, 0.52, -0.02]} rotation-y={0.4}>
        <shaderMaterial ref={(el) => { matRefs.current[1] = el; }}
          {...sharedProps} uniforms={uniforms[1]} />
      </mesh>
      <mesh geometry={planeGeo} position={[-0.09, 0.50,  0.00]} rotation-y={-0.3}>
        <shaderMaterial ref={(el) => { matRefs.current[2] = el; }}
          {...sharedProps} uniforms={uniforms[2]} />
      </mesh>
    </group>
  );
}

export default function HearthAndSmoke() {
  return (
    <group>
      <EmberBed />
      <HeartsparksParticles />
      <AromaticSmoke />
    </group>
  );
}
