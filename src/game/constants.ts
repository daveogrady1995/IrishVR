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

// How close to the door (along z) and how central (along x) the player must be to use it.
export const DOOR_REACH = { z: 1.8, x: 2.2 };

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
  // closed door filling the doorway
  { minX: -DOOR.halfWidth, maxX: DOOR.halfWidth, minZ: -H - T, maxZ: -H + T },
];

// The shop is only mounted while the player is inside it, so it reuses the lounge's world space.
// The front wall (z = +halfDepth) faces the street; customers come in through STREET_DOOR.
export const SHOP = {
  halfWidth: 7,
  halfDepth: 8,
  counterZ: -4.6,
  customerZ: -3.4,
  // Pavement outside the front wall, where customers walk in from.
  streetZ: 10,
  wallHeight: 4,
};
export const STREET_DOOR = { x: -2.6, halfWidth: 1.1, height: 2.6 };
export const SHOP_WINDOWS = [
  { x: 2.4, halfWidth: 1.8, y0: 0.9, y1: 2.7 },
  { x: 5.4, halfWidth: 0.9, y0: 0.9, y1: 2.7 },
  { x: -5.6, halfWidth: 0.9, y0: 0.9, y1: 2.7 },
];
// Door back to the lounge on the shop's east wall, and the matching door in the lounge's east wall.
export const SHOP_EXIT = { z: -6.2 };
export const SHOP_DOOR = { z: -3.5 };

const SW = SHOP.halfWidth;
const SD = SHOP.halfDepth;
export const SHOP_COLLIDERS: AABB[] = [
  { minX: -SW - T, maxX: SW + T, minZ: -SD - T, maxZ: -SD + T },
  { minX: -SW - T, maxX: SW + T, minZ: SD - T, maxZ: SD + T },
  { minX: -SW - T, maxX: -SW + T, minZ: -SD, maxZ: SD },
  { minX: SW - T, maxX: SW + T, minZ: -SD, maxZ: SD },
  // counter
  { minX: -3, maxX: 3, minZ: SHOP.counterZ - 0.5, maxZ: SHOP.counterZ + 0.5 },
  // customer shelves along both side walls
  { minX: -SW, maxX: -SW + 0.9, minZ: -1.4, maxZ: 5.3 },
  { minX: SW - 0.9, maxX: SW, minZ: -1.4, maxZ: 5.3 },
  // back shelves
  { minX: -SW, maxX: SW, minZ: -SD, maxZ: -SD + 0.7 },
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

export interface SpectatorConfig {
  seat: number;
  shirt: string;
  hair: string;
  skin: string;
  snack: "popcorn" | "drink" | "none";
}

const seatAt = (row: number, side: -1 | 1, col: number) =>
  row * SEAT_COLUMNS * 2 + (side === 1 ? SEAT_COLUMNS : 0) + col;

const MAYO_GREEN = "#0a6b2b";
const MAYO_RED = "#c80000";

// People already watching when you arrive.
export const SPECTATORS: SpectatorConfig[] = [
  {
    seat: seatAt(1, -1, 3),
    shirt: MAYO_GREEN,
    hair: "#2a2520",
    skin: "#e8b896",
    snack: "popcorn",
  },
  {
    seat: seatAt(1, 1, 5),
    shirt: "#3b5b92",
    hair: "#b5651d",
    skin: "#f1c9a5",
    snack: "drink",
  },
  {
    seat: seatAt(2, -1, 2),
    shirt: MAYO_RED,
    hair: "#7a4a21",
    skin: "#f1c9a5",
    snack: "popcorn",
  },
  {
    seat: seatAt(2, -1, 3),
    shirt: "#e2b33c",
    hair: "#16130f",
    skin: "#c68e63",
    snack: "popcorn",
  },
  {
    seat: seatAt(2, 1, 1),
    shirt: "#6d4f3a",
    hair: "#cfcfcf",
    skin: "#e8b896",
    snack: "none",
  },
  {
    seat: seatAt(3, -1, 5),
    shirt: MAYO_GREEN,
    hair: "#b5651d",
    skin: "#f1c9a5",
    snack: "popcorn",
  },
  {
    seat: seatAt(3, 1, 3),
    shirt: "#0fa391",
    hair: "#2a2520",
    skin: "#8d5a3b",
    snack: "popcorn",
  },
  {
    seat: seatAt(3, 1, 4),
    shirt: MAYO_RED,
    hair: "#16130f",
    skin: "#e8b896",
    snack: "drink",
  },
  {
    seat: seatAt(4, -1, 1),
    shirt: "#594033",
    hair: "#7a4a21",
    skin: "#e8b896",
    snack: "none",
  },
  {
    seat: seatAt(4, 1, 6),
    shirt: MAYO_GREEN,
    hair: "#2a2520",
    skin: "#c68e63",
    snack: "popcorn",
  },
  {
    seat: seatAt(5, -1, 4),
    shirt: "#a83279",
    hair: "#cfcfcf",
    skin: "#f1c9a5",
    snack: "popcorn",
  },
];

export const OCCUPIED_SEATS = new Set(SPECTATORS.map((s) => s.seat));
