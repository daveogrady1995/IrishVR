import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ROOM, DOOR, CINEMA, SEATS } from "@/game/constants";
import { useGame } from "@/game/store";
import { VIDEOS } from "@/game/videos";
import { cinemaVideo } from "@/game/videoElement";
import { Spectators } from "./Spectators";
import { Door } from "./Door";

const GLOW = "#2cc3ae";
const WALL_COLOR = "#14301f";

function textTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  draw(c.getContext("2d")!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function CinemaSigns() {
  const doorSign = useMemo(
    () =>
      textTexture(512, 160, (ctx) => {
        ctx.fillStyle = "#0b1a14";
        ctx.fillRect(0, 0, 512, 160);
        ctx.strokeStyle = GLOW;
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, 496, 144);
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 84px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★ CINEMA ★", 256, 86);
      }),
    [],
  );
  const postSign = useMemo(
    () =>
      textTexture(512, 160, (ctx) => {
        ctx.fillStyle = "#14301f";
        ctx.fillRect(0, 0, 512, 160);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, 496, 144);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("↑ CINEMA", 256, 86);
      }),
    [],
  );

  useEffect(
    () => () => {
      doorSign.dispose();
      postSign.dispose();
    },
    [doorSign, postSign],
  );

  return (
    <>
      {/* Sign above the doorway, lounge side */}
      <mesh position={[0, 3.4, -ROOM.half + 0.14]}>
        <planeGeometry args={[2.3, 0.72]} />
        <meshBasicMaterial map={doorSign} toneMapped={false} />
      </mesh>

      {/* Signpost on the lounge floor */}
      <group position={[-2.6, 0, -6.4]}>
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.08, 20]} />
          <meshStandardMaterial color="#4b372c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 12]} />
          <meshStandardMaterial color="#4b372c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.1, 0]} castShadow>
          <boxGeometry args={[1.5, 0.5, 0.06]} />
          <meshStandardMaterial color="#1a0e05" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.1, 0.04]}>
          <planeGeometry args={[1.4, 0.44]} />
          <meshBasicMaterial map={postSign} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

function Seats() {
  const base = useRef<THREE.InstancedMesh>(null);
  const cushion = useRef<THREE.InstancedMesh>(null);
  const back = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    SEATS.forEach((s, i) => {
      base.current!.setMatrixAt(i, m.makeTranslation(s.x, 0.22, s.z));
      cushion.current!.setMatrixAt(i, m.makeTranslation(s.x, 0.5, s.z - 0.02));
      back.current!.setMatrixAt(i, m.makeTranslation(s.x, 0.95, s.z + 0.36));
    });
    for (const ref of [base, cushion, back]) {
      ref.current!.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <>
      <instancedMesh
        ref={base}
        args={[undefined, undefined, SEATS.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.9, 0.44, 0.78]} />
        <meshStandardMaterial color="#2a0c0c" roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={cushion}
        args={[undefined, undefined, SEATS.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.96, 0.14, 0.82]} />
        <meshStandardMaterial color="#8c1c1c" roughness={0.85} />
      </instancedMesh>
      <instancedMesh
        ref={back}
        args={[undefined, undefined, SEATS.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.96, 0.9, 0.16]} />
        <meshStandardMaterial color="#8c1c1c" roughness={0.85} />
      </instancedMesh>
    </>
  );
}

function CinemaScreen() {
  const {
    screenWidth: sw,
    screenHeight: sh,
    screenBottom,
    backZ,
    height,
  } = CINEMA;
  const centerY = screenBottom + sh / 2;
  const videoIndex = useGame((s) => s.videoIndex);
  const playing = useGame((s) => s.videoPlaying);
  const inCinema = useGame((s) => s.inCinema);
  const [live, setLive] = useState(false);
  const [aspect, setAspect] = useState(sw / sh);
  const loadedUrl = useRef<string | null>(null);

  const video = useMemo(() => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.playsInline = true;
    v.preload = "auto";
    v.loop = VIDEOS.length === 1;
    return v;
  }, []);

  // Created in an effect: VideoTexture.dispose() cancels its frame callback for good,
  // so a memoised texture would stay frozen after React StrictMode re-runs effects.
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(
    null,
  );
  useEffect(() => {
    const t = new THREE.VideoTexture(video);
    t.colorSpace = THREE.SRGBColorSpace;
    setVideoTexture(t);
    return () => t.dispose();
  }, [video]);

  const idleTexture = useMemo(
    () =>
      textTexture(1024, 576, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 576);
        g.addColorStop(0, "#0b2a18");
        g.addColorStop(1, "#041208");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 1024, 576);
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd700";
        ctx.font = "56px serif";
        ctx.fillText("★   ★   ★", 512, 150);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 110px Arial";
        ctx.fillText("IRISH CINEMA", 512, 290);
        ctx.fillStyle = "#2cc3ae";
        ctx.font = "36px Arial";
        ctx.fillText(
          VIDEOS.length
            ? "Take a seat and enjoy the show"
            : "Add videos to src/assets/videos to get started",
          512,
          400,
        );
      }),
    [],
  );

  useEffect(() => {
    const onPlaying = () => setLive(true);
    const onMeta = () => {
      if (video.videoWidth && video.videoHeight) {
        setAspect(video.videoWidth / video.videoHeight);
      }
    };
    const onEnded = () => useGame.getState().nextVideo();
    cinemaVideo.el = video;
    video.addEventListener("playing", onPlaying);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("ended", onEnded);
    return () => {
      if (cinemaVideo.el === video) cinemaVideo.el = null;
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("ended", onEnded);
      video.pause();
      video.removeAttribute("src");
      video.load();
      loadedUrl.current = null;
      idleTexture.dispose();
    };
  }, [video, idleTexture]);

  useEffect(() => {
    const item = VIDEOS[videoIndex];
    if (!item) return;
    if (loadedUrl.current !== item.url) {
      loadedUrl.current = item.url;
      video.src = item.url;
      video.load();
    }
    if (playing) {
      // Browsers may block autoplay until the user has interacted with the page.
      video.play().catch((err) => {
        if (err?.name === "NotAllowedError") {
          useGame.setState({ videoPlaying: false });
        }
      });
    } else video.pause();
  }, [video, videoIndex, playing]);

  useEffect(() => {
    video.volume = inCinema ? 1 : 0.12;
  }, [video, inCinema]);

  // Fit the video inside the screen without stretching it.
  let w = sw;
  let h = live ? sw / aspect : sh;
  if (h > sh) {
    h = sh;
    w = sh * aspect;
  }

  return (
    <group>
      <mesh position={[0, centerY, backZ + 0.225]}>
        <boxGeometry args={[sw + 0.6, sh + 0.6, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.6} />
      </mesh>
      <mesh position={[0, centerY, backZ + 0.336]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          key={live ? "video" : "idle"}
          map={live && videoTexture ? videoTexture : idleTexture}
          toneMapped={false}
        />
      </mesh>

      {/* Curtains and valance */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (sw / 2 + 1.5), (height - 0.4) / 2, backZ + 0.375]}
        >
          <boxGeometry args={[2.2, height - 0.4, 0.5]} />
          <meshStandardMaterial color="#7a1212" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, height - 0.65, backZ + 0.45]}>
        <boxGeometry args={[sw + 8, 1.3, 0.6]} />
        <meshStandardMaterial color="#5e0d0d" roughness={0.95} />
      </mesh>

      {/* Glow cast by the screen onto the audience */}
      <pointLight
        position={[0, centerY, backZ + 5]}
        intensity={120}
        distance={28}
        decay={2}
        color="#cfe0ff"
      />
    </group>
  );
}

export function Cinema() {
  const { halfWidth: cw, depth, height, frontZ, backZ } = CINEMA;
  const { half, wallHeight, wallThickness: t } = ROOM;
  const midZ = frontZ - depth / 2;
  const panelZ = frontZ - t / 2 - 0.03;

  return (
    <group>
      {/* Carpet and ceiling */}
      <mesh
        position={[0, 0, midZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[cw * 2, depth]} />
        <meshStandardMaterial color="#3a0f12" roughness={1} />
      </mesh>
      <mesh position={[0, height, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cw * 2, depth]} />
        <meshStandardMaterial color="#0a0f0c" roughness={1} />
      </mesh>

      {/* Side and back walls */}
      {[-cw, cw].map((x) => (
        <mesh key={x} position={[x, height / 2, midZ]}>
          <boxGeometry args={[t, height, depth]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, height / 2, backZ]}>
        <boxGeometry args={[cw * 2 + t, height, t]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Front wall: structure beside and above the lounge's back wall */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * ((half + cw) / 2), height / 2, frontZ]}
        >
          <boxGeometry args={[cw - half, height, t]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, wallHeight + (height - wallHeight) / 2, frontZ]}>
        <boxGeometry args={[cw * 2, height - wallHeight, t]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Cinema-side panelling so the lounge wall colour doesn't show through */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * ((cw + DOOR.halfWidth) / 2), height / 2, panelZ]}
        >
          <boxGeometry args={[cw - DOOR.halfWidth, height, 0.06]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, DOOR.height + (height - DOOR.height) / 2, panelZ]}>
        <boxGeometry args={[DOOR.halfWidth * 2, height - DOOR.height, 0.06]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Aisle lights */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.02, midZ - 3]}>
          <boxGeometry args={[0.06, 0.02, depth - 14]} />
          <meshBasicMaterial color="#ffb347" toneMapped={false} />
        </mesh>
      ))}

      <Seats />
      <Spectators />
      <CinemaScreen />
      <Door />

      {/* Dim house lights */}
      {[-20, -32].map((z) => (
        <pointLight
          key={z}
          position={[0, height - 1, z]}
          intensity={90}
          distance={30}
          decay={2}
          color="#ffc98a"
        />
      ))}
    </group>
  );
}
