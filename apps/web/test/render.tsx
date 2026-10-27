import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { api } from '../src/api/client.js';
import { App } from '../src/app.js';
import { DojoProvider } from '../src/store/context.js';
import { createDojoStore, type DojoStore } from '../src/store/dojo-store.js';
import { SyncClient } from '../src/store/sync.js';
import { FakeDojo, mswServer } from './fake-server.js';

export interface RenderedApp extends RenderResult {
  store: DojoStore;
  sync: SyncClient;
  dojo: FakeDojo;
}

/** Renders the whole app at a route against a FakeDojo served by msw, without SSE. */
export function renderApp(route: string, dojo = new FakeDojo()): RenderedApp {
  mswServer.use(...dojo.handlers());
  const store = createDojoStore();
  const sync = new SyncClient(store, {
    api,
    createEventSource: () => null,
    retryDelaysMs: [0, 0, 0],
    reconnectPollMs: 60_000,
  });
  const result = render(
    <DojoProvider runtime={{ store, sync }}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </DojoProvider>,
  );
  return { ...result, store, sync, dojo };
}
