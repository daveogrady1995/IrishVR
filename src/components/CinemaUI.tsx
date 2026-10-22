import { useEffect } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useGame } from "@/game/store";
import { VIDEOS } from "@/game/videos";
import { SubtitleButton, cycleSubtitleMode } from "./Subtitles";

function useCinemaKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const s = useGame.getState();
      const k = e.key.toLowerCase();
      if (k === "e") {
        if (s.seatId !== null) s.stand();
        else if (s.nearDoor && !s.listening) {
          s.travel(s.room === "lounge" ? "cinema" : "lounge");
        } else if (s.nearSeat !== null) s.sit(s.nearSeat);
      } else if (s.inCinema && !s.listening) {
        if (k === " ") {
          e.preventDefault();
          s.togglePlay();
        } else if (k === "n") s.nextVideo();
        else if (k === "b") s.prevVideo();
        else if (k === "c") cycleSubtitleMode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

const panel = "border border-white/12 bg-black/55 shadow-xl";
const iconButton =
  "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95";

export function CinemaUI() {
  useCinemaKeys();
  const isMobile = useGame((s) => s.isMobile);
  const seatId = useGame((s) => s.seatId);
  const nearSeat = useGame((s) => s.nearSeat);
  const inCinema = useGame((s) => s.inCinema);
  const room = useGame((s) => s.room);
  const nearDoor = useGame((s) => s.nearDoor);
  const listening = useGame((s) => s.listening);
  const travel = useGame((s) => s.travel);
  const videoIndex = useGame((s) => s.videoIndex);
  const playing = useGame((s) => s.videoPlaying);
  const sit = useGame((s) => s.sit);
  const stand = useGame((s) => s.stand);
  const togglePlay = useGame((s) => s.togglePlay);
  const nextVideo = useGame((s) => s.nextVideo);
  const prevVideo = useGame((s) => s.prevVideo);

  const title = VIDEOS[videoIndex]?.title;
  const credit = VIDEOS[videoIndex]?.credit;

  const destination = room === "lounge" ? "cinema" : "lounge";
  const destinationLabel = room === "lounge" ? "Cinema" : "Lounge";

  return (
    <>
      {nearDoor && !listening && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[120px]">
          <button
            onClick={() => travel(destination)}
            className={`pointer-events-auto animate-floatUp rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:scale-105 active:scale-95 ${panel}`}
            style={{ backdropFilter: "blur(12px)" }}
          >
            {isMobile
              ? `Tap to go to ${destinationLabel}`
              : `Press [E] or Tap to go to ${destinationLabel}`}
          </button>
        </div>
      )}

      {nearSeat !== null && seatId === null && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[120px]">
          <button
            onClick={() => sit(nearSeat)}
            className={`pointer-events-auto animate-floatUp rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:scale-105 active:scale-95 ${panel}`}
            style={{ backdropFilter: "blur(12px)" }}
          >
            {isMobile ? "Tap to sit down" : "Press [E] or Tap to sit down"}
          </button>
        </div>
      )}

      {inCinema && (
        <div className="pointer-events-none absolute inset-x-0 top-[4.5rem] z-20 flex justify-center sm:top-4">
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${panel}`}
            style={{ backdropFilter: "blur(12px)" }}
          >
            <button
              onClick={prevVideo}
              className={iconButton}
              aria-label="Previous video"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className={iconButton}
              aria-label="Play or pause"
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={nextVideo}
              className={iconButton}
              aria-label="Next video"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <SubtitleButton
              className={`${iconButton} w-auto px-3`}
            />
            <div className="min-w-0 max-w-[9rem] px-1 sm:max-w-[16rem]">
              <p className="truncate text-sm font-semibold text-white">
                {title ?? "No videos found"}
              </p>
              <p className="text-[10px] leading-tight text-white/50">
                {VIDEOS.length
                  ? isMobile
                    ? `${videoIndex + 1} of ${VIDEOS.length}`
                    : `${videoIndex + 1} of ${VIDEOS.length}  ·  Space pause  ·  N next  ·  B back`
                  : "Add files to src/assets/videos"}
              </p>
              {credit && (
                <a
                  href={credit.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="pointer-events-auto block truncate text-[10px] leading-tight text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
                >
                  {credit.author} · {credit.license}
                </a>
              )}
            </div>
            {seatId !== null && (
              <button
                onClick={stand}
                className="pointer-events-auto rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
              >
                {isMobile ? "Stand up" : "Stand up [E]"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
