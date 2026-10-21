import { OCCUPIED_SEATS, SEATS } from "./constants";

const REACH = 2;

// Picks the closest seat the player is roughly facing.
export function findNearSeat(
  px: number,
  pz: number,
  yaw: number,
): number | null {
  const fx = -Math.sin(yaw);
  const fz = -Math.cos(yaw);
  let best: number | null = null;
  let bestDist = REACH;
  for (let i = 0; i < SEATS.length; i++) {
    if (OCCUPIED_SEATS.has(i)) continue;
    const dx = SEATS[i].x - px;
    const dz = SEATS[i].z - pz;
    const dist = Math.hypot(dx, dz);
    if (dist >= bestDist) continue;
    if ((dx * fx + dz * fz) / (dist || 1) < 0.3) continue;
    best = i;
    bestDist = dist;
  }
  return best;
}
