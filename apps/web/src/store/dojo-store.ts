import type { ContentSnapshot, HealthStatus, InboxNote, Rep, Settings } from '@dojo/core';
import { createStore, type Store } from '../lib/store.js';

export type Connection = 'online' | 'offline' | 'unknown';

export type PendingWrite =
  | { kind: 'rep'; rep: Rep; attempts: number }
  | { kind: 'inbox-add'; note: InboxNote; attempts: number }
  | { kind: 'inbox-remove'; id: string; attempts: number };

/** The in-memory replica of the server. Empty on every launch until the first fetch. */
export interface DojoState {
  snapshot: ContentSnapshot | null;
  settings: Settings | null;
  reps: Rep[];
  inbox: InboxNote[];
  /** Writes not yet confirmed by the server, in the order they were made. */
  pendingWrites: PendingWrite[];
  connection: Connection;
  senseiHealth: HealthStatus | null;
  /** The first fetch of every slice finished (with or without success). */
  loaded: boolean;
  /** A write the server refused (4xx/5xx); shown once and cleared. */
  lastWriteError: string | null;
}

export type DojoStore = Store<DojoState>;

export function initialState(): DojoState {
  return {
    snapshot: null,
    settings: null,
    reps: [],
    inbox: [],
    pendingWrites: [],
    connection: 'unknown',
    senseiHealth: null,
    loaded: false,
    lastWriteError: null,
  };
}

export function createDojoStore(state: DojoState = initialState()): DojoStore {
  return createStore(state);
}
