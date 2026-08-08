import { OBSTACLES, ROOM, PLAYER, type AABB } from './constants';

const BOUND = ROOM.half - PLAYER.radius - 0.15;

function closestOnAABB(px: number, pz: number, box: AABB) {
  const cx = Math.max(box.minX, Math.min(px, box.maxX));
  const cz = Math.max(box.minZ, Math.min(pz, box.maxZ));
  return { cx, cz };
}

export function resolveCollision(
  px: number,
  pz: number,
  radius = PLAYER.radius,
): [number, number] {
  let x = px;
  let z = pz;

  x = Math.max(-BOUND, Math.min(BOUND, x));
  z = Math.max(-BOUND, Math.min(BOUND, z));

  for (const box of OBSTACLES) {
    const { cx, cz } = closestOnAABB(x, z, box);
    const dx = x - cx;
    const dz = z - cz;
    const distSq = dx * dx + dz * dz;
    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq) || 0.0001;
      if (dist > 0.0001) {
        const push = (radius - dist) / dist;
        x += dx * push;
        z += dz * push;
      } else {
        x += radius;
      }
    }
  }

  x = Math.max(-BOUND, Math.min(BOUND, x));
  z = Math.max(-BOUND, Math.min(BOUND, z));
  return [x, z];
}
