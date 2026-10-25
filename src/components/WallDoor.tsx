import { useEffect, useMemo } from "react";
import * as THREE from "three";

export function signTexture(text: string, bg: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 144);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 84px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 86);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A door set into a wall. Local +z points into the room it decorates.
export function WallDoor({
  position,
  rotationY,
  label,
}: {
  position: [number, number, number];
  rotationY: number;
  label: string;
}) {
  const sign = useMemo(() => signTexture(label, "#1f6b4a"), [label]);
  useEffect(() => () => sign.dispose(), [sign]);
  const w = 1.2;
  const h = 2.8;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-w - 0.1, w + 0.1].map((x) => (
        <mesh key={x} position={[x, h / 2, 0.1]}>
          <boxGeometry args={[0.2, h, 0.2]} />
          <meshStandardMaterial color="#1a0e05" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, h + 0.1, 0.1]}>
        <boxGeometry args={[w * 2 + 0.4, 0.2, 0.2]} />
        <meshStandardMaterial color="#1a0e05" roughness={0.5} />
      </mesh>
      <mesh position={[0, (h - 0.05) / 2, 0.03]}>
        <boxGeometry args={[w * 2, h - 0.05, 0.06]} />
        <meshStandardMaterial color="#3b6b4a" roughness={0.55} />
      </mesh>
      <mesh position={[w - 0.3, 1.05, 0.1]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#d8b25a" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 3.4, 0.05]}>
        <planeGeometry args={[2.3, 0.72]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
