import { ref, set, update, onValue, onDisconnect, push, query, limitToLast } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "@/firebase";

export const playerId = (() => {
  let id = sessionStorage.getItem("vr-player-id");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("vr-player-id", id);
  }
  return id;
})();

export function getPlayerName(): string {
  return sessionStorage.getItem("vr-player-name") || `Player_${playerId.slice(0, 4)}`;
}

export interface RemotePlayer {
  id: string;
  x: number;
  z: number;
  rotY: number;
  name: string;
  message?: string;
  messageTime?: number;
}

export interface ChatMessage {
  id: string;
  name: string;
  text: string;
  t: number;
}

let lastPublish = 0;

export function publishPosition(x: number, z: number, rotY: number) {
  if (Date.now() - lastPublish < 100) return;
  lastPublish = Date.now();
  update(ref(db, `players/${playerId}`), { x, z, rotY, t: Date.now(), name: getPlayerName() });
}

export function sendChatMessage(text: string) {
  const name = getPlayerName();
  push(ref(db, "chat"), { name, text, t: Date.now() });
  update(ref(db, `players/${playerId}`), { message: text, messageTime: Date.now() });
  // Clear speech bubble from Firebase after 10s so late-joiners don't see stale bubbles
  setTimeout(() => update(ref(db, `players/${playerId}`), { message: null, messageTime: null }), 10000);
}

export function useOtherPlayers(): RemotePlayer[] {
  const [others, setOthers] = useState<RemotePlayer[]>([]);

  useEffect(() => {
    const myRef = ref(db, `players/${playerId}`);
    onDisconnect(myRef).remove();

    const allRef = ref(db, "players");
    const unsub = onValue(allRef, (snap) => {
      const data = snap.val() as Record<string, {
        x: number; z: number; rotY: number; t: number;
        name?: string; message?: string; messageTime?: number;
      }> | null;
      if (!data) { setOthers([]); return; }
      const now = Date.now();
      setOthers(
        Object.entries(data)
          .filter(([id, p]) => id !== playerId && now - (p.t ?? 0) < 15000)
          .map(([id, p]) => ({
            id, x: p.x, z: p.z, rotY: p.rotY,
            name: p.name || `Player_${id.slice(0, 4)}`,
            message: p.message,
            messageTime: p.messageTime,
          }))
      );
    });

    return () => {
      unsub();
      set(myRef, null);
    };
  }, []);

  return others;
}

export function useChat(): ChatMessage[] {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const chatQuery = query(ref(db, "chat"), limitToLast(20));
    const unsub = onValue(chatQuery, (snap) => {
      const data = snap.val();
      if (!data) { setMessages([]); return; }
      setMessages(
        Object.entries(data)
          .map(([id, m]: any) => ({ id, ...m }))
          .sort((a, b) => a.t - b.t)
      );
    });
    return () => unsub();
  }, []);

  return messages;
}
