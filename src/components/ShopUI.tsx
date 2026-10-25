import { useEffect } from "react";
import { Volume2 } from "lucide-react";
import { useGame } from "@/game/store";
import { MAX_SCORE, SHIFT_LENGTH, orderTotal, useShop } from "@/game/shopStore";
import { SHOP_ITEMS, euroGa, lookupLinks } from "@/game/shopData";
import { speakShopLine, stopIrishSpeech } from "@/game/speech";

const panel =
  "pointer-events-auto w-full max-w-2xl rounded-2xl border border-white/12 bg-black/70 p-4 text-white shadow-xl";
const button =
  "rounded-xl bg-white/10 px-3 py-2 text-left text-sm font-semibold transition hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";
const primary =
  "rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-400 active:scale-95 disabled:opacity-40";

function useCustomerVoice() {
  const line = useShop((s) => s.line);
  const voiceEnabled = useGame((s) => s.voiceEnabled);

  useEffect(() => {
    if (!line || !voiceEnabled) return;
    let cancelled = false;

    const play = () => {
      window.removeEventListener("pointerdown", play);
      window.removeEventListener("keydown", play);
      speakShopLine(line.voice, line.key).catch((error: unknown) => {
        if (cancelled || (error instanceof Error && error.name === "AbortError")) return;
        // Autoplay is blocked until the player interacts, so retry on their next input.
        if (error instanceof Error && error.name === "NotAllowedError") {
          window.addEventListener("pointerdown", play, { once: true });
          window.addEventListener("keydown", play, { once: true });
          return;
        }
        useGame
          .getState()
          .setVoiceError(error instanceof Error ? error.message : "Irish voice playback failed.");
      });
    };
    play();

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", play);
      window.removeEventListener("keydown", play);
    };
  }, [line, voiceEnabled]);

  useEffect(() => stopIrishSpeech, []);
}

// Answer with the keyboard (1-3 / 1-8, Enter) so the mouse never has to be released.
function useShopKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.repeat ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      const s = useShop.getState();
      const n = Number(e.key);
      if ((s.phase === "idle" || s.phase === "summary") && e.key === "Enter") s.startShift();
      else if (s.choices.length > 0 && n >= 1 && n <= s.choices.length) s.choose(n - 1);
      else if (s.phase === "order" && n >= 1 && n <= s.menu.length) s.toggleItem(s.menu[n - 1]);
      else if (s.phase === "order" && e.key === "Enter") s.serve();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

// The cursor is freed whenever the panel is waiting for an answer; clicking the scene locks it again.
function useFreeCursor() {
  const phase = useShop((s) => s.phase);
  const customerIndex = useShop((s) => s.customerIndex);
  useEffect(() => {
    const waiting = ["idle", "greet", "order", "price", "pay", "summary"].includes(phase);
    if (waiting && document.pointerLockElement) document.exitPointerLock();
  }, [phase, customerIndex]);
}

function Key({ n }: { n: number }) {
  return (
    <kbd className="mr-1.5 rounded border border-white/30 bg-white/10 px-1.5 text-[11px] font-bold">
      {n}
    </kbd>
  );
}

function Hint({ children }: { children: string }) {
  const show = useShop((s) => s.showEnglish);
  return show ? <div className="text-xs text-white/60">{children}</div> : null;
}

function Summary() {
  const score = useShop((s) => s.score);
  const startShift = useShop((s) => s.startShift);
  const stars = Math.max(1, Math.round((score / MAX_SCORE) * 5));

  return (
    <div className={`${panel} max-h-[70vh] overflow-y-auto`}>
      <div className="text-lg font-bold">Críochnaithe! 🎉</div>
      <Hint>Finished!</Hint>
      <div className="my-2 text-2xl">{"⭐".repeat(stars)}</div>
      <div className="text-sm">
        Scór: {score} / {MAX_SCORE}
      </div>
      <div className="mt-3 text-sm font-semibold">Foclóir — look the words up:</div>
      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        {SHOP_ITEMS.map((item) => {
          const links = lookupLinks(item.ga, item.en);
          return (
            <div key={item.id}>
              {item.emoji} <b>{item.ga}</b> = {item.en}{" "}
              <a className="underline" href={links.teanglann} target="_blank" rel="noreferrer">
                T
              </a>{" "}
              <a className="underline" href={links.focloir} target="_blank" rel="noreferrer">
                F
              </a>{" "}
              <a className="underline" href={links.tearma} target="_blank" rel="noreferrer">
                Té
              </a>
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-[10px] text-white/50">
        T = teanglann.ie · F = focloir.ie · Té = tearma.ie
      </div>
      <button className={`${primary} mt-3`} onClick={startShift}>
        <kbd className="mr-1 text-[11px]">↵</kbd> Imir arís (Play again)
      </button>
    </div>
  );
}

export function ShopUI() {
  const room = useGame((s) => s.room);
  if (room !== "shop") return null;
  return <ShopPanel />;
}

function ShopPanel() {
  useCustomerVoice();
  useShopKeys();
  useFreeCursor();
  const s = useShop();

  useEffect(() => () => useShop.getState().reset(), []);

  const wrap = "pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-3";

  if (s.phase === "summary") {
    return (
      <div className={wrap}>
        <Summary />
      </div>
    );
  }

  if (s.phase === "idle") {
    return (
      <div className={wrap}>
        <div className={panel}>
          <div className="text-lg font-bold">Fáilte go dtí an Siopa! 🛒</div>
          <Hint>Welcome to the Shop!</Hint>
          <div className="mt-2 text-sm">
            Freastail ar {SHIFT_LENGTH} chustaiméir as Gaeilge.
          </div>
          <Hint>Serve 5 customers in Irish. The east door leads back to the lobby.</Hint>
          <button className={`${primary} mt-3`} onClick={s.startShift}>
            <kbd className="mr-1 text-[11px]">↵</kbd> Oscail an siopa (Open the shop)
          </button>
        </div>
      </div>
    );
  }

  const total = orderTotal(s.basket);

  return (
    <div className={wrap}>
      <div className={`${panel} max-h-[60vh] overflow-y-auto`}>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>
            Custaiméir {Math.min(s.customerIndex + 1, SHIFT_LENGTH)} / {SHIFT_LENGTH} · Scór {s.score}
          </span>
          <button className="underline" onClick={s.toggleEnglish}>
            {s.showEnglish ? "Hide English" : "Show English"}
          </button>
        </div>

        {s.line && s.customer && (
          <div className="mt-2 flex items-start gap-2 rounded-xl bg-white/10 p-3">
            <div className="flex-1">
              <div className="text-xs text-emerald-300">{s.customer.name}</div>
              <div className="text-base font-semibold">{s.line.ga}</div>
              <Hint>{s.line.en}</Hint>
            </div>
            <button
              aria-label="Replay"
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              onClick={() => speakShopLine(s.line!.voice, s.line!.key).catch(() => {})}
            >
              <Volume2 size={16} />
            </button>
          </div>
        )}

        {s.feedback && (
          <div className={`mt-2 text-sm ${s.feedback.ok ? "text-emerald-300" : "text-red-300"}`}>
            {s.feedback.ga}{" "}
            {s.showEnglish && <span className="text-xs opacity-70">{s.feedback.en}</span>}
          </div>
        )}

        {s.phase === "arriving" && (
          <div className="mt-2 text-sm text-white/70">
            Tá custaiméir ag siopadóireacht… <span className="text-xs">(a customer is shopping)</span>
          </div>
        )}
        {s.phase === "leaving" && <div className="mt-2 text-sm text-white/70">Slán!</div>}

        {s.choices.length > 0 && (
          <div className="mt-3 grid gap-2">
            {s.choices.map((c, i) => (
              <button key={i} className={button} disabled={c.tried} onClick={() => s.choose(i)}>
                <Key n={i + 1} />
                {c.ga}
                <Hint>{c.en}</Hint>
              </button>
            ))}
          </div>
        )}

        {s.phase === "order" && (
          <>
            <div className="mt-3 text-xs text-white/60">
              Cad atá sa bhasca? (What is in the basket?) · 1–8 / Enter
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {s.menu.map((id, i) => {
                const item = SHOP_ITEMS[id];
                return (
                <button
                  key={item.id}
                  className={`${button} ${s.basket.includes(item.id) ? "ring-2 ring-emerald-400" : ""}`}
                  onClick={() => s.toggleItem(item.id)}
                >
                  <Key n={i + 1} />
                  {item.emoji} {item.ga}{" "}
                  <span className="text-xs text-white/60">{euroGa(item.price)}</span>
                  <Hint>{`${item.en} · €${item.price}`}</Hint>
                </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-xs text-white/70">
                Mála: {s.basket.map((id) => SHOP_ITEMS[id].ga).join(", ") || "—"} · €{total}
              </div>
              <button className={primary} disabled={s.basket.length === 0} onClick={s.serve}>
                <kbd className="mr-1 text-[11px]">↵</kbd> Tabhair dó (Give)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
