import type { CardId, ChatOpening, ChatTurn, KumiteOutput } from '@dojo/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../api/client.js';

export interface CardChatOptions {
  cardId: CardId;
  /** 'kumite' until the verdict arrives: the next send is graded, not chatted. */
  mode: 'kumite' | 'chat';
  /** How the Chat began; required for mode 'chat'. */
  opening: ChatOpening | null;
  /** Receives the Sensei's verdict with the Kumite it graded. */
  onKumite(output: KumiteOutput, kumite: string): void;
}

export interface CardChatHandle {
  /** The turns after the opening. */
  turns: ChatTurn[];
  draft: string;
  setDraft(text: string): void;
  /** The message on its way, shown as the latest learner bubble; null when idle. */
  sending: string | null;
  error: string | null;
  /** Sends the draft; also Retry after a failure. */
  send(): void;
  /** Drops the draft, the error and a request on its way. */
  reset(): void;
}

/** The text of a failure as the learner reads it. */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * One Card's Chat with the Sensei: the draft, the turns and the request on its way. The first
 * message after a Kumite goes to the Sensei as the Kumite; its verdict is handed to `onKumite`
 * and never kept here. The request is aborted when the Card's screen goes away, and an abort
 * is never shown as an error.
 */
export function useCardChat({ cardId, mode, opening, onKumite }: CardChatOptions): CardChatHandle {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);

  const reset = useCallback(() => {
    pending.current?.abort();
    pending.current = null;
    setDraft('');
    setSending(null);
    setError(null);
  }, []);

  /** Sends one message as the Kumite or as the next Chat message and takes in the answer. */
  const exchange = async (message: string, signal: AbortSignal): Promise<void> => {
    if (mode === 'kumite') {
      const output = await api.senseiKumite(cardId, message, signal);
      if (!signal.aborted) onKumite(output, message);
      return;
    }
    if (!opening) throw new Error('A Chat about a Card needs the Card revealed first');
    const { reply } = await api.senseiChat(cardId, { opening, turns }, message, signal);
    if (signal.aborted) return;
    setTurns((before) => [
      ...before,
      { role: 'learner', text: message },
      { role: 'sensei', text: reply },
    ]);
  };

  const send = () => {
    const message = draft.trim();
    if (message === '' || sending !== null) return;
    const controller = new AbortController();
    pending.current = controller;
    setSending(message);
    setError(null);
    exchange(message, controller.signal).then(
      () => {
        if (controller.signal.aborted) return;
        pending.current = null;
        setDraft('');
        setSending(null);
      },
      (cause: unknown) => {
        if (controller.signal.aborted) return;
        pending.current = null;
        setSending(null);
        setError(messageOf(cause));
      },
    );
  };

  return { turns, draft, setDraft, sending, error, send, reset };
}
