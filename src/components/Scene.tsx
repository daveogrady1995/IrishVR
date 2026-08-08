import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, SoftShadows } from '@react-three/drei';
import { Room } from './Room';
import { Player } from './Player';
import { NPCs } from './NPCs';

export function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 5.8, 9.5], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#1a1612']} />
      <fog attach="fog" args={['#1a1612', 22, 38]} />

      <SoftShadows size={28} samples={12} focus={0.6} />

      {/* Warm ambient */}
      <ambientLight intensity={0.45} color="#fff0d4" />
      {/* Hemi for soft fill */}
      <hemisphereLight args={['#fff0d4', '#4b372c', 0.4]} />
      {/* Key directional with shadows */}
      <directionalLight
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
      <directionalLight position={[-5, 4, -8]} intensity={0.35} color="#a8d8ff" />

      <Suspense fallback={null}>
        <Room />
        <Player />
        <NPCs />
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
        <pointLight position={[0, 3.5, 0]} intensity={0.3} distance={20} color="#fff0d4" />
      </Suspense>
    </Canvas>
  );
}
