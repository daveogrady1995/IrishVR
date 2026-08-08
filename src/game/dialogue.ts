import type { DialogueLine } from './types';

export const DIALOGUE: DialogueLine[] = [
  { speaker: 'Ava', text: "Did you hear about the new web game engine?", duration: 4.2 },
  { speaker: 'Leo', text: "Yeah, it lets us build full 3D browser games in seconds!", duration: 4.8 },
  { speaker: 'Ava', text: "No downloads, no installs — it just runs straight in the browser.", duration: 5.2 },
  { speaker: 'Leo', text: "And the rendering is surprisingly smooth for something web-based.", duration: 5.0 },
  { speaker: 'Ava', text: "Right? Real-time lighting, shadows, even character animations.", duration: 4.8 },
  { speaker: 'Leo', text: "Imagine prototyping a whole scene like this without ever leaving your laptop.", duration: 5.6 },
  { speaker: 'Ava', text: "Honestly, it kind of changes how I think about making games.", duration: 4.6 },
  { speaker: 'Leo', text: "Same. The barrier to entry just dropped to almost zero.", duration: 4.4 },
];

export const SPEAKER_COLORS: Record<string, string> = {
  Ava: '#2cc3ae',
  Leo: '#faa517',
};
