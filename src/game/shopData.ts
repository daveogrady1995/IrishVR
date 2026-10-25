// Self-contained (no path aliases) because the Netlify TTS function imports it too.

export type ShopVoice = 'orla' | 'colm';

export interface ShopItem {
  id: number;
  ga: string;
  en: string;
  price: number;
  emoji: string;
  // File name in /models/food (Kenney Food Kit, CC0) and its on-shelf height in metres.
  model: string;
  size: number;
}

// Bundled starter vocabulary. Look-up links for each word are generated in `lookupLinks`.
export const SHOP_ITEMS: ShopItem[] = [
  { id: 0, ga: 'arán', en: 'bread', price: 2, emoji: '🍞', model: 'loaf', size: 0.42 },
  { id: 1, ga: 'bainne', en: 'milk', price: 1, emoji: '🥛', model: 'carton', size: 0.42 },
  { id: 2, ga: 'uibheacha', en: 'eggs', price: 3, emoji: '🥚', model: 'egg', size: 0.22 },
  { id: 3, ga: 'mil', en: 'honey', price: 4, emoji: '🍯', model: 'honey', size: 0.34 },
  { id: 4, ga: 'cáis', en: 'cheese', price: 4, emoji: '🧀', model: 'cheese', size: 0.4 },
  { id: 5, ga: 'úll', en: 'apple', price: 1, emoji: '🍎', model: 'apple', size: 0.24 },
  { id: 6, ga: 'banana', en: 'banana', price: 1, emoji: '🍌', model: 'banana', size: 0.34 },
  { id: 7, ga: 'oráiste', en: 'orange', price: 1, emoji: '🍊', model: 'orange', size: 0.24 },
  { id: 8, ga: 'tae', en: 'tea', price: 3, emoji: '🍵', model: 'cup-tea', size: 0.3 },
  { id: 9, ga: 'caife', en: 'coffee', price: 4, emoji: '☕', model: 'cup-coffee', size: 0.3 },
  { id: 10, ga: 'seacláid', en: 'chocolate', price: 2, emoji: '🍫', model: 'chocolate', size: 0.34 },
  { id: 11, ga: 'briosca', en: 'biscuit', price: 2, emoji: '🍪', model: 'cookie', size: 0.24 },
  { id: 12, ga: 'sú talún', en: 'strawberry', price: 3, emoji: '🍓', model: 'strawberry', size: 0.24 },
  { id: 13, ga: 'uisce', en: 'water', price: 1, emoji: '💧', model: 'soda-bottle', size: 0.42 },
];

export const PAYMENT = 10;

const NUMBERS_GA = ['', 'aon', 'dhá', 'trí', 'ceithre', 'cúig', 'sé', 'seacht', 'ocht', 'naoi', 'deich'];

export const euroGa = (n: number) => `${NUMBERS_GA[n]} euro`;
export const euroEn = (n: number) => `€${n}`;

function joinList(words: string[], and: string) {
  return words.length > 1
    ? `${words.slice(0, -1).join(', ')} ${and} ${words[words.length - 1]}`
    : words[0];
}

export function orderText(ids: number[]) {
  const items = ids.map((id) => SHOP_ITEMS[id]);
  return {
    ga: `Teastaíonn ${joinList(items.map((i) => i.ga), 'agus')} uaim.`,
    en: `I need ${joinList(items.map((i) => i.en), 'and')}.`,
  };
}

export const PHRASES = {
  greet: { ga: 'Dia duit!', en: 'Hello!' },
  price: { ga: 'Cé mhéad ar fad?', en: 'How much altogether?' },
  thanks: { ga: 'Go raibh maith agat! Slán!', en: 'Thank you! Goodbye!' },
  wrongOrder: { ga: 'Ní hé sin atá uaim.', en: "That's not what I need." },
  tryAgain: { ga: 'Ní hea. Bain triail eile as.', en: 'No. Try again.' },
  good: { ga: 'Go maith!', en: 'Well done!' },
};

export const payText = (n: number) => ({
  ga: `Seo ${euroGa(n)}.`,
  en: `Here is ${euroEn(n)}.`,
});

export const totalText = (n: number) => ({
  ga: `Sin ${euroGa(n)} ar fad.`,
  en: `That's ${euroEn(n)} altogether.`,
});

export const changeText = (n: number) => ({
  ga: `Seo do shóinseáil: ${euroGa(n)}.`,
  en: `Here is your change: ${euroEn(n)}.`,
});

export const GREETING_CHOICES = {
  correct: { ga: 'Dia is Muire duit! Cad a theastaíonn uait?', en: 'Hello! What do you need?' },
  wrong: [
    { ga: 'Slán abhaile!', en: 'Safe home! (goodbye)' },
    { ga: 'Oíche mhaith!', en: 'Good night!' },
  ],
};

export const CUSTOMER_NAMES = [
  'Seán', 'Áine', 'Pádraig', 'Siobhán', 'Mícheál', 'Máire', 'Cian', 'Niamh', 'Eoin', 'Aoife',
];

export function lookupLinks(ga: string, en: string) {
  return {
    teanglann: `https://www.teanglann.ie/ga/fgb/${encodeURIComponent(ga)}`,
    focloir: `https://www.focloir.ie/en/dictionary/ei/${encodeURIComponent(en)}`,
    tearma: `https://www.tearma.ie/q/${encodeURIComponent(ga)}/`,
  };
}

// Keys are what the client sends to the TTS function, so only whitelisted phrases can be spoken.
export function shopSpeechKey(kind: 'greet' | 'price' | 'thanks'): string;
export function shopSpeechKey(kind: 'order', ids: number[]): string;
export function shopSpeechKey(kind: 'pay', amount: number): string;
export function shopSpeechKey(kind: string, arg?: number | number[]): string {
  if (kind === 'order') return `order-${(arg as number[]).join('-')}`;
  if (kind === 'pay') return `pay-${arg}`;
  return kind;
}

export function resolveShopSpeech(key: string): string | null {
  if (key === 'greet') return PHRASES.greet.ga;
  if (key === 'price') return PHRASES.price.ga;
  if (key === 'thanks') return PHRASES.thanks.ga;

  const order = /^order-(\d{1,2}(?:-\d{1,2}){0,2})$/.exec(key);
  if (order) {
    const ids = order[1].split('-').map(Number);
    const valid = ids.every((id) => SHOP_ITEMS[id]) && new Set(ids).size === ids.length;
    return valid ? orderText(ids).ga : null;
  }

  const pay = /^pay-(\d{1,2})$/.exec(key);
  if (pay && Number(pay[1]) === PAYMENT) return payText(PAYMENT).ga;

  return null;
}
