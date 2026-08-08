import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Character } from './Character';
import { getMoveVector, input } from '@/game/input';
import { resolveCollision } from '@/game/collision';
import { PLAYER, CAMERA } from '@/game/constants';
import { useGame } from '@/game/store';

const _camPos = new THREE.Vector3();
const _look = new THREE.Vector3();

export function Player() {
  const group = useRef<THREE.Group>(null);
  const facing = useRef(0);
  const { camera } = useThree();
  const cameraMode = useGame((s) => s.cameraMode);
  const camMode = useRef(cameraMode);
  camMode.current = cameraMode;

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);

    const mv = getMoveVector();
    const moving = mv.x !== 0 || mv.y !== 0;

    if (moving) {
      const targetAngle = Math.atan2(mv.x, mv.y);
      let diff = targetAngle - facing.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      facing.current += diff * Math.min(1, dt * 12);

      const dist = PLAYER.speed * dt;
      const nx = g.position.x + mv.x * dist;
      const nz = g.position.z + mv.y * dist;
      const [rx, rz] = resolveCollision(nx, nz);
      g.position.x = rx;
      g.position.z = rz;
    }

    g.rotation.y = facing.current;

    // Camera
    if (camMode.current === 'walk') {
      const yaw = input.cameraYaw;
      const offset = CAMERA.walkOffset;
      const radius = Math.hypot(offset.x, offset.z);
      _camPos.set(
        g.position.x + Math.sin(yaw) * radius,
        g.position.y + offset.y,
        g.position.z + Math.cos(yaw) * radius,
      );
      camera.position.lerp(_camPos, Math.min(1, dt * CAMERA.smooth));
      _look.copy(g.position);
      _look.y = CAMERA.walkLookHeight;
      camera.lookAt(_look);
    } else {
      _camPos.copy(CAMERA.cinematicPos);
      camera.position.lerp(_camPos, Math.min(1, dt * CAMERA.smooth * 0.8));
      _look.copy(CAMERA.cinematicTarget);
      camera.lookAt(_look);
    }
  });

  return (
    <group ref={group} name="player-group" position={[0, 0, 6]}>
      <Character
        bodyColor="#0fa391"
        hairColor="#2a2520"
        skinColor="#e8b896"
        pantsColor="#2a2520"
        facing={0}
      />
    </group>
  );
}
