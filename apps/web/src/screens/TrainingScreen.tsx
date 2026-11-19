import { DIFFICULTIES, type CardId, type Difficulty } from '@dojo/core';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Shell } from '../components/Shell.js';
import { Button } from '../components/ui/button.js';
import { CardStep } from '../features/training/CardStep.js';
import { useTraining } from '../features/training/useTraining.js';
import { useDojoState } from '../store/context.js';
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
  const [chatOpen, setChatOpen] = useState(false);

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

  return (
    <Shell
      title={`${title} · ${training.remaining} left`}
      back={back}
      actions={
        <Button variant="ghost" size="sm" onClick={training.end}>
          End
        </Button>
      }
      // The floating Quick note button would cover the Chat's submit arrow.
      quickNote={!chatOpen}
    >
      <CardStep
        // A new step per Card shown, also when a failed Card comes back: it drops the Chat.
        key={`${training.state.shown}:${current.card}`}
        card={card}
        current={current}
        training={training}
        onChatOpenChange={setChatOpen}
      />
    </Shell>
  );
}
