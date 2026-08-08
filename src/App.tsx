import { useEffect } from 'react';
import { Scene } from '@/components/Scene';
import { HUD } from '@/components/HUD';
import { Joystick } from '@/components/Joystick';
import { DialogueOverlay } from '@/components/DialogueOverlay';
import { ProximityPrompt } from '@/components/ProximityPrompt';
import { useGame } from '@/game/store';
import { setupKeyboard, setupMouseDrag } from '@/game/input';

function useResponsive() {
  const setIsMobile = useGame((s) => s.setIsMobile);
  useEffect(() => {
    const check = () => {
      const mobile =
        window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        window.innerWidth < 768;
      setIsMobile(mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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
      if (k === 'e' && nearby && !listening) {
        startListening();
      } else if (k === ' ' && listening && !dialogueEnded) {
        e.preventDefault();
        togglePause();
      } else if (k === 'f' && listening && !dialogueEnded) {
        nextLine();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearby, listening, startListening, togglePause, nextLine, dialogueEnded]);
}

export default function App() {
  useResponsive();
  useListenKey();
  const isMobile = useGame((s) => s.isMobile);

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

      {/* Mobile joystick */}
      {isMobile && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-20">
          <Joystick />
        </div>
      )}

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </div>
  );
}
