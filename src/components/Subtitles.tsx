import { useEffect, useState } from "react";
import { Captions } from "lucide-react";
import { useGame, type SubtitleMode } from "@/game/store";
import { VIDEOS } from "@/game/videos";
import { cinemaVideo } from "@/game/videoElement";
import { cueAt, loadSubtitles, type Cue } from "@/game/subtitles";

const MODE_LABEL: Record<SubtitleMode, string> = {
  both: "GA + EN",
  ga: "GA",
  en: "EN",
  off: "Off",
};

const modesFor = (videoIndex: number): SubtitleMode[] => {
  const langs = VIDEOS[videoIndex]?.subtitles?.map((t) => t.lang) ?? [];
  const ga = langs.includes("ga");
  const en = langs.includes("en");
  if (ga && en) return ["both", "ga", "en", "off"];
  if (ga) return ["ga", "off"];
  if (en) return ["en", "off"];
  return [];
};

// Modes that make sense for the current video, based on which tracks it has.
export function useSubtitleModes(): SubtitleMode[] {
  const videoIndex = useGame((s) => s.videoIndex);
  return modesFor(videoIndex);
}

export function useEffectiveMode(): SubtitleMode | null {
  const modes = useSubtitleModes();
  const mode = useGame((s) => s.subtitleMode);
  if (!modes.length) return null;
  return modes.includes(mode) ? mode : modes[0];
}

export function cycleSubtitleMode() {
  const s = useGame.getState();
  const modes = modesFor(s.videoIndex);
  if (!modes.length) return;
  const current = modes.includes(s.subtitleMode) ? s.subtitleMode : modes[0];
  s.setSubtitleMode(modes[(modes.indexOf(current) + 1) % modes.length]);
}

export function SubtitleButton({ className }: { className: string }) {
  const mode = useEffectiveMode();
  if (!mode) return null;
  return (
    <button
      onClick={cycleSubtitleMode}
      className={className}
      aria-label="Change subtitles"
      title="Subtitles [C]"
    >
      <Captions className="h-4 w-4" />
      <span className="ml-1 text-[10px] font-bold">{MODE_LABEL[mode]}</span>
    </button>
  );
}

export function Subtitles() {
  const inCinema = useGame((s) => s.inCinema);
  const videoIndex = useGame((s) => s.videoIndex);
  const mode = useEffectiveMode();
  const [tracks, setTracks] = useState<Record<string, Cue[]>>({});
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    setTracks({});
    setLines([]);
    const list = VIDEOS[videoIndex]?.subtitles;
    if (!list) return;
    let cancelled = false;
    Promise.all(list.map((t) => loadSubtitles(t.url))).then((all) => {
      if (cancelled) return;
      setTracks(Object.fromEntries(list.map((t, i) => [t.lang, all[i]])));
    });
    return () => {
      cancelled = true;
    };
  }, [videoIndex]);

  useEffect(() => {
    if (!inCinema || !mode || mode === "off") {
      setLines([]);
      return;
    }
    const wanted = mode === "both" ? ["ga", "en"] : [mode];
    const id = window.setInterval(() => {
      const t = cinemaVideo.el?.currentTime ?? 0;
      const next = wanted
        .map((lang) => (tracks[lang] ? cueAt(tracks[lang], t) : null))
        .filter((x): x is string => !!x);
      setLines((prev) =>
        prev.length === next.length && prev.every((l, i) => l === next[i])
          ? prev
          : next,
      );
    }, 150);
    return () => window.clearInterval(id);
  }, [inCinema, mode, tracks]);

  if (!inCinema || !lines.length) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex flex-col items-center gap-1 px-4 sm:bottom-16">
      {lines.map((text, i) => (
        <p
          key={i}
          className={`max-w-[90vw] whitespace-pre-line rounded-md bg-black/70 px-3 py-1.5 text-center font-semibold text-white sm:max-w-2xl ${
            i === 0 && lines.length > 1
              ? "text-base sm:text-xl"
              : "text-sm text-white/90 sm:text-lg"
          }`}
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
        >
          {text}
        </p>
      ))}
    </div>
  );
}
