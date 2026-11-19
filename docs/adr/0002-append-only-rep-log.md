# Store progress as an append-only log of Reps and derive scheduling from it

**Status:** accepted

The obvious design stores per-Card state (next due date, interval, Belt) and updates it after every answer. We instead store only Reps (Card, Result, timestamp), append-only, and recompute Due dates and Belts from the log every time. Reasons: the owner will tune the spaced-repetition numbers after some weeks of use, and with a log that is a pure recomputation rather than a data migration; Reps from the phone, including retried writes, can be merged by appending with no conflict resolution; the log is a plain, git-friendly file next to the content; and the full history is available later for statistics or Sensei memory without having planned for them.

## Considered Options

- **Append-only Rep log, derived state** (chosen): simple merge, free re-tuning, full history. Costs a recomputation on read, trivial at this scale.
- **Per-Card mutable state**: cheaper reads, but every algorithm change becomes a migration and retried or concurrent writes need conflict rules.

## Consequences

- Deleting a Card never deletes its Reps; they are simply ignored.
- The scheduling rule must be deterministic given the log and its settings.
- Reps are never edited; correcting a Result before moving to the next Card replaces the pending Rep, not a written one.
