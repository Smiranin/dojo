import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useStore } from '../lib/store.js';
import type { DojoState, DojoStore } from './dojo-store.js';
import type { SyncClient } from './sync.js';

export interface DojoRuntime {
  store: DojoStore;
  sync: SyncClient;
}

const DojoContext = createContext<DojoRuntime | null>(null);

export function DojoProvider({ runtime, children }: { runtime: DojoRuntime; children: ReactNode }) {
  useEffect(() => {
    void runtime.sync.start();
    return () => runtime.sync.stop();
  }, [runtime]);
  return <DojoContext.Provider value={runtime}>{children}</DojoContext.Provider>;
}

export function useRuntime(): DojoRuntime {
  const runtime = useContext(DojoContext);
  if (!runtime) throw new Error('useRuntime must be used inside DojoProvider');
  return runtime;
}

export function useDojoState(): DojoState {
  return useStore(useRuntime().store);
}

export function useSync(): SyncClient {
  return useRuntime().sync;
}
