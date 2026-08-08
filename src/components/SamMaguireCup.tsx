import { useMemo } from "react";
import * as THREE from "three";

export function SamMaguireCup({ position }: { position: [number, number, number] }) {
  // Bowl flares dramatically outward from a tiny base — key to the real cup shape
  const BOWL_BOTTOM = 1.08;
  const RIM_R = 1.22;
  const RIM_Y = BOWL_BOTTOM + 1.02; // 2.10

  const bowlProfile = useMemo(() => [
    new THREE.Vector2(0.06,  0),
    new THREE.Vector2(0.62,  0.1),   // opens EXTREMELY fast — most important line
    new THREE.Vector2(0.96,  0.25),
    new THREE.Vector2(1.12,  0.46),
    new THREE.Vector2(1.20,  0.68),
    new THREE.Vector2(1.24,  0.88),
    new THREE.Vector2(1.25,  1.0),
    new THREE.Vector2(1.22,  1.02),  // slight inward rim curl
  ], []);

  // Celtic knotwork band with "CORN SAM MHIC UIDHIR" inscription above the arcs
  const celticTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 80;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#d0d0dc";
    ctx.fillRect(0, 0, 512, 80);
    ctx.font = "bold 13px Arial";
    ctx.fillStyle = "#404050";
    ctx.textAlign = "center";
    ctx.fillText("CORN SAM MHIC UIDHIR", 256, 13);
    ctx.strokeStyle = "#707080"; ctx.lineWidth = 2;
    for (let x = 0; x < 528; x += 32) {
      ctx.beginPath(); ctx.arc(x, 36, 13, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 16, 56, 13, 0, Math.PI); ctx.stroke();
    }
    ctx.fillStyle = "#606070";
    for (let x = 16; x < 512; x += 32) {
      ctx.beginPath(); ctx.arc(x, 46, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    return new THREE.CanvasTexture(c);
  }, []);

  // Diamond crosshatch for stem
  const hatchTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ccccd8"; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "#8888a0"; ctx.lineWidth = 1.2;
    for (let i = -128; i < 256; i += 14) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i + 128, 0); ctx.lineTo(i, 128); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }, []);

  // Inscription band for bowl — winner text wrapped around lower bowl
  const bowlBandTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 52;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ccccd8";
    ctx.fillRect(0, 0, 1024, 52);
    ctx.strokeStyle = "#606070"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(1024, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(1024, 46); ctx.stroke();
    ctx.font = "bold 19px Georgia, serif";
    ctx.fillStyle = "#383848";
    ctx.textAlign = "center";
    ctx.fillText("ALL-IRELAND SENIOR FOOTBALL CHAMPIONS  ·  MAYO  ·  2026", 512, 32);
    return new THREE.CanvasTexture(c);
  }, []);

  // GAA circular medallion crest
  const medallionTex = useMemo(() => {
    const sz = 256; const cx = 128, cy = 128;
    const c = document.createElement("canvas");
    c.width = sz; c.height = sz;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, sz, sz);
    const ring = (r: number, lw: number) => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#606070"; ctx.lineWidth = lw; ctx.stroke();
    };
    ring(sz * 0.45, 5); ring(sz * 0.37, 2.5);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * sz * 0.37, cy + Math.sin(a) * sz * 0.37);
      ctx.lineTo(cx + Math.cos(a) * sz * 0.45, cy + Math.sin(a) * sz * 0.45);
      ctx.lineWidth = 2; ctx.strokeStyle = "#606070"; ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * sz * 0.41, cy + Math.sin(a) * sz * 0.41, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#606070"; ctx.fill();
    }
    ring(sz * 0.24, 3);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * sz * 0.13, cy + Math.sin(a) * sz * 0.13, sz * 0.06, a, a + Math.PI * 1.5);
      ctx.lineWidth = 2.5; ctx.strokeStyle = "#707080"; ctx.stroke();
    }
    ring(sz * 0.1, 2);
    return new THREE.CanvasTexture(c);
  }, []);

  // Low metalness so direct lights illuminate it — high metalness looks black without env map
  const silver = { color: "#dcdce8", metalness: 0.28, roughness: 0.2 };

  return (
    <group position={position}>
      {/* PEDESTAL */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.68, 0.78, 0.3, 32]} />
        <meshStandardMaterial color="#3a1e0c" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.22, 32]} />
        <meshStandardMaterial color="#3a1e0c" roughness={0.78} />
      </mesh>

      {/* DOMED BASE — 3 stacked sections for dome-saucer shape */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.74, 0.76, 0.08, 48]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.74, 0.16, 48]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      <mesh position={[0, 0.74, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.62, 0.2, 48]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      {/* Celtic base band */}
      <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.028, 8, 56]} />
        <meshStandardMaterial map={celticTex} color="#ccccd8" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* STEM with diamond crosshatch */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.28, 0.38, 24]} />
        <meshStandardMaterial map={hatchTex} color="#ccccd8" metalness={0.28} roughness={0.22} />
      </mesh>

      {/* BOWL — wide shallow salad-bowl shape */}
      <mesh position={[0, BOWL_BOTTOM, 0]} castShadow>
        <latheGeometry args={[bowlProfile, 64]} />
        <meshStandardMaterial {...silver} side={THREE.DoubleSide} />
      </mesh>

      {/* Celtic knotwork rim band */}
      <mesh position={[0, BOWL_BOTTOM + 0.93, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.27, 0.055, 10, 64]} />
        <meshStandardMaterial map={celticTex} color="#ccccd8" metalness={0.3} roughness={0.18} />
      </mesh>

      {/* 4 spherical escutcheon studs on rim band */}
      {([0, Math.PI / 2, Math.PI, -Math.PI / 2] as number[]).map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * RIM_R, RIM_Y, Math.cos(a) * RIM_R]}>
          <sphereGeometry args={[0.04, 12, 8]} />
          <meshStandardMaterial {...silver} />
        </mesh>
      ))}

      {/* HANDLES — full circular rings, center offset so ring just touches the rim */}
      <mesh position={[-(RIM_R + 0.3), RIM_Y - 0.08, 0]} castShadow>
        <torusGeometry args={[0.3, 0.048, 14, 52]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      <mesh position={[RIM_R + 0.3, RIM_Y - 0.08, 0]} castShadow>
        <torusGeometry args={[0.3, 0.048, 14, 52]} />
        <meshStandardMaterial {...silver} />
      </mesh>

      <pointLight position={[0, 4, 1]} intensity={5} distance={8} color="#fff8ee" />
    </group>
  );
}
