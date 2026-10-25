import { create } from 'zustand';
import {
  CUSTOMER_NAMES,
  GREETING_CHOICES,
  PAYMENT,
  PHRASES,
  SHOP_ITEMS,
  changeText,
  orderText,
  payText,
  shopSpeechKey,
  totalText,
  type ShopVoice,
} from './shopData';

export const SHIFT_LENGTH = 5;
const POINTS_PER_STEP = 10;
const OUTFITS = [
  { body: '#2a6f97', pants: '#2a2f3a' },
  { body: '#a23b72', pants: '#3a2a35' },
  { body: '#3b8f5a', pants: '#2a3a30' },
  { body: '#c26a2e', pants: '#3a2f2a' },
  { body: '#6c4ab6', pants: '#2a2a3a' },
  { body: '#b3392f', pants: '#2a2520' },
];
const HAIR = ['#1f1b17', '#4b372c', '#8a5a2b', '#c9b037', '#8d8d8d'];
const SKIN = ['#e8b896', '#d4a07a', '#f1c9a5', '#b98560'];

export type ShopPhase =
  | 'idle'
  | 'arriving'
  | 'greet'
  | 'order'
  | 'price'
  | 'pay'
  | 'leaving'
  | 'summary';

export interface Customer {
  id: number;
  name: string;
  voice: ShopVoice;
  body: string;
  pants: string;
  hair: string;
  skin: string;
  order: number[];
}

export interface ShopChoice {
  ga: string;
  en: string;
  correct: boolean;
  tried: boolean;
}

export interface SpokenLine {
  key: string;
  ga: string;
  en: string;
  voice: ShopVoice;
}

interface ShopState {
  phase: ShopPhase;
  customer: Customer | null;
  customerIndex: number;
  basket: number[];
  // Items the customer has taken off the shelves, and the 8 items offered on the till.
  picked: number[];
  menu: number[];
  choices: ShopChoice[];
  line: SpokenLine | null;
  feedback: { ok: boolean; ga: string; en: string } | null;
  score: number;
  stepMistakes: number;
  showEnglish: boolean;
  startShift: () => void;
  pickItem: (id: number) => void;
  arrived: () => void;
  choose: (index: number) => void;
  toggleItem: (id: number) => void;
  serve: () => void;
  nextCustomer: () => void;
  toggleEnglish: () => void;
  reset: () => void;
}

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const orderTotal = (ids: number[]) =>
  ids.reduce((sum, id) => sum + SHOP_ITEMS[id].price, 0);

function makeCustomer(id: number): Customer {
  const count = id < 2 ? 1 : 1 + Math.floor(Math.random() * 2);
  const outfit = pick(OUTFITS);
  return {
    id,
    name: pick(CUSTOMER_NAMES),
    voice: Math.random() < 0.5 ? 'orla' : 'colm',
    body: outfit.body,
    pants: outfit.pants,
    hair: pick(HAIR),
    skin: pick(SKIN),
    order: shuffle(SHOP_ITEMS.map((item) => item.id)).slice(0, count),
  };
}

// The correct amount plus two nearby wrong ones, kept within 1..9.
function amountChoices(correct: number, format: (n: number) => { ga: string; en: string }) {
  const wrong = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== correct))
    .sort((a, b) => Math.abs(a - correct) - Math.abs(b - correct))
    .slice(0, 4);
  return shuffle([correct, ...shuffle(wrong).slice(0, 2)]).map((n) => ({
    ...format(n),
    correct: n === correct,
    tried: false,
  }));
}

const initial = {
  phase: 'idle' as ShopPhase,
  customer: null as Customer | null,
  customerIndex: 0,
  basket: [] as number[],
  picked: [] as number[],
  menu: [] as number[],
  choices: [] as ShopChoice[],
  line: null as SpokenLine | null,
  feedback: null as ShopState['feedback'],
  score: 0,
  stepMistakes: 0,
};

export const useShop = create<ShopState>((set, get) => {
  const spawn = (index: number) =>
    set({
      ...initial,
      score: get().score,
      customerIndex: index,
      customer: makeCustomer(index),
      phase: 'arriving',
    });

  const award = () =>
    set({
      score: get().score + (get().stepMistakes === 0 ? POINTS_PER_STEP : POINTS_PER_STEP / 2),
      stepMistakes: 0,
    });

  return {
    ...initial,
    showEnglish: true,

    startShift: () => {
      set({ score: 0 });
      spawn(0);
    },

    pickItem: (id) => set({ picked: [...get().picked, id] }),

    arrived: () => {
      const { phase, customer } = get();
      if (phase !== 'arriving' || !customer) return;
      set({
        phase: 'greet',
        line: { key: shopSpeechKey('greet'), ...PHRASES.greet, voice: customer.voice },
        choices: shuffle([
          { ...GREETING_CHOICES.correct, correct: true, tried: false },
          ...GREETING_CHOICES.wrong.map((c) => ({ ...c, correct: false, tried: false })),
        ]),
      });
    },

    choose: (index) => {
      const { phase, customer, choices } = get();
      const choice = choices[index];
      if (!customer || !choice || choice.tried) return;

      if (!choice.correct) {
        set({
          choices: choices.map((c, i) => (i === index ? { ...c, tried: true } : c)),
          stepMistakes: get().stepMistakes + 1,
          feedback: { ok: false, ...PHRASES.tryAgain },
        });
        return;
      }

      award();
      const total = orderTotal(customer.order);
      if (phase === 'greet') {
        set({
          phase: 'order',
          choices: [],
          menu: shuffle([
            ...customer.order,
            ...shuffle(SHOP_ITEMS.map((i) => i.id).filter((id) => !customer.order.includes(id))).slice(
              0,
              8 - customer.order.length,
            ),
          ]),
          feedback: { ok: true, ...PHRASES.good },
          line: {
            key: shopSpeechKey('order', customer.order),
            ...orderText(customer.order),
            voice: customer.voice,
          },
        });
      } else if (phase === 'price') {
        set({
          phase: 'pay',
          feedback: { ok: true, ...PHRASES.good },
          line: { key: shopSpeechKey('pay', PAYMENT), ...payText(PAYMENT), voice: customer.voice },
          choices: amountChoices(PAYMENT - total, changeText),
        });
      } else if (phase === 'pay') {
        set({
          phase: 'leaving',
          choices: [],
          feedback: { ok: true, ...PHRASES.good },
          line: { key: shopSpeechKey('thanks'), ...PHRASES.thanks, voice: customer.voice },
        });
      }
    },

    toggleItem: (id) => {
      const { phase, basket } = get();
      if (phase !== 'order') return;
      set({
        basket: basket.includes(id) ? basket.filter((b) => b !== id) : [...basket, id].slice(0, 3),
      });
    },

    serve: () => {
      const { phase, customer, basket } = get();
      if (phase !== 'order' || !customer || basket.length === 0) return;

      const correct =
        basket.length === customer.order.length &&
        customer.order.every((id) => basket.includes(id));
      if (!correct) {
        set({
          basket: [],
          stepMistakes: get().stepMistakes + 1,
          feedback: { ok: false, ...PHRASES.wrongOrder },
        });
        return;
      }

      award();
      set({
        phase: 'price',
        feedback: { ok: true, ...PHRASES.good },
        line: { key: shopSpeechKey('price'), ...PHRASES.price, voice: customer.voice },
        choices: amountChoices(orderTotal(customer.order), totalText),
      });
    },

    nextCustomer: () => {
      if (get().phase !== 'leaving') return;
      const next = get().customerIndex + 1;
      if (next >= SHIFT_LENGTH) {
        set({ ...initial, score: get().score, customerIndex: next, phase: 'summary' });
      } else {
        spawn(next);
      }
    },

    toggleEnglish: () => set({ showEnglish: !get().showEnglish }),
    reset: () => set({ ...initial, score: 0 }),
  };
});

export const MAX_SCORE = SHIFT_LENGTH * 4 * POINTS_PER_STEP;
