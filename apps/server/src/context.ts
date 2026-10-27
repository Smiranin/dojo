import type { Sensei, Settings } from '@dojo/core';
import type { ContentStore } from './content/content-store.js';
import type { InboxStore } from './inbox/inbox-store.js';
import type { RepLog } from './progress/rep-log.js';
import type { SenseiHealthCache } from './sensei/health-cache.js';
import type { EventHub } from './sse.js';

/** Everything the routes need, built once by the composition root. */
export interface ServerContext {
  settings: Settings;
  content: ContentStore;
  reps: RepLog;
  inbox: InboxStore;
  sensei: Sensei;
  senseiHealth: SenseiHealthCache;
  events: EventHub;
  version: string;
}
