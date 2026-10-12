"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Building } from "./pieces";
import {
  companyHeight,
  floorsFor,
  isUnderConstruction,
  type Floor,
  type Place,
} from "./atlas";
import { Equalizer, Flag, Monument, SignalRings, Smoke, CraneLoad } from "./landmarks";

type Props = {
  place: Place;
  hovered: boolean;
  selected: boolean;
  dimmed: boolean;
  paused: boolean;
  /** Outcome id currently lit up inside this building, if any. */
  litFloor: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onSelectFloor: (placeId: string, floorId: string) => void;
};

export default function PlaceGroup({
  place,
  hovered,
  selected,
  dimmed,
  paused,
  litFloor,
  onHover,
  onSelect,
  onSelectFloor,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const lift = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = selected ? 0.85 : hovered ? 0.45 : 0;
    lift.current += (target - lift.current) * Math.min(1, delta * 8);
    group.current.position.y = lift.current;
  });

  const active = hovered || selected;
  const pad = place.kind === "company" ? 3.4 : 5.4;
  const top = topOf(place);

  return (
    <group position={[place.cx, 0, place.cz]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(place.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(place.id);
        }}
      >
        <circleGeometry args={[pad, 36]} />
        <meshStandardMaterial
          color={active ? place.accent : "#DFDAD1"}
          transparent
          opacity={active ? 0.28 : dimmed ? 0.1 : 0.2}
          roughness={1}
        />
      </mesh>

      <group ref={group}>
        <Structure
          place={place}
          paused={paused}
          active={active}
          litFloor={litFloor}
          onSelectFloor={onSelectFloor}
        />
      </group>

      {/* The township would be a wall of overlapping labels, so project pins
          only appear on hover or selection. */}
      {(place.kind !== "project" || active) && (
      <Html position={[0, top + 1.5, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="city-pin"
          data-active={active ? "true" : "false"}
          data-dimmed={dimmed ? "true" : "false"}
          style={{ ["--pin" as string]: place.accent }}
        >
          <span className="city-pin__dot" />
          {place.label}
        </div>
      </Html>
      )}
    </group>
  );
}

function topOf(place: Place) {
  if (place.kind === "company") return companyHeight(place.companyId!);
  if (place.kind === "signal") return 9;
  if (place.kind === "project") return 3.2;
  return 4.2;
}

/* ─────────────────────── per-kind structures ─────────────────────── */

function Structure({
  place,
  paused,
  active,
  litFloor,
  onSelectFloor,
}: {
  place: Place;
  paused: boolean;
  active: boolean;
  litFloor: string | null;
  onSelectFloor: (placeId: string, floorId: string) => void;
}) {
  switch (place.kind) {
    case "company":
      return (
        <CompanyBuilding
          place={place}
          paused={paused}
          litFloor={litFloor}
          onSelectFloor={onSelectFloor}
        />
      );
    case "project":
      return <ProjectHouse place={place} />;
    case "factory":
      return (
        <>
          <Building spec={{ x: -1.6, z: 0, w: 5.0, d: 3.6, h: 3.0, tint: 0, roof: "pitched" }} accent={place.accent} base="#E9E3D8" />
          <Building spec={{ x: 2.0, z: -1.2, w: 1.8, d: 1.8, h: 5.6, tint: 1, roof: "flat" }} accent={place.accent} base="#E9E3D8" />
          <Building spec={{ x: 2.2, z: 2.0, w: 3.2, d: 2.6, h: 2.4, tint: 0, roof: "pitched" }} accent={place.accent} base="#E9E3D8" />
          <Smoke x={2.0} z={-1.2} y={5.7} paused={paused} />
        </>
      );
    case "club":
      return (
        <>
          <Building spec={{ x: 0, z: 0, w: 4.6, d: 3.6, h: 2.6, tint: 1, roof: "flat" }} accent={place.accent} base="#EAE5E0" />
          <Building spec={{ x: -3.2, z: -1.4, w: 2.0, d: 2.0, h: 3.8, tint: 0 }} accent={place.accent} base="#EAE5E0" />
          <Equalizer color={place.accent} paused={paused} />
        </>
      );
    case "signal":
      return (
        <>
          <Building spec={{ x: 0, z: 0, w: 1.8, d: 1.8, h: 9.0, tint: 1, roof: "antenna" }} accent={place.accent} base="#E4E4E0" />
          <Building spec={{ x: -3.0, z: 1.8, w: 2.8, d: 2.6, h: 3.0, tint: 0, roof: "flat" }} accent={place.accent} base="#E4E4E0" />
          <SignalRings y={12.2} color={place.accent} paused={paused} active={active} />
        </>
      );
    case "academy":
      return (
        <>
          <Building spec={{ x: 0, z: 0, w: 4.0, d: 4.0, h: 3.4, tint: 1, roof: "dome" }} accent={place.accent} base="#E7E7DE" />
          <Building spec={{ x: -3.4, z: 2.2, w: 2.6, d: 2.2, h: 2.2, tint: 0, roof: "pitched" }} accent={place.accent} base="#E7E7DE" />
          <Building spec={{ x: 3.2, z: 2.0, w: 2.4, d: 2.2, h: 2.2, tint: 0, roof: "pitched" }} accent={place.accent} base="#E7E7DE" />
          <Flag color={place.accent} paused={paused} />
        </>
      );
    case "plaza":
      return (
        <>
          <Building spec={{ x: -2.6, z: -2.4, w: 1.8, d: 1.8, h: 2.0, tint: 0, roof: "pitched" }} accent={place.accent} base="#EDEAE3" />
          <Building spec={{ x: 2.6, z: 2.4, w: 1.8, d: 1.8, h: 2.2, tint: 0, roof: "pitched" }} accent={place.accent} base="#EDEAE3" />
          <Monument color={place.accent} paused={paused} />
        </>
      );
    default:
      return null;
  }
}

/** One building per company. Each shipped outcome is a lit floor; a failure is a dark one. */
function CompanyBuilding({
  place,
  paused,
  litFloor,
  onSelectFloor,
}: {
  place: Place;
  paused: boolean;
  litFloor: string | null;
  onSelectFloor: (placeId: string, floorId: string) => void;
}) {
  const companyId = place.companyId!;
  const floors = useMemo(() => floorsFor(companyId), [companyId]);
  const h = companyHeight(companyId);
  const building = isUnderConstruction(companyId);

  return (
    <group>
      <Building
        spec={{ x: 0, z: 0, w: 3.2, d: 3.2, h, tint: 1, roof: building ? "crane" : "antenna" }}
        accent={place.accent}
        base="#E8E4DC"
      />
      {building && <CraneLoad paused={paused} offsets={[[0, h, 0]]} />}

      {floors.map((floor, i) => (
        <FloorBand
          key={floor.id}
          floor={floor}
          y={1.3 + ((h - 2.4) / Math.max(1, floors.length)) * (i + 0.5)}
          accent={place.accent}
          lit={litFloor === floor.id}
          onSelect={() => onSelectFloor(place.id, floor.id)}
        />
      ))}
    </group>
  );
}

function FloorBand({
  floor,
  y,
  accent,
  lit,
  onSelect,
}: {
  floor: Floor;
  y: number;
  accent: string;
  lit: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    const pulse = lit ? 1.6 + Math.sin(clock.elapsedTime * 3.2) * 0.7 : 0;
    m.emissiveIntensity = floor.failed ? pulse * 0.4 : 0.55 + pulse;
    m.opacity = floor.failed ? 0.95 : lit ? 1 : 0.82;
  });

  return (
    <mesh
      ref={ref}
      position={[0, y, 0]}
      onPointerOver={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <boxGeometry args={[3.34, 0.34, 3.34]} />
      <meshStandardMaterial
        // A floor that did not work is dark, and stays dark.
        color={floor.failed ? "#3A3A44" : accent}
        emissive={floor.failed ? "#1A1A22" : accent}
        emissiveIntensity={0.55}
        transparent
        opacity={0.85}
        roughness={0.5}
      />
    </mesh>
  );
}

function ProjectHouse({ place }: { place: Place }) {
  const live = place.cityCopy.kicker === "Live";
  return (
    <Building
      spec={{
        x: 0,
        z: 0,
        w: 2.4,
        d: 2.2,
        h: live ? 3.0 : 2.2,
        tint: live ? 1 : 0,
        roof: live ? "pitched" : "crane",
      }}
      accent={place.accent}
      base="#EDE9E3"
    />
  );
}
