import { useState } from 'react';
import { ConfirmButton } from '../components/ConfirmButton.js';
import { Shell } from '../components/Shell.js';
import { Button } from '../components/ui/button.js';
import { AuthoringSheet, type AuthoringRequest } from '../features/sensei/AuthoringSheet.js';
import { useSenseiAvailability } from '../features/sensei/useSenseiAvailability.js';
import { useDojoState, useSync } from '../store/context.js';
import { effectiveInbox } from '../store/derive.js';

export function InboxScreen() {
  const state = useDojoState();
  const sync = useSync();
  const sensei = useSenseiAvailability();
  const [authoring, setAuthoring] = useState<(AuthoringRequest & { noteId: string }) | null>(null);
  const notes = [...effectiveInbox(state)].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Shell title="Inbox" back="/">
      {!state.loaded ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing here. The pencil button adds a note from any screen.
        </p>
      ) : (
        <ul aria-label="Notes" className="flex flex-col divide-y rounded-xl border">
          {notes.map((note) => (
            <li key={note.id} className="flex flex-col gap-2 p-3">
              <p className="whitespace-pre-wrap">{note.text}</p>
              <div className="flex items-center justify-between gap-2">
                <time dateTime={note.at} className="text-muted-foreground text-xs">
                  {new Date(note.at).toLocaleString()}
                </time>
                <span className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!sensei.available}
                    title={sensei.reason || undefined}
                    onClick={() =>
                      setAuthoring({
                        kind: 'from-inbox',
                        context: { note: note.text },
                        noteId: note.id,
                      })
                    }
                  >
                    Make a Card
                  </Button>
                  <ConfirmButton
                    label="Delete"
                    confirmLabel="Delete note"
                    onConfirm={() => void sync.writeInboxRemove(note.id)}
                  />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!sensei.available && (
        <p className="text-muted-foreground text-center text-xs">{sensei.reason}</p>
      )}
      <AuthoringSheet
        request={authoring}
        onClose={() => setAuthoring(null)}
        // A note that became a Card has done its job; it leaves the Inbox.
        onDone={() => authoring && void sync.writeInboxRemove(authoring.noteId)}
      />
    </Shell>
  );
}
