import { useEffect, useRef, useState } from "react";
import { sendChatMessage, useChat, getPlayerName } from "@/game/multiplayer";

export function ChatOverlay() {
  const messages = useChat();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  // Press T to focus chat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendChatMessage(trimmed);
    setText("");
    inputRef.current?.blur();
  };

  return (
    <div className="absolute bottom-4 left-4 z-30 flex w-72 flex-col gap-1">
      <div
        ref={logRef}
        className="flex max-h-36 flex-col gap-0.5 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {messages.map((m) => (
          <div key={m.id} className="rounded bg-black/55 px-2 py-0.5 text-sm text-white">
            <span className="font-semibold text-amber-300">{m.name}: </span>
            {m.text}
          </div>
        ))}
      </div>

      <div className={`flex overflow-hidden rounded border transition-colors ${focused ? "border-amber-400" : "border-white/20"}`}>
        <input
          ref={inputRef}
          className="flex-1 bg-black/60 px-2 py-1.5 text-sm text-white outline-none placeholder-white/40"
          placeholder={focused ? "Type a message…" : "Press T to chat"}
          value={text}
          maxLength={120}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") send();
            if (e.key === "Escape") { setText(""); inputRef.current?.blur(); }
          }}
        />
        {focused && (
          <button
            className="bg-amber-500/80 px-2 text-xs font-bold text-stone-900 hover:bg-amber-400"
            onMouseDown={(e) => { e.preventDefault(); send(); }}
          >
            Send
          </button>
        )}
      </div>
      {!focused && (
        <p className="text-right text-xs text-white/30">
          {getPlayerName()}
        </p>
      )}
    </div>
  );
}
