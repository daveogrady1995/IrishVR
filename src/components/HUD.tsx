import { useEffect, useState } from 'react';
import { Camera, Gamepad2, Keyboard, Eye } from 'lucide-react';
import { useGame } from '@/game/store';

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="flex h-7 w-7 items-center justify-center rounded-md border border-white/20 bg-white/10 text-xs font-bold text-white shadow-sm">
      {children}
    </kbd>
  );
}

export function HUD() {
  const isMobile = useGame((s) => s.isMobile);
  const cameraMode = useGame((s) => s.cameraMode);
  const toggleCamera = useGame((s) => s.toggleCamera);
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHelp(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4">
        {/* Title */}
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 shadow-lg" style={{ backdropFilter: 'blur(10px)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 shadow-md">
            <Gamepad2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-white">Cozy Conversation</h1>
            <p className="text-[10px] leading-tight text-white/45">3D WebGL Demo</p>
          </div>
        </div>

        {/* Camera toggle */}
        <button
          onClick={toggleCamera}
          className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-black/55 active:scale-95"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          {cameraMode === 'walk' ? <Camera className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {cameraMode === 'walk' ? 'Free Walk' : 'Cinematic'}
          </span>
          <span className="sm:hidden">{cameraMode === 'walk' ? 'Walk' : 'Cine'}</span>
        </button>
      </div>

      {/* Controls guide - desktop */}
      {!isMobile && (
        <div
          className={`pointer-events-none absolute left-4 top-1/2 z-20 -translate-y-1/2 transition-all duration-500 ${
            showHelp ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="pointer-events-auto rounded-xl border border-white/12 bg-black/40 p-3.5 shadow-lg" style={{ backdropFilter: 'blur(10px)' }}>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/50">
              <Keyboard className="h-3.5 w-3.5" /> Controls
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Key>W</Key>
              <div className="flex gap-1.5">
                <Key>A</Key>
                <Key>S</Key>
                <Key>D</Key>
              </div>
            </div>
            <p className="mt-2.5 text-center text-[10px] leading-tight text-white/45">
              Walk up to the couple and press <span className="font-bold text-primary-300">[E]</span>
            </p>
            <div className="mt-2 border-t border-white/10 pt-2 text-center text-[10px] leading-tight text-white/45">
              <span className="font-bold text-secondary-300">Right-click + drag</span> to orbit camera
            </div>
          </div>
        </div>
      )}

      {/* Controls guide - mobile hint */}
      {isMobile && showHelp && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2">
          <div className="pointer-events-auto rounded-full border border-white/12 bg-black/50 px-4 py-2 text-xs font-medium text-white/80 shadow-lg" style={{ backdropFilter: 'blur(10px)' }}>
            Use the joystick to walk around
          </div>
        </div>
      )}

      {/* Dismiss hint button */}
      {!isMobile && (
        <button
          onClick={() => setShowHelp((v) => !v)}
          className="pointer-events-auto absolute left-4 top-1/2 z-20 mt-32 -translate-y-1/2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white/40 transition hover:text-white/70"
          style={{ backdropFilter: 'blur(6px)' }}
        >
          {showHelp ? 'Hide' : 'Help'}
        </button>
      )}
    </>
  );
}
