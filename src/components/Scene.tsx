import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ROOM } from "@/game/constants";
import { Room } from "./Room";
import { Cinema } from "./Cinema";
import { Player } from "./Player";
import { NPCs } from "./NPCs";
import { OtherPlayers } from "./OtherPlayers";

// Global lights fade down as the player walks through the cinema doorway.
function Lights() {
  const ambient = useRef<THREE.AmbientLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const player = useRef<THREE.Object3D | null>(null);

  useFrame(({ scene }) => {
    player.current ??= scene.getObjectByName("player-group") ?? null;
    const z = player.current?.position.z ?? 0;
    const t = THREE.MathUtils.smoothstep(-ROOM.half - z + 1, 0, 4);
    const k = 1 - 0.92 * t;
    if (ambient.current) ambient.current.intensity = 0.45 * k;
    if (hemi.current) hemi.current.intensity = 0.4 * k;
    if (key.current) key.current.intensity = 1.6 * k;
    if (rim.current) rim.current.intensity = 0.35 * k;
  });

  return (
    <>
      {/* Warm ambient */}
      <ambientLight ref={ambient} intensity={0.45} color="#fff0d4" />
      {/* Hemi for soft fill */}
      <hemisphereLight ref={hemi} args={["#fff0d4", "#4b372c", 0.4]} />
      {/* Key directional with shadows */}
      <directionalLight
        ref={key}
        position={[6, 9, 4]}
        intensity={1.6}
        color="#fff0d4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-14, 14, 14, -14, 0.1, 30]}
        />
      </directionalLight>
      {/* Cool rim from window side */}
      <directionalLight
        ref={rim}
        position={[-5, 4, -8]}
        intensity={0.35}
        color="#a8d8ff"
      />
    </>
  );
}

export function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.65, 6], fov: 75, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#1a1612"]} />
      <fog attach="fog" args={["#1a1612", 26, 60]} />

      <Lights />

      <Suspense fallback={null}>
        <Room />
        <Cinema />
        <Player />
        <NPCs />
        <OtherPlayers />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.35}
          scale={24}
          blur={2.4}
          far={6}
          resolution={512}
          color="#1a1208"
        />
        {/* Subtle warm fill from all directions using a low-cost light rig */}
        <pointLight
          position={[0, 3.5, 0]}
          intensity={0.3}
          distance={20}
          color="#fff0d4"
        />
      </Suspense>
    </Canvas>
  );
}
