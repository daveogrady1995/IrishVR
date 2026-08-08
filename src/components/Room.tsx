import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { ROOM } from "@/game/constants";
import { SamMaguireCup } from "./SamMaguireCup";

function Wall({
  args,
  position,
  rotation,
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#e8dcc8" roughness={0.95} />
    </mesh>
  );
}

function Rug() {
  return (
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[3.6, 48]} />
      <meshStandardMaterial color="#944a08" roughness={1} />
    </mesh>
  );
}

function CoffeeTable() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.12, 0.9]} />
        <meshStandardMaterial color="#6d4f3a" roughness={0.55} />
      </mesh>
      {[
        [-0.7, 0, -0.35],
        [0.7, 0, -0.35],
        [-0.7, 0, 0.35],
        [0.7, 0, 0.35],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.225, p[2]]} castShadow>
          <boxGeometry args={[0.1, 0.45, 0.1]} />
          <meshStandardMaterial color="#594033" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[-0.4, 0.53, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.18, 16]} />
        <meshStandardMaterial color="#2cc3ae" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0.45, 0.54, 0.1]} castShadow>
        <boxGeometry args={[0.32, 0.04, 0.22]} />
        <meshStandardMaterial color="#a17d57" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Sofa({
  position,
  rotation,
  color,
}: {
  position: [number, number, number];
  rotation: number;
  color: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.3, 0.95]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.4, 0.5, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[-1.05, 0.55, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.95]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[1.05, 0.55, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.95]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {[
        [-0.6, 0.55, 0.05],
        [0.6, 0.55, 0.05],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.2]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 24]} />
        <meshStandardMaterial color="#594033" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2, 12]} />
        <meshStandardMaterial color="#4b372c" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[0.32, 0.45, 24, 1, true]} />
        <meshStandardMaterial
          color="#ffd988"
          roughness={0.9}
          side={THREE.DoubleSide}
          emissive="#faa517"
          emissiveIntensity={0.45}
        />
      </mesh>
      <pointLight
        position={[0, 2, 0]}
        intensity={6}
        distance={9}
        decay={2}
        color="#ffbf4a"
        castShadow
        shadow-mapSize={[512, 512]}
      />
    </group>
  );
}

function Bookshelf({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: number;
}) {
  const bookColors = useMemo(
    () => ["#944a08", "#0a8273", "#bb6206", "#6d4f3a", "#2cc3ae", "#a17d57"],
    [],
  );
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 2.4, 0.4]} />
        <meshStandardMaterial color="#594033" roughness={0.7} />
      </mesh>
      {[0.5, 1.1, 1.7, 2.3].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0.21]} castShadow>
            <boxGeometry args={[1.6, 0.04, 0.05]} />
            <meshStandardMaterial color="#4b372c" />
          </mesh>
          {Array.from({ length: 7 }).map((_, j) => (
            <mesh key={j} position={[-0.7 + j * 0.2, y + 0.25, 0]} castShadow>
              <boxGeometry args={[0.12, 0.42, 0.28]} />
              <meshStandardMaterial
                color={bookColors[(i + j) % bookColors.length]}
                roughness={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Armchair({
  position,
  rotation,
  color,
}: {
  position: [number, number, number];
  rotation: number;
  color: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.22, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.55, -0.35]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[-0.42, 0.5, 0]} castShadow>
        <boxGeometry args={[0.16, 0.4, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0.42, 0.5, 0]} castShadow>
        <boxGeometry args={[0.16, 0.4, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </group>
  );
}

function FloorMat({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, rotation]}
      receiveShadow
    >
      <planeGeometry args={[1.6, 0.8]} />
      <meshStandardMaterial color="#6d4f3a" roughness={1} />
    </mesh>
  );
}

function PosterFrame({
  position,
  rotationY,
  width,
  height,
  children,
}: {
  position: [number, number, number];
  rotationY: number;
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.04]} />
        <meshStandardMaterial color="#1a0e05" roughness={0.7} />
      </mesh>
      {children}
    </group>
  );
}

function PhotoPoster({
  position,
  rotationY,
  url,
  width = 2.0,
  height = 1.35,
}: {
  position: [number, number, number];
  rotationY: number;
  url: string;
  width?: number;
  height?: number;
}) {
  const texture = useTexture(url);
  return (
    <PosterFrame
      position={position}
      rotationY={rotationY}
      width={width}
      height={height}
    >
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
    </PosterFrame>
  );
}

function CurseIsBrokenPoster({
  position,
  rotationY,
}: {
  position: [number, number, number];
  rotationY: number;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 768;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#00521a";
    ctx.fillRect(0, 0, 512, 768);
    ctx.fillStyle = "#c80000";
    ctx.fillRect(0, 0, 512, 110);
    ctx.fillRect(0, 658, 512, 110);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 54px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MAYO GAA", 256, 75);
    ctx.fillText("2026 CHAMPIONS", 256, 728);
    ctx.fillStyle = "#ffd700";
    ctx.font = "56px serif";
    ctx.fillText("★  ★  ★  ★", 256, 185);
    ctx.font = "bold 80px Arial";
    ctx.fillText("THE CURSE", 256, 300);
    ctx.fillText("IS OVER!", 256, 400);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 34px Arial";
    ctx.fillText("75 YEARS OF HEARTBREAK", 256, 480);
    ctx.fillText("ENDED • 26 JULY 2026", 256, 528);
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 30px Arial";
    ctx.fillText("MAYO 1–20  KERRY 1–17", 256, 590);
    ctx.fillStyle = "#fff";
    ctx.font = "26px Arial";
    ctx.fillText("All-Ireland Final • Croke Park", 256, 632);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <PosterFrame
      position={position}
      rotationY={rotationY}
      width={1.6}
      height={2.4}
    >
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.6, 2.4]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
    </PosterFrame>
  );
}

function MayoBannerPoster({
  position,
  rotationY,
}: {
  position: [number, number, number];
  rotationY: number;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 768, 0);
    grad.addColorStop(0, "#00521a");
    grad.addColorStop(0.5, "#007d28");
    grad.addColorStop(1, "#00521a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 768, 512);
    ctx.fillStyle = "#c80000";
    ctx.fillRect(0, 0, 768, 80);
    ctx.fillRect(0, 432, 768, 80);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MAYO", 384, 55);
    ctx.fillText("GREEN & RED FOREVER", 384, 476);
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 88px serif";
    ctx.fillText("SAM IS HOME!", 384, 220);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 44px Arial";
    ctx.fillText("All-Ireland Senior Football", 384, 300);
    ctx.fillText("Champions 2026", 384, 360);
    ctx.fillStyle = "#ffd700";
    ctx.font = "44px serif";
    ctx.fillText("★ ★ ★ ★ ★ ★", 384, 420);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <PosterFrame
      position={position}
      rotationY={rotationY}
      width={2.4}
      height={1.6}
    >
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[2.4, 1.6]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
    </PosterFrame>
  );
}

export function Room() {
  const { half, wallHeight, wallThickness } = ROOM;
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[half * 2, half * 2]} />
        <meshStandardMaterial color="#d0bd9f" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <Wall
        args={[half * 2, wallHeight, wallThickness]}
        position={[0, wallHeight / 2, -half]}
      />
      <Wall
        args={[half * 2, wallHeight, wallThickness]}
        position={[0, wallHeight / 2, half]}
      />
      <Wall
        args={[half * 2, wallHeight, wallThickness]}
        position={[-half, wallHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Wall
        args={[half * 2, wallHeight, wallThickness]}
        position={[half, wallHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Ceiling */}
      <mesh
        position={[0, wallHeight, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[half * 2, half * 2]} />
        <meshStandardMaterial color="#f2ece1" roughness={1} />
      </mesh>

      <Rug />
      <CoffeeTable />
      <Sofa position={[0, 0, 8]} rotation={Math.PI} color="#783c0e" />
      <Sofa position={[-7.5, 0, -7.5]} rotation={Math.PI / 4} color="#6d4f3a" />
      <Armchair
        position={[7.5, 0, -7.5]}
        rotation={-Math.PI / 4 + Math.PI}
        color="#0a8273"
      />
      <FloorLamp position={[-7.5, 0, 8]} />
      <FloorLamp position={[7.5, 0, 7.5]} />
      <Bookshelf position={[-9.5, 0, -3]} rotation={Math.PI / 2} />
      <FloorMat position={[3, 0.01, -8]} rotation={0} />
      <FloorMat position={[-3, 0.01, 5]} rotation={0.3} />

      {/* Mayo GAA posters */}
      <CurseIsBrokenPoster position={[-3.2, 2.2, -9.8]} rotationY={0} />
      <PhotoPoster
        position={[3.2, 2.2, -9.8]}
        rotationY={0}
        url="/images/mayo-celebration.jpg"
        width={2.0}
        height={1.4}
      />
      <PhotoPoster
        position={[-9.8, 2.2, -2]}
        rotationY={Math.PI / 2}
        url="/images/mayo-poster.jpg"
        width={1.8}
        height={2.2}
      />
      <MayoBannerPoster position={[9.8, 2.3, 2]} rotationY={-Math.PI / 2} />

      {/* Sam Maguire Cup — centre of the room on a pedestal */}
      <SamMaguireCup position={[0, 0, -4]} />
    </group>
  );
}
