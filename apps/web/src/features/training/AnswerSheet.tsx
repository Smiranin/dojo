import type { Result } from '@dojo/core';
import { useState } from 'react';
import { api } from '../../api/client.js';
import { Button } from '../../components/ui/button.js';
import { Field } from '../../components/ui/field.js';
import { Sheet, SheetContent } from '../../components/ui/sheet.js';
import { Textarea } from '../../components/ui/textarea.js';
import { SenseiWaiting } from '../sensei/SenseiWaiting.js';

export interface AnswerSheetProps {
  cardId: string;
  open: boolean;
  onClose(): void;
  /** The Sensei's verdict lands here with the answer it graded; the Training reveals the Card
   *  with both, no confirm tap. */
  onChecked(result: Result, notes: string, answer: string): void;
}

export function AnswerSheet({ cardId, open, onClose, onChecked }: AnswerSheetProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const output = await api.senseiCheck(cardId, text);
      setText('');
      onChecked(output.result, output.notes, text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <SheetContent
        title="Your answer"
        description="In your own words; the Sensei grades it against the Card."
      >
        <Field label="Your answer" hideLabel error={error}>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={busy}
            autoFocus
            rows={6}
          />
        </Field>
        {busy ? (
          <SenseiWaiting label="The Sensei is reading your answer…" />
        ) : (
          <Button size="lg" onClick={() => void submit()} disabled={text.trim() === ''}>
            Check with the Sensei
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}
