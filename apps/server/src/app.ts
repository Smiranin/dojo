import { join } from 'node:path';
import cors from '@fastify/cors';
import type { Sensei, Settings } from '@dojo/core';
import Fastify, { type FastifyInstance } from 'fastify';
import { ContentStore } from './content/content-store.js';
import type { ServerContext } from './context.js';
import { registerErrorHandler } from './errors.js';
import { InboxStore } from './inbox/inbox-store.js';
import { RepLog } from './progress/rep-log.js';
import { registerContentRoutes } from './routes/content.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerInboxRoutes } from './routes/inbox.js';
import { registerEventRoutes } from './routes/events.js';
import { registerRepRoutes } from './routes/reps.js';
import { registerSenseiRoutes } from './routes/sensei.js';
import { SenseiHealthCache } from './sensei/health-cache.js';
import { EventHub } from './sse.js';
import { registerStatic } from './static.js';
import { watchFolders } from './watch.js';
import { INBOX_FILE, REPS_FILE } from './files.js';

export { INBOX_FILE, REPS_FILE } from './files.js';
/** The Vite dev server; the only cross-origin caller the API accepts. */
export const DEV_WEB_ORIGIN = 'http://localhost:5173';

export interface BuildAppOptions {
  settings: Settings;
  contentDir: string;
  dataDir: string;
  sensei: Sensei;
  version: string;
  /** Directory of the built web app; served when it exists. */
  webDist?: string;
  logger?: boolean;
  healthTtlMs?: number;
  heartbeatMs?: number;
  /** Watch the folders and publish change events; on by default. */
  watch?: { debounceMs?: number } | false;
}

export interface BuiltApp {
  app: FastifyInstance;
  context: ServerContext;
}

/** Wires stores and routes; the composition root supplies the Sensei and the paths. */
export async function buildApp(options: BuildAppOptions): Promise<BuiltApp> {
  const app = Fastify({ logger: options.logger ?? false });
  await app.register(cors, { origin: [DEV_WEB_ORIGIN] });
  registerErrorHandler(app);

  const context: ServerContext = {
    settings: options.settings,
    content: new ContentStore(options.contentDir),
    reps: new RepLog(join(options.dataDir, REPS_FILE)),
    inbox: new InboxStore(join(options.dataDir, INBOX_FILE)),
    sensei: options.sensei,
    senseiHealth: new SenseiHealthCache(options.sensei, options.healthTtlMs),
    events: new EventHub(options.heartbeatMs),
    version: options.version,
  };

  app.addHook('onClose', async () => context.events.closeAll());
  if (options.watch !== false) {
    const watcher = watchFolders({
      contentDir: options.contentDir,
      dataDir: options.dataDir,
      hub: context.events,
      ...(options.watch?.debounceMs !== undefined && { debounceMs: options.watch.debounceMs }),
      onError: (error) => app.log.error(error, 'The folder watcher failed'),
    });
    app.addHook('onClose', async () => watcher.close());
    await watcher.ready;
  }

  registerHealthRoutes(app, context);
  registerContentRoutes(app, context);
  registerRepRoutes(app, context);
  registerInboxRoutes(app, context);
  registerEventRoutes(app, context);
  registerSenseiRoutes(app, context);
  if (options.webDist) await registerStatic(app, options.webDist);

  return { app, context };
}
