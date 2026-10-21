import { useEffect, useState } from "react";
import { useGame } from "@/game/store";

export function CursorHint() {
  const [locked, setLocked] = useState(false);
  const isMobile = useGame((s) => s.isMobile);
  const listening = useGame((s) => s.listening);

  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  // Dialogue controls need a cursor.
  useEffect(() => {
    if (listening && document.pointerLockElement) document.exitPointerLock();
  }, [listening]);

  if (isMobile) return null;

  return (
    <>
      {locked && (
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow" />
      )}
      <div className="absolute bottom-6 right-4 rounded-full border border-white/12 bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white/70">
        {locked
          ? "Press Esc or Alt to show the cursor"
          : "Click the scene to look around"}
      </div>
    </>
  );
}
