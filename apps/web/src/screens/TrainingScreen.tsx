import { DIFFICULTIES, type CardId, type ChatTurn, type Difficulty } from '@dojo/core';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api } from '../api/client.js';
import { ConfirmButton } from '../components/ConfirmButton.js';
import { Shell } from '../components/Shell.js';
import { Button } from '../components/ui/button.js';
import { AuthoringSheet, type AuthoringRequest } from '../features/sensei/AuthoringSheet.js';
import { useSenseiAvailability } from '../features/sensei/useSenseiAvailability.js';
import { AnswerSheet } from '../features/training/AnswerSheet.js';
import { CardAnswer, CardQuestion } from '../features/training/CardView.js';
import { FollowUpSheet } from '../features/training/FollowUpSheet.js';
import { ResultBar } from '../features/training/ResultBar.js';
import { useTraining } from '../features/training/useTraining.js';
import { useDojoState, useSync } from '../store/context.js';
import { cardById, kataOf, trainingCards, type TrainingSelection } from '../store/derive.js';

function selectionFrom(params: URLSearchParams): TrainingSelection {
  const kata = params.get('kata');
  const tags = params.get('tags');
  const difficulty = params.get('difficulty');
  return {
    ...(kata && { kataId: kata }),
    scope: params.get('scope') === 'all' ? 'all' : 'due',
    ...(tags && { tags: tags.split(',').filter(Boolean) }),
    ...(difficulty &&
      DIFFICULTIES.includes(difficulty as Difficulty) && { difficulty: difficulty as Difficulty }),
    seed: Date.now() % 2_147_483_647,
  };
}

export function TrainingScreen() {
  const [params] = useSearchParams();
  const state = useDojoState();
  const selection = selectionFrom(params);
  const back = selection.kataId ? `/kata/${selection.kataId}` : '/';
  const kata = selection.kataId ? kataOf(state, selection.kataId) : null;
  const title = kata ? kata.title : 'All Katas';
  if (!state.loaded) {
    return (
      <Shell title={title} back={back}>
        <p className="text-muted-foreground">Loading…</p>
      </Shell>
    );
  }
  return <TrainingSession selection={selection} title={title} back={back} />;
}

/** Mounted once the store is loaded: the Card list is fixed for the whole Training. */
function TrainingSession({
  selection,
  title,
  back,
}: {
  selection: TrainingSelection;
  title: string;
  back: string;
}) {
  const state = useDojoState();
  const [cards] = useState<CardId[]>(() => trainingCards(state, selection, new Date()));
  const training = useTraining(cards);
  const pending = state.pendingWrites.length;
  const sensei = useSenseiAvailability();
  const sync = useSync();
  const [sheet, setSheet] = useState<'answer' | 'chat' | null>(null);
  const [authoring, setAuthoring] = useState<AuthoringRequest | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [chat, setChat] = useState<{ card: CardId; history: ChatTurn[] } | null>(null);

  // Reps still being written would be lost with the page; warn before it closes.
  useEffect(() => {
    if (pending === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pending]);

  const current = training.state.current;
  const card = current ? cardById(state, current.card) : null;

  if (cards.length === 0) {
    return (
      <Shell title={title} back={back}>
        <p className="text-muted-foreground">Nothing to train here right now.</p>
        <Button asChild variant="secondary">
          <Link to={back}>Back</Link>
        </Button>
      </Shell>
    );
  }

  if (training.finished || !current || !card) {
    const reps = training.state.committed;
    const count = (r: string) => reps.filter((rep) => rep.result === r).length;
    return (
      <Shell title={title} back={back}>
        <section
          aria-label="Training summary"
          className="bg-card flex flex-col gap-2 rounded-xl border p-4"
        >
          <h2 className="text-lg font-semibold">Training over</h2>
          <p>
            {reps.length} {reps.length === 1 ? 'Rep' : 'Reps'}: {count('pass')} Pass,{' '}
            {count('pass-with-notes')} Pass with notes, {count('fail')} Fail.
          </p>
          {pending > 0 && (
            <p className="text-warning text-sm">{pending} still being saved; keep the page open.</p>
          )}
        </section>
        <Button asChild size="lg">
          <Link to={back}>Done</Link>
        </Button>
      </Shell>
    );
  }

  const revealed = current.phase === 'revealed';
  // The follow-up conversation belongs to one Card and is dropped when the Card changes.
  const history = chat && chat.card === current.card ? chat.history : [];
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
  return (
    <Shell
      title={`${title} · ${training.remaining} left`}
      back={back}
      actions={
        <Button variant="ghost" size="sm" onClick={training.end}>
          End
        </Button>
      }
    >
      <CardQuestion card={card} />
      {!revealed ? (
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button size="lg" variant="outline" onClick={training.dontKnow}>
            Don't know
          </Button>
          <Button size="lg" variant="outline" onClick={training.skip}>
            Skip
          </Button>
          <Button
            size="lg"
            variant="secondary"
            disabled={!sensei.available}
            title={sensei.reason || undefined}
            onClick={() => setSheet('answer')}
          >
            Answer
          </Button>
          <Button size="lg" onClick={training.know}>
            Know
          </Button>
        </div>
      ) : (
        <>
          <CardAnswer card={card} {...(current.notes !== undefined && { notes: current.notes })} />
          <div className="mt-auto flex flex-col gap-3">
            <Button
              variant="outline"
              disabled={!sensei.available}
              title={sensei.reason || undefined}
              onClick={() => setSheet('chat')}
            >
              Ask the Sensei{history.length > 0 ? ` (${history.length / 2})` : ''}
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={!sensei.available}
                title={sensei.reason || undefined}
                onClick={() =>
                  setAuthoring({ kind: 'fix-card', kataId: card.kataId, cardId: card.id })
                }
              >
                Fix this Card
              </Button>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!sensei.available}
                  title={sensei.reason || undefined}
                  onClick={() =>
                    setAuthoring({
                      kind: 'from-chat',
                      kataId: card.kataId,
                      context: { chat: history },
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
            {deleteError && (
              <p role="alert" className="text-destructive text-sm">
                {deleteError}
              </p>
            )}
            <ResultBar value={current.pending ?? 'pass'} onChange={training.changeResult} />
            <Button size="lg" onClick={training.next}>
              Next
            </Button>
          </div>
        </>
      )}
      {!sensei.available && (
        <p className="text-muted-foreground text-center text-xs">{sensei.reason}</p>
      )}
      <AnswerSheet
        cardId={current.card}
        open={sheet === 'answer'}
        onClose={() => setSheet(null)}
        onChecked={(result, notes) => {
          setSheet(null);
          training.answerChecked(result, notes);
        }}
      />
      <AuthoringSheet request={authoring} onClose={() => setAuthoring(null)} />
      <FollowUpSheet
        cardId={current.card}
        open={sheet === 'chat'}
        onClose={() => setSheet(null)}
        history={history}
        onHistory={(next) => setChat({ card: current.card, history: next })}
      />
    </Shell>
  );
}
