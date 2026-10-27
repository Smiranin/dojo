import type { ChatTurn } from '@dojo/core';
import { useState } from 'react';
import { api } from '../../api/client.js';
import { Markdown } from '../../components/Markdown.js';
import { Button } from '../../components/ui/button.js';
import { Sheet, SheetContent } from '../../components/ui/sheet.js';
import { Textarea } from '../../components/ui/textarea.js';
import { SenseiWaiting } from '../sensei/SenseiWaiting.js';

export interface FollowUpSheetProps {
  cardId: string;
  open: boolean;
  onClose(): void;
  /** The conversation lives in the parent so it survives closing the sheet and dies with the Card. */
  history: ChatTurn[];
  onHistory(history: ChatTurn[]): void;
}

/** A stateless chat about the current Card: every message carries the whole history. */
export function FollowUpSheet({ cardId, open, onClose, history, onHistory }: FollowUpSheetProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const message = text.trim();
    if (!message) return;
    setBusy(true);
    setError(null);
    try {
      const { reply } = await api.senseiChat(cardId, history, message);
      onHistory([...history, { role: 'learner', text: message }, { role: 'sensei', text: reply }]);
      setText('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <SheetContent
        title="Ask the Sensei"
        description="About this Card only; the conversation is not kept."
      >
        <ol aria-label="Conversation" className="flex flex-col gap-3">
          {history.map((turn, index) => (
            <li
              key={index}
              className={
                turn.role === 'learner'
                  ? 'bg-secondary self-end rounded-xl px-3 py-2 text-sm'
                  : 'bg-card self-start rounded-xl border px-3 py-2'
              }
            >
              {turn.role === 'learner' ? (
                turn.text
              ) : (
                <Markdown text={turn.text} className="prose-sm" />
              )}
            </li>
          ))}
        </ol>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        {busy && <SenseiWaiting label="The Sensei is thinking…" />}
        <Textarea
          aria-label="Your question"
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={busy}
          rows={3}
          placeholder="Ask about this Card"
        />
        <Button onClick={() => void send()} disabled={busy || text.trim() === ''}>
          Send
        </Button>
      </SheetContent>
    </Sheet>
  );
}
