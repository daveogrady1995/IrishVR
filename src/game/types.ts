export interface DialogueLine {
  speaker: 'Ava' | 'Leo';
  text: string;
  translation: string;
  duration: number;
  nextLine?: number;
  choices?: {
    text: string;
    translation: string;
    nextLine: number;
  }[];
}

export type CameraMode = 'walk' | 'cinematic';

export type RoomId = 'lounge' | 'cinema' | 'shop';
