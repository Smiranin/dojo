import {
  createTraining,
  isFinished,
  remaining,
  trainingReducer,
  type CardId,
  type Result,
  type TrainingState,
} from '@dojo/core';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { newId } from '../../lib/utils.js';
import { useSync } from '../../store/context.js';

export interface TrainingHandle {
  state: TrainingState;
  remaining: number;
  finished: boolean;
  dontKnow(): void;
  know(): void;
  skip(): void;
  drop(): void;
  answerChecked(result: Result, notes: string, answer: string): void;
  changeResult(result: Result): void;
  next(): void;
  end(): void;
}

/**
 * Drives the core reducer and hands every newly committed Rep to the sync client. The id and
 * time of a Rep are made here, at the tap, so the reducer stays pure.
 */
export function useTraining(cards: CardId[]): TrainingHandle {
  const [state, dispatch] = useReducer(trainingReducer, cards, createTraining);
  const sync = useSync();
  const written = useRef(0);
  useEffect(() => {
    const fresh = state.committed.slice(written.current);
    written.current = state.committed.length;
    for (const rep of fresh) void sync.writeRep(rep);
  }, [state.committed, sync]);

  const stamp = () => ({ at: new Date().toISOString(), id: newId() });
  return {
    state,
    remaining: remaining(state),
    finished: isFinished(state),
    dontKnow: useCallback(() => dispatch({ type: 'dont-know' }), []),
    know: useCallback(() => dispatch({ type: 'know' }), []),
    skip: useCallback(() => dispatch({ type: 'skip' }), []),
    drop: useCallback(() => dispatch({ type: 'drop' }), []),
    answerChecked: useCallback(
      (result: Result, notes: string, answer: string) =>
        dispatch({ type: 'answer-checked', result, notes, answer }),
      [],
    ),
    changeResult: useCallback((result: Result) => dispatch({ type: 'change-result', result }), []),
    next: useCallback(() => dispatch({ type: 'next', ...stamp() }), []),
    end: useCallback(() => dispatch({ type: 'end', ...stamp() }), []),
  };
}
