"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { PLACES } from "./atlas";
import PlaceGroup from "./Place";
import { Clouds, Island, Roads, Scenery, Traffic } from "./pieces";
import { GlowContext } from "./glow";

type Props = {
  hovered: string | null;
  selected: string | null;
  litFloor: string | null;
  dusk: boolean;
  paused: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onSelectFloor: (placeId: string, floorId: string) => void;
  onClearSelection: () => void;
};

const DAY_BG = new THREE.Color("#EFEBE3");
const DUSK_BG = new THREE.Color("#2A2F4A");

export default function CityScene({
  hovered,
  selected,
  litFloor,
  dusk,
  paused,
  onHover,
  onSelect,
  onSelectFloor,
  onClearSelection,
}: Props) {
  const controls = useRef<OrbitControlsImpl>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const warm = useRef<THREE.PointLight>(null);
  const glow = useRef(0);
  const userMoved = useRef(false);
  // While true the scene drives the zoom (intro, or a newly picked district).
  // The first user gesture hands zoom control back to OrbitControls.
  const driveZoom = useRef(true);
  const target = useMemo(() => new THREE.Vector3(...restTarget()), []);

  const centres = useMemo(() => PLACES.map((p) => [p.cx, p.cz] as [number, number]), []);

  // Intro: ease the camera in from a wide shot.
  const intro = useRef(0);

  useEffect(() => {
    const d = PLACES.find((x) => x.id === selected);
    const rest = restTarget();
    target.set(d ? d.cx * 0.6 : rest[0], d ? 3 : rest[1], d ? d.cz * 0.6 : rest[2]);
    driveZoom.current = true;
  }, [selected, target]);

  useFrame(({ camera, scene }, delta) => {
    const k = Math.min(1, delta * 3);

    // Intro zoom, then hands off to the user's own scroll-zoom.
    if (driveZoom.current) {
      intro.current = Math.min(1, intro.current + delta * 0.55);
      const eased = 1 - Math.pow(1 - intro.current, 3);
      const zoomTarget = fitZoom(Boolean(selected));
      const from = zoomTarget * 0.55;
      const goal = paused ? zoomTarget : from + (zoomTarget - from) * eased;
      camera.zoom += (goal - camera.zoom) * k;
      camera.updateProjectionMatrix();
      if (intro.current >= 1 && Math.abs(camera.zoom - zoomTarget) < 0.25) {
        driveZoom.current = false;
      }
    }

    // day → dusk
    const g = dusk ? 1 : 0;
    glow.current += (g - glow.current) * Math.min(1, delta * 2.2);
    const t = glow.current;
    if (sun.current) {
      sun.current.intensity = 2.1 - t * 1.55;
      sun.current.color.lerpColors(new THREE.Color("#FFF6E6"), new THREE.Color("#8FA6FF"), t);
    }
    if (ambient.current) ambient.current.intensity = 0.48 - t * 0.28;
    if (warm.current) warm.current.intensity = t * 26;
    (scene.background as THREE.Color)?.lerpColors(DAY_BG, DUSK_BG, t);

    // ease the orbit pivot toward the selected district
    if (controls.current) {
      controls.current.target.lerp(target, Math.min(1, delta * 2.4));
      controls.current.autoRotate = !userMoved.current && !selected && !paused;
      controls.current.update();
    }
  });

  return (
    <GlowContext.Provider value={glow}>
      <color attach="background" args={["#EFEBE3"]} />
      <hemisphereLight args={["#DCE8FF", "#CFC5B2", 0.38]} />
      <ambientLight ref={ambient} intensity={0.48} />
      <directionalLight
        ref={sun}
        position={[20, 30, 14]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={90}
      />
      <pointLight ref={warm} position={[0, 8, 0]} color="#FFC98A" intensity={0} distance={44} decay={1.6} />

      <group position={[0, 0, 0]}>
        <Island onGroundClick={onClearSelection} />
        <Roads />
        <Scenery districtCentres={centres} blockedRadius={4.6} />
        <Traffic paused={paused} />

        {PLACES.map((p) => (
          <PlaceGroup
            key={p.id}
            place={p}
            hovered={hovered === p.id}
            selected={selected === p.id}
            dimmed={Boolean(selected) && selected !== p.id}
            litFloor={selected === p.id ? litFloor : null}
            paused={paused}
            onHover={onHover}
            onSelect={onSelect}
            onSelectFloor={onSelectFloor}
          />
        ))}
      </group>

      <Clouds paused={paused} />

      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotateSpeed={0.32}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.45}
        minZoom={5}
        maxZoom={80}
        onStart={() => {
          userMoved.current = true;
          driveZoom.current = false;
        }}
      />
    </GlowContext.Provider>
  );
}

/** Zoom that fits the whole island in view, constrained by both axes. */
function fitZoom(focused: boolean) {
  if (typeof window === "undefined") return 18;
  const { innerWidth: w, innerHeight: h } = window;
  const base = Math.min(w / 46, h / 48);
  return base * (focused ? 1.32 : 1);
}

/** Resting orbit pivot. On narrow screens the city sits higher so the
 *  bottom-anchored HUD does not cover it. */
function restTarget(): [number, number, number] {
  if (typeof window === "undefined") return [-2, 3.5, -2];
  if (window.innerWidth < 768) return [0, -1.5, 0];
  return window.innerHeight < 700 ? [-2, 1.5, -2] : [-2, 3.5, -2];
}
