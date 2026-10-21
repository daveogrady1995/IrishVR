import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Character } from "./Character";
import { getMoveVector, input } from "@/game/input";
import { resolveCollision } from "@/game/collision";
import { PLAYER, CAMERA, ROOM, SEATS } from "@/game/constants";
import { useGame } from "@/game/store";
import { findNearSeat } from "@/game/seats";
import { publishPosition } from "@/game/multiplayer";

const _look = new THREE.Vector3();
const _cinematicPos = new THREE.Vector3();
const EYE_HEIGHT = 1.65;
const SEATED_EYE_HEIGHT = 1.25;
// Corridor between seat rows, in front of the seat.
const STAND_OFFSET_Z = -1.2;

export function Player() {
  const group = useRef<THREE.Group>(null);
  const facing = useRef(0);
  const eye = useRef(EYE_HEIGHT);
  const prevSeat = useRef<number | null>(null);
  const { camera, gl } = useThree();
  const cameraMode = useGame((s) => s.cameraMode);
  const camMode = useRef(cameraMode);
  camMode.current = cameraMode;

  // Click canvas to enter pointer-lock (first-person look)
  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => {
      if (!document.pointerLockElement && camMode.current === "walk") {
        canvas.requestPointerLock();
      }
    };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [gl]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);

    const mv = getMoveVector();
    const moving = mv.x !== 0 || mv.y !== 0;
    const store = useGame.getState();
    const seatId = store.seatId;

    if (seatId !== null) {
      const seat = SEATS[seatId];
      if (moving) store.stand();
      const k = Math.min(1, dt * 8);
      g.position.x += (seat.x - g.position.x) * k;
      g.position.z += (seat.z - g.position.z) * k;
      eye.current += (SEATED_EYE_HEIGHT - eye.current) * k;
      if (prevSeat.current === null) {
        input.cameraYaw = 0;
        input.cameraPitch = 0.3;
      }
    } else {
      if (prevSeat.current !== null) {
        const seat = SEATS[prevSeat.current];
        g.position.set(seat.x, g.position.y, seat.z + STAND_OFFSET_Z);
      }
      eye.current += (EYE_HEIGHT - eye.current) * Math.min(1, dt * 8);

      if (moving) {
        const dist = PLAYER.speed * dt;
        const nx = g.position.x + mv.x * dist;
        const nz = g.position.z + mv.y * dist;
        const [rx, rz] = resolveCollision(nx, nz);
        g.position.x = rx;
        g.position.z = rz;
      }
    }
    prevSeat.current = seatId;

    const inCinema = g.position.z < -ROOM.half;
    store.setInCinema(inCinema);
    store.setNearSeat(
      inCinema && seatId === null
        ? findNearSeat(g.position.x, g.position.z, input.cameraYaw)
        : null,
    );

    if (camMode.current === "walk" || seatId !== null) {
      // First-person: body faces camera yaw, camera snaps to eye position
      facing.current = input.cameraYaw;
      g.rotation.y = facing.current;

      camera.position.set(
        g.position.x,
        g.position.y + eye.current,
        g.position.z,
      );
      _look.set(
        g.position.x - Math.sin(input.cameraYaw) * Math.cos(input.cameraPitch),
        g.position.y + eye.current + Math.sin(input.cameraPitch),
        g.position.z - Math.cos(input.cameraYaw) * Math.cos(input.cameraPitch),
      );
      camera.lookAt(_look);
    } else {
      // Cinematic: smooth character turning toward movement direction
      if (moving) {
        const targetAngle = Math.atan2(mv.x, mv.y);
        let diff = targetAngle - facing.current;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        facing.current += diff * Math.min(1, dt * 12);
      }
      g.rotation.y = facing.current;

      _cinematicPos.copy(CAMERA.cinematicPos);
      camera.position.lerp(
        _cinematicPos,
        Math.min(1, dt * CAMERA.smooth * 0.8),
      );
      camera.lookAt(CAMERA.cinematicTarget);
    }

    // +PI because character body faces opposite to camera direction
    publishPosition(g.position.x, g.position.z, facing.current + Math.PI);
  });

  return (
    <group ref={group} name="player-group" position={[0, 0, 6]}>
      {/* Only render body in cinematic mode — first-person has no visible self */}
      {cameraMode === "cinematic" && (
        <Character
          bodyColor="#0fa391"
          hairColor="#2a2520"
          skinColor="#e8b896"
          pantsColor="#2a2520"
          facing={0}
        />
      )}
    </group>
  );
}
