import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Character } from './Character';
import { NPC_A_POS, NPC_B_POS, PROXIMITY_DISTANCE } from '@/game/constants';
import { useGame } from '@/game/store';
import { DIALOGUE } from '@/game/dialogue';

function SpeechBubble({
  active,
  name,
  color,
  position,
}: {
  active: boolean;
  name: string;
  color: string;
  position: [number, number, number];
}) {
  return (
    <Html position={position} center distanceFactor={9} occlude={false} zIndexRange={[20, 0]}>
      <div
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-lg transition-all duration-300 ${
          active ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
        }`}
        style={{
          background: 'rgba(15,12,8,0.85)',
          backdropFilter: 'blur(8px)',
          border: `1.5px solid ${color}`,
        }}
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span className="text-xs font-semibold text-white whitespace-nowrap">{name}</span>
      </div>
    </Html>
  );
}

export function NPCs() {
  const groupA = useRef<THREE.Group>(null);
  const groupB = useRef<THREE.Group>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const setNearby = useGame((s) => s.setNearby);
  const listening = useGame((s) => s.listening);
  const lineIndex = useGame((s) => s.lineIndex);
  const dialogueEnded = useGame((s) => s.dialogueEnded);
  const lastNearby = useRef(false);

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
  });

  const currentSpeaker = listening && !dialogueEnded ? DIALOGUE[lineIndex]?.speaker : null;

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
        />
      </group>
    </>
  );
}
