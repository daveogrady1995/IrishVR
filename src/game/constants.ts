import { Vector3 } from "three";

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

export const DOOR = {
  halfWidth: 1.2,
  height: 2.8,
};

// Cinema sits directly behind the lounge's back wall (z = -half).
const CINEMA_DEPTH = 30;
const SCREEN_WIDTH = 15;
export const CINEMA = {
  halfWidth: 14,
  depth: CINEMA_DEPTH,
  height: 12,
  frontZ: -ROOM.half,
  backZ: -ROOM.half - CINEMA_DEPTH,
  screenWidth: SCREEN_WIDTH,
  screenHeight: (SCREEN_WIDTH * 9) / 16,
  screenBottom: 1.8,
};

const T = ROOM.wallThickness / 2;
const H = ROOM.half;
const CW = CINEMA.halfWidth;
export const WORLD_MIN_Z = CINEMA.backZ;
export const WORLD_MAX_Z = H;

export const WALLS: AABB[] = [
  // lounge front
  { minX: -H - T, maxX: H + T, minZ: H - T, maxZ: H + T },
  // shared wall, split around the doorway and extended across the wider cinema
  { minX: -CW - T, maxX: -DOOR.halfWidth, minZ: -H - T, maxZ: -H + T },
  { minX: DOOR.halfWidth, maxX: CW + T, minZ: -H - T, maxZ: -H + T },
  // lounge side walls
  { minX: -H - T, maxX: -H + T, minZ: -H, maxZ: H + T },
  { minX: H - T, maxX: H + T, minZ: -H, maxZ: H + T },
  // cinema side walls
  { minX: -CW - T, maxX: -CW + T, minZ: WORLD_MIN_Z - T, maxZ: -H },
  { minX: CW - T, maxX: CW + T, minZ: WORLD_MIN_Z - T, maxZ: -H },
  // cinema back wall
  { minX: -CW - T, maxX: CW + T, minZ: WORLD_MIN_Z - T, maxZ: WORLD_MIN_Z + T },
  // open door leaves, swung into the cinema
  {
    minX: -DOOR.halfWidth - 0.05,
    maxX: -DOOR.halfWidth + 0.05,
    minZ: -H - DOOR.halfWidth,
    maxZ: -H,
  },
  {
    minX: DOOR.halfWidth - 0.05,
    maxX: DOOR.halfWidth + 0.05,
    minZ: -H - DOOR.halfWidth,
    maxZ: -H,
  },
];

export const OBSTACLES: AABB[] = [
  { minX: -1.1, maxX: 1.1, minZ: -0.7, maxZ: 0.7 },
  { minX: -2.5, maxX: -1.9, minZ: -0.55, maxZ: 0.55 },
  { minX: 1.9, maxX: 2.5, minZ: -0.55, maxZ: 0.55 },
  { minX: -8.1, maxX: -6.9, minZ: 6.9, maxZ: 9.1 },
  { minX: 6.9, maxX: 8.1, minZ: -8.6, maxZ: -6.4 },
  { minX: -9.1, maxX: -6.9, minZ: -8.6, maxZ: -6.4 },
  // cinema signpost
  { minX: -2.85, maxX: -2.35, minZ: -6.65, maxZ: -6.15 },
];

export interface Seat {
  x: number;
  z: number;
}

const SEAT_ROWS = 6;
const SEAT_COLUMNS = 8;
const SEAT_FIRST_ROW_Z = -H - 9;
export const SEAT_ROW_SPACING = 2.4;
export const SEAT_COLUMN_SPACING = 1.1;

// Two blocks of seats either side of a centre aisle, all facing the screen (-z).
export const SEATS: Seat[] = [];
for (let r = 0; r < SEAT_ROWS; r++) {
  for (const side of [-1, 1]) {
    for (let c = 0; c < SEAT_COLUMNS; c++) {
      SEATS.push({
        x: side * (1.4 + c * SEAT_COLUMN_SPACING),
        z: SEAT_FIRST_ROW_Z - r * SEAT_ROW_SPACING,
      });
    }
  }
}

export const SEAT_COLLIDERS: AABB[] = SEATS.map((s) => ({
  minX: s.x - 0.5,
  maxX: s.x + 0.5,
  minZ: s.z - 0.45,
  maxZ: s.z + 0.45,
}));
