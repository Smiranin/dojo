import { chatOpeningOf, type Card, type CurrentCard, type KumiteOutput } from '@dojo/core';
import { SwordsIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { ConfirmButton } from '../../components/ConfirmButton.js';
import { Button } from '../../components/ui/button.js';
import { ErrorText } from '../../components/ui/error-text.js';
import { useSync } from '../../store/context.js';
import { AuthoringSheet, type AuthoringRequest } from '../sensei/AuthoringSheet.js';
import { useSenseiAvailability } from '../sensei/useSenseiAvailability.js';
import { CardAnswer, CardQuestion } from './CardView.js';
import { ChatPanel } from './ChatPanel.js';
import { ResultBar } from './ResultBar.js';
import { useCardChat } from './useCardChat.js';
import type { TrainingHandle } from './useTraining.js';

export interface CardStepProps {
  card: Card;
  current: CurrentCard;
  training: TrainingHandle;
  /** Told whenever the Chat's input appears on the screen or goes away. */
  onChatOpenChange(open: boolean): void;
}

/**
 * One Card of a Training: the question with Kumite, Don't know, Skip and Know; the Chat with
 * the Sensei; the reference answer, the Card actions, the Result bar and Next. Mounted once
 * per Card, so leaving the Card drops its Chat and aborts a reply still on its way.
 */
export function CardStep({ card, current, training, onChatOpenChange }: CardStepProps) {
  const sensei = useSenseiAvailability();
  const sync = useSync();
  const [chatOpen, setChatOpen] = useState(false);
  const [authoring, setAuthoring] = useState<AuthoringRequest | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const revealed = current.phase === 'revealed';
  const opening = chatOpeningOf(current);
  const { kumiteChecked } = training;
  const onKumite = useCallback(
    (output: KumiteOutput, kumite: string) => kumiteChecked(output.result, output.notes, kumite),
    [kumiteChecked],
  );
  const chat = useCardChat({
    cardId: card.id,
    mode: revealed ? 'chat' : 'kumite',
    opening,
    onKumite,
  });

  useEffect(() => {
    onChatOpenChange(chatOpen);
    return () => onChatOpenChange(false);
  }, [chatOpen, onChatOpenChange]);

  const cancelKumite = () => {
    chat.reset();
    setChatOpen(false);
  };

  const deleteCurrent = async () => {
    setDeleteError(null);
    try {
      await api.deleteCard(card.kataId, card.slug);
      training.drop();
      await sync.refetch('content');
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const senseiDisabled = { disabled: !sensei.available, title: sensei.reason || undefined };
  const canSaveChat = opening !== null && (opening.kind === 'kumite' || chat.turns.length > 0);
  return (
    <>
      <CardQuestion card={card} />
      {!revealed && !chatOpen && (
        <div className="mt-auto flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            {...senseiDisabled}
            onClick={() => setChatOpen(true)}
          >
            <SwordsIcon />
            Kumite
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={training.dontKnow}>
              Don't know
            </Button>
            <Button variant="outline" onClick={training.skip}>
              Skip
            </Button>
            <Button variant="outline" onClick={training.know}>
              Know
            </Button>
          </div>
        </div>
      )}
      {chatOpen ? (
        <ChatPanel
          chat={chat}
          mode={revealed ? 'chat' : 'kumite'}
          opening={opening}
          kataId={card.kataId}
          onCancel={!revealed && chat.sending === null ? cancelKumite : undefined}
        />
      ) : (
        revealed && (
          <Button variant="outline" {...senseiDisabled} onClick={() => setChatOpen(true)}>
            Ask the Sensei
          </Button>
        )
      )}
      {revealed && (
        <>
          <CardAnswer card={card} />
          <div className="flex flex-wrap items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              {...senseiDisabled}
              onClick={() =>
                setAuthoring({ kind: 'fix-card', kataId: card.kataId, cardId: card.id })
              }
            >
              Fix this Card
            </Button>
            {canSaveChat && (
              <Button
                variant="ghost"
                size="sm"
                {...senseiDisabled}
                onClick={() =>
                  setAuthoring({
                    kind: 'from-chat',
                    kataId: card.kataId,
                    context: { chat: { opening, turns: chat.turns } },
                  })
                }
              >
                Save chat as Card
              </Button>
            )}
            <ConfirmButton
              label="Delete"
              confirmLabel="Delete Card"
              onConfirm={() => void deleteCurrent()}
            />
          </div>
          {deleteError && <ErrorText>{deleteError}</ErrorText>}
          <ResultBar value={current.pending ?? 'pass'} onChange={training.changeResult} />
          <Button size="lg" onClick={training.next}>
            Next
          </Button>
        </>
      )}
      {!sensei.available && (
        <p className="text-muted-foreground text-center text-xs">{sensei.reason}</p>
      )}
      <AuthoringSheet request={authoring} onClose={() => setAuthoring(null)} />
    </>
  );
}
