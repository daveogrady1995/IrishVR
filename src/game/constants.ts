import { Vector3 } from 'three';

export const ROOM = {
  half: 10,
  wallHeight: 4,
  wallThickness: 0.25,
};

export const PLAYER = {
  radius: 0.42,
  speed: 4.2,
  startY: 0,
};

export const PROXIMITY_DISTANCE = 3.5;

export const NPC_CENTER = new Vector3(0, 0, 0);

export const NPC_A_POS: [number, number, number] = [-1.7, 0, 0];
export const NPC_B_POS: [number, number, number] = [1.7, 0, 0];

export const CAMERA = {
  walkOffset: new Vector3(0, 5.8, 9.5),
  walkLookHeight: 1.1,
  cinematicPos: new Vector3(4.6, 2.7, 5.2),
  cinematicTarget: new Vector3(0, 1.25, 0),
  smooth: 4.5,
};

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const OBSTACLES: AABB[] = [
  { minX: -1.1, maxX: 1.1, minZ: -0.7, maxZ: 0.7 },
  { minX: -2.5, maxX: -1.9, minZ: -0.55, maxZ: 0.55 },
  { minX: 1.9, maxX: 2.5, minZ: -0.55, maxZ: 0.55 },
  { minX: -8.1, maxX: -6.9, minZ: 6.9, maxZ: 9.1 },
  { minX: 6.9, maxX: 8.1, minZ: -8.6, maxZ: -6.4 },
  { minX: -9.1, maxX: -6.9, minZ: -8.6, maxZ: -6.4 },
];
