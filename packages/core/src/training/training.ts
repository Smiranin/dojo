import type { Card, CardId, Rep, Result } from '../domain/types.js';
import type { CardSchedule } from '../schedule/schedule.js';

export type TrainingPhase = 'question' | 'revealed';

export interface CurrentCard {
  card: CardId;
  phase: TrainingPhase;
  /** The Result that `next` will commit; set when the Card is revealed. */
  pending?: Result;
  /** The Sensei's notes for a checked answer, shown above the reference answer. */
  notes?: string;
  /** What the learner wrote for the check; shown with the notes so they can be compared. */
  answer?: string;
}

export interface TrainingState {
  /** Cards still to show, in order. */
  queue: CardId[];
  current: CurrentCard | null;
  /** How often each Card was skipped; a second skip drops the Card from this Training. */
  skips: Record<CardId, number>;
  /** Reps written so far, in order. */
  committed: Rep[];
  /** Cards that left the current slot, by `next`, `end` or a drop. */
  shown: number;
}

export type TrainingAction =
  | { type: 'dont-know' }
  | { type: 'know' }
  | { type: 'skip' }
  /** The current Card was deleted: leave it without a Rep and never show it again. */
  | { type: 'drop' }
  | { type: 'answer-checked'; result: Result; notes: string; answer: string }
  | { type: 'change-result'; result: Result }
  | { type: 'next'; at: string; id: string }
  | { type: 'end'; at: string; id: string };

export function createTraining(cards: readonly CardId[]): TrainingState {
  const [first, ...rest] = cards;
  return {
    queue: rest,
    current: first === undefined ? null : { card: first, phase: 'question' },
    skips: {},
    committed: [],
    shown: 0,
  };
}

export function remaining(state: TrainingState): number {
  return state.queue.length + (state.current ? 1 : 0);
}

export function isFinished(state: TrainingState): boolean {
  return state.current === null;
}

function reveal(
  state: TrainingState,
  result: Result,
  checked?: { notes: string; answer: string },
): TrainingState {
  if (!state.current || state.current.phase !== 'question') return state;
  return {
    ...state,
    current: {
      card: state.current.card,
      phase: 'revealed',
      pending: result,
      ...checked,
    },
  };
}

function pullNext(state: TrainingState, queue: CardId[]): TrainingState {
  const [next, ...rest] = queue;
  return {
    ...state,
    queue: rest,
    current: next === undefined ? null : { card: next, phase: 'question' },
    shown: state.shown + 1,
  };
}

/** Commits the pending Result as a Rep; returns the Rep so `next` can re-enqueue a Fail. */
function commit(
  state: TrainingState,
  at: string,
  id: string,
): { state: TrainingState; rep: Rep | null } {
  const current = state.current;
  if (!current || current.phase !== 'revealed' || current.pending === undefined) {
    return { state, rep: null };
  }
  const rep: Rep = { id, card: current.card, result: current.pending, at };
  return { state: { ...state, committed: [...state.committed, rep] }, rep };
}

/**
 * The whole Training rule set (SPEC req. 11-19) as a pure reducer. Time and ids come in with
 * the action so the reducer never reads the clock or random numbers.
 */
export function trainingReducer(state: TrainingState, action: TrainingAction): TrainingState {
  switch (action.type) {
    case 'dont-know':
      return reveal(state, 'fail');
    case 'know':
      return reveal(state, 'pass');
    case 'answer-checked':
      return reveal(state, action.result, { notes: action.notes, answer: action.answer });
    case 'change-result': {
      if (!state.current || state.current.phase !== 'revealed') return state;
      return { ...state, current: { ...state.current, pending: action.result } };
    }
    case 'skip': {
      if (!state.current || state.current.phase !== 'question') return state;
      const card = state.current.card;
      const skippedBefore = state.skips[card] ?? 0;
      const skips = { ...state.skips, [card]: skippedBefore + 1 };
      // The first skip sends the Card to the end; the second drops it. No Rep either way, so
      // the Card stays Due for the next Training.
      const queue = skippedBefore === 0 ? [...state.queue, card] : state.queue;
      return pullNext({ ...state, skips }, queue);
    }
    case 'drop': {
      if (!state.current) return state;
      const gone = state.current.card;
      return pullNext(
        state,
        state.queue.filter((card) => card !== gone),
      );
    }
    case 'next': {
      if (!state.current || state.current.phase !== 'revealed') return state;
      const { state: committed, rep } = commit(state, action.at, action.id);
      const queue = rep?.result === 'fail' ? [...committed.queue, rep.card] : committed.queue;
      return pullNext(committed, queue);
    }
    case 'end': {
      if (!state.current) return state;
      const { state: committed } = commit(state, action.at, action.id);
      return { ...committed, queue: [], current: null, shown: committed.shown + 1 };
    }
  }
}

/** Overdue Cards first, the longest overdue on top, then New Cards in the given order. */
export function orderDue(
  cards: readonly Card[],
  schedules: ReadonlyMap<CardId, CardSchedule>,
): CardId[] {
  const overdue: Array<{ id: CardId; dueAt: string }> = [];
  const fresh: CardId[] = [];
  for (const card of cards) {
    const schedule = schedules.get(card.id);
    if (!schedule || schedule.dueAt === null) fresh.push(card.id);
    else overdue.push({ id: card.id, dueAt: schedule.dueAt });
  }
  overdue.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return [...overdue.map((entry) => entry.id), ...fresh];
}

/** mulberry32: a tiny seeded generator so a shuffled Training is reproducible in tests. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function orderShuffled(cards: readonly Card[], seed: number): CardId[] {
  const ids = cards.map((card) => card.id);
  const random = seededRandom(seed);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j] as CardId, ids[i] as CardId];
  }
  return ids;
}
