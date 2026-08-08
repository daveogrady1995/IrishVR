import { create } from 'zustand';
import type { CameraMode } from './types';

interface GameState {
  nearby: boolean;
  listening: boolean;
  lineIndex: number;
  paused: boolean;
  dialogueEnded: boolean;
  cameraMode: CameraMode;
  isMobile: boolean;
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
  cameraMode: 'walk',
  isMobile: false,
  setNearby: (v) => {
    if (get().nearby !== v) set({ nearby: v });
  },
  startListening: () => {
    if (get().dialogueEnded) {
      set({ lineIndex: 0, dialogueEnded: false, paused: false, listening: true });
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
    set((s) => ({ cameraMode: s.cameraMode === 'walk' ? 'cinematic' : 'walk' })),
  restart: () => set({ lineIndex: 0, dialogueEnded: false, paused: false, listening: true }),
  setIsMobile: (v) => {
    if (get().isMobile !== v) set({ isMobile: v });
  },
}));
