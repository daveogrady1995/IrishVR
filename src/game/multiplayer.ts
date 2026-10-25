import { ref, set, update, onValue, onDisconnect, push } from "firebase/database";
import { useEffect, useState } from "react";
import { auth, authReady, db } from "@/firebase";
import type { RoomId } from "./types";

// The player's id is the anonymous Firebase uid, which the database rules check against.
export function getPlayerId(): string | null {
  return auth.currentUser?.uid ?? null;
}

// Short random tag used only for default display names.
export const playerTag = (() => {
  let tag = sessionStorage.getItem("vr-player-tag");
  if (!tag) {
    tag = Math.random().toString(36).slice(2, 6);
    sessionStorage.setItem("vr-player-tag", tag);
  }
  return tag;
})();

export function getPlayerName(): string {
  return sessionStorage.getItem("vr-player-name") || `Player_${playerTag}`;
}

export interface RemotePlayer {
  id: string;
  x: number;
  z: number;
  rotY: number;
  room: RoomId;
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

export function publishPosition(x: number, z: number, rotY: number, room: RoomId) {
  // The shop is a private room, so there is nothing to share.
  if (room === "shop") return;
  const playerId = getPlayerId();
  if (!playerId || Date.now() - lastPublish < 100) return;
  lastPublish = Date.now();
  update(ref(db, `players/${playerId}`), { x, z, rotY, room, t: Date.now(), name: getPlayerName() });
}

export function sendChatMessage(text: string) {
  const playerId = getPlayerId();
  const trimmed = text.trim().slice(0, 200);
  if (!playerId || !trimmed) return;
  const name = getPlayerName();
  push(ref(db, `chat/${playerId}`), { name, text: trimmed, t: Date.now() });
  update(ref(db, `players/${playerId}`), { message: trimmed, messageTime: Date.now() });
  setTimeout(() => update(ref(db, `players/${playerId}`), { message: null, messageTime: null }), 10000);
}

export function useOtherPlayers(): RemotePlayer[] {
  const [others, setOthers] = useState<RemotePlayer[]>([]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    authReady.then((playerId) => {
      if (cancelled) return;
      cleanup = subscribePlayers(playerId, setOthers);
    }).catch((err) => console.error("Firebase sign-in failed", err));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return others;
}

function subscribePlayers(
  playerId: string,
  setOthers: (players: RemotePlayer[]) => void,
): () => void {
  {
    const myRef = ref(db, `players/${playerId}`);
    const myChatRef = ref(db, `chat/${playerId}`);
    onDisconnect(myRef).remove();
    onDisconnect(myChatRef).remove();

    const allRef = ref(db, "players");
    const unsub = onValue(allRef, (snap) => {
      const data = snap.val() as Record<string, {
        x: number; z: number; rotY: number; room?: RoomId; t: number;
        name?: string; message?: string; messageTime?: number;
      }> | null;
      if (!data) { setOthers([]); return; }
      const now = Date.now();
      setOthers(
        Object.entries(data)
          .filter(([id, p]) => id !== playerId && now - (p.t ?? 0) < 15000)
          .map(([id, p]) => ({
            id, x: p.x, z: p.z, rotY: p.rotY, room: p.room ?? "lounge",
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
  }
}

export function useChat(): ChatMessage[] {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    authReady.then(() => {
      if (cancelled) return;
      unsub = onValue(ref(db, "chat"), (snap) => {
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
    }).catch((err) => console.error("Firebase sign-in failed", err));

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  return messages;
}
