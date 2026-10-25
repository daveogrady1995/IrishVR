import { SHOP } from "./constants";

export interface ShelfSlot {
  x: number;
  y: number;
  z: number;
  // Where a customer stands to reach this slot, and the yaw that faces the shelf.
  standX: number;
  yaw: number;
  // Rotation that turns the product to face into the room.
  productYaw: number;
}

export const SHELF_UNIT = { zMin: -1.3, zMax: 5.2, boards: [0.5, 1.3] };

// Items 0-6 stock the west wall and 7-13 the east wall, four on the lower board and three above.
export const SHELF_SLOTS: ShelfSlot[] = Array.from({ length: 14 }, (_, id) => {
  const side = id < 7 ? -1 : 1;
  const k = id % 7;
  const lower = k < 4;
  return {
    x: side * (SHOP.halfWidth - 0.5),
    y: SHELF_UNIT.boards[lower ? 0 : 1] + 0.03,
    z: lower ? -0.5 + k * 1.5 : 0.25 + (k - 4) * 1.5,
    standX: side * (SHOP.halfWidth - 1.9),
    yaw: side < 0 ? -Math.PI / 2 : Math.PI / 2,
    productYaw: side < 0 ? Math.PI / 2 : -Math.PI / 2,
  };
});
