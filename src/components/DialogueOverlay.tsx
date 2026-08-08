import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward, RotateCcw, X } from 'lucide-react';
import { useGame } from '@/game/store';
import { DIALOGUE, SPEAKER_COLORS } from '@/game/dialogue';

export function DialogueOverlay() {
  const listening = useGame((s) => s.listening);
  const lineIndex = useGame((s) => s.lineIndex);
  const paused = useGame((s) => s.paused);
  const dialogueEnded = useGame((s) => s.dialogueEnded);
  const nextLine = useGame((s) => s.nextLine);
  const togglePause = useGame((s) => s.togglePause);
  const stopListening = useGame((s) => s.stopListening);
  const restart = useGame((s) => s.restart);

  const [typed, setTyped] = useState('');
  const line = DIALOGUE[lineIndex];
  const isLast = lineIndex >= DIALOGUE.length - 1;
  const raf = useRef<number>(0);
  const startTime = useRef<number>(0);
  const fullText = line?.text ?? '';

  // Typewriter + auto-advance timer
  useEffect(() => {
    if (!listening || dialogueEnded) return;
    setTyped('');
    startTime.current = performance.now();
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (paused) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = (performance.now() - startTime.current) / 1000;
      const charRate = fullText.length / Math.max(0.5, line.duration - 0.8);
      const target = Math.min(fullText.length, Math.floor(elapsed * charRate));
      setTyped(fullText.slice(0, target));

      if (elapsed >= line.duration) {
        if (isLast) {
          useGame.setState({ dialogueEnded: true });
        } else {
          nextLine();
        }
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, lineIndex, paused, dialogueEnded]);

  if (!listening) return null;

  const color = line ? SPEAKER_COLORS[line.speaker] : '#fff';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-6 sm:pb-8">
      <div className="pointer-events-auto w-full max-w-2xl animate-floatUp">
        {/* Ended state */}
        {dialogueEnded ? (
          <div
            className="rounded-2xl border p-5 shadow-2xl"
            style={{
              background: 'rgba(15,12,8,0.88)',
              backdropFilter: 'blur(14px)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Conversation ended</p>
                <p className="mt-0.5 text-xs text-white/50">
                  Walk away or replay the dialogue
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={restart}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-400 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" /> Replay
                </button>
                <button
                  onClick={stopListening}
                  className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
                >
                  <X className="h-4 w-4" /> Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              background: 'rgba(15,12,8,0.88)',
              backdropFilter: 'blur(14px)',
              borderColor: `${color}55`,
            }}
          >
            {/* Progress dots */}
            <div className="flex gap-1.5 px-5 pt-3">
              {DIALOGUE.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{
                    background:
                      i < lineIndex
                        ? color
                        : i === lineIndex
                          ? `${color}aa`
                          : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>

            <div className="flex items-start gap-3.5 px-5 py-4">
              {/* Avatar */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
                style={{ background: color, boxShadow: `0 0 16px ${color}55` }}
              >
                {line?.speaker[0]}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-bold tracking-wide"
                    style={{ color }}
                  >
                    {line?.speaker}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/35">
                    Line {lineIndex + 1} / {DIALOGUE.length}
                  </span>
                </div>
                <p className="mt-1 text-[15px] leading-relaxed text-white/90 min-h-[3em]">
                  {typed}
                  {typed.length < fullText.length && (
                    <span className="typewriter-caret" style={{ color }} />
                  )}
                </p>
              </div>
            </div>

            {/* Controls bar */}
            <div className="flex items-center gap-2 border-t border-white/8 px-4 py-2.5">
              <button
                onClick={togglePause}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 active:scale-95"
              >
                {paused ? (
                  <>
                    <Play className="h-3.5 w-3.5" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (isLast) {
                    useGame.setState({ dialogueEnded: true });
                  } else {
                    nextLine();
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 active:scale-95"
              >
                <SkipForward className="h-3.5 w-3.5" /> Skip Line
              </button>
              <div className="flex-1" />
              <button
                onClick={stopListening}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white active:scale-95"
              >
                <X className="h-3.5 w-3.5" /> Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
