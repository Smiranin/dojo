import {
  isDue,
  orderDue,
  orderShuffled,
  progressOf,
  scheduleCards,
  streakDays,
  tagProgress,
  todayRepCount,
  type Card,
  type CardId,
  type CardSchedule,
  type Difficulty,
  type InboxNote,
  type Kata,
  type Progress,
  type Rep,
  type TagProgress,
} from '@dojo/core';
import type { DojoState } from './dojo-store.js';

/** Reps the server holds plus the ones still being written, so a retried Rep already counts. */
export function effectiveReps(state: DojoState): Rep[] {
  const pending = state.pendingWrites.flatMap((w) => (w.kind === 'rep' ? [w.rep] : []));
  if (pending.length === 0) return state.reps;
  const known = new Set(state.reps.map((r) => r.id));
  return [...state.reps, ...pending.filter((r) => !known.has(r.id))];
}

/** The Inbox as the learner sees it: server notes plus pending adds, minus pending removes. */
export function effectiveInbox(state: DojoState): InboxNote[] {
  let notes = state.inbox;
  for (const write of state.pendingWrites) {
    if (write.kind === 'inbox-add' && !notes.some((n) => n.id === write.note.id)) {
      notes = [...notes, write.note];
    }
    if (write.kind === 'inbox-remove') notes = notes.filter((n) => n.id !== write.id);
  }
  return notes;
}

export function cardsOf(state: DojoState, kataId: string): Card[] {
  return state.snapshot?.cards.filter((c) => c.kataId === kataId) ?? [];
}

export function kataOf(state: DojoState, kataId: string): Kata | null {
  return state.snapshot?.katas.find((k) => k.id === kataId) ?? null;
}

export function cardById(state: DojoState, cardId: CardId): Card | null {
  return state.snapshot?.cards.find((c) => c.id === cardId) ?? null;
}

export function schedulesOf(state: DojoState, cards: readonly Card[]): Map<CardId, CardSchedule> {
  if (!state.settings) return new Map();
  return scheduleCards(cards, effectiveReps(state), state.settings.scheduling);
}

export interface KataSummary {
  kata: Kata;
  progress: Progress;
}

/** Non-archived Katas, pinned first, then by title. */
export function kataSummaries(state: DojoState, now: Date): KataSummary[] {
  if (!state.snapshot) return [];
  return state.snapshot.katas
    .filter((k) => !k.archived)
    .map((kata) => {
      const cards = cardsOf(state, kata.id);
      return { kata, progress: progressOf(cards, schedulesOf(state, cards), now) };
    })
    .sort((a, b) => {
      if (a.kata.pinned !== b.kata.pinned) return a.kata.pinned ? -1 : 1;
      return a.kata.title.localeCompare(b.kata.title);
    });
}

export function archivedKatas(state: DojoState): Kata[] {
  return state.snapshot?.katas.filter((k) => k.archived) ?? [];
}

export interface HomeStats {
  dueTotal: number;
  todayReps: number;
  streak: number;
}

export function homeStats(state: DojoState, now: Date, timeZone: string): HomeStats {
  const reps = effectiveReps(state);
  const dueTotal = kataSummaries(state, now).reduce((sum, s) => sum + s.progress.due, 0);
  return {
    dueTotal,
    todayReps: todayRepCount(reps, now, timeZone),
    streak: streakDays(reps, now, timeZone),
  };
}

export interface CardFilter {
  tags?: string[] | undefined;
  difficulty?: Difficulty | undefined;
}

/** Tag filter: any of the chosen Tags. Difficulty filter: a Card without one matches any value. */
export function filterCards(cards: readonly Card[], filter: CardFilter): Card[] {
  let result = [...cards];
  if (filter.tags && filter.tags.length > 0) {
    const wanted = filter.tags;
    result = result.filter((c) => c.tags.some((t) => wanted.includes(t)));
  }
  if (filter.difficulty) {
    const wanted = filter.difficulty;
    result = result.filter((c) => c.difficulty === undefined || c.difficulty === wanted);
  }
  return result;
}

export type KataSort = 'name' | 'due';

/** Pinned Katas stay on top in both orders; "due" puts the most Due Cards first. */
export function sortSummaries(summaries: KataSummary[], sort: KataSort): KataSummary[] {
  return [...summaries].sort((a, b) => {
    if (a.kata.pinned !== b.kata.pinned) return a.kata.pinned ? -1 : 1;
    if (sort === 'due' && a.progress.due !== b.progress.due) return b.progress.due - a.progress.due;
    return a.kata.title.localeCompare(b.kata.title);
  });
}

export function searchSummaries(summaries: KataSummary[], query: string): KataSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return summaries;
  return summaries.filter((s) => s.kata.title.toLowerCase().includes(needle));
}

export interface CardRow {
  card: Card;
  schedule: CardSchedule;
  due: boolean;
}

export function cardRows(
  state: DojoState,
  kataId: string,
  now: Date,
  filter: CardFilter = {},
): CardRow[] {
  const cards = filterCards(cardsOf(state, kataId), filter);
  const schedules = schedulesOf(state, cards);
  return cards.flatMap((card) => {
    const schedule = schedules.get(card.id);
    return schedule ? [{ card, schedule, due: isDue(schedule, now) }] : [];
  });
}

export function tagBreakdown(state: DojoState, kataId: string): TagProgress[] {
  const kata = kataOf(state, kataId);
  if (!kata) return [];
  const cards = cardsOf(state, kataId);
  return tagProgress(kata.tags, cards, schedulesOf(state, cards));
}

export interface TrainingSelection {
  /** One Kata, or every non-archived Kata when absent. */
  kataId?: string;
  scope: 'due' | 'all';
  tags?: string[];
  difficulty?: Difficulty;
  /** Seed for the shuffled order of "all"; fixed in tests. */
  seed: number;
}

/** The Cards of a Training, in order: Due ones by overdue first, "all" shuffled. */
export function trainingCards(state: DojoState, selection: TrainingSelection, now: Date): CardId[] {
  if (!state.snapshot) return [];
  const active = new Set(state.snapshot.katas.filter((k) => !k.archived).map((k) => k.id));
  const cards = filterCards(
    state.snapshot.cards.filter((c) =>
      selection.kataId ? c.kataId === selection.kataId : active.has(c.kataId),
    ),
    selection,
  );
  const schedules = schedulesOf(state, cards);
  if (selection.scope === 'due') {
    const due = cards.filter((c) => {
      const schedule = schedules.get(c.id);
      return schedule ? isDue(schedule, now) : false;
    });
    return orderDue(due, schedules);
  }
  return orderShuffled(cards, selection.seed);
}
