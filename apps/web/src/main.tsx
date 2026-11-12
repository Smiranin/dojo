import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { api } from './api/client.js';
import { App } from './app.js';
import { KobzarWatch } from './features/dictation/kobzar-watch.js';
import { DojoProvider } from './store/context.js';
import { createDojoStore } from './store/dojo-store.js';
import { SyncClient } from './store/sync.js';
import './index.css';

const store = createDojoStore();
const sync = new SyncClient(store, { api, createEventSource: (url) => new EventSource(url) });
const kobzar = new KobzarWatch(store);

// Follow the system appearance; the `.dark` class drives the Tailwind variant.
const dark = window.matchMedia('(prefers-color-scheme: dark)');
const applyTheme = () => document.documentElement.classList.toggle('dark', dark.matches);
applyTheme();
dark.addEventListener('change', applyTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DojoProvider runtime={{ store, sync, kobzar }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DojoProvider>
  </StrictMode>,
);
