"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Ambient animations that give each place its signature motion. */

/** Signal Tower: broadcast rings pushing outward from the mast. */
export function SignalRings({ y, color, paused, active }: { y: number; color: string; paused: boolean; active: boolean }) {
  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <SignalRing key={i} index={i} color={color} paused={paused} active={active} />
      ))}
    </group>
  );
}

export function SignalRing({
  index,
  color,
  paused,
  active,
}: {
  index: number;
  color: string;
  paused: boolean;
  active: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const phase = paused ? 0.4 : (clock.elapsedTime * 0.42 + index / 3) % 1;
    const s = 0.4 + phase * 5.4;
    ref.current.scale.set(s, s, s);
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = (1 - phase) * (active ? 0.85 : 0.5);
  });
  return (
    <mesh ref={ref}>
      <ringGeometry args={[0.85, 1, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/** The Amp: an equalizer on the venue roof. */
export function Equalizer({ color, paused }: { color: string; paused: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((bar, i) => {
      const t = paused ? 0.5 : clock.elapsedTime;
      const h = 0.4 + Math.abs(Math.sin(t * (2.1 + i * 0.55) + i)) * 1.5;
      bar.scale.y = h;
      bar.position.y = 2.6 + (h * 0.5) / 2;
    });
  });
  return (
    <group ref={group}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[(i - 2) * 0.62, 2.9, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Skill Foundry: chimney smoke — the workshop is running. */
export function Smoke({ x, z, y, paused }: { x: number; z: number; y: number; paused: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((puff, i) => {
      const t = paused ? 0.3 : (clock.elapsedTime * 0.3 + i / 5) % 1;
      puff.position.y = t * 3.4;
      puff.position.x = Math.sin(t * 3 + i) * 0.5 * t;
      const s = 0.18 + t * 0.55;
      puff.scale.setScalar(s);
      const m = (puff as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = (1 - t) * 0.5;
    });
  });
  return (
    <group position={[x, y, z]} ref={group}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#E7E2D8" transparent opacity={0.4} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** A crane arm swinging a load — anything still under construction. */
export function CraneLoad({
  paused,
  offsets = [[3.4, 2.4, 3.4]],
}: {
  paused: boolean;
  offsets?: [number, number, number][];
}) {
  return (
    <>
      {offsets.map((offset, i) => (
        <CraneArm key={i} offset={offset} phase={i * 1.4} paused={paused} />
      ))}
    </>
  );
}

function CraneArm({
  offset,
  phase,
  paused,
}: {
  offset: [number, number, number];
  phase: number;
  paused: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || paused) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.2 + phase) * 0.85;
  });
  return (
    <group ref={ref} position={offset}>
      <mesh position={[1.9, 2.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#C98A2E" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Academy Hill: a flag over the dome. */
export function Flag({ color, paused }: { color: string; paused: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current || paused) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 1.3) * 0.35;
  });
  return (
    <group position={[0, 5.1, 0]}>
      <mesh>
        <cylinderGeometry args={[0.035, 0.035, 1.6, 6]} />
        <meshStandardMaterial color="#6B6860" />
      </mesh>
      <mesh ref={ref} position={[0.42, 0.55, 0]}>
        <planeGeometry args={[0.8, 0.5]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Central Plaza: a slowly turning ring around the meeting point. */
export function Monument({ color, paused }: { color: string; paused: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current || paused) return;
    ring.current.rotation.z = clock.elapsedTime * 0.35;
    ring.current.position.y = 2.4 + Math.sin(clock.elapsedTime * 0.9) * 0.14;
  });
  return (
    <group>
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.18, 0.34, 2.2, 6]} />
        <meshStandardMaterial color="#D9D4CA" roughness={0.7} />
      </mesh>
      <mesh ref={ring} position={[0, 2.4, 0]} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[0.62, 0.075, 12, 40]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.35} />
      </mesh>
    </group>
  );
}
