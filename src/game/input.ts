export const input = {
  keys: new Set<string>(),
  joystick: { x: 0, y: 0, active: false },
  cameraYaw: 0,
  rightDrag: { active: false, lastX: 0 },
};

const MOVE_KEYS = new Set([
  'w', 'a', 's', 'd',
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
]);

export function setupKeyboard() {
  const down = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (MOVE_KEYS.has(k)) e.preventDefault();
    input.keys.add(k);
  };
  const up = (e: KeyboardEvent) => {
    input.keys.delete(e.key.toLowerCase());
  };
  const blur = () => input.keys.clear();

  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', blur);

  return () => {
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
    window.removeEventListener('blur', blur);
  };
}

export function setupMouseDrag() {
  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 2) return;
    input.rightDrag.active = true;
    input.rightDrag.lastX = e.clientX;
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!input.rightDrag.active) return;
    const dx = e.clientX - input.rightDrag.lastX;
    input.rightDrag.lastX = e.clientX;
    input.cameraYaw -= dx * 0.005;
  };
  const onMouseUp = (e: MouseEvent) => {
    if (e.button !== 2) return;
    input.rightDrag.active = false;
  };
  const onContext = (e: Event) => e.preventDefault();

  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('contextmenu', onContext);

  return () => {
    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('contextmenu', onContext);
  };
}

export function getMoveVector(): { x: number; y: number } {
  let x = 0;
  let y = 0;
  const k = input.keys;
  if (k.has('w') || k.has('arrowup')) y -= 1;
  if (k.has('s') || k.has('arrowdown')) y += 1;
  if (k.has('a') || k.has('arrowleft')) x -= 1;
  if (k.has('d') || k.has('arrowright')) x += 1;

  if (input.joystick.active && (input.joystick.x !== 0 || input.joystick.y !== 0)) {
    x = input.joystick.x;
    y = -input.joystick.y;
  }

  const mag = Math.hypot(x, y);
  if (mag > 1) {
    x /= mag;
    y /= mag;
  }

  // Rotate the move vector by cameraYaw so W always goes
  // where the camera is facing (Roblox-style).
  const cos = Math.cos(input.cameraYaw);
  const sin = Math.sin(input.cameraYaw);
  const rx = x * cos - y * sin;
  const ry = x * sin + y * cos;
  return { x: rx, y: ry };
}
