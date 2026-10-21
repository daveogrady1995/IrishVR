import { ROOM, DOOR } from "@/game/constants";

const GLOW = "#2cc3ae";

// Closed double door in the shared wall (z = -half), visible from either room.
export function Door() {
  const jambX = DOOR.halfWidth + 0.1;
  const frame = {
    color: "#1a0e05",
    emissive: GLOW,
    emissiveIntensity: 0.9,
    roughness: 0.4,
  };

  return (
    <group position={[0, 0, -ROOM.half]}>
      {[-jambX, jambX].map((x) => (
        <mesh key={x} position={[x, DOOR.height / 2, 0]}>
          <boxGeometry args={[0.2, DOOR.height, 0.4]} />
          <meshStandardMaterial {...frame} />
        </mesh>
      ))}
      <mesh position={[0, DOOR.height + 0.1, 0]}>
        <boxGeometry args={[DOOR.halfWidth * 2 + 0.4, 0.2, 0.4]} />
        <meshStandardMaterial {...frame} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * (DOOR.halfWidth / 2), 0, 0]}>
          <mesh position={[0, (DOOR.height - 0.05) / 2, 0]}>
            <boxGeometry args={[DOOR.halfWidth - 0.02, DOOR.height - 0.05, 0.1]} />
            <meshStandardMaterial color="#3b2a1e" roughness={0.55} />
          </mesh>
          {[-1, 1].map((face) => (
            <mesh
              key={face}
              position={[-side * 0.15, 1.05, face * 0.08]}
            >
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial
                color="#d8b25a"
                metalness={0.8}
                roughness={0.25}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
