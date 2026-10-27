import { describe, expect, it } from 'vitest';
import {
  defaultSettings,
  isDue,
  progressOf,
  scheduleCard,
  scheduleCards,
  streakDays,
  tagProgress,
  todayRepCount,
  type Card,
  type Rep,
  type Result,
} from '../src/index.js';

const settings = defaultSettings().scheduling;
const CARD = 'react/use-memo';
const DAY_ONE = '2026-10-01T10:00:00.000Z';

/** One Rep per day starting on DAY_ONE, in the given order. */
function repsOf(results: Result[], card = CARD): Rep[] {
  return results.map((result, index) => ({
    id: `rep-${card}-${index}`,
    card,
    result,
    at: new Date(Date.parse(DAY_ONE) + index * 24 * 3600 * 1000).toISOString(),
  }));
}

function daysAfterLastRep(reps: Rep[], dueAt: string | null): number {
  const last = reps.at(-1)!;
  return (Date.parse(dueAt!) - Date.parse(last.at)) / (24 * 3600 * 1000);
}

describe('scheduleCard', () => {
  it.each<{ sequence: Result[]; intervalDays: number; belt: string }>([
    { sequence: [], intervalDays: 0, belt: 'new' },
    { sequence: ['fail'], intervalDays: 1, belt: 'learning' },
    { sequence: ['pass'], intervalDays: 7, belt: 'learning' },
    { sequence: ['pass', 'pass'], intervalDays: 14, belt: 'learning' },
    { sequence: ['pass', 'pass', 'pass'], intervalDays: 28, belt: 'known' },
    { sequence: ['pass-with-notes'], intervalDays: 3, belt: 'learning' },
    { sequence: ['pass-with-notes', 'pass'], intervalDays: 7, belt: 'learning' },
    { sequence: ['pass', 'fail', 'pass'], intervalDays: 7, belt: 'learning' },
    {
      sequence: ['pass', 'pass', 'pass', 'pass', 'pass', 'pass'],
      intervalDays: 180,
      belt: 'known',
    },
    { sequence: Array<Result>(8).fill('pass'), intervalDays: 180, belt: 'known' },
  ])(
    '$sequence gives $intervalDays days and the $belt Belt',
    ({ sequence, intervalDays, belt }) => {
      const reps = repsOf(sequence);

      const schedule = scheduleCard(reps, settings);

      expect(schedule.intervalDays).toBe(intervalDays);
      expect(schedule.belt).toBe(belt);
    },
  );

  it('puts the Due date intervalDays after the last Rep for a Pass', () => {
    const reps = repsOf(['pass', 'pass']);

    const schedule = scheduleCard(reps, settings);

    expect(daysAfterLastRep(reps, schedule.dueAt)).toBe(14);
    expect(schedule.lastRepAt).toBe(reps[1]!.at);
  });

  it('makes a failed Card Due at once', () => {
    const reps = repsOf(['pass', 'fail']);

    const schedule = scheduleCard(reps, settings);

    expect(schedule.dueAt).toBe(reps[1]!.at);
    expect(isDue(schedule, new Date(reps[1]!.at))).toBe(true);
  });

  it('orders Reps by time, not by array position', () => {
    const [first, second] = repsOf(['fail', 'pass']);

    const schedule = scheduleCard([second!, first!], settings);

    expect(schedule.intervalDays).toBe(7);
  });

  it('is deterministic: the same log gives the same schedule', () => {
    const reps = repsOf(['pass', 'pass-with-notes', 'pass']);

    expect(scheduleCard(reps, settings)).toEqual(scheduleCard(reps, settings));
  });
});

describe('isDue', () => {
  it('treats a New Card as Due', () => {
    expect(isDue(scheduleCard([], settings), new Date(DAY_ONE))).toBe(true);
  });

  it('is Due exactly when the Due date has passed', () => {
    const reps = repsOf(['pass']);
    const schedule = scheduleCard(reps, settings);
    const dueAt = new Date(schedule.dueAt!);

    expect(isDue(schedule, new Date(dueAt.getTime() - 1))).toBe(false);
    expect(isDue(schedule, dueAt)).toBe(true);
  });
});

describe('progressOf and tagProgress', () => {
  const cards: Card[] = [
    { id: 'react/a', kataId: 'react', slug: 'a', question: '', answer: '', tags: ['hooks'] },
    { id: 'react/b', kataId: 'react', slug: 'b', question: '', answer: '', tags: ['hooks'] },
    { id: 'react/c', kataId: 'react', slug: 'c', question: '', answer: '', tags: ['perf'] },
  ];
  const reps = [...repsOf(['pass', 'pass', 'pass'], 'react/a'), ...repsOf(['fail'], 'react/b')];
  const now = new Date('2026-10-05T00:00:00.000Z');

  it('counts Due Cards and Belts, ignoring Reps of Cards that no longer exist', () => {
    const repsWithOrphan = [...reps, ...repsOf(['pass'], 'react/deleted')];
    const schedules = scheduleCards(cards, repsWithOrphan, settings);

    const progress = progressOf(cards, schedules, now);

    expect(progress).toEqual({ total: 3, due: 2, belts: { new: 1, learning: 1, known: 1 } });
  });

  it('reports Known per Tag in the order the Kata declares them', () => {
    const schedules = scheduleCards(cards, reps, settings);

    const breakdown = tagProgress(['perf', 'hooks', 'unused'], cards, schedules);

    expect(breakdown).toEqual([
      { tag: 'perf', total: 1, known: 0 },
      { tag: 'hooks', total: 2, known: 1 },
      { tag: 'unused', total: 0, known: 0 },
    ]);
  });
});

describe('streak', () => {
  const KYIV = 'Europe/Kyiv';
  const atKyiv = (local: string) => ({ id: local, card: CARD, result: 'pass' as const, at: local });

  it('counts consecutive local days across midnight in a non-UTC zone', () => {
    // 23:30 Kyiv on Oct 1 is 20:30 UTC; 00:30 Kyiv on Oct 3 is 21:30 UTC on Oct 2.
    const reps = [atKyiv('2026-10-01T20:30:00.000Z'), atKyiv('2026-10-02T21:30:00.000Z')];
    const nowOct3Kyiv = new Date('2026-10-03T08:00:00.000Z');

    expect(streakDays(reps, nowOct3Kyiv, KYIV)).toBe(1);
    expect(streakDays(reps, nowOct3Kyiv, 'UTC')).toBe(2);
  });

  it('survives through today when yesterday had a Rep and today has none yet', () => {
    const reps = [atKyiv('2026-10-01T10:00:00.000Z'), atKyiv('2026-10-02T10:00:00.000Z')];
    const nowOct3 = new Date('2026-10-03T10:00:00.000Z');

    expect(streakDays(reps, nowOct3, 'UTC')).toBe(2);
  });

  it('breaks after a day without Reps', () => {
    const reps = [atKyiv('2026-10-01T10:00:00.000Z')];
    const nowOct3 = new Date('2026-10-03T10:00:00.000Z');

    expect(streakDays(reps, nowOct3, 'UTC')).toBe(0);
  });

  it('counts only today for todayRepCount', () => {
    const reps = [atKyiv('2026-10-02T21:30:00.000Z'), atKyiv('2026-10-02T10:00:00.000Z')];
    const nowOct3Kyiv = new Date('2026-10-03T08:00:00.000Z');

    expect(todayRepCount(reps, nowOct3Kyiv, KYIV)).toBe(1);
    expect(todayRepCount(reps, nowOct3Kyiv, 'UTC')).toBe(0);
  });
});
