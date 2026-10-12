"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGlow } from "./glow";

/** Geometry for one box-shaped building, relative to its place's centre. */
export type BuildingSpec = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** 0 = base tone, 1 = accent tone */
  tint: number;
  roof?: "flat" | "pitched" | "dome" | "antenna" | "crane";
};

/* ─────────────────────────── helpers ─────────────────────────── */

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Black canvas with a grid of lit/unlit windows, used as an emissiveMap. */
let sharedWindowTexture: THREE.CanvasTexture | null = null;
function windowTexture() {
  if (sharedWindowTexture) return sharedWindowTexture;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000000";
  g.fillRect(0, 0, 64, 64);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const lit = (row * 7 + col * 13) % 5 !== 0;
      g.fillStyle = lit ? "#ffffff" : "#0e0e0e";
      g.fillRect(col * 16 + 4, row * 16 + 5, 8, 7);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  sharedWindowTexture = tex;
  return tex;
}

/* ─────────────────────────── building ─────────────────────────── */

type BuildingProps = {
  spec: BuildingSpec;
  accent: string;
  base: string;
};

export function Building({ spec, accent, base }: BuildingProps) {
  // Accent blocks are pulled back toward the warm base so a district reads as
  // tinted rather than painted.
  const color = useMemo(
    () =>
      spec.tint > 0.5
        ? new THREE.Color(accent).lerp(new THREE.Color("#F0ECE4"), 0.12)
        : new THREE.Color(base),
    [spec.tint, accent, base]
  );
  const glow = useGlow();
  const body = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!body.current) return;
    const m = body.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.06 + glow.current * 1.5;
  });

  const emissiveMap = useMemo(() => {
    const tex = windowTexture().clone();
    tex.needsUpdate = true;
    tex.repeat.set(Math.max(1, Math.round(spec.w * 0.9)), Math.max(1, Math.round(spec.h * 0.55)));
    return tex;
  }, [spec.w, spec.h]);

  return (
    <group position={[spec.x, 0, spec.z]}>
      <mesh ref={body} castShadow receiveShadow position={[0, spec.h / 2, 0]}>
        <boxGeometry args={[spec.w, spec.h, spec.d]} />
        <meshStandardMaterial
          color={color}
          roughness={0.72}
          metalness={0.04}
          emissive="#FFC66B"
          emissiveMap={emissiveMap}
          emissiveIntensity={0.06}
        />
      </mesh>
      <Roof spec={spec} accent={accent} />
    </group>
  );
}

function Roof({ spec, accent }: { spec: BuildingSpec; accent: string }) {
  const beacon = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!beacon.current) return;
    const m = beacon.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 1.4 + Math.sin(clock.elapsedTime * 2.4) * 1.1;
  });

  switch (spec.roof) {
    case "pitched":
      return (
        <mesh castShadow position={[0, spec.h + Math.min(spec.w, spec.d) * 0.28, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[Math.max(spec.w, spec.d) * 0.76, Math.min(spec.w, spec.d) * 0.56, 4]} />
          <meshStandardMaterial color="#BE6144" roughness={0.9} />
        </mesh>
      );
    case "dome":
      return (
        <mesh castShadow position={[0, spec.h, 0]}>
          <sphereGeometry args={[spec.w * 0.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={accent} roughness={0.45} metalness={0.2} />
        </mesh>
      );
    case "antenna":
      return (
        <group position={[0, spec.h, 0]}>
          <mesh castShadow position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.045, 0.09, 2.8, 6]} />
            <meshStandardMaterial color="#3B3B3B" roughness={0.6} />
          </mesh>
          <mesh ref={beacon} position={[0, 2.95, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial color="#FF5A5A" emissive="#FF3B3B" emissiveIntensity={1.6} />
          </mesh>
        </group>
      );
    case "crane":
      return (
        <group position={[0, spec.h, 0]}>
          <mesh castShadow position={[0, 1.8, 0]}>
            <boxGeometry args={[0.16, 3.6, 0.16]} />
            <meshStandardMaterial color="#E8A33D" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0.9, 3.5, 0]}>
            <boxGeometry args={[3.0, 0.14, 0.14]} />
            <meshStandardMaterial color="#E8A33D" roughness={0.6} />
          </mesh>
          <mesh position={[1.9, 2.9, 0]}>
            <boxGeometry args={[0.05, 1.1, 0.05]} />
            <meshStandardMaterial color="#6B6860" />
          </mesh>
        </group>
      );
    case "flat":
      return (
        <mesh castShadow position={[0, spec.h + 0.09, 0]}>
          <boxGeometry args={[spec.w * 1.06, 0.18, spec.d * 1.06]} />
          <meshStandardMaterial color="#D6D2CA" roughness={0.8} />
        </mesh>
      );
    default:
      return null;
  }
}

/* ─────────────────────────── island & ground ─────────────────────────── */

export const ISLAND_RADIUS = 22;

export function Island({ onGroundClick }: { onGroundClick?: () => void }) {
  return (
    <group>
      <mesh
        receiveShadow
        position={[0, -0.75, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onGroundClick?.();
        }}
      >
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS, 1.5, 72]} />
        <meshStandardMaterial color="#E6E1D8" roughness={0.95} />
      </mesh>
      <mesh position={[0, -5.0, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS, 5.5, 7.0, 72, 1, true]} />
        <meshStandardMaterial color="#B9AE9C" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -8.6, 0]}>
        <coneGeometry args={[5.5, 3.0, 40]} />
        <meshStandardMaterial color="#A99E8C" roughness={1} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────── roads ─────────────────────────── */

const ROAD_Y = 0.02;

export function Roads() {
  const ring = 15.5;
  return (
    <group>
      {/* cross avenues */}
      <RoadStrip x={0} z={0} w={3.2} l={2 * ISLAND_RADIUS - 6} rot={0} />
      <RoadStrip x={0} z={0} w={3.2} l={2 * ISLAND_RADIUS - 6} rot={Math.PI / 2} />
      {/* ring road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y, 0]} receiveShadow>
        <ringGeometry args={[ring - 1.5, ring + 1.5, 96]} />
        <meshStandardMaterial color="#CFC9BE" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y + 0.006, 0]}>
        <ringGeometry args={[ring - 0.05, ring + 0.05, 96]} />
        <meshStandardMaterial color="#F3EFE7" roughness={1} />
      </mesh>
      {/* plaza roundabout */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y + 0.01, 0]} receiveShadow>
        <circleGeometry args={[5.2, 48]} />
        <meshStandardMaterial color="#D8D2C7" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y + 0.02, 0]}>
        <ringGeometry args={[2.0, 2.2, 48]} />
        <meshStandardMaterial color="#F3EFE7" roughness={1} />
      </mesh>
    </group>
  );
}

function RoadStrip({ x, z, w, l, rot }: { x: number; z: number; w: number; l: number; rot: number }) {
  const dashes = useMemo(() => {
    const out: number[] = [];
    for (let i = -l / 2 + 1; i < l / 2 - 1; i += 2.2) out.push(i);
    return out;
  }, [l]);
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y, 0]} receiveShadow>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial color="#CFC9BE" roughness={1} />
      </mesh>
      {dashes.map((d) => (
        <mesh key={d} rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y + 0.008, d]}>
          <planeGeometry args={[0.12, 1.1]} />
          <meshStandardMaterial color="#F5F3EF" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────── traffic ─────────────────────────── */

const CAR_COLORS = ["#1B6AE7", "#E11D74", "#16A34A", "#D97706", "#7C3AED", "#2B2B2B"];

export function Traffic({ count = 10, paused }: { count?: number; paused: boolean }) {
  const curves = useMemo(() => {
    const ring = 15.5;
    const ringCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * ring, 0.12, Math.sin(a) * ring);
      }),
      true,
      "catmullrom",
      0.5
    );
    const innerCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.8, 0.12, -17),
        new THREE.Vector3(-0.8, 0.12, -4),
        new THREE.Vector3(-4, 0.12, -0.8),
        new THREE.Vector3(-17, 0.12, -0.8),
        new THREE.Vector3(-17, 0.12, 0.8),
        new THREE.Vector3(-4, 0.12, 0.8),
        new THREE.Vector3(0.8, 0.12, 4),
        new THREE.Vector3(0.8, 0.12, 17),
        new THREE.Vector3(-0.8, 0.12, 17),
        new THREE.Vector3(-0.8, 0.12, 4),
        new THREE.Vector3(4, 0.12, 0.8),
        new THREE.Vector3(17, 0.12, 0.8),
        new THREE.Vector3(17, 0.12, -0.8),
        new THREE.Vector3(4, 0.12, -0.8),
        new THREE.Vector3(0.8, 0.12, -4),
        new THREE.Vector3(0.8, 0.12, -17),
      ],
      true,
      "catmullrom",
      0.2
    );
    return [ringCurve, innerCurve];
  }, []);

  const cars = useMemo(() => {
    const rnd = mulberry32(90210);
    return Array.from({ length: count }, (_, i) => ({
      curve: curves[i % curves.length],
      offset: rnd(),
      speed: 0.014 + rnd() * 0.016,
      color: CAR_COLORS[i % CAR_COLORS.length],
    }));
  }, [count, curves]);

  return (
    <group>
      {cars.map((car, i) => (
        <Car key={i} {...car} paused={paused} />
      ))}
    </group>
  );
}

function Car({
  curve,
  offset,
  speed,
  color,
  paused,
}: {
  curve: THREE.CatmullRomCurve3;
  offset: number;
  speed: number;
  color: string;
  paused: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tan = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = paused ? offset : (offset + clock.elapsedTime * speed) % 1;
    curve.getPointAt(t, pos);
    curve.getTangentAt(t, tan);
    ref.current.position.copy(pos);
    ref.current.rotation.y = Math.atan2(tan.x, tan.z);
  });

  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0.14, 0]}>
        <boxGeometry args={[0.42, 0.26, 0.86]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.34, -0.04]}>
        <boxGeometry args={[0.34, 0.2, 0.42]} />
        <meshStandardMaterial color="#F2F2F2" roughness={0.25} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────── greenery ─────────────────────────── */

export function Scenery({ blockedRadius = 6.5, districtCentres }: { blockedRadius?: number; districtCentres: [number, number][] }) {
  const items = useMemo(() => {
    const rnd = mulberry32(4242);
    const out: { x: number; z: number; s: number; kind: "tree" | "lamp" }[] = [];
    let guard = 0;
    while (out.length < 46 && guard < 1200) {
      guard++;
      const a = rnd() * Math.PI * 2;
      const r = 3 + rnd() * (ISLAND_RADIUS - 4.5);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      // keep off the roads and out of the district footprints
      if (Math.abs(x) < 2.4 || Math.abs(z) < 2.4) continue;
      if (Math.abs(Math.hypot(x, z) - 15.5) < 2.2) continue;
      if (districtCentres.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < blockedRadius)) continue;
      out.push({ x, z, s: 0.7 + rnd() * 0.7, kind: rnd() > 0.78 ? "lamp" : "tree" });
    }
    return out;
  }, [blockedRadius, districtCentres]);

  return (
    <group>
      {items.map((it, i) =>
        it.kind === "tree" ? (
          <group key={i} position={[it.x, 0, it.z]} scale={it.s}>
            <mesh castShadow position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.07, 0.1, 0.6, 6]} />
              <meshStandardMaterial color="#8A6B4F" roughness={1} />
            </mesh>
            <mesh castShadow position={[0, 0.95, 0]}>
              <icosahedronGeometry args={[0.52, 0]} />
              <meshStandardMaterial color={i % 3 === 0 ? "#3F8F5A" : "#4FA36B"} roughness={0.95} flatShading />
            </mesh>
          </group>
        ) : (
          <group key={i} position={[it.x, 0, it.z]} scale={it.s}>
            <mesh castShadow position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.045, 0.06, 1.2, 6]} />
              <meshStandardMaterial color="#5A5A5A" roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.28, 0]}>
              <sphereGeometry args={[0.14, 10, 10]} />
              <meshStandardMaterial color="#FFE9B0" emissive="#FFC66B" emissiveIntensity={1.1} />
            </mesh>
          </group>
        )
      )}
    </group>
  );
}

/* ─────────────────────────── sky ─────────────────────────── */

/** Clouds ring the island rather than crossing it, so they never sit in front
 *  of the skyline in the orthographic view. */
export function Clouds({ paused }: { paused: boolean }) {
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo(() => {
    const rnd = mulberry32(777);
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + rnd() * 0.7;
      const r = 27 + rnd() * 7;
      return {
        x: Math.cos(a) * r,
        y: 11 + rnd() * 8,
        z: Math.sin(a) * r,
        s: 1.1 + rnd() * 1.1,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!group.current || paused) return;
    group.current.rotation.y = clock.elapsedTime * 0.012;
  });

  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]} scale={p.s}>
          <mesh>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.4} roughness={1} depthWrite={false} />
          </mesh>
          <mesh position={[0.9, -0.15, 0.2]} scale={0.72}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.34} roughness={1} depthWrite={false} />
          </mesh>
          <mesh position={[-0.85, -0.2, -0.15]} scale={0.62}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} roughness={1} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
