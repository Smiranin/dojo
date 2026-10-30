import type { AuthorKind, ChatTurn, SenseiAuthorResponse } from '@dojo/core';
import { useState } from 'react';
import { api } from '../../api/client.js';
import { Button } from '../../components/ui/button.js';
import { Field } from '../../components/ui/field.js';
import { Select } from '../../components/ui/select.js';
import { Sheet, SheetContent } from '../../components/ui/sheet.js';
import { Textarea } from '../../components/ui/textarea.js';
import { useDojoState, useSync } from '../../store/context.js';
import { SenseiWaiting } from './SenseiWaiting.js';

export interface AuthoringRequest {
  kind: AuthorKind;
  /** Preselected Kata; `from-inbox` offers a picker when absent. */
  kataId?: string;
  cardId?: string;
  context?: { chat?: ChatTurn[]; note?: string };
}

export interface AuthoringSheetProps {
  request: AuthoringRequest | null;
  onClose(): void;
  onDone?(response: SenseiAuthorResponse): void;
}

const TITLE: Record<AuthorKind, string> = {
  'add-cards': 'Add Cards',
  'new-kata': 'New Kata',
  'fix-card': 'Fix this Card',
  'from-chat': 'Save the conversation as a Card',
  'from-inbox': 'Make a Card from the note',
};

const PLACEHOLDER: Record<AuthorKind, string> = {
  'add-cards': 'e.g. add 5 cards about React Server Components',
  'new-kata': 'e.g. Go: goroutines, channels, the memory model',
  'fix-card': 'e.g. the answer about useMemo is wrong, it should say…',
  'from-chat': 'Optional: what the Card should focus on',
  'from-inbox': 'Optional: anything the note does not say',
};

/** One sheet for every authoring request; the Sensei writes complete Cards, the learner no form. */
export function AuthoringSheet({ request, onClose, onDone }: AuthoringSheetProps) {
  const state = useDojoState();
  const sync = useSync();
  const [instruction, setInstruction] = useState('');
  const [kataId, setKataId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SenseiAuthorResponse | null>(null);
  if (!request) return null;

  const katas = state.snapshot?.katas.filter((k) => !k.archived) ?? [];
  const needsKata = request.kind !== 'new-kata';
  const chosenKata = request.kataId ?? kataId;
  const instructionRequired =
    request.kind === 'add-cards' || request.kind === 'new-kata' || request.kind === 'fix-card';
  const canSubmit =
    !busy &&
    (!needsKata || chosenKata !== '') &&
    (!instructionRequired || instruction.trim() !== '');

  const close = () => {
    if (busy) return;
    setInstruction('');
    setKataId('');
    setError(null);
    setResult(null);
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await api.senseiAuthor({
        kind: request.kind,
        instruction: instruction.trim(),
        ...(needsKata && { kataId: chosenKata }),
        ...(request.cardId && { cardId: request.cardId }),
        ...(request.context && { context: request.context }),
      });
      setResult(response);
      // The watcher will announce the change too; this makes the new Cards show without waiting.
      await sync.refetch('content');
      onDone?.(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open onOpenChange={(next) => !next && close()}>
      <SheetContent title={TITLE[request.kind]}>
        {result ? (
          <div className="flex flex-col gap-3">
            <p role="status">
              The Sensei wrote {result.cards.length} {result.cards.length === 1 ? 'Card' : 'Cards'}{' '}
              to <strong>{result.kataId}</strong>.
            </p>
            {result.issues.length > 0 && (
              <ul className="text-muted-foreground list-disc pl-5 text-sm">
                {result.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
            <Button onClick={close}>Done</Button>
          </div>
        ) : (
          <>
            {needsKata && !request.kataId && (
              <Field label="Kata">
                <Select
                  value={kataId}
                  onChange={(event) => setKataId(event.target.value)}
                  disabled={busy}
                >
                  <option value="">Choose a Kata</option>
                  {katas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.title}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            {request.context?.note && (
              <blockquote className="bg-secondary rounded-md px-3 py-2 text-sm">
                {request.context.note}
              </blockquote>
            )}
            <Field label="Instruction" hideLabel error={error}>
              <Textarea
                placeholder={PLACEHOLDER[request.kind]}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                disabled={busy}
                rows={4}
                autoFocus
              />
            </Field>
            {busy ? (
              <SenseiWaiting label="The Sensei is writing…" />
            ) : (
              <Button size="lg" onClick={() => void submit()} disabled={!canSubmit}>
                Ask the Sensei
              </Button>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
