import {
  OBSTACLES,
  SEAT_COLLIDERS,
  WALLS,
  CINEMA,
  PLAYER,
  WORLD_MIN_Z,
  WORLD_MAX_Z,
  type AABB,
} from "./constants";
import type { RoomId } from "./types";

const MARGIN = PLAYER.radius + 0.15;
const BOUND_X = CINEMA.halfWidth - MARGIN;
const MIN_Z = WORLD_MIN_Z + MARGIN;
const MAX_Z = WORLD_MAX_Z - MARGIN;
const COLLIDERS: Record<RoomId, AABB[]> = {
  lounge: [...WALLS, ...OBSTACLES],
  cinema: [...WALLS, ...SEAT_COLLIDERS],
};

function closestOnAABB(px: number, pz: number, box: AABB) {
  const cx = Math.max(box.minX, Math.min(px, box.maxX));
  const cz = Math.max(box.minZ, Math.min(pz, box.maxZ));
  return { cx, cz };
}

export function resolveCollision(
  px: number,
  pz: number,
  room: RoomId,
  radius = PLAYER.radius,
): [number, number] {
  let x = px;
  let z = pz;

  x = Math.max(-BOUND_X, Math.min(BOUND_X, x));
  z = Math.max(MIN_Z, Math.min(MAX_Z, z));

  for (const box of COLLIDERS[room]) {
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

  x = Math.max(-BOUND_X, Math.min(BOUND_X, x));
  z = Math.max(MIN_Z, Math.min(MAX_Z, z));
  return [x, z];
}
