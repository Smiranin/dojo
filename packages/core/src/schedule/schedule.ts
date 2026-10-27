import type { SchedulingSettings } from '../api/settings.js';
import type { Belt, Card, CardId, Rep } from '../domain/types.js';

export const DAY_MS = 24 * 60 * 60 * 1000;

export interface CardSchedule {
  /** Days the last Result earned; 0 for a New Card. */
  intervalDays: number;
  /** ISO timestamp when the Card is Due again; null for a New Card (which is Due now). */
  dueAt: string | null;
  belt: Belt;
  lastRepAt: string | null;
}

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

export function beltOf(intervalDays: number, repCount: number, settings: SchedulingSettings): Belt {
  if (repCount === 0) return 'new';
  return intervalDays < settings.knownDays ? 'learning' : 'known';
}

/**
 * Derives the schedule of one Card from its Reps (ADR 0002): walk them in `at` order, each
 * Result sets the interval, and the Belt follows from the interval. Pure and deterministic.
 */
export function scheduleCard(reps: readonly Rep[], settings: SchedulingSettings): CardSchedule {
  const ordered = [...reps].sort((a, b) => a.at.localeCompare(b.at));
  let intervalDays = 0;
  let dueAt: string | null = null;
  let lastRepAt: string | null = null;
  for (const rep of ordered) {
    switch (rep.result) {
      case 'fail':
        intervalDays = settings.minDays;
        dueAt = rep.at;
        break;
      case 'pass-with-notes':
        intervalDays = settings.notesDays;
        dueAt = addDays(rep.at, intervalDays);
        break;
      case 'pass':
        intervalDays = Math.min(
          settings.capDays,
          Math.max(settings.firstPassDays, intervalDays * settings.growth),
        );
        dueAt = addDays(rep.at, intervalDays);
        break;
    }
    lastRepAt = rep.at;
  }
  return { intervalDays, dueAt, belt: beltOf(intervalDays, ordered.length, settings), lastRepAt };
}

export function isDue(schedule: CardSchedule, now: Date): boolean {
  if (schedule.dueAt === null) return true;
  return new Date(schedule.dueAt).getTime() <= now.getTime();
}

/** Groups Reps by Card, each group in `at` order. Reps of unknown Cards are kept; callers iterate Cards. */
export function repsByCard(reps: readonly Rep[]): Map<CardId, Rep[]> {
  const groups = new Map<CardId, Rep[]>();
  for (const rep of reps) {
    const group = groups.get(rep.card);
    if (group) group.push(rep);
    else groups.set(rep.card, [rep]);
  }
  for (const group of groups.values()) group.sort((a, b) => a.at.localeCompare(b.at));
  return groups;
}

export function scheduleCards(
  cards: readonly Card[],
  reps: readonly Rep[],
  settings: SchedulingSettings,
): Map<CardId, CardSchedule> {
  const groups = repsByCard(reps);
  const schedules = new Map<CardId, CardSchedule>();
  for (const card of cards)
    schedules.set(card.id, scheduleCard(groups.get(card.id) ?? [], settings));
  return schedules;
}

export interface BeltCounts {
  new: number;
  learning: number;
  known: number;
}

export interface Progress {
  total: number;
  due: number;
  belts: BeltCounts;
}

export function progressOf(
  cards: readonly Card[],
  schedules: ReadonlyMap<CardId, CardSchedule>,
  now: Date,
): Progress {
  const progress: Progress = { total: 0, due: 0, belts: { new: 0, learning: 0, known: 0 } };
  for (const card of cards) {
    const schedule = schedules.get(card.id);
    if (!schedule) continue;
    progress.total += 1;
    progress.belts[schedule.belt] += 1;
    if (isDue(schedule, now)) progress.due += 1;
  }
  return progress;
}

export interface TagProgress {
  tag: string;
  total: number;
  known: number;
}

/** "performance: 2 of 9 Known", for every Tag the Kata declares, in the Kata's order. */
export function tagProgress(
  tags: readonly string[],
  cards: readonly Card[],
  schedules: ReadonlyMap<CardId, CardSchedule>,
): TagProgress[] {
  return tags.map((tag) => {
    const tagged = cards.filter((card) => card.tags.includes(tag));
    const known = tagged.filter((card) => schedules.get(card.id)?.belt === 'known').length;
    return { tag, total: tagged.length, known };
  });
}
