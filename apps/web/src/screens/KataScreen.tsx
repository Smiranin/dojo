import { DIFFICULTIES, type Difficulty } from '@dojo/core';
import { ArchiveIcon, PinIcon, PinOffIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../api/client.js';
import { BeltBadge } from '../components/BeltBadge.js';
import { ConfirmButton } from '../components/ConfirmButton.js';
import { Shell } from '../components/Shell.js';
import { Button } from '../components/ui/button.js';
import { ErrorText } from '../components/ui/error-text.js';
import { Select } from '../components/ui/select.js';
import { AuthoringSheet, type AuthoringRequest } from '../features/sensei/AuthoringSheet.js';
import { useSenseiAvailability } from '../features/sensei/useSenseiAvailability.js';
import { useDojoState, useSync } from '../store/context.js';
import { cardRows, kataOf, tagBreakdown } from '../store/derive.js';
import { cn } from '../lib/utils.js';

export function KataScreen() {
  const { kataId = '' } = useParams();
  const state = useDojoState();
  const sync = useSync();
  const [error, setError] = useState<string | null>(null);
  const [authoring, setAuthoring] = useState<AuthoringRequest | null>(null);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const sensei = useSenseiAvailability();
  const kata = kataOf(state, kataId);
  const now = new Date();
  if (!state.loaded) {
    return (
      <Shell title="…" back="/">
        <p className="text-muted-foreground">Loading…</p>
      </Shell>
    );
  }
  if (!kata) {
    return (
      <Shell title="Not found" back="/">
        <p className="text-muted-foreground">There is no Kata “{kataId}”.</p>
      </Shell>
    );
  }
  const filter = { tags: tagFilter, ...(difficulty && { difficulty }) };
  const rows = cardRows(state, kataId, now, filter);
  const due = rows.filter((r) => r.due).length;
  const tags = tagBreakdown(state, kataId);
  const trainParams = new URLSearchParams({ kata: kataId });
  if (tagFilter.length > 0) trainParams.set('tags', tagFilter.join(','));
  if (difficulty) trainParams.set('difficulty', difficulty);
  const trainHref = (scope: 'due' | 'all') => `/train?${trainParams.toString()}&scope=${scope}`;
  const toggleTag = (tag: string) =>
    setTagFilter((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );

  // Flag changes are not retried (PLAN): a failure is shown and the state stays as it was.
  const deleteCard = async (slug: string) => {
    setError(null);
    try {
      await api.deleteCard(kataId, slug);
      await sync.refetch('content');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const toggle = async (flags: { pinned?: boolean; archived?: boolean }) => {
    setError(null);
    try {
      await api.patchKata(kataId, flags);
      await sync.refetch('content');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  return (
    <Shell
      title={kata.title}
      back="/"
      actions={
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label={kata.pinned ? 'Unpin' : 'Pin'}
            aria-pressed={kata.pinned}
            onClick={() => void toggle({ pinned: !kata.pinned })}
          >
            {kata.pinned ? <PinOffIcon /> : <PinIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={kata.archived ? 'Unarchive' : 'Archive'}
            aria-pressed={kata.archived}
            onClick={() => void toggle({ archived: !kata.archived })}
          >
            <ArchiveIcon />
          </Button>
        </>
      }
    >
      {error && <ErrorText>{error}</ErrorText>}
      <p className="text-muted-foreground">{kata.description}</p>
      {kata.archived && <p className="text-warning text-sm">This Kata is archived.</p>}
      <div className="grid grid-cols-2 gap-2">
        <Button asChild size="lg" disabled={due === 0}>
          <Link to={trainHref('due')} aria-disabled={due === 0}>
            Train Due ({due})
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link to={trainHref('all')}>Train all ({rows.length})</Link>
        </Button>
      </div>
      <Button
        variant="outline"
        disabled={!sensei.available}
        title={sensei.reason || undefined}
        onClick={() => setAuthoring({ kind: 'add-cards', kataId })}
      >
        Add Cards with the Sensei
      </Button>
      {tags.length > 0 && (
        <ul aria-label="Tags" className="flex flex-wrap gap-2 text-xs">
          {tags.map((t) => (
            <li key={t.tag}>
              <button
                type="button"
                aria-pressed={tagFilter.includes(t.tag)}
                onClick={() => toggleTag(t.tag)}
                className={cn(
                  'rounded-md border px-2 py-1',
                  tagFilter.includes(t.tag)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary',
                )}
              >
                {t.tag}: {t.known} of {t.total} Known
              </button>
            </li>
          ))}
        </ul>
      )}
      <Select
        aria-label="Difficulty"
        value={difficulty}
        onChange={(event) => setDifficulty(event.target.value as Difficulty | '')}
        className="w-fit"
      >
        <option value="">Any Difficulty</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>
      <ul aria-label="Cards" className="flex flex-col divide-y rounded-xl border">
        {rows.map(({ card, schedule, due: isCardDue }) => (
          <li key={card.id} className="flex items-center justify-between gap-3 p-3">
            <span className="line-clamp-2 text-sm">{card.question}</span>
            <span className="flex shrink-0 items-center gap-2">
              {isCardDue && <span className="text-warning text-xs font-medium">Due</span>}
              <BeltBadge belt={schedule.belt} />
              <ConfirmButton
                label="Delete"
                confirmLabel="Delete Card"
                onConfirm={() => void deleteCard(card.slug)}
              />
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-muted-foreground p-3 text-sm">No Cards yet.</li>}
      </ul>
      <AuthoringSheet request={authoring} onClose={() => setAuthoring(null)} />
    </Shell>
  );
}
