import { PencilLineIcon } from 'lucide-react';
import { useState } from 'react';
import { newId } from '../lib/utils.js';
import { useSync } from '../store/context.js';
import { ComposeField } from './ComposeField.js';
import { Button } from './ui/button.js';
import { Sheet, SheetContent } from './ui/sheet.js';

/** One tap from anywhere to drop a line into the Inbox. */
export function QuickNoteButton() {
  const sync = useSync();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    void sync.writeInboxAdd({ id: newId(), text: trimmed, at: new Date().toISOString() });
    setText('');
    setOpen(false);
  };

  return (
    <>
      <Button
        size="icon"
        aria-label="Quick note"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 size-12 rounded-full shadow-lg"
      >
        <PencilLineIcon className="size-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent title="Quick note" description="Goes to the Inbox; make a Card of it later.">
          <ComposeField
            label="Note"
            value={text}
            onChange={setText}
            onSubmit={save}
            submitLabel="Save note"
            canSubmit={text.trim() !== ''}
            autoFocus
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
