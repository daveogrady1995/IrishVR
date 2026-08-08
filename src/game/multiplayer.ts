import { ref, set, onValue, onDisconnect } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "@/firebase";

// Stable ID for this browser tab
export const playerId = (() => {
  let id = sessionStorage.getItem("vr-player-id");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("vr-player-id", id);
  }
  return id;
})();

export interface RemotePlayer {
  id: string;
  x: number;
  z: number;
  rotY: number;
}

let lastPublish = 0;

export function publishPosition(x: number, z: number, rotY: number) {
  if (Date.now() - lastPublish < 100) return; // 10fps cap
  lastPublish = Date.now();
  set(ref(db, `players/${playerId}`), { x, z, rotY, t: Date.now() });
}

export function useOtherPlayers(): RemotePlayer[] {
  const [others, setOthers] = useState<RemotePlayer[]>([]);

  useEffect(() => {
    const myRef = ref(db, `players/${playerId}`);
    // Remove our entry from DB if the browser closes/crashes
    onDisconnect(myRef).remove();

    const allRef = ref(db, "players");
    const unsub = onValue(allRef, (snap) => {
      const data = snap.val() as Record<string, { x: number; z: number; rotY: number; t: number }> | null;
      if (!data) { setOthers([]); return; }
      const now = Date.now();
      setOthers(
        Object.entries(data)
          .filter(([id, p]) => id !== playerId && now - (p.t ?? 0) < 15000)
          .map(([id, p]) => ({ id, x: p.x, z: p.z, rotY: p.rotY }))
      );
    });

    return () => {
      unsub();
      set(myRef, null);
    };
  }, []);

  return others;
}
