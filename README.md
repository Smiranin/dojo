# Dojo

A personal, mobile-first trainer for interview preparation. Questions and answers live as
Markdown cards grouped by topic, you review them with spaced repetition until you know them
cold, and an LLM coach checks your answers, explains and writes new cards on request.

Content is domain-agnostic: React, Python and Node.js today, anything tomorrow.

## Vocabulary

The project uses a small "dojo" vocabulary. The same words are used in the UI, the code and
the docs, so it is worth learning them once.

| Term           | Meaning                                                                                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dojo**       | The application itself: the place where training happens.                                                                                                                                                      |
| **Kata**       | A set of Cards on one topic, for example `react` or `python`, plus the list of Tags its Cards may use. Katas are flat (no nested Katas); sub-topics are expressed with Tags. A Kata can be pinned or archived. |
| **Card**       | One question together with its reference answer, an explanation and, optionally, a best practice, a source and a Difficulty. The unit of learning and of authoring.                                            |
| **Tag**        | One of the labels a Kata declares for its Cards, for example `hooks` or `performance`. A Card carries zero or more Tags from its Kata's list; the list is maintained by hand, never by the Sensei.             |
| **Difficulty** | How hard a Card is (easy, medium, hard), set when the Card is written. Only filters a Training; never affects scheduling.                                                                                      |
| **Rep**        | One attempt to answer a Card, recorded as the Card, its Result and a timestamp. Reps are append-only: never edited, never deleted.                                                                             |
| **Result**     | The outcome of a Rep: Fail, Pass with notes, or Pass. Set by you (Don't know, Know) or by the Sensei (Answer). Drives scheduling.                                                                              |
| **Belt**       | The mastery level of a Card derived from its Reps: New, Learning, Known. Also aggregated per Kata.                                                                                                             |
| **Due**        | A Card whose next scheduled Rep date has arrived.                                                                                                                                                              |
| **Training**   | One sitting of Reps over one Kata (Due Cards or the whole Kata) or over all Due Cards.                                                                                                                         |
| **Sensei**     | The LLM coach. Checks written answers against the reference answer, answers follow-up questions about a Card, writes new Cards and Katas on request.                                                           |
| **Inbox**      | Quick notes captured during Training ("ask about useLayoutEffect") that are not Cards yet and can be turned into Cards later.                                                                                  |

Words to avoid, because they blur these meanings: deck, topic, question (for a Card),
review, attempt, grade, score, status, session, mode, drill, LLM/AI (for the Sensei), drafts.

## Running the Dojo

The server runs on a Mac and the phone opens it in the browser; nothing is installed on the phone beyond "Add to Home Screen". Node and pnpm versions come from `mise.toml`.

### First time on a machine

```sh
mise install            # Node 26 and pnpm 12
mise run setup          # pnpm install --frozen-lockfile
claude auth status      # must say loggedIn: true; the Sensei runs on this login
```

Do not set `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`: the server strips them from the Sensei's environment and warns about it in the start log, so a key can never be billed by mistake.

### Development (work laptop, phone on the same Wi-Fi or a cable)

```sh
mise run dev                              # server on 127.0.0.1:4800 + Vite on localhost:5173
DOJO_HOST=0.0.0.0 mise run dev:server     # also reachable from the phone; the log prints the URLs
```

Open `http://<laptop-ip>:4800` on the phone (the built web app is served by the server after `mise run build`; during development the Vite dev server on the laptop proxies `/api`). Use a private network only: there is no login in the app (ADR 0003).

### Day to day (personal Mac, phone anywhere)

```sh
mise run start                            # builds the web app and starts the server on 127.0.0.1:4800
tailscale serve --bg https / http://127.0.0.1:4800
```

Tailscale publishes the Dojo inside the tailnet only, with HTTPS, under the Mac's tailnet name. Keep `host: 127.0.0.1` in `dojo.yaml` and do not set `DOJO_HOST` on this Mac: the server must never listen on a public interface. Check with `lsof -iTCP:4800 -sTCP:LISTEN`.

On the phone open `https://<mac-name>.<tailnet>.ts.net`, then Safari: Share → Add to Home Screen (iOS) or Chrome: menu → Add to Home screen (Android). The Dojo opens full screen.

### Stop, update, sleep

- Stop with Ctrl-C in the terminal running `mise run start`; `tailscale serve reset` removes the serve rule.
- Update with `git pull && mise run setup && mise run start`.
- When the Mac is asleep or the server is down, the Dojo shows "The Dojo server is unreachable" and retries; nothing else works and nothing is cached on the phone. Reps made during a short blip are retried in memory and are lost only if the page is closed while the banner shows them unsaved.

### Files

- `content/<kata>/kata.md` declares the Kata and its Tags; `content/<kata>/<slug>.md` is one Card. The format is described in [`content/README.md`](content/README.md). Edit on the laptop with any editor or Claude Code; the phone sees the change within seconds.
- `data/reps.jsonl` is the append-only Rep log; `data/inbox.json` holds the Inbox. Both are committed by hand; the Dojo never runs git.
- `dojo.yaml` holds the scheduling intervals, the bind address and the Sensei timeout.

### Checks

```sh
mise run check                                        # typecheck, lint, format, tests (no model calls)
DOJO_LIVE=1 pnpm vitest run --project sensei-claude   # one real round trip to the Sensei
```
