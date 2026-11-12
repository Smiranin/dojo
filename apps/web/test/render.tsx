import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { api } from '../src/api/client.js';
import { App } from '../src/app.js';
import { KobzarWatch } from '../src/features/dictation/kobzar-watch.js';
import { DojoProvider } from '../src/store/context.js';
import { createDojoStore, type DojoStore } from '../src/store/dojo-store.js';
import { SyncClient } from '../src/store/sync.js';
import type { FakeKobzar } from './fake-kobzar.js';
import { FakeDojo, mswServer } from './fake-server.js';

export interface RenderedApp extends RenderResult {
  store: DojoStore;
  sync: SyncClient;
  dojo: FakeDojo;
}

export interface RenderAppOptions {
  /** Configures the Dojo with this Kobzar and serves it; without it no Kobzar is configured. */
  kobzar?: FakeKobzar;
}

/** Short enough that a test sees Kobzar come back without waiting. */
const KOBZAR_TEST_POLL_MS = 30;

/** Renders the whole app at a route against a FakeDojo served by msw, without SSE. */
export function renderApp(
  route: string,
  dojo = new FakeDojo(),
  options: RenderAppOptions = {},
): RenderedApp {
  mswServer.use(...dojo.handlers());
  if (options.kobzar) {
    dojo.settings.kobzar = { url: options.kobzar.url };
    mswServer.use(...options.kobzar.handlers());
  }
  const store = createDojoStore();
  const sync = new SyncClient(store, {
    api,
    createEventSource: () => null,
    retryDelaysMs: [0, 0, 0],
    reconnectPollMs: 60_000,
  });
  const kobzar = new KobzarWatch(store, {
    readyPollMs: KOBZAR_TEST_POLL_MS,
    unavailablePollMs: KOBZAR_TEST_POLL_MS,
  });
  const result = render(
    <DojoProvider runtime={{ store, sync, kobzar }}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </DojoProvider>,
  );
  return { ...result, store, sync, dojo };
}
