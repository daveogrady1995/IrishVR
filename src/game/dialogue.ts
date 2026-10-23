import type { DialogueLine } from './types';

export const DIALOGUE: DialogueLine[] = [
  {
    speaker: 'Ava',
    text: 'Dia duit! Fáilte romhat.',
    translation: 'Hello! You are very welcome.',
    duration: 3.5,
  },
  {
    speaker: 'Leo',
    text: 'An bhfuil tú ag foghlaim Gaeilge?',
    translation: 'Are you learning Irish?',
    duration: 4.5,
    choices: [
      {
        text: 'Tá, tá mé ag foghlaim beagáinín.',
        translation: 'Yes, I am learning a little.',
        nextLine: 2,
      },
      {
        text: 'Tá cúpla focal Gaeilge agam.',
        translation: 'I know a few words of Irish.',
        nextLine: 3,
      },
    ],
  },
  {
    speaker: 'Ava',
    text: 'Go hiontach! Is maith an rud é cleachtadh.',
    translation: 'Brilliant! Practising is a good thing.',
    duration: 4.5,
    nextLine: 4,
  },
  {
    speaker: 'Ava',
    text: 'Go hiontach! Foghlaimeoimid le chéile.',
    translation: 'Brilliant! We can learn together.',
    duration: 4.5,
    nextLine: 4,
  },
  {
    speaker: 'Leo',
    text: 'An maith leat cluichí?',
    translation: 'Do you like games?',
    duration: 3.5,
    choices: [
      {
        text: 'Is maith liom cluichí.',
        translation: 'I like games.',
        nextLine: 5,
      },
      {
        text: 'Is fearr liom an comhrá!',
        translation: 'I prefer the conversation!',
        nextLine: 6,
      },
    ],
  },
  {
    speaker: 'Ava',
    text: 'Mise freisin! Bain taitneamh as an gcluiche.',
    translation: 'Me too! Enjoy the game.',
    duration: 4.5,
    nextLine: 7,
  },
  {
    speaker: 'Ava',
    text: 'Maith thú! Bímid ag caint arís ar ball.',
    translation: 'Fair play! We will chat again soon.',
    duration: 4.5,
    nextLine: 7,
  },
  {
    speaker: 'Leo',
    text: 'Slán go fóill! Tar ar ais chugainn.',
    translation: 'Bye for now! Come back to us.',
    duration: 4,
  },
];

export const SPEAKER_COLORS: Record<string, string> = {
  Ava: '#2cc3ae',
  Leo: '#faa517',
};

export const AMBIENT_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'Ava',
    text: 'Is breá liom an áit seo.',
    translation: 'I love this place.',
    duration: 4,
  },
  {
    speaker: 'Leo',
    text: 'Tá atmaisféar deas anseo.',
    translation: 'There is a lovely atmosphere here.',
    duration: 4.5,
  },
  {
    speaker: 'Ava',
    text: 'An bhfuil tú réidh don chluiche?',
    translation: 'Are you ready for the game?',
    duration: 4.5,
  },
  {
    speaker: 'Leo',
    text: 'Cinnte! Beidh sé go hiontach.',
    translation: 'Definitely! It will be great.',
    duration: 4,
  },
];
