import { useEffect, useRef, useState } from "react";
import { Scene } from "@/components/Scene";
import { HUD } from "@/components/HUD";
import { Joystick } from "@/components/Joystick";
import { DialogueOverlay } from "@/components/DialogueOverlay";
import { ProximityPrompt } from "@/components/ProximityPrompt";
import { NamePrompt } from "@/components/NamePrompt";
import { ChatOverlay } from "@/components/ChatOverlay";
import { CinemaUI } from "@/components/CinemaUI";
import { CursorHint } from "@/components/CursorHint";
import { useGame } from "@/game/store";
import { setupKeyboard, setupMouseDrag, input } from "@/game/input";

function useResponsive() {
  const setIsMobile = useGame((s) => s.setIsMobile);
  useEffect(() => {
    const check = () => {
      const mobile =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        window.innerWidth < 768;
      setIsMobile(mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setIsMobile]);
}

function useListenKey() {
  const nearby = useGame((s) => s.nearby);
  const listening = useGame((s) => s.listening);
  const startListening = useGame((s) => s.startListening);
  const togglePause = useGame((s) => s.togglePause);
  const nextLine = useGame((s) => s.nextLine);
  const dialogueEnded = useGame((s) => s.dialogueEnded);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "e" && nearby && !listening) {
        startListening();
      } else if (k === " " && listening && !dialogueEnded) {
        e.preventDefault();
        togglePause();
      } else if (k === "f" && listening && !dialogueEnded) {
        nextLine();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nearby, listening, startListening, togglePause, nextLine, dialogueEnded]);
}

// Full-screen drag area for camera look on mobile; sits under the UI layer so buttons stay tappable
function TouchLook() {
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  const release = (e: React.PointerEvent) => {
    if (touch.current?.id === e.pointerId) touch.current = null;
  };
  return (
    <div
      className="pointer-events-auto absolute inset-0"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        if (touch.current) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        if (touch.current?.id !== e.pointerId) return;
        input.cameraYaw -= (e.clientX - touch.current.x) * 0.006;
        input.cameraPitch -= (e.clientY - touch.current.y) * 0.004;
        input.cameraPitch = Math.max(
          -Math.PI / 2.5,
          Math.min(Math.PI / 2.5, input.cameraPitch),
        );
        touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    />
  );
}

export default function App() {
  useResponsive();
  useListenKey();
  const isMobile = useGame((s) => s.isMobile);
  const listening = useGame((s) => s.listening);
  const [hasName, setHasName] = useState(
    () => !!sessionStorage.getItem("vr-player-name"),
  );

  useEffect(() => {
    const kb = setupKeyboard();
    const md = setupMouseDrag();
    return () => {
      kb();
      md();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950">
      <Scene />

      {/* Mobile touch-look area — under the UI layer so buttons still receive taps */}
      {isMobile && !listening && (
        <div className="absolute inset-0 z-[5]">
          <TouchLook />
        </div>
      )}

      {/* UI Layer */}
      <div className="pointer-events-none absolute inset-0 z-10 select-none">
        <HUD />
        <ProximityPrompt />
        <CinemaUI />
        <CursorHint />
        <DialogueOverlay />
      </div>

      {/* Mobile joystick — hidden during dialogue so it doesn't overlap */}
      {isMobile && !listening && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-20">
          <Joystick />
        </div>
      )}

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <ChatOverlay />
      {!hasName && <NamePrompt onDone={() => setHasName(true)} />}
    </div>
  );
}
