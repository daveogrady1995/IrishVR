import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Character } from "./Character";
import { useOtherPlayers, type RemotePlayer } from "@/game/multiplayer";

function OtherPlayer({ target }: { target: RemotePlayer }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef(target);
  targetRef.current = target;
  const smooth = useRef({ x: target.x, z: target.z });
  const prevSmooth = useRef({ x: target.x, z: target.z });
  const lastMoved = useRef(0);
  const walkState = useRef(false);
  const [walking, setWalking] = useState(false);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const alpha = Math.min(1, Math.min(delta, 0.1) * 12);
    smooth.current.x += (targetRef.current.x - smooth.current.x) * alpha;
    smooth.current.z += (targetRef.current.z - smooth.current.z) * alpha;
    g.position.set(smooth.current.x, 0, smooth.current.z);

    const dx = smooth.current.x - prevSmooth.current.x;
    const dz = smooth.current.z - prevSmooth.current.z;
    prevSmooth.current = { x: smooth.current.x, z: smooth.current.z };
    if (Math.hypot(dx, dz) > 0.001) lastMoved.current = Date.now();
    const nowWalking = Date.now() - lastMoved.current < 250;
    if (nowWalking !== walkState.current) {
      walkState.current = nowWalking;
      setWalking(nowWalking);
    }
  });

  return (
    <group ref={groupRef}>
      <Character
        bodyColor="#c0392b"
        hairColor="#2a2520"
        skinColor="#e8b896"
        pantsColor="#2a2520"
        facing={target.rotY}
        walking={walking}
      />
    </group>
  );
}

export function OtherPlayers() {
  const others = useOtherPlayers();
  return (
    <>
      {others.map((p) => (
        <OtherPlayer key={p.id} target={p} />
      ))}
    </>
  );
}
