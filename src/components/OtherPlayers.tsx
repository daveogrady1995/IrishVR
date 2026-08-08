import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
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
  const [activeMessage, setActiveMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!target.message || !target.messageTime) return;
    setActiveMessage(target.message);
    const t = setTimeout(() => setActiveMessage(undefined), 8000);
    return () => clearTimeout(t);
  }, [target.message, target.messageTime]);

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
      {/* Name tag */}
      <Html center position={[0, 2.15, 0]} zIndexRange={[10, 0]} distanceFactor={10}>
        <div style={{
          background: "rgba(0,0,0,0.65)", color: "#fff",
          padding: "2px 8px", borderRadius: 4, fontSize: 12,
          fontWeight: "bold", whiteSpace: "nowrap", display: "inline-block",
          pointerEvents: "none",
        }}>
          {target.name}
        </div>
      </Html>
      {/* Speech bubble */}
      {activeMessage && (
        <Html center position={[0, 2.65, 0]} zIndexRange={[10, 0]} distanceFactor={10}>
          <div style={{
            background: "#fff", color: "#1a1a1a",
            padding: "5px 10px", borderRadius: 8, fontSize: 12,
            whiteSpace: "nowrap", display: "inline-block",
            maxWidth: 200, overflowWrap: "break-word",
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)", pointerEvents: "none",
          }}>
            {activeMessage}
          </div>
        </Html>
      )}
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
