import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SEATS, SPECTATORS, type SpectatorConfig } from "@/game/constants";

const PANTS = "#2a2520";
const ARM_LENGTH = 0.62;
const REST_ARM_X = -1.1;
const EAT_ARM_X = -1.75;

function Arm({
  side,
  color,
  skin,
  armRef,
  children,
}: {
  side: -1 | 1;
  color: string;
  skin: string;
  armRef: React.RefObject<THREE.Group | null>;
  children?: React.ReactNode;
}) {
  return (
    <group
      ref={armRef}
      position={[side * 0.33, 1.15, -0.1]}
      rotation={[REST_ARM_X, 0, -side * 0.35]}
    >
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[0.14, 0.5, 0.16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.56, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.14]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {children}
    </group>
  );
}

function PopcornBucket() {
  return (
    <group position={[0, 0.86, 0.36]}>
      <mesh>
        <cylinderGeometry args={[0.13, 0.1, 0.24, 14]} />
        <meshStandardMaterial color="#d9262c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1315, 0.1165, 0.07, 14]} />
        <meshStandardMaterial color="#f4f1e8" roughness={0.7} />
      </mesh>
      {[
        [0, 0.14, 0, 0.09],
        [0.06, 0.13, 0.04, 0.07],
        [-0.06, 0.13, -0.03, 0.07],
        [0.02, 0.16, -0.05, 0.06],
        [-0.04, 0.15, 0.05, 0.06],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 8, 8]} />
          <meshStandardMaterial color="#fff2b8" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Drink() {
  return (
    <group position={[0, -0.62, 0.05]}>
      <mesh>
        <cylinderGeometry args={[0.065, 0.05, 0.2, 12]} />
        <meshStandardMaterial color="#e8e1d2" roughness={0.6} />
      </mesh>
      <mesh position={[0.015, 0.16, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
        <meshStandardMaterial color="#d9262c" />
      </mesh>
    </group>
  );
}

function Spectator({
  config,
  index,
}: {
  config: SpectatorConfig;
  index: number;
}) {
  const seat = SEATS[config.seat];
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  // Spread phases so the audience doesn't move in unison.
  const phase = useMemo(() => index * 1.7 + (index % 3) * 0.9, [index]);
  const eatCycle = config.snack === "popcorn" ? 4.5 : 11;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.35) * 0.1;
      head.current.rotation.x = -0.12 + Math.sin(t * 0.9) * 0.015;
    }
    if (rightArm.current && config.snack !== "none") {
      const c = t % eatCycle;
      const k = c < 1.8 ? Math.sin((Math.PI * c) / 1.8) : 0;
      rightArm.current.rotation.x = THREE.MathUtils.lerp(
        REST_ARM_X,
        EAT_ARM_X,
        k,
      );
      if (head.current && k > 0.5 && config.snack === "popcorn") {
        head.current.rotation.x += Math.sin(t * 14) * 0.03;
      }
    }
  });

  return (
    <group position={[seat.x, 0, seat.z]} rotation={[0, Math.PI, 0]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.12, 0.65, 0.12]}>
            <boxGeometry args={[0.2, 0.16, 0.52]} />
            <meshStandardMaterial color={PANTS} roughness={0.85} />
          </mesh>
          <mesh position={[s * 0.12, 0.3, 0.33]}>
            <boxGeometry args={[0.18, 0.5, 0.18]} />
            <meshStandardMaterial color={PANTS} roughness={0.85} />
          </mesh>
          <mesh position={[s * 0.12, 0.045, 0.4]}>
            <boxGeometry args={[0.2, 0.09, 0.28]} />
            <meshStandardMaterial color="#1f1b17" roughness={0.5} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.9, -0.12]}>
        <boxGeometry args={[0.46, 0.62, 0.26]} />
        <meshStandardMaterial color={config.shirt} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.25, -0.1]}>
        <boxGeometry args={[0.14, 0.1, 0.14]} />
        <meshStandardMaterial color={config.skin} roughness={0.6} />
      </mesh>

      <group ref={head} position={[0, 1.48, -0.1]}>
        <mesh>
          <boxGeometry args={[0.36, 0.4, 0.34]} />
          <meshStandardMaterial color={config.skin} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.16, -0.01]}>
          <boxGeometry args={[0.4, 0.15, 0.38]} />
          <meshStandardMaterial color={config.hair} roughness={0.8} />
        </mesh>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.02, 0.175]}>
            <boxGeometry args={[0.06, 0.05, 0.01]} />
            <meshStandardMaterial color="#1f1b17" />
          </mesh>
        ))}
      </group>

      <Arm side={-1} color={config.shirt} skin={config.skin} armRef={leftArm} />
      <Arm side={1} color={config.shirt} skin={config.skin} armRef={rightArm}>
        {config.snack === "drink" && <Drink />}
      </Arm>

      {config.snack === "popcorn" && <PopcornBucket />}
    </group>
  );
}

export function Spectators() {
  return (
    <>
      {SPECTATORS.map((config, i) => (
        <Spectator key={config.seat} config={config} index={i} />
      ))}
    </>
  );
}
