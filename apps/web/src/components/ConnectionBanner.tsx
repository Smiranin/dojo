import { useDojoState, useSync } from '../store/context.js';
import { Button } from './ui/button.js';

/** Says when the server is unreachable and how many writes wait; nothing survives a reload. */
export function ConnectionBanner() {
  const state = useDojoState();
  const sync = useSync();
  const pending = state.pendingWrites.length;
  if (state.lastWriteError) {
    return (
      <div
        role="alert"
        className="bg-destructive/15 text-destructive flex items-center justify-between gap-3 px-4 py-2 text-sm"
      >
        <span>The server refused a write: {state.lastWriteError}</span>
        <Button size="sm" variant="ghost" onClick={() => sync.clearWriteError()}>
          Dismiss
        </Button>
      </div>
    );
  }
  if (state.connection !== 'offline' && pending === 0) return null;
  const unsaved = pending === 1 ? '1 write unsaved' : `${pending} writes unsaved`;
  return (
    <div
      role="status"
      className="bg-warning/15 text-warning flex items-center justify-between gap-3 px-4 py-2 text-sm"
    >
      <span>
        {state.connection === 'offline' ? 'The Dojo server is unreachable.' : 'Saving…'}
        {pending > 0 ? ` ${unsaved}; lost if you close the page.` : ''}
      </span>
      {state.connection === 'offline' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => void sync.refetchAll().then(() => sync.flush())}
        >
          Retry
        </Button>
      )}
    </div>
  );
}
