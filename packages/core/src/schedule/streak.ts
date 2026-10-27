import type { Rep } from '../domain/types.js';
import { DAY_MS } from './schedule.js';

/** `YYYY-MM-DD` of an instant in the given IANA time zone. */
export function localDay(at: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD, which is the sortable key the streak needs.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}

export function todayRepCount(reps: readonly Rep[], now: Date, timeZone: string): number {
  const today = localDay(now, timeZone);
  return reps.filter((rep) => localDay(new Date(rep.at), timeZone) === today).length;
}

/**
 * Consecutive local calendar days with at least one Rep, ending today or yesterday (so the
 * streak survives until the end of the day on which it would break).
 */
export function streakDays(reps: readonly Rep[], now: Date, timeZone: string): number {
  const days = new Set(reps.map((rep) => localDay(new Date(rep.at), timeZone)));
  if (days.size === 0) return 0;
  let cursor = now;
  if (!days.has(localDay(cursor, timeZone))) cursor = new Date(cursor.getTime() - DAY_MS);
  let streak = 0;
  while (days.has(localDay(cursor, timeZone))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}
