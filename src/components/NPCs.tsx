import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Character } from './Character';
import { NPC_A_POS, NPC_B_POS, PROXIMITY_DISTANCE } from '@/game/constants';
import { useGame } from '@/game/store';
import { AMBIENT_DIALOGUE, DIALOGUE } from '@/game/dialogue';
import { speakIrish, stopIrishSpeech } from '@/game/speech';

function SpeechBubble({
  active,
  name,
  color,
  position,
  text,
  translation,
}: {
  active: boolean;
  name: string;
  color: string;
  position: [number, number, number];
  text: string;
  translation: string;
}) {
  return (
    <Html position={position} center distanceFactor={9} occlude={false} zIndexRange={[20, 0]}>
      <div
        className={`inline-flex w-fit min-w-[180px] max-w-[min(280px,68vw)] flex-col gap-1 rounded-xl px-4 py-2.5 shadow-lg transition-all duration-300 ${
          active ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
        }`}
        style={{
          background: 'rgba(15,12,8,0.85)',
          backdropFilter: 'blur(8px)',
          border: `1.5px solid ${color}`,
        }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="text-[10px] font-semibold text-white/60">{name}</span>
        </span>
        <span className="text-xs font-semibold leading-snug text-white">{text}</span>
        <span className="text-[10px] leading-snug text-white/55">{translation}</span>
      </div>
    </Html>
  );
}

export function NPCs() {
  const groupA = useRef<THREE.Group>(null);
  const groupB = useRef<THREE.Group>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const setNearby = useGame((s) => s.setNearby);
  const nearby = useGame((s) => s.nearby);
  const listening = useGame((s) => s.listening);
  const lineIndex = useGame((s) => s.lineIndex);
  const dialogueEnded = useGame((s) => s.dialogueEnded);
  const voiceEnabled = useGame((s) => s.voiceEnabled);
  const voiceError = useGame((s) => s.voiceError);
  const lastNearby = useRef(false);
  const [ambientIndex, setAmbientIndex] = useState(0);
  const ambientLine = AMBIENT_DIALOGUE[ambientIndex];

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setAmbientIndex((index) => (index + 1) % AMBIENT_DIALOGUE.length),
      ambientLine.duration * 1000,
    );
    return () => window.clearTimeout(timeout);
  }, [ambientIndex, ambientLine.duration]);

  // Grab player group from scene
  useFrame(({ scene }) => {
    if (!playerRef.current) {
      const p = scene.getObjectByName('player-group');
      playerRef.current = p as THREE.Group | null;
    }
  });

  useFrame(() => {
    const pa = groupA.current;
    const pb = groupB.current;
    const player = playerRef.current;
    if (!pa || !pb || !player) return;

    const dx = player.position.x - NPC_A_POS[0];
    const dz = player.position.z - NPC_A_POS[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const near = dist < PROXIMITY_DISTANCE;
    if (near !== lastNearby.current) {
      lastNearby.current = near;
      setNearby(near);
    }

    for (const [npc, position, baseFacing] of [
      [pa, NPC_A_POS, Math.PI / 2],
      [pb, NPC_B_POS, -Math.PI / 2],
    ] as const) {
      const targetFacing =
        nearby || (listening && !dialogueEnded)
          ? Math.atan2(player.position.x - position[0], player.position.z - position[2])
          : baseFacing;
      const targetGroupYaw = targetFacing - baseFacing;
      npc.rotation.y = THREE.MathUtils.damp(npc.rotation.y, targetGroupYaw, 5, 1 / 60);
    }
  });

  const activeDialogueLine = listening && !dialogueEnded ? DIALOGUE[lineIndex] : null;
  const activeLine = activeDialogueLine ?? (nearby ? DIALOGUE[0] : ambientLine);
  const activeLineId = activeDialogueLine
    ? `dialogue-${lineIndex}`
    : nearby
      ? 'dialogue-0'
      : `ambient-${ambientIndex}`;
  const currentSpeaker = activeLine?.speaker ?? null;

  useEffect(() => {
    if (!voiceEnabled || !activeLine || voiceError) {
      stopIrishSpeech();
      return;
    }

    let cancelled = false;
    const gestureEvents = ['pointerdown', 'keydown'] as const;
    const removeGestureListeners = () =>
      gestureEvents.forEach((type) => window.removeEventListener(type, play));

    function play() {
      removeGestureListeners();
      speakIrish(activeLineId).catch((error: unknown) => {
        if (cancelled || (error instanceof Error && error.name === 'AbortError')) return;

        // Autoplay is blocked until the player interacts, so retry on their next input.
        if (error instanceof Error && error.name === 'NotAllowedError') {
          gestureEvents.forEach((type) =>
            window.addEventListener(type, play, { once: true }),
          );
          return;
        }

        console.error('Irish voice playback failed:', error);
        useGame
          .getState()
          .setVoiceError(
            error instanceof Error ? error.message : 'Irish voice playback failed.',
          );
      });
    }

    play();

    return () => {
      cancelled = true;
      removeGestureListeners();
      stopIrishSpeech();
    };
  }, [activeLineId, voiceEnabled, voiceError]);

  return (
    <>
      <group ref={groupA} position={NPC_A_POS}>
        <Character
          bodyColor="#faa517"
          hairColor="#4b372c"
          skinColor="#d4a07a"
          pantsColor="#594033"
          speaking={currentSpeaker === 'Ava'}
          facing={Math.PI / 2}
        />
        <SpeechBubble
          active={currentSpeaker === 'Ava'}
          name="Ava"
          color="#2cc3ae"
          position={[0, 2.35, 0]}
          text={activeLine?.speaker === 'Ava' ? activeLine.text : ''}
          translation={activeLine?.speaker === 'Ava' ? activeLine.translation : ''}
        />
      </group>

      <group ref={groupB} position={NPC_B_POS}>
        <Character
          bodyColor="#2cc3ae"
          hairColor="#1f1b17"
          skinColor="#e8b896"
          pantsColor="#10524b"
          speaking={currentSpeaker === 'Leo'}
          facing={-Math.PI / 2}
        />
        <SpeechBubble
          active={currentSpeaker === 'Leo'}
          name="Leo"
          color="#faa517"
          position={[0, 2.35, 0]}
          text={activeLine?.speaker === 'Leo' ? activeLine.text : ''}
          translation={activeLine?.speaker === 'Leo' ? activeLine.translation : ''}
        />
      </group>
    </>
  );
}
