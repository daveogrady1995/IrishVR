import { useEffect, useRef, useState } from "react";
import { Scene } from "@/components/Scene";
import { HUD } from "@/components/HUD";
import { Joystick } from "@/components/Joystick";
import { DialogueOverlay } from "@/components/DialogueOverlay";
import { ProximityPrompt } from "@/components/ProximityPrompt";
import { NamePrompt } from "@/components/NamePrompt";
import { ChatOverlay } from "@/components/ChatOverlay";
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

// Right-half touch drag for camera look on mobile
function TouchLook() {
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  return (
    <div
      className="pointer-events-auto absolute inset-y-0 right-0 w-1/2"
      onTouchStart={(e) => {
        if (touch.current) return;
        const t = e.changedTouches[0];
        touch.current = { id: t.identifier, x: t.clientX, y: t.clientY };
      }}
      onTouchMove={(e) => {
        if (!touch.current) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier !== touch.current.id) continue;
          input.cameraYaw -= (t.clientX - touch.current.x) * 0.004;
          input.cameraPitch -= (t.clientY - touch.current.y) * 0.004;
          input.cameraPitch = Math.max(
            -Math.PI / 2.5,
            Math.min(Math.PI / 2.5, input.cameraPitch),
          );
          touch.current = { id: t.identifier, x: t.clientX, y: t.clientY };
          break;
        }
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touch.current.id) {
            touch.current = null;
            break;
          }
        }
      }}
    />
  );
}

export default function App() {
  useResponsive();
  useListenKey();
  const isMobile = useGame((s) => s.isMobile);
  const listening = useGame((s) => s.listening);
  const [hasName, setHasName] = useState(() => !!sessionStorage.getItem("vr-player-name"));

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

      {/* UI Layer */}
      <div className="pointer-events-none absolute inset-0 z-10 select-none">
        <HUD />
        <ProximityPrompt />
        <DialogueOverlay />
      </div>

      {/* Mobile joystick — hidden during dialogue so it doesn't overlap */}
      {isMobile && !listening && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-20">
          <Joystick />
        </div>
      )}

      {/* Mobile right-side touch area for camera pivot */}
      {isMobile && !listening && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <TouchLook />
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
