import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterProps {
  bodyColor: string;
  hairColor: string;
  skinColor?: string;
  pantsColor?: string;
  speaking?: boolean;
  facing?: number;
}

const HEAD_Y = 1.55;
const BODY_TOP = 1.25;

export function Character({
  bodyColor,
  hairColor,
  skinColor = '#e8b896',
  pantsColor = '#2a2520',
  speaking = false,
  facing = 0,
}: CharacterProps) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftHand = useRef<THREE.Group>(null);
  const rightHand = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    const time = t.current;
    const g = group.current;
    if (!g) return;

    g.rotation.y = facing;

    const breath = Math.sin(time * 1.8) * 0.018;
    g.position.y = breath;

    if (head.current) {
      const headTurn = Math.sin(time * 0.7) * 0.12;
      head.current.rotation.y = headTurn;
      head.current.rotation.x = Math.sin(time * 1.8) * 0.03;
    }

    if (speaking) {
      const gesture = Math.sin(time * 5.5);
      const gesture2 = Math.sin(time * 5.5 + 1.2);
      if (leftArm.current) leftArm.current.rotation.x = 0.15 + gesture * 0.35;
      if (rightArm.current) rightArm.current.rotation.x = 0.15 + gesture2 * 0.35;
      if (leftHand.current) leftHand.current.position.y = 0.85 + Math.abs(gesture) * 0.12;
      if (rightHand.current) rightHand.current.position.y = 0.85 + Math.abs(gesture2) * 0.12;
    } else {
      const idle = Math.sin(time * 1.5);
      if (leftArm.current)
        leftArm.current.rotation.x = THREE.MathUtils.lerp(
          leftArm.current.rotation.x,
          0.05 + idle * 0.03,
          0.1,
        );
      if (rightArm.current)
        rightArm.current.rotation.x = THREE.MathUtils.lerp(
          rightArm.current.rotation.x,
          0.05 - idle * 0.03,
          0.1,
        );
      if (leftHand.current)
        leftHand.current.position.y = THREE.MathUtils.lerp(
          leftHand.current.position.y,
          0.85,
          0.1,
        );
      if (rightHand.current)
        rightHand.current.position.y = THREE.MathUtils.lerp(
          rightHand.current.position.y,
          0.85,
          0.1,
        );
    }
  });

  return (
    <group ref={group}>
      {/* Legs */}
      <mesh position={[-0.16, 0.4, 0]} castShadow>
        <boxGeometry args={[0.22, 0.8, 0.24]} />
        <meshStandardMaterial color={pantsColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.16, 0.4, 0]} castShadow>
        <boxGeometry args={[0.22, 0.8, 0.24]} />
        <meshStandardMaterial color={pantsColor} roughness={0.8} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.16, 0.04, 0.04]} castShadow>
        <boxGeometry args={[0.24, 0.1, 0.32]} />
        <meshStandardMaterial color="#1f1b17" roughness={0.5} />
      </mesh>
      <mesh position={[0.16, 0.04, 0.04]} castShadow>
        <boxGeometry args={[0.24, 0.1, 0.32]} />
        <meshStandardMaterial color="#1f1b17" roughness={0.5} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.52, 0.7, 0.34]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Hip */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.18, 0.32]} />
        <meshStandardMaterial color={pantsColor} roughness={0.8} />
      </mesh>

      {/* Left arm */}
      <group ref={leftArm} position={[-0.34, 1.2, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.14, 0.7, 0.16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
      </group>
      {/* Right arm */}
      <group ref={rightArm} position={[0.34, 1.2, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.14, 0.7, 0.16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Hands */}
      <mesh ref={leftHand} position={[-0.34, 0.85, 0]} castShadow>
        <boxGeometry args={[0.16, 0.14, 0.18]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      <mesh ref={rightHand} position={[0.34, 0.85, 0]} castShadow>
        <boxGeometry args={[0.16, 0.14, 0.18]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <boxGeometry args={[0.16, 0.12, 0.16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Head */}
      <group ref={head} position={[0, HEAD_Y, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.38, 0.42, 0.36]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.16, -0.01]} castShadow>
          <boxGeometry args={[0.42, 0.16, 0.4]} />
          <meshStandardMaterial color={hairColor} roughness={0.8} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.09, 0.02, 0.19]}>
          <boxGeometry args={[0.06, 0.05, 0.01]} />
          <meshStandardMaterial color="#1f1b17" />
        </mesh>
        <mesh position={[0.09, 0.02, 0.19]}>
          <boxGeometry args={[0.06, 0.05, 0.01]} />
          <meshStandardMaterial color="#1f1b17" />
        </mesh>
      </group>
    </group>
  );
}

export { HEAD_Y, BODY_TOP };
