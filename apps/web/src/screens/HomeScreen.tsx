import { InboxIcon, PinIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Shell } from '../components/Shell.js';
import { Button } from '../components/ui/button.js';
import { Card, CardDescription, CardTitle } from '../components/ui/card.js';
import { AuthoringSheet, type AuthoringRequest } from '../features/sensei/AuthoringSheet.js';
import { useSenseiAvailability } from '../features/sensei/useSenseiAvailability.js';
import { deviceTimeZone } from '../lib/utils.js';
import { useDojoState } from '../store/context.js';
import { Input } from '../components/ui/input.js';
import { Select } from '../components/ui/select.js';
import {
  effectiveInbox,
  homeStats,
  kataSummaries,
  searchSummaries,
  sortSummaries,
  type KataSort,
} from '../store/derive.js';

export function HomeScreen() {
  const state = useDojoState();
  const now = new Date();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<KataSort>('name');
  const summaries = sortSummaries(searchSummaries(kataSummaries(state, now), query), sort);
  const stats = homeStats(state, now, deviceTimeZone());
  const sensei = useSenseiAvailability();
  const [authoring, setAuthoring] = useState<AuthoringRequest | null>(null);
  const inboxCount = effectiveInbox(state).length;
  return (
    <Shell
      title="Dojo"
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            disabled={!sensei.available}
            title={sensei.reason || undefined}
            onClick={() => setAuthoring({ kind: 'new-kata' })}
          >
            <PlusIcon /> New Kata
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link to="/inbox" aria-label={`Inbox, ${inboxCount} notes`}>
              <InboxIcon />
              {inboxCount > 0 && <span className="text-xs">{inboxCount}</span>}
            </Link>
          </Button>
        </>
      }
    >
      <section aria-label="Today" className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Due" value={stats.dueTotal} />
        <Stat label="Reps today" value={stats.todayReps} />
        <Stat label="Streak" value={stats.streak} />
      </section>
      {stats.dueTotal > 0 && (
        <Button asChild size="lg">
          <Link to="/train?scope=due">Train all Due ({stats.dueTotal})</Link>
        </Button>
      )}
      <div className="flex gap-2">
        <Input
          type="search"
          aria-label="Search Katas"
          placeholder="Search Katas"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          aria-label="Sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as KataSort)}
          className="w-auto"
        >
          <option value="name">By name</option>
          <option value="due">By Due</option>
        </Select>
      </div>
      {!state.loaded ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : summaries.length === 0 ? (
        <p className="text-muted-foreground">
          {query ? 'No Kata matches.' : 'No Katas yet. Add a folder under content/ to begin.'}
        </p>
      ) : (
        <ul aria-label="Katas" className="flex flex-col gap-3">
          {summaries.map(({ kata, progress }) => (
            <li key={kata.id}>
              <Link to={`/kata/${kata.id}`} className="block">
                <Card className="hover:bg-accent/40">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      {kata.pinned && <PinIcon className="size-4" aria-label="Pinned" />}
                      {kata.title}
                    </CardTitle>
                    <span className="text-sm font-medium" aria-label={`${progress.due} Due`}>
                      {progress.due} Due
                    </span>
                  </div>
                  <CardDescription>{kata.description}</CardDescription>
                  <p className="text-muted-foreground text-xs">
                    {progress.belts.new} New · {progress.belts.learning} Learning ·{' '}
                    {progress.belts.known} Known
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <AuthoringSheet request={authoring} onClose={() => setAuthoring(null)} />
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl border p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}
