import { defaultSettings, type Rep } from '@dojo/core';
import { describe, expect, it } from 'vitest';
import { initialState, type DojoState } from '../src/store/dojo-store.js';
import {
  filterCards,
  kataSummaries,
  searchSummaries,
  sortSummaries,
  tagBreakdown,
  trainingCards,
} from '../src/store/derive.js';
import { FakeDojo } from './fake-server.js';

const NOW = new Date('2026-10-05T10:00:00.000Z');

function loaded(reps: Rep[] = []): DojoState {
  const dojo = new FakeDojo();
  return {
    ...initialState(),
    snapshot: dojo.snapshot,
    settings: defaultSettings(),
    reps,
    loaded: true,
  };
}

describe('derive', () => {
  it('filters by any of the Tags and treats a Card without Difficulty as matching', () => {
    const state = loaded();
    const react = state.snapshot!.cards.filter((c) => c.kataId === 'react');

    const byTag = filterCards(react, { tags: ['performance'] }).map((c) => c.slug);
    const hardOrUnset = filterCards(state.snapshot!.cards, { difficulty: 'hard' }).map(
      (c) => c.slug,
    );

    expect(byTag).toEqual(['use-memo', 'context-rerender']);
    expect(hardOrUnset).toEqual(['stale-closure', 'dunder-eq-hash']);
  });

  it('orders a Due Training overdue first and respects the filters', () => {
    const reps: Rep[] = [
      { id: '1', card: 'react/keys', result: 'fail', at: '2026-10-01T10:00:00.000Z' },
      { id: '2', card: 'react/use-memo', result: 'pass', at: '2026-10-04T10:00:00.000Z' },
    ];
    const state = loaded(reps);

    const due = trainingCards(state, { kataId: 'react', scope: 'due', seed: 1 }, NOW);
    const filtered = trainingCards(
      state,
      { kataId: 'react', scope: 'all', tags: ['hooks'], seed: 1 },
      NOW,
    );

    expect(due[0]).toBe('react/keys');
    expect(due).not.toContain('react/use-memo');
    expect(filtered.sort()).toEqual(['react/stale-closure', 'react/use-memo']);
  });

  it('breaks progress down per Tag in the Kata order', () => {
    const state = loaded([
      { id: '1', card: 'react/keys', result: 'pass', at: '2026-01-01T00:00:00.000Z' },
    ]);
    const lots = Array.from({ length: 4 }, (_, i) => ({
      id: `k${i}`,
      card: 'react/keys',
      result: 'pass' as const,
      at: `2026-0${i + 2}-01T00:00:00.000Z`,
    }));

    const breakdown = tagBreakdown({ ...state, reps: [...state.reps, ...lots] }, 'react');

    expect(breakdown).toEqual([
      { tag: 'hooks', total: 2, known: 0 },
      { tag: 'rendering', total: 2, known: 1 },
      { tag: 'state-management', total: 1, known: 0 },
      { tag: 'performance', total: 2, known: 0 },
    ]);
  });

  it('searches by name and sorts by Due with pinned Katas on top', () => {
    const summaries = kataSummaries(loaded(), NOW);

    expect(searchSummaries(summaries, 'pyt').map((s) => s.kata.id)).toEqual(['python']);
    expect(sortSummaries(summaries, 'due').map((s) => s.kata.id)).toEqual(['react', 'python']);
    expect(
      sortSummaries(
        summaries.map((s) => ({ ...s, kata: { ...s.kata, pinned: false } })),
        'due',
      ).map((s) => s.kata.id),
    ).toEqual(['react', 'python']);
  });
});
