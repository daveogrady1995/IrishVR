import { create } from "zustand";
import type { CameraMode } from "./types";
import { VIDEOS } from "./videos";

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
  videoIndex: number;
  videoPlaying: boolean;
  setNearSeat: (id: number | null) => void;
  setInCinema: (v: boolean) => void;
  sit: (id: number) => void;
  stand: () => void;
  togglePlay: () => void;
  nextVideo: () => void;
  prevVideo: () => void;
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
  videoIndex: 0,
  videoPlaying: false,
  setNearSeat: (id) => {
    if (get().nearSeat !== id) set({ nearSeat: id });
  },
  setInCinema: (v) => {
    if (get().inCinema !== v) set({ inCinema: v });
  },
  sit: (id) =>
    set({
      seatId: id,
      nearSeat: null,
      cameraMode: "walk",
      videoPlaying: VIDEOS.length > 0,
    }),
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
