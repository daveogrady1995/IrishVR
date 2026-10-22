import { create } from "zustand";
import type { CameraMode, RoomId } from "./types";
import { VIDEOS } from "./videos";

export type SubtitleMode = "both" | "ga" | "en" | "off";

interface GameState {
  nearby: boolean;
  listening: boolean;
  lineIndex: number;
  paused: boolean;
  dialogueEnded: boolean;
  cameraMode: CameraMode;
  isMobile: boolean;
  seatId: number | null;
  nearSeat: number | null;
  inCinema: boolean;
  room: RoomId;
  nearDoor: boolean;
  videoIndex: number;
  videoPlaying: boolean;
  videoStarted: boolean;
  subtitleMode: SubtitleMode;
  setSubtitleMode: (m: SubtitleMode) => void;
  setNearSeat: (id: number | null) => void;
  setNearDoor: (v: boolean) => void;
  travel: (room: RoomId) => void;
  sit: (id: number) => void;
  stand: () => void;
  togglePlay: () => void;
  nextVideo: () => void;
  prevVideo: () => void;
  randomVideo: () => void;
  setNearby: (v: boolean) => void;
  startListening: () => void;
  stopListening: () => void;
  nextLine: () => void;
  setPaused: (v: boolean) => void;
  togglePause: () => void;
  toggleCamera: () => void;
  restart: () => void;
  setIsMobile: (v: boolean) => void;
}

export const useGame = create<GameState>((set, get) => ({
  nearby: false,
  listening: false,
  lineIndex: 0,
  paused: false,
  dialogueEnded: false,
  cameraMode: "walk",
  isMobile: false,
  seatId: null,
  nearSeat: null,
  inCinema: false,
  room: "lounge",
  nearDoor: false,
  videoIndex: 0,
  videoPlaying: false,
  videoStarted: false,
  subtitleMode: "both",
  setSubtitleMode: (m) => set({ subtitleMode: m }),
  setNearSeat: (id) => {
    if (get().nearSeat !== id) set({ nearSeat: id });
  },
  setNearDoor: (v) => {
    if (get().nearDoor !== v) set({ nearDoor: v });
  },
  travel: (room) => {
    if (get().room === room) return;
    const base = {
      room,
      inCinema: room === "cinema",
      nearDoor: false,
      nearSeat: null,
      seatId: null,
      nearby: false,
    };
    if (room === "cinema" && !get().videoStarted && VIDEOS.length > 0) {
      set({
        ...base,
        videoStarted: true,
        videoPlaying: true,
        videoIndex: 0,
      });
    } else {
      set(base);
    }
  },
  sit: (id) => set({ seatId: id, nearSeat: null, cameraMode: "walk" }),
  stand: () => set({ seatId: null }),
  togglePlay: () =>
    set((s) => ({ videoPlaying: VIDEOS.length > 0 && !s.videoPlaying })),
  nextVideo: () =>
    set((s) => ({
      videoIndex: VIDEOS.length ? (s.videoIndex + 1) % VIDEOS.length : 0,
      videoPlaying: VIDEOS.length > 0,
    })),
  prevVideo: () =>
    set((s) => ({
      videoIndex: VIDEOS.length
        ? (s.videoIndex - 1 + VIDEOS.length) % VIDEOS.length
        : 0,
      videoPlaying: VIDEOS.length > 0,
    })),
  randomVideo: () =>
    set((s) => {
      if (VIDEOS.length < 2) return { videoPlaying: VIDEOS.length > 0 };
      // Offset by 1..n-1 so the same video never repeats back to back.
      const offset = 1 + Math.floor(Math.random() * (VIDEOS.length - 1));
      return {
        videoIndex: (s.videoIndex + offset) % VIDEOS.length,
        videoPlaying: true,
      };
    }),
  setNearby: (v) => {
    if (get().nearby !== v) set({ nearby: v });
  },
  startListening: () => {
    if (get().dialogueEnded) {
      set({
        lineIndex: 0,
        dialogueEnded: false,
        paused: false,
        listening: true,
      });
    } else {
      set({ listening: true, paused: false });
    }
  },
  stopListening: () => set({ listening: false, paused: false }),
  nextLine: () => {
    const { lineIndex } = get();
    set({ lineIndex: lineIndex + 1 });
  },
  setPaused: (v) => set({ paused: v }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  toggleCamera: () =>
    set((s) => ({
      cameraMode: s.cameraMode === "walk" ? "cinematic" : "walk",
    })),
  restart: () =>
    set({ lineIndex: 0, dialogueEnded: false, paused: false, listening: true }),
  setIsMobile: (v) => {
    if (get().isMobile !== v) set({ isMobile: v });
  },
}));
