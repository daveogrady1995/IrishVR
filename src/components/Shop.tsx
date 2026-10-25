import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  ROOM,
  SHOP,
  SHOP_EXIT,
  SHOP_WINDOWS,
  STREET_DOOR,
} from "@/game/constants";
import { SHOP_ITEMS } from "@/game/shopData";
import { SHELF_SLOTS, SHELF_UNIT } from "@/game/shopLayout";
import { useShop, type Customer as CustomerData } from "@/game/shopStore";
import { Character } from "./Character";
import { WallDoor, signTexture } from "./WallDoor";

const WALL = "#f1e6cf";
const WALL_H = SHOP.wallHeight;
const modelUrl = (file: string) => `/models/food/${file}.glb`;
SHOP_ITEMS.forEach((item) => useGLTF.preload(modelUrl(item.model)));

// Real Kenney Food Kit (CC0) model, scaled so its largest side equals `size` and sat on y = 0.
function Product({
  file,
  size,
  position,
  rotationY = 0,
}: {
  file: string;
  size: number;
  position: [number, number, number];
  rotationY?: number;
}) {
  const { scene } = useGLTF(modelUrl(file));
  const clone = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    const box = new THREE.Box3().setFromObject(root);
    const dims = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const k = size / Math.max(dims.x, dims.y, dims.z, 0.001);
    const wrapper = new THREE.Group();
    root.position.set(-centre.x, -box.min.y, -centre.z);
    wrapper.add(root);
    wrapper.scale.setScalar(k);
    return wrapper;
  }, [scene, size]);

  return <primitive object={clone} position={position} rotation={[0, rotationY, 0]} />;
}

interface Opening {
  x: number;
  halfWidth: number;
  y0: number;
  y1: number;
}

// Wall along local x, from -length/2 to length/2, with rectangular openings cut out.
function OpeningWall({
  length,
  openings,
}: {
  length: number;
  openings: Opening[];
}) {
  const pieces = useMemo(() => {
    const out: { x: number; w: number; y: number; h: number }[] = [];
    let cursor = -length / 2;
    for (const o of [...openings].sort((a, b) => a.x - b.x)) {
      const a = o.x - o.halfWidth;
      if (a > cursor) out.push({ x: (cursor + a) / 2, w: a - cursor, y: 0, h: WALL_H });
      if (o.y0 > 0) out.push({ x: o.x, w: o.halfWidth * 2, y: 0, h: o.y0 });
      if (o.y1 < WALL_H) out.push({ x: o.x, w: o.halfWidth * 2, y: o.y1, h: WALL_H - o.y1 });
      cursor = o.x + o.halfWidth;
    }
    if (cursor < length / 2) {
      out.push({ x: (cursor + length / 2) / 2, w: length / 2 - cursor, y: 0, h: WALL_H });
    }
    return out;
  }, [length, openings]);

  return (
    <group>
      {pieces.map((p, i) => (
        <mesh key={i} position={[p.x, p.y + p.h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[p.w, p.h, ROOM.wallThickness]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

const frameMat = { color: "#2a1a0e", roughness: 0.5 } as const;

function WindowPane({ x, halfWidth, y0, y1 }: Opening) {
  const w = halfWidth * 2;
  const h = y1 - y0;
  const cy = (y0 + y1) / 2;
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, cy, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          color="#bfe6ff"
          transparent
          opacity={0.16}
          roughness={0.05}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>
      {[y0, y1].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[w + 0.16, 0.1, 0.3]} />
          <meshStandardMaterial {...frameMat} />
        </mesh>
      ))}
      {[-halfWidth, halfWidth].map((dx) => (
        <mesh key={dx} position={[dx, cy, 0]}>
          <boxGeometry args={[0.1, h, 0.3]} />
          <meshStandardMaterial {...frameMat} />
        </mesh>
      ))}
      <mesh position={[0, cy, 0]}>
        <boxGeometry args={[0.05, h, 0.12]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
      <mesh position={[0, y0 - 0.03, 0.25]}>
        <boxGeometry args={[w + 0.3, 0.06, 0.4]} />
        <meshStandardMaterial color="#d9c7a3" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Last known customer position, so the street door can swing open as they approach.
const customerPos = new THREE.Vector3(0, 0, 99);

function StreetDoor() {
  const leaf = useRef<THREE.Group>(null);
  const open = useRef(0);
  const sign = useMemo(() => signTexture("OSCAILTE", "#1f6b4a"), []);
  useEffect(() => () => sign.dispose(), [sign]);
  const { x, halfWidth, height } = STREET_DOOR;

  useFrame((_, delta) => {
    const near =
      Math.abs(customerPos.x - x) < 1.6 &&
      customerPos.z > 4.5 &&
      customerPos.z < SHOP.halfDepth + 2.5;
    open.current = THREE.MathUtils.damp(open.current, near ? 1.5 : 0, 6, delta);
    if (leaf.current) leaf.current.rotation.y = open.current;
  });

  return (
    <group position={[x, 0, 0]}>
      {[-halfWidth - 0.06, halfWidth + 0.06].map((dx) => (
        <mesh key={dx} position={[dx, height / 2, 0]}>
          <boxGeometry args={[0.12, height, 0.3]} />
          <meshStandardMaterial {...frameMat} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.06, 0]}>
        <boxGeometry args={[halfWidth * 2 + 0.24, 0.12, 0.3]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
      <group ref={leaf} position={[-halfWidth, 0, 0]}>
        <mesh position={[halfWidth, height / 2, 0]}>
          <boxGeometry args={[halfWidth * 2, height, 0.05]} />
          <meshStandardMaterial
            color="#bfe6ff"
            transparent
            opacity={0.22}
            roughness={0.05}
            depthWrite={false}
          />
        </mesh>
        {[0.04, height - 0.04].map((y) => (
          <mesh key={y} position={[halfWidth, y, 0]}>
            <boxGeometry args={[halfWidth * 2, 0.08, 0.08]} />
            <meshStandardMaterial {...frameMat} />
          </mesh>
        ))}
        <mesh position={[halfWidth * 2 - 0.08, 1.1, 0]}>
          <boxGeometry args={[0.04, 0.5, 0.1]} />
          <meshStandardMaterial color="#d8b25a" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[halfWidth, 1.7, -0.04]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.8, 0.25]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function facadeTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#3a3340";
  ctx.fillRect(0, 0, 128, 256);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.fillStyle = Math.random() < 0.55 ? "#ffd98a" : "#1d2030";
      ctx.fillRect(14 + col * 38, 14 + row * 30, 24, 18);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function skyTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#141a3a");
  g.addColorStop(0.7, "#7a5a8a");
  g.addColorStop(1, "#f0a070");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const BUILDINGS = [
  { x: -26, w: 7, h: 11, c: "#8b5e5e" },
  { x: -18, w: 8, h: 8, c: "#5e7a8b" },
  { x: -9, w: 7, h: 12, c: "#7a6a4f" },
  { x: 0, w: 8, h: 9, c: "#6a5e8b" },
  { x: 9, w: 7, h: 11, c: "#5e8b6f" },
  { x: 17, w: 8, h: 8, c: "#8b7a5e" },
  { x: 26, w: 7, h: 12, c: "#7a5e6a" },
];

// What you see through the windows: pavement, road, a row of buildings and a dusk sky.
function Street() {
  const facade = useMemo(facadeTexture, []);
  const sky = useMemo(skyTexture, []);
  useEffect(
    () => () => {
      facade.dispose();
      sky.dispose();
    },
    [facade, sky],
  );

  return (
    <group>
      <mesh position={[0, 40, 70]}>
        <planeGeometry args={[220, 100]} />
        <meshBasicMaterial map={sky} fog={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 30]}>
        <planeGeometry args={[220, 80]} />
        <meshStandardMaterial color="#2b2b2e" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 10]}>
        <planeGeometry args={[220, 4]} />
        <meshStandardMaterial color="#8a8a86" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 21]}>
        <planeGeometry args={[220, 4]} />
        <meshStandardMaterial color="#8a8a86" roughness={0.9} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-26 + i * 4, 0.015, 15.5]}>
          <planeGeometry args={[2, 0.2]} />
          <meshBasicMaterial color="#d8d27a" />
        </mesh>
      ))}
      {BUILDINGS.map((b) => (
        <mesh key={b.x} position={[b.x, b.h / 2, 28]}>
          <boxGeometry args={[b.w, b.h, 6]} />
          <meshBasicMaterial map={facade} color={b.c} fog={false} />
        </mesh>
      ))}
      {[-9, 6].map((x) => (
        <group key={x} position={[x, 0, 8.9]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 4, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 4.05, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshBasicMaterial color="#ffe9b0" toneMapped={false} />
          </mesh>
          <pointLight position={[0, 3.8, -0.5]} intensity={6} distance={9} color="#ffd9a0" />
        </group>
      ))}
    </group>
  );
}

function Shelves() {
  const { halfWidth: sw, halfDepth: sd } = SHOP;
  const boards = [0.5, 1.25, 2.0];
  return (
    <group position={[0, 0, -sd + 0.4]}>
      <mesh position={[0, 1.3, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[sw * 2 - 0.4, 2.7, 0.1]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.8} />
      </mesh>
      {boards.map((y, row) => (
        <group key={y}>
          <mesh position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[sw * 2 - 0.4, 0.06, 0.6]} />
            <meshStandardMaterial color="#8a6137" roughness={0.8} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const item = SHOP_ITEMS[(row * 5 + i * 2) % SHOP_ITEMS.length];
            return (
              <Product
                key={i}
                file={item.model}
                size={item.size}
                position={[-5.4 + i * 1.8, y + 0.03, 0]}
                rotationY={(i + row) * 0.7}
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}

// Customer-side shelving along both side walls. Items disappear as the customer takes them.
function WallShelves() {
  const picked = useShop((s) => s.picked);
  const length = SHELF_UNIT.zMax - SHELF_UNIT.zMin;
  const centreZ = (SHELF_UNIT.zMax + SHELF_UNIT.zMin) / 2;
  const wood = { color: "#8a6137", roughness: 0.8 } as const;

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * (SHOP.halfWidth - 0.12), 1.1, centreZ]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 2.2, length]} />
            <meshStandardMaterial color="#6b4a2f" roughness={0.8} />
          </mesh>
          {[SHELF_UNIT.zMin, SHELF_UNIT.zMax].map((z) => (
            <mesh key={z} position={[side * (SHOP.halfWidth - 0.45), 1.1, z]} castShadow>
              <boxGeometry args={[0.6, 2.2, 0.08]} />
              <meshStandardMaterial {...wood} />
            </mesh>
          ))}
          {[...SHELF_UNIT.boards, 2.15].map((y) => (
            <mesh key={y} position={[side * (SHOP.halfWidth - 0.45), y, centreZ]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.06, length]} />
              <meshStandardMaterial {...wood} />
            </mesh>
          ))}
        </group>
      ))}
      {SHELF_SLOTS.map((slot, id) =>
        [-0.3, 0.3].map((dz, copy) =>
          copy === 0 && picked.includes(id) ? null : (
            <Product
              key={`${id}-${copy}`}
              file={SHOP_ITEMS[id].model}
              size={SHOP_ITEMS[id].size}
              position={[slot.x, slot.y, slot.z + dz]}
              rotationY={slot.productYaw}
            />
          ),
        ),
      )}
    </group>
  );
}

// Wicker basket holding whatever the customer has picked up.
function Basket({ ids }: { ids: number[] }) {
  const wicker = { color: "#b98a4b", roughness: 0.9 } as const;
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.5, 0.04, 0.34]} />
        <meshStandardMaterial {...wicker} />
      </mesh>
      {[-0.17, 0.17].map((z) => (
        <mesh key={z} position={[0, 0.12, z]} castShadow>
          <boxGeometry args={[0.5, 0.2, 0.03]} />
          <meshStandardMaterial {...wicker} />
        </mesh>
      ))}
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]} castShadow>
          <boxGeometry args={[0.03, 0.2, 0.34]} />
          <meshStandardMaterial {...wicker} />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 0]}>
        <torusGeometry args={[0.2, 0.014, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#8a6137" roughness={0.8} />
      </mesh>
      {ids.map((id, i) => (
        <Product
          key={`${id}-${i}`}
          file={SHOP_ITEMS[id].model}
          size={Math.min(SHOP_ITEMS[id].size, 0.24)}
          position={[-0.12 + i * 0.24, 0.04, 0]}
          rotationY={i * 0.8}
        />
      ))}
    </group>
  );
}

// While the customer is being served, their basket sits on the counter.
function CounterBasket() {
  const phase = useShop((s) => s.phase);
  const picked = useShop((s) => s.picked);
  const onCounter = phase === "greet" || phase === "order" || phase === "price" || phase === "pay";
  if (!onCounter) return null;
  return (
    <group position={[-1.0, 1.06, SHOP.counterZ + 0.15]} scale={1.5}>
      <Basket ids={picked} />
    </group>
  );
}

function Counter() {
  return (
    <group position={[0, 0, SHOP.counterZ]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 1, 1]} />
        <meshStandardMaterial color="#7a4a24" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.03, 0]} castShadow>
        <boxGeometry args={[6.2, 0.06, 1.2]} />
        <meshStandardMaterial color="#d9c7a3" roughness={0.5} />
      </mesh>
      <mesh position={[2.2, 1.2, -0.1]} castShadow>
        <boxGeometry args={[0.7, 0.28, 0.5]} />
        <meshStandardMaterial color="#2c3a46" roughness={0.4} />
      </mesh>
      <mesh position={[2.2, 1.45, -0.2]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.5, 0.25, 0.04]} />
        <meshStandardMaterial color="#7fe0c3" emissive="#2cc3ae" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

interface Step {
  x: number;
  z: number;
  yaw?: number;
  // Shelf item taken on arriving at this step.
  pick?: number;
}

const START: [number, number] = [-12, SHOP.streetZ];
const WALK_SPEED = 2.2;
const PICK_TIME = 0.9;

function arriveRoute(order: number[]): Step[] {
  return [
    { x: STREET_DOOR.x, z: SHOP.streetZ },
    { x: STREET_DOOR.x, z: 5.5 },
    ...order.map((id) => ({
      x: SHELF_SLOTS[id].standX,
      z: SHELF_SLOTS[id].z,
      yaw: SHELF_SLOTS[id].yaw,
      pick: id,
    })),
    { x: 0, z: SHOP.customerZ },
  ];
}

const LEAVE_ROUTE: Step[] = [
  { x: STREET_DOOR.x, z: 5.5 },
  { x: STREET_DOOR.x, z: SHOP.streetZ },
  { x: -14, z: SHOP.streetZ },
];

const turnToward = (current: number, target: number, rate: number) => {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * rate;
};

// Customer who walks in from the street, collects their items in a basket, pays at the counter and leaves.
function CustomerFigure({ customer }: { customer: CustomerData }) {
  const group = useRef<THREE.Group>(null);
  const waypoint = useRef(0);
  const pauseTime = useRef(0);
  const route = useRef<"arrive" | "leave">("arrive");
  const steps = useMemo(() => arriveRoute(customer.order), [customer.order]);
  const [walking, setWalking] = useState(true);
  const phase = useShop((s) => s.phase);
  const picked = useShop((s) => s.picked);
  const speaking = phase === "greet" || phase === "order" || phase === "price" || phase === "pay";
  const holdingBasket = phase === "arriving" || phase === "leaving";

  useLayoutEffect(() => {
    group.current?.position.set(START[0], 0, START[1]);
    return () => {
      customerPos.set(0, 0, 99);
    };
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const store = useShop.getState();
    if (store.phase === "leaving" && route.current !== "leave") {
      route.current = "leave";
      waypoint.current = 0;
    }
    const path = route.current === "arrive" ? steps : LEAVE_ROUTE;
    const travelling = store.phase === "arriving" || store.phase === "leaving";

    let isWalking = false;
    let targetYaw = Math.PI;
    if (travelling && waypoint.current < path.length) {
      const step = path[waypoint.current];
      const dx = step.x - g.position.x;
      const dz = step.z - g.position.z;
      const dist = Math.hypot(dx, dz);
      let advance = false;
      if (dist < 0.05) {
        if (step.pick !== undefined) {
          targetYaw = step.yaw ?? targetYaw;
          pauseTime.current += dt;
          if (pauseTime.current >= PICK_TIME) {
            store.pickItem(step.pick);
            pauseTime.current = 0;
            advance = true;
          }
        } else {
          advance = true;
        }
      } else {
        const move = Math.min(dist, WALK_SPEED * dt);
        g.position.x += (dx / dist) * move;
        g.position.z += (dz / dist) * move;
        targetYaw = Math.atan2(dx, dz);
        isWalking = true;
      }
      if (advance) {
        waypoint.current += 1;
        if (waypoint.current >= path.length) {
          if (store.phase === "arriving") store.arrived();
          else store.nextCustomer();
        }
      }
    }

    g.rotation.y = turnToward(g.rotation.y, targetYaw, Math.min(1, dt * 8));
    customerPos.copy(g.position);
    if (isWalking !== walking) setWalking(isWalking);
  });

  return (
    <group ref={group}>
      <Character
        bodyColor={customer.body}
        hairColor={customer.hair}
        skinColor={customer.skin}
        pantsColor={customer.pants}
        walking={walking}
        speaking={!walking && speaking}
      />
      {holdingBasket && (
        <group position={[0.5, 0.62, 0.1]}>
          <Basket ids={picked} />
        </group>
      )}
    </group>
  );
}

function ActiveCustomer() {
  const customer = useShop((s) => s.customer);
  return customer ? <CustomerFigure key={customer.id} customer={customer} /> : null;
}

export function Shop() {
  const { halfWidth: sw, halfDepth: sd } = SHOP;
  const sideWall = (x: number) => (
    <mesh position={[x, WALL_H / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[ROOM.wallThickness, WALL_H, sd * 2]} />
      <meshStandardMaterial color={WALL} roughness={0.95} />
    </mesh>
  );
  const frontOpenings: Opening[] = useMemo(
    () => [
      { x: STREET_DOOR.x, halfWidth: STREET_DOOR.halfWidth, y0: 0, y1: STREET_DOOR.height },
      ...SHOP_WINDOWS,
    ],
    [],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[sw * 2, sd * 2]} />
        <meshStandardMaterial color="#b9a688" roughness={0.9} />
      </mesh>
      <mesh position={[0, WALL_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[sw * 2, sd * 2]} />
        <meshStandardMaterial color="#f2ece1" roughness={1} />
      </mesh>

      <mesh position={[0, WALL_H / 2, -sd]} castShadow receiveShadow>
        <boxGeometry args={[sw * 2, WALL_H, ROOM.wallThickness]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {sideWall(-sw)}
      {sideWall(sw)}

      {/* Street-facing front wall with the customers' door and windows */}
      <group position={[0, 0, sd]}>
        <OpeningWall length={sw * 2} openings={frontOpenings} />
        <StreetDoor />
        {SHOP_WINDOWS.map((w) => (
          <WindowPane key={w.x} {...w} />
        ))}
      </group>

      {/* Door back to the lounge */}
      <WallDoor
        position={[sw - 0.12, 0, SHOP_EXIT.z]}
        rotationY={-Math.PI / 2}
        label="← LOBBY"
      />

      <Suspense fallback={null}>
        <Shelves />
        <WallShelves />
        <CounterBasket />
      </Suspense>
      <Counter />
      <Street />
      <Suspense fallback={null}>
        <ActiveCustomer />
      </Suspense>

      <pointLight position={[0, 3.2, 0]} intensity={12} distance={16} color="#fff0d4" />
      <pointLight position={[0, 3.2, -5]} intensity={8} distance={10} color="#fff0d4" />
    </group>
  );
}
