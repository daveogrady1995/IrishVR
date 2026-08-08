import { useState } from "react";
import { playerId } from "@/game/multiplayer";

export function NamePrompt({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const name = value.trim() || `Player_${playerId.slice(0, 4)}`;
    sessionStorage.setItem("vr-player-name", name);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="flex min-w-72 flex-col gap-4 rounded-xl bg-stone-900 p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-amber-400">Enter the World</h2>
        <input
          autoFocus
          className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white outline-none focus:border-amber-400"
          placeholder="Your name..."
          maxLength={20}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button
          className="rounded bg-amber-500 px-4 py-2 font-semibold text-stone-900 transition-colors hover:bg-amber-400"
          onClick={submit}
        >
          Enter World
        </button>
      </div>
    </div>
  );
}
