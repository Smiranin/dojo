import { basename, relative, sep } from 'node:path';
import { SSE_EVENTS, type SseEventName } from '@dojo/core';
import { watch, type FSWatcher } from 'chokidar';
import { INBOX_FILE, REPS_FILE } from './files.js';
import type { EventHub } from './sse.js';

/** Editors save in bursts (temp file, rename, write); one event per burst is enough. */
export const WATCH_DEBOUNCE_MS = 300;

export interface WatchOptions {
  contentDir: string;
  dataDir: string;
  hub: EventHub;
  debounceMs?: number;
  /** Chokidar reports its own failures here; the Dojo keeps running without the watcher. */
  onError: (error: Error) => void;
}

export interface Watcher {
  /** Resolves once chokidar has scanned the folders and reports changes. */
  ready: Promise<void>;
  close(): Promise<void>;
}

/**
 * Watches `content/` and `data/` and publishes one debounced event per changed slice, so a
 * file written on the laptop reaches the phone within a few seconds (SPEC req. 4).
 */
export function watchFolders(options: WatchOptions): Watcher {
  const debounceMs = options.debounceMs ?? WATCH_DEBOUNCE_MS;
  const timers = new Map<SseEventName, NodeJS.Timeout>();
  const schedule = (name: SseEventName) => {
    const pending = timers.get(name);
    if (pending) clearTimeout(pending);
    timers.set(
      name,
      setTimeout(() => {
        timers.delete(name);
        options.hub.publish(name);
      }, debounceMs),
    );
  };
  const classify = (path: string): SseEventName | null => {
    if (!relative(options.contentDir, path).startsWith('..')) {
      return basename(path).endsWith('.md') ? SSE_EVENTS.content : null;
    }
    const inData = relative(options.dataDir, path);
    if (inData.startsWith('..') || inData.includes(sep)) return null;
    if (inData === REPS_FILE) return SSE_EVENTS.reps;
    if (inData === INBOX_FILE) return SSE_EVENTS.inbox;
    return null;
  };
  const watcher: FSWatcher = watch([options.contentDir, options.dataDir], {
    ignoreInitial: true,
    ignored: (path) => basename(path).startsWith('.'),
  });
  watcher.on('all', (_event, path) => {
    const name = classify(path);
    if (name) schedule(name);
  });
  watcher.on('error', (error) => options.onError(error as Error));
  const ready = new Promise<void>((resolve) => watcher.once('ready', resolve));
  return {
    ready,
    close: async () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      await watcher.close();
    },
  };
}
