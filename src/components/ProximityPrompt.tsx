import { useGame } from '@/game/store';

export function ProximityPrompt() {
  const nearby = useGame((s) => s.nearby);
  const listening = useGame((s) => s.listening);
  const dialogueEnded = useGame((s) => s.dialogueEnded);
  const startListening = useGame((s) => s.startListening);
  const isMobile = useGame((s) => s.isMobile);

  if (!nearby || listening) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[120px]">
      <button
        onClick={startListening}
        className="pointer-events-auto animate-floatUp rounded-full border border-primary-300/40 bg-black/55 px-5 py-3 shadow-2xl transition hover:scale-105 active:scale-95"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full bg-primary-400" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-400" />
          </span>
          <span className="text-sm font-semibold text-white">
            {dialogueEnded
              ? 'Tap to Replay Conversation'
              : isMobile
                ? 'Tap to Listen to Conversation'
                : 'Press [E] or Tap to Listen'}
          </span>
          {!isMobile && !dialogueEnded && (
            <kbd className="flex h-6 min-w-6 items-center justify-center rounded-md border border-primary-300/50 bg-primary-500/20 px-1.5 text-xs font-bold text-primary-200">
              E
            </kbd>
          )}
        </div>
      </button>
    </div>
  );
}
