import { describe, expect, it } from 'vitest';
import {
  createTraining,
  isFinished,
  orderDue,
  orderShuffled,
  remaining,
  trainingReducer,
  type Card,
  type CardSchedule,
  type TrainingAction,
  type TrainingState,
} from '../src/index.js';

const A = 'react/a';
const B = 'react/b';
const C = 'react/c';

let counter = 0;
const next = (): TrainingAction => ({
  type: 'next',
  at: `2026-10-05T10:00:0${counter}.000Z`,
  id: `rep-${counter++}`,
});
const end = (): TrainingAction => ({ type: 'end', at: '2026-10-05T11:00:00.000Z', id: 'rep-end' });

function run(state: TrainingState, actions: TrainingAction[]): TrainingState {
  return actions.reduce(trainingReducer, state);
}

describe('trainingReducer', () => {
  it('starts on the first Card with the question hidden', () => {
    const state = createTraining([A, B]);

    expect(state.current).toEqual({ card: A, phase: 'question' });
    expect(remaining(state)).toBe(2);
  });

  it("Don't know reveals with a pending Fail and next re-enqueues the Card at the end", () => {
    const state = run(createTraining([A, B]), [{ type: 'dont-know' }, next()]);

    expect(state.committed).toMatchObject([{ card: A, result: 'fail' }]);
    expect(state.current?.card).toBe(B);
    expect(state.queue).toEqual([A]);
    expect(remaining(state)).toBe(2);
  });

  it('Know reveals with a pending Pass and next removes the Card', () => {
    const state = run(createTraining([A, B]), [{ type: 'know' }, next()]);

    expect(state.committed).toMatchObject([{ card: A, result: 'pass' }]);
    expect(state.queue).toEqual([]);
    expect(state.current?.card).toBe(B);
  });

  it('change-result before next replaces the pending Result', () => {
    const state = run(createTraining([A]), [
      { type: 'know' },
      { type: 'change-result', result: 'pass-with-notes' },
      next(),
    ]);

    expect(state.committed).toMatchObject([{ card: A, result: 'pass-with-notes' }]);
    expect(isFinished(state)).toBe(true);
  });

  it('answer-checked reveals with the Sensei Result and notes', () => {
    const state = run(createTraining([A]), [
      { type: 'answer-checked', result: 'pass-with-notes', notes: 'Mention stability.' },
    ]);

    expect(state.current).toEqual({
      card: A,
      phase: 'revealed',
      pending: 'pass-with-notes',
      notes: 'Mention stability.',
    });
  });

  it('skip once moves the Card to the end, skip twice drops it without a Rep', () => {
    const once = run(createTraining([A, B]), [{ type: 'skip' }]);
    expect(once.current?.card).toBe(B);
    expect(once.queue).toEqual([A]);

    const twice = run(once, [{ type: 'know' }, next(), { type: 'skip' }]);

    expect(twice.current).toBeNull();
    expect(twice.committed.map((rep) => rep.card)).toEqual([B]);
    expect(remaining(twice)).toBe(0);
  });

  it('ignores next while the question is still hidden', () => {
    const state = createTraining([A, B]);

    expect(run(state, [next()])).toBe(state);
  });

  it('end commits a revealed pending Result and empties the queue', () => {
    const state = run(createTraining([A, B, C]), [{ type: 'dont-know' }, end()]);

    expect(state.committed).toMatchObject([{ card: A, result: 'fail', id: 'rep-end' }]);
    expect(state.queue).toEqual([]);
    expect(isFinished(state)).toBe(true);
  });

  it('end on a hidden question commits nothing', () => {
    const state = run(createTraining([A, B]), [end()]);

    expect(state.committed).toEqual([]);
    expect(isFinished(state)).toBe(true);
  });

  it('drop removes the current Card everywhere without a Rep', () => {
    const state = run(createTraining([A, B, A]), [{ type: 'drop' }]);

    expect(state.current?.card).toBe(B);
    expect(state.queue).toEqual([]);
    expect(state.committed).toEqual([]);
  });

  it('uses the id and time from the action for the Rep', () => {
    const state = run(createTraining([A]), [
      { type: 'know' },
      { type: 'next', at: '2026-01-01T00:00:00.000Z', id: 'fixed-id' },
    ]);

    expect(state.committed).toEqual([
      { id: 'fixed-id', card: A, result: 'pass', at: '2026-01-01T00:00:00.000Z' },
    ]);
  });
});

describe('ordering', () => {
  const card = (id: string): Card => ({
    id,
    kataId: 'react',
    slug: id,
    question: '',
    answer: '',
    tags: [],
  });
  const schedule = (dueAt: string | null): CardSchedule => ({
    intervalDays: dueAt === null ? 0 : 7,
    dueAt,
    belt: dueAt === null ? 'new' : 'learning',
    lastRepAt: null,
  });

  it('puts the longest overdue Card first and New Cards last', () => {
    const cards = [card(A), card(B), card(C)];
    const schedules = new Map([
      [A, schedule(null)],
      [B, schedule('2026-10-03T00:00:00.000Z')],
      [C, schedule('2026-10-01T00:00:00.000Z')],
    ]);

    expect(orderDue(cards, schedules)).toEqual([C, B, A]);
  });

  it('shuffles the same way for the same seed and differently for another', () => {
    const cards = ['a', 'b', 'c', 'd', 'e', 'f'].map(card);

    const first = orderShuffled(cards, 42);
    const again = orderShuffled(cards, 42);
    const other = orderShuffled(cards, 7);

    expect(again).toEqual(first);
    expect([...first].sort()).toEqual(cards.map((c) => c.id));
    expect(other).not.toEqual(first);
  });
});
