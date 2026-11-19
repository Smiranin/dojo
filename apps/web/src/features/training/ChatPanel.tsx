import type { ChatOpening, Result } from '@dojo/core';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { ComposeField } from '../../components/ComposeField.js';
import { Markdown } from '../../components/Markdown.js';
import { Badge } from '../../components/ui/badge.js';
import { Button } from '../../components/ui/button.js';
import { ErrorText } from '../../components/ui/error-text.js';
import { useKeyboardInset } from '../../lib/use-keyboard-inset.js';
import { SenseiWaiting } from '../sensei/SenseiWaiting.js';
import { RESULT_LABEL } from './ResultBar.js';
import type { CardChatHandle } from './useCardChat.js';

export interface ChatPanelProps {
  chat: CardChatHandle;
  mode: 'kumite' | 'chat';
  opening: ChatOpening | null;
  /** The Card's Kata; its title and Tags help Kobzar recognise a dictated message. */
  kataId: string;
  /** Leaves the Kumite before it was graded; no Cancel when absent. */
  onCancel?: (() => void) | undefined;
}

const RESULT_BADGE: Record<Result, 'destructive' | 'warning' | 'success'> = {
  fail: 'destructive',
  'pass-with-notes': 'warning',
  pass: 'success',
};

/** Keeps the input above the on-screen keyboard and the home indicator while it is stuck. */
const STUCK_ABOVE_KEYBOARD: CSSProperties = {
  bottom: 'calc(var(--keyboard-inset, 0px) + env(safe-area-inset-bottom))',
};

const LEARNER_BUBBLE = 'bg-secondary max-w-full self-end rounded-xl px-3 py-2 whitespace-pre-wrap';
const SENSEI_BUBBLE = 'bg-card max-w-full scroll-mt-16 self-start rounded-xl border px-3 py-2';

/**
 * The Chat about one Card on its screen: the Kumite with the Sensei's verdict, the turns, the
 * message on its way with a waiting note, a failure with Retry, and the input stuck to the
 * bottom of the screen. A new reply is scrolled to its first line.
 */
export function ChatPanel({ chat, mode, opening, kataId, onCancel }: ChatPanelProps) {
  useKeyboardInset();
  const latestReply = useRef<HTMLLIElement>(null);
  const latestReplyKey =
    chat.turns.length > 0
      ? `turn-${chat.turns.length - 1}`
      : opening?.kind === 'kumite'
        ? 'verdict'
        : null;
  useEffect(() => {
    if (latestReplyKey !== null) latestReply.current?.scrollIntoView({ block: 'start' });
  }, [latestReplyKey]);

  const items: ReactNode[] = [];
  if (opening?.kind === 'kumite') {
    items.push(
      <li key="kumite" className={LEARNER_BUBBLE}>
        {opening.kumite}
      </li>,
      <li
        key="verdict"
        ref={latestReplyKey === 'verdict' ? latestReply : undefined}
        aria-label="Sensei verdict"
        className={`${SENSEI_BUBBLE} flex flex-col gap-2`}
      >
        <Badge variant={RESULT_BADGE[opening.result]}>{RESULT_LABEL[opening.result]}</Badge>
        {opening.notes.trim() !== '' && <Markdown text={opening.notes} className="prose-sm" />}
      </li>,
    );
  }
  chat.turns.forEach((turn, index) => {
    const key = `turn-${index}`;
    items.push(
      turn.role === 'learner' ? (
        <li key={key} className={LEARNER_BUBBLE}>
          {turn.text}
        </li>
      ) : (
        <li
          key={key}
          ref={latestReplyKey === key ? latestReply : undefined}
          className={SENSEI_BUBBLE}
        >
          <Markdown text={turn.text} className="prose-sm" />
        </li>
      ),
    );
  });
  if (chat.sending !== null) {
    items.push(
      <li key="sending" className={LEARNER_BUBBLE}>
        {chat.sending}
      </li>,
    );
  }

  return (
    <section aria-label="Sensei chat" className="flex flex-col gap-3">
      {items.length > 0 && (
        <ol aria-label="Chat" className="flex flex-col gap-3">
          {items}
        </ol>
      )}
      {chat.sending !== null && (
        <SenseiWaiting
          label={
            mode === 'kumite' ? 'The Sensei is reading your Kumite…' : 'The Sensei is thinking…'
          }
        />
      )}
      {chat.error !== null && (
        <div className="flex items-center gap-2">
          <ErrorText className="flex-1">{chat.error}</ErrorText>
          <Button variant="secondary" size="sm" onClick={chat.send}>
            Retry
          </Button>
        </div>
      )}
      <div className="bg-background sticky flex flex-col gap-2 py-2" style={STUCK_ABOVE_KEYBOARD}>
        <ComposeField
          label={mode === 'kumite' ? 'Your Kumite' : 'Your message'}
          placeholder={mode === 'kumite' ? 'Answer in your own words' : 'Ask about this Card'}
          value={chat.draft}
          onChange={chat.setDraft}
          onSubmit={chat.send}
          submitLabel="Send"
          canSubmit={chat.draft.trim() !== ''}
          disabled={chat.sending !== null}
          kataId={kataId}
          minRows={mode === 'kumite' ? 2 : 1}
          autoFocus
        />
        {onCancel && (
          <Button variant="ghost" size="sm" className="self-start" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </section>
  );
}
