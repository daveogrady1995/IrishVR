import { ref, set, update, onValue, onDisconnect, push } from "firebase/database";
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
  push(ref(db, `chat/${playerId}`), { name, text, t: Date.now() });
  update(ref(db, `players/${playerId}`), { message: text, messageTime: Date.now() });
  setTimeout(() => update(ref(db, `players/${playerId}`), { message: null, messageTime: null }), 10000);
}

export function useOtherPlayers(): RemotePlayer[] {
  const [others, setOthers] = useState<RemotePlayer[]>([]);

  useEffect(() => {
    const myRef = ref(db, `players/${playerId}`);
    const myChatRef = ref(db, `chat/${playerId}`);
    onDisconnect(myRef).remove();
    onDisconnect(myChatRef).remove();

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
      set(myChatRef, null);
    };
  }, []);

  return others;
}

export function useChat(): ChatMessage[] {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const unsub = onValue(ref(db, "chat"), (snap) => {
      const data = snap.val();
      if (!data) { setMessages([]); return; }
      const all: ChatMessage[] = [];
      for (const pid of Object.keys(data)) {
        for (const [id, m] of Object.entries(data[pid] as Record<string, any>)) {
          all.push({ id, ...m });
        }
      }
      setMessages(all.sort((a, b) => a.t - b.t).slice(-20));
    });
    return () => unsub();
  }, []);

  return messages;
}
