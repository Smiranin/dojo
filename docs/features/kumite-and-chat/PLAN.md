# Kumite and Chat: Implementation Plan

**SPEC:** ./SPEC.md
**ADRs:** none (the work stays inside ../../adr/0001-local-mac-server-with-claude-code-subscription.md, ../../adr/0002-append-only-rep-log.md and ../../adr/0005-phone-talks-to-kobzar-directly.md; it changes none of them)
**Status:** draft

## Summary

Answering a Card and talking about it becomes one Chat on the Card's screen. Four things change:

1. **Contract.** The Sensei's answer check is renamed to Kumite everywhere in code (`Sensei.kumite`, `POST /api/sensei/kumite`). A Chat becomes a typed value, `Chat = { opening, turns }`, where `opening` says how the Chat began: a Kumite with the Sensei's verdict, or the learner's Know / Don't know choice. Every Chat message and "Save chat as Card" send the whole `Chat`, so the Sensei sees the Kumite and its notes. The Sensei stays stateless.
2. **Prompts.** Kumite notes and Chat replies follow the language of the learner's latest message. Cards and Katas follow the language of the Kata: its existing questions, else its title and description, else the instruction for a new Kata.
3. **Cancellation.** Next aborts a pending Sensei request end to end. The web aborts the fetch; the server notices the dropped connection and aborts the Agent SDK query through an `AbortSignal` on the Sensei port. A reply nobody will read does not spend the subscription.
4. **UI.** One input component, `ComposeField`, holds the microphone and the submit arrow inside the field and grows with its text. It replaces the text box + `DictationButton` + submit button wherever dictation is offered. The Training screen loses `AnswerSheet` and `FollowUpSheet`: a per-Card `CardStep` component shows the question, the Kumite button and the inline `ChatPanel`, the reference answer, the Card actions, the Result bar and Next. `CardStep` is keyed by Card and position, so Next unmounts it, which drops the Chat and aborts a pending request.

The Training reducer in core stays the single owner of Results and Reps. It additionally records how the Card was revealed, so the Chat opening can be derived purely. The Chat's turns and its request lifecycle live in a web hook, `useCardChat`, because they are network state, not Training rules. No Chat is stored anywhere, and the Rep format does not change.

## Current State

- **Sensei port** (`packages/core/src/sensei/port.ts`): `Sensei { healthCheck, check(CheckInput), chat(ChatInput), author(AuthorInput) }`. `CheckInput = { card, answer }`, `CheckOutput = { result, notes }`, `ChatInput = { card, history: ChatTurn[], message }`, `ChatTurn = { role: 'learner' | 'sensei', text }`, `AuthorInput.context?: { chat?: ChatTurn[]; note?: string }`. `SenseiErrorReason` already includes `'aborted'`, but nothing produces it.
- **API schemas** (`packages/core/src/api/schemas.ts`): `senseiCheckRequestSchema { cardId, answer }`, `senseiChatRequestSchema { cardId, history, message }`, `senseiAuthorRequestSchema { …, context: { chat?: ChatTurn[], note? } }`.
- **Server routes** (`apps/server/src/routes/sensei.ts`): `POST /api/sensei/check`, `/chat`, `/author`. Each call reads the Card from disk (`cardFromDisk`). Errors map in `apps/server/src/errors.ts` (`SENSEI_STATUS`; `aborted` → 499 already exists). `apps/server/src/sensei/authoring.ts` builds `AuthorInput`.
- **Claude Sensei** (`packages/sensei-claude/src/claude-sensei.ts`): one `query()` per call. `run()` owns an `AbortController` used only for the timeout. Prompts are in `packages/sensei-claude/src/prompts.ts`. `LANGUAGE_RULE` forces the Card's language on check and chat. The author prompt says "language of the learner's instruction, or of the Kata when the instruction is a short command". This is the bug behind SPEC criteria 1 and 4.
- **Training reducer** (`packages/core/src/training/training.ts`): `CurrentCard { card, phase, pending?, notes?, answer? }` and the actions `dont-know | know | skip | drop | answer-checked | change-result | next | end`. A Rep is committed only on `next`/`end` of a revealed Card, so a failed Kumite already records nothing. `apps/web/src/features/training/useTraining.ts` wraps it.
- **Training screen** (`apps/web/src/screens/TrainingScreen.tsx`): a 2×2 grid of Don't know / Skip / Answer / Know. Answer opens `AnswerSheet` (a bottom sheet → `api.senseiCheck` → `training.answerChecked`). After reveal, `CardAnswer` (`features/training/CardView.tsx`) shows "Your answer" and "Sensei notes" above the reference answer. "Ask the Sensei (n)" opens `FollowUpSheet`, a separate sheet whose `history` the screen keeps in `chat` state and drops when the Card changes. "Save chat as Card" sends only the follow-up turns. Fix this Card, Delete, `ResultBar` and Next sit at `mt-auto`.
- **Dictation inputs**: `AnswerSheet`, `FollowUpSheet`, `AuthoringSheet` (`features/sensei/`) and `QuickNoteButton` (`components/`). Each stacks `Field` + `Textarea` (`components/ui/textarea.tsx`, `min-h-24`, fixed `rows`) + `DictationButton` (`features/dictation/DictationButton.tsx`, a row under the field with mic/stop/cancel/retry, "Recording m:ss", "Waiting for the text…", errors and notes) + a submit button. Only the Quick note handles Cmd/Ctrl+Enter. `useDictation` and `appendDictated` hold the behaviour that must not change.
- **Web API client** (`apps/web/src/api/client.ts`): `request()` already accepts `signal`, but the `senseiCheck`/`senseiChat` methods do not pass one. A fetch aborted by the signal surfaces as `NetworkError`.
- **Shell** (`components/Shell.tsx`): sticky header, `main` with `pb-24`, and the fixed Quick note button at the bottom right, which would cover a submit arrow in a bottom-stuck input.
- **Viewport** (`apps/web/index.html`): `width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0`, with no `interactive-widget`.
- **Comments that cite the deleted MVP SPEC/PLAN**: `apps/server/src/sensei/authoring.ts:32`, `apps/server/src/watch.ts:27`, `apps/web/src/components/ConfirmButton.tsx:11`, `apps/web/src/components/QuickNoteButton.tsx:12`, `apps/web/src/lib/utils.ts:8`, `apps/web/src/screens/KataScreen.tsx:56`, `packages/core/src/api/settings.ts:5`, `packages/core/src/sensei/rules.ts:18`, `packages/core/src/training/training.ts:101`, `packages/sensei-claude/src/env.ts:1`. **Comments that cite ADRs**: `apps/server/src/content/content-store.ts:145`, `apps/server/src/progress/rep-log.ts:13`, `apps/server/src/routes/reps.ts:9`, `apps/web/src/features/dictation/kobzar-api.ts:1`, `packages/core/src/api/settings.ts:23`, `packages/core/src/domain/types.ts:15`, `packages/core/src/schedule/schedule.ts:25`, `packages/core/src/sensei/port.ts:82`, `packages/sensei-claude/src/claude-sensei.ts:44`. Re-grep before Stage 8; line numbers will have moved.
- `README.md:22` describes the Result as set by the Sensei "(Answer …)". It must say Kumite.

## Target Architecture

### Modules and Responsibilities

- **`packages/core/src/sensei/port.ts`**: owns the Sensei contract. It gains `KumiteInput/KumiteOutput` (renamed from Check), `ChatOpening`, `Chat`, and an optional `signal: AbortSignal` on `KumiteInput` and `ChatInput`. It knows nothing about HTTP or React.
- **`packages/core/src/api/schemas.ts`**: owns the wire shapes: `senseiKumiteRequestSchema`, the new `senseiChatRequestSchema { cardId, chat, message }`, and `context.chat: chatSchema` in the author request.
- **`packages/core/src/training/training.ts`**: owns Training rules. `CurrentCard` records `revealedBy` and the Kumite verdict. A pure `chatOpeningOf(current)` derives the `ChatOpening`. It does not know about Chat turns or requests.
- **`packages/sensei-claude/src/prompts.ts`**: owns how inputs become prompts, including the language rules and the rendering of a `ChatOpening`. `claude-sensei.ts` links the caller's `signal` to its own `AbortController` and tells abort apart from timeout.
- **`apps/server/src/routes/sensei.ts`**: validates requests, reads the Card from disk, and creates an `AbortSignal` that fires when the client disconnects before the reply is sent (new helper `apps/server/src/abort.ts`). It must not interpret Chats.
- **`apps/web/src/components/ComposeField.tsx`** (new): the one dictation-enabled input. It owns layout (textarea, in-field microphone, submit arrow, messages below), auto-grow and Cmd/Ctrl+Enter. It must not know what is being submitted.
- **`apps/web/src/features/dictation/`**: `useDictation` is unchanged. `DictationButton.tsx` is replaced by `useDictationField` (the hook that today lives inside `DictationControl`: availability, hints, `canStart`, `note`, `limitReached`) plus two presentational parts, `DictationInline` (in-field controls and recording/transcribing status) and `DictationMessages` (errors, limit notice, unavailability note). `ComposeField` is their only consumer.
- **`apps/web/src/lib/use-auto-grow.ts`** and **`apps/web/src/lib/use-keyboard-inset.ts`** (new): DOM-measuring hooks, kept out of components.
- **`apps/web/src/features/training/useCardChat.ts`** (new): owns one Card's Chat: turns, draft, the pending request with its `AbortController`, the error and Retry. It sends the first message after Kumite to `api.senseiKumite` and later ones to `api.senseiChat`. It reports a Kumite verdict through a callback and never dispatches to the reducer itself.
- **`apps/web/src/features/training/ChatPanel.tsx`** (new): renders the Chat list (Kumite, verdict, turns), the waiting indicator, the error with Retry, the sticky `ComposeField` and, before anything was sent after Kumite, Cancel.
- **`apps/web/src/features/training/CardStep.tsx`** (new): one Card of the Training, keyed by position and Card. Holds the question, the Kumite button with the Don't know / Skip / Know row, the `ChatPanel` or the Ask the Sensei button, the reference answer, the Card actions, `ResultBar` and Next. Unmounting it is how the Chat is dropped.
- **`apps/web/src/screens/TrainingScreen.tsx`**: keeps the Training-level concerns: the Card list, the summary, the pending-writes warning, the Shell. It renders `CardStep` for the current Card.
- **Deleted**: `features/training/AnswerSheet.tsx`, `features/training/FollowUpSheet.tsx`, `features/dictation/DictationButton.tsx`.

### Relations and Data Flow

```
TrainingScreen ──key=`${shown}:${cardId}`──▶ CardStep
                                              │ uses useTraining (core reducer) for Results/Reps
                                              │ chatOpeningOf(training.state.current)
                                              ▼
                                      ChatPanel ◀── useCardChat({ cardId, mode, opening, onKumite })
                                              │            │
                                              │            ├─ mode 'kumite', no verdict yet ─▶ api.senseiKumite(cardId, text, signal)
                                              │            │        └─ ok ─▶ onKumite(output, text) ─▶ training.kumiteChecked(...)
                                              │            └─ otherwise ─▶ api.senseiChat(cardId, { opening, turns }, text, signal)
                                              ▼
                                        ComposeField ─▶ useDictationField ─▶ useDictation ─▶ Kobzar (unchanged)

web fetch ──HTTP──▶ routes/sensei.ts ─(abortOnDisconnect → signal)─▶ Sensei.kumite / chat ─▶ ClaudeSensei.run (query abortController)
```

- Dependencies point inward: web → core; server → core; sensei-claude → core. Core imports nothing from the others.
- The Chat opening is derived from reducer state every render. The verdict is never stored twice: the reducer holds it, the hook holds only the turns after it.
- "Save chat as Card" builds `{ opening, turns }` in `CardStep` from `chatOpeningOf` + `useCardChat().turns`, and passes it as `AuthoringRequest.context.chat`.

### Patterns and Technologies

- **Applied:** discriminated unions validated with zod, as `contentIssueSchema` does already. A pure reducer plus a derived selector (`chatOpeningOf`), as `remaining`/`isFinished` do. Component keying to scope per-Card state. `AbortController` end to end. Composition of small presentational parts over a configurable mega-component (`DictationInline` / `DictationMessages`).
- **Deliberately not applied:** no Chat in the global store (`apps/web/src/store`); it dies with the Card. No streaming of replies; one request, one reply as today. No CSS `field-sizing: content` (unreliable on iOS Safari and blind to the keyboard). No new libraries.
- **Mobile keyboard:** `interactive-widget=resizes-content` in the viewport meta (Android Chrome shrinks the layout viewport). `useKeyboardInset` writes `--keyboard-inset` on `document.documentElement` from `window.visualViewport`, and the sticky input adds it to its `bottom` (iOS Safari).

## Interfaces and Contracts

`packages/core/src/sensei/port.ts`:

```ts
export interface KumiteInput {
  card: Card;
  kumite: string;
  signal?: AbortSignal;
}
export const kumiteOutputSchema = z.object({ result: z.enum(RESULTS), notes: z.string() }); // was checkOutputSchema
export type KumiteOutput = z.infer<typeof kumiteOutputSchema>;

export const SELF_GRADES = ['know', 'dont-know'] as const;
export const chatOpeningSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('kumite'),
    kumite: z.string().min(1),
    result: z.enum(RESULTS),
    notes: z.string(),
  }),
  z.object({ kind: z.literal('self-graded'), choice: z.enum(SELF_GRADES) }),
]);
export type ChatOpening = z.infer<typeof chatOpeningSchema>;
export const chatSchema = z.object({ opening: chatOpeningSchema, turns: z.array(chatTurnSchema) });
export type Chat = z.infer<typeof chatSchema>;

export interface ChatInput {
  card: Card;
  chat: Chat;
  message: string;
  signal?: AbortSignal;
}
// AuthorInput.context?: { chat?: Chat | undefined; note?: string | undefined }

export interface Sensei {
  healthCheck(): Promise<HealthStatus>;
  kumite(input: KumiteInput): Promise<KumiteOutput>; // was check
  chat(input: ChatInput): Promise<ChatOutput>;
  author(input: AuthorInput): Promise<AuthoringProposal>;
}
```

`turns` hold only what came after the opening. A Kumite's verdict `result` is the Sensei's, not the Result bar's current value.

`packages/core/src/api/schemas.ts`:

```ts
senseiKumiteRequestSchema = z.object({ cardId, kumite: z.string().min(1) }); // POST /api/sensei/kumite → KumiteOutput
senseiChatRequestSchema = z.object({ cardId, chat: chatSchema, message: z.string().min(1) }); // POST /api/sensei/chat → { reply }
senseiAuthorRequestSchema.context = z
  .object({ chat: chatSchema.optional(), note: z.string().optional() })
  .optional();
```

`POST /api/sensei/check` is removed (the web and server ship together). A client that disconnects before the reply gets nothing; the server logs nothing for it (499 is mapped already, and the reply goes nowhere).

`packages/core/src/training/training.ts`:

```ts
export type RevealedBy = 'kumite' | 'know' | 'dont-know';
export interface CurrentCard {
  card: CardId;
  phase: TrainingPhase;
  pending?: Result;
  revealedBy?: RevealedBy; // set with phase 'revealed'
  kumite?: { text: string; result: Result; notes: string }; // set when revealedBy === 'kumite'
}
// action: { type: 'kumite-checked'; result: Result; notes: string; kumite: string }  (was 'answer-checked')
export function chatOpeningOf(current: CurrentCard): ChatOpening | null; // null while phase is 'question'
```

`apps/web/src/api/client.ts`:

```ts
senseiKumite(cardId: string, kumite: string, signal?: AbortSignal): Promise<KumiteOutput>;
senseiChat(cardId: string, chat: Chat, message: string, signal?: AbortSignal): Promise<ChatOutput>;
```

`apps/server/src/abort.ts`:

```ts
/** A signal that aborts when the client goes away before the reply was sent. */
export function abortOnDisconnect(reply: FastifyReply): AbortSignal;
```

Listen on `reply.raw` `'close'` and abort only when `!reply.raw.writableFinished`. Do **not** use `request.raw` `'close'`: on current Node it fires once the body has been read, not on disconnect.

`apps/web/src/components/ComposeField.tsx`:

```ts
export interface ComposeFieldProps {
  label: string; // accessible name of the textarea (visually hidden, via Field)
  value: string;
  onChange(value: string): void;
  onSubmit(): void; // called by the arrow and by Cmd/Ctrl+Enter, only when canSubmit
  submitLabel: string; // accessible name of the arrow: 'Send', 'Ask the Sensei', 'Save note', …
  canSubmit: boolean;
  disabled?: boolean; // the parent is busy; also disables the microphone
  kataId?: string | undefined; // hints for Kobzar
  placeholder?: string;
  autoFocus?: boolean;
  error?: string | null;
  minRows?: 1 | 2; // default 2
}
```

Behaviour: Enter inserts a newline. Cmd/Ctrl+Enter submits. The height follows `scrollHeight` from `minRows` up to `0.4 × (visualViewport?.height ?? innerHeight)`, then the field scrolls inside. The microphone and the arrow sit at the bottom right inside the border, and the textarea has right padding so text never runs under them. Dictation errors and notes render below the field, under the Field error. With no Kobzar configured there is no microphone, and the layout is otherwise identical.

`apps/web/src/features/training/useCardChat.ts`:

```ts
export interface CardChatOptions {
  cardId: CardId;
  /** 'kumite' until the verdict arrives: the next send is graded, not chatted. */
  mode: 'kumite' | 'chat';
  opening: ChatOpening | null; // required for mode 'chat'
  onKumite(output: KumiteOutput, kumite: string): void;
}
export interface CardChatHandle {
  turns: ChatTurn[];
  draft: string;
  setDraft(text: string): void;
  /** The message on its way, shown as the latest learner bubble; null when idle. */
  sending: string | null;
  error: string | null;
  send(): void; // also Retry: re-sends `draft`
}
```

Rules: on `send` the draft stays in the input (disabled) and appears as the pending bubble. On success the draft clears, and a chat reply is appended as `[learner, sensei]` turns; a Kumite verdict goes to `onKumite`. On failure the bubble goes away, the draft stays, and `error` is set. Unmount aborts the controller. An abort is never shown as an error.

## Testing Strategy

**Main seam:** the whole web app through `renderApp` (`apps/web/test/render.tsx`) against msw `FakeDojo` (`apps/web/test/fake-server.ts`). Tests tap and type as the learner and assert on the screen and on `dojo.requests` / `dojo.reps`. Copy the shape of `apps/web/test/answer.test.tsx` and `apps/web/test/dictation.test.tsx`. `FakeDojo` gains:

- `kumites: KumiteOutput[]` (renamed from `checks`) and the `/api/sensei/kumite` handler.
- `hold(): () => void`: every Sensei handler awaits the gate until released. It lets a test see the waiting indicator and tap Next mid-request; with msw, an aborted request is visible as `request.signal.aborted`, so record `aborted: true` on the `RecordedRequest`.

**Neighbouring seams already in place:**

- `apps/server/test/sensei.test.ts`: `s.app.inject` + `FakeSensei` for request shapes, the Card read from disk, and error mapping. For the disconnect, start a real listen on an ephemeral port in the test, `fetch` with an `AbortController`, abort, and assert that the `FakeSensei` call's `signal.aborted` became true. `FakeSensei` gets a `hold()` like `FakeDojo`.
- `packages/sensei-claude/test/prompts.test.ts`: pure prompt builders (opening rendering, language rules present, Kata language hint).
- `packages/core/test/training.test.ts`: `revealedBy`, `kumite`, `chatOpeningOf`.
- `packages/sensei-claude/test/live.test.ts` (`DOJO_LIVE=1`, manual): one Russian Kumite and one Russian chat message answered in Russian.

**What a good test looks like here:** it names a learner-visible behaviour ("keeps the text and offers Retry when the Kumite fails, and records no Rep"), drives the UI by role and accessible name, and asserts on what is visible or sent. It never reaches into hook state or component props. Layout, auto-grow height and the keyboard inset cannot be observed in jsdom; they go to the manual checklist in Stage 7.

## Stages

### Stage 1: Rename the answer check to Kumite

- **Goal:** the glossary word Kumite in every name; behaviour unchanged.
- **Depends on:** none.
- **Touches:** `packages/core/src/sensei/port.ts`, `packages/core/src/api/schemas.ts`, `packages/core/src/testing/fake-sensei.ts`, `packages/core/src/training/training.ts`, `packages/core/test/{training,fake-sensei}.test.ts`, `packages/sensei-claude/src/{claude-sensei,prompts,schemas,index}.ts`, `packages/sensei-claude/test/{schemas,prompts,live}.test.ts`, `apps/server/src/routes/sensei.ts`, `apps/server/test/sensei.test.ts`, `apps/web/src/api/client.ts`, `apps/web/src/features/training/{useTraining.ts,AnswerSheet.tsx,CardView.tsx}`, `apps/web/src/screens/TrainingScreen.tsx`, `apps/web/test/{fake-server.ts,answer.test.tsx}`, `README.md`.
- **Steps:**
  1. `CheckInput/CheckOutput/checkOutputSchema` → `KumiteInput/KumiteOutput/kumiteOutputSchema`; the field `answer` → `kumite`; `Sensei.check` → `Sensei.kumite`.
  2. `FakeSensei.scriptCheck` → `scriptKumite`; the call method is `'kumite'`.
  3. `CHECK_SYSTEM_PROMPT/checkPrompt/CHECK_JSON_SCHEMA` → `KUMITE_SYSTEM_PROMPT/kumitePrompt/KUMITE_JSON_SCHEMA`; the prompt heading becomes `# Learner's Kumite`.
  4. `senseiCheckRequestSchema` → `senseiKumiteRequestSchema { cardId, kumite }`; route `POST /api/sensei/kumite`; `api.senseiCheck` → `api.senseiKumite`.
  5. Reducer action `answer-checked` → `kumite-checked { result, notes, kumite }`; `CurrentCard.answer` → `kumite` (a plain string in this stage); `useTraining.answerChecked` → `kumiteChecked`.
  6. `FakeDojo.checks` → `kumites`; update tests to the new names and URL.
  7. `README.md`: the Result row says the Sensei sets it after a Kumite.
  8. Leave user-visible labels ("Answer", "Your answer", "Check with the Sensei") alone; they change in Stage 7.
- **Verify:** `mise run check` is green; `git grep -nE "senseiCheck|CheckInput|CheckOutput|checkOutputSchema|answer-checked|answerChecked|CHECK_|/api/sensei/check"` returns nothing.

### Stage 2: The Chat carries its opening

- **Goal:** every Chat message and "Save chat as Card" send `{ opening, turns }`; the reducer records how a Card was revealed.
- **Depends on:** Stage 1.
- **Touches:** `packages/core/src/sensei/port.ts`, `packages/core/src/api/schemas.ts`, `packages/core/src/training/training.ts`, `packages/core/test/training.test.ts`, `packages/sensei-claude/src/prompts.ts`, `packages/sensei-claude/test/prompts.test.ts`, `apps/server/src/routes/sensei.ts`, `apps/server/src/sensei/authoring.ts` (types only), `apps/server/test/{sensei,authoring}.test.ts`, `apps/web/src/api/client.ts`, `apps/web/src/features/sensei/AuthoringSheet.tsx` (`AuthoringRequest.context.chat: Chat`), `apps/web/src/features/training/{FollowUpSheet.tsx,CardView.tsx,useTraining.ts}`, `apps/web/src/screens/TrainingScreen.tsx`, `apps/web/test/answer.test.tsx`.
- **Steps:**
  1. Add `SELF_GRADES`, `chatOpeningSchema`, `chatSchema` and their types to the port. `ChatInput` becomes `{ card, chat, message }`; `AuthorInput.context.chat` becomes `Chat`.
  2. Update `senseiChatRequestSchema` and `senseiAuthorRequestSchema.context.chat`; the chat route passes `chat` through.
  3. Reducer: `reveal` sets `revealedBy` (`'dont-know'`, `'know'`, `'kumite'`), and `kumite-checked` stores `kumite: { text, result, notes }`. Add `chatOpeningOf`. `change-result` must not touch `kumite.result`.
  4. Prompts: a `renderOpening(opening)` used by `chatPrompt` and, for `context.chat`, by `authorPrompt`. For a Kumite: `# Learner's Kumite`, then `# Sensei's verdict` with `Result: Fail | Pass with notes | Pass` and the notes (omitted when empty). For self-graded: `# How the Card was revealed` with "The learner chose Know without answering: go deeper than the Card" or "The learner chose Don't know: explain from scratch". The conversation section renders `turns`. The chat system prompt says the opening is part of the Chat and that a follow-up about the notes must refer to them specifically.
  5. Web, interim: `TrainingScreen` passes `chatOpeningOf(current)` to `FollowUpSheet`. `FollowUpSheet` sends `{ opening, turns: history }`. "Save chat as Card" sends the same `Chat` and shows when the opening is a Kumite or there are turns. `CardAnswer` reads `current.kumite.text/notes`.
- **Verify:** `mise run check` is green. New tests:
  - core: Know/Don't know/Kumite set `revealedBy`; `chatOpeningOf` returns null on a question and the right union member after each reveal; changing the Result keeps the verdict's `result`.
  - prompts: the Kumite opening (text, Result label, notes) precedes the conversation; a clean Pass renders no empty notes; each self-graded choice renders its instruction; an author `from-chat` prompt includes the opening.
  - server: the chat route passes `chat` to `FakeSensei` unchanged and rejects a body with `history` (400).
  - web (`answer.test.tsx`): after Know, the chat request body is `{ cardId, chat: { opening: { kind: 'self-graded', choice: 'know' }, turns: [...] }, message }`; after a Kumite, the opening holds the Kumite and verdict.

### Stage 3: Language rules

- **Goal:** Kumite notes and Chat replies follow the learner's latest message; Cards and Katas follow the Kata.
- **Depends on:** Stage 2.
- **Touches:** `packages/sensei-claude/src/prompts.ts`, `packages/sensei-claude/test/{prompts,live}.test.ts`.
- **Steps:**
  1. Replace `LANGUAGE_RULE` with two named rules:
     - `REPLY_LANGUAGE_RULE`: write in the language of the learner's latest message (the Kumite for a Kumite, the message for a Chat); keep technical terms, API names and code in their original form; the Card's own language does not matter.
     - `KATA_LANGUAGE_RULE`: write Cards (and a new Kata's title and description) in the language the Kata is written in, judged by its existing questions, else its title and description; for a new Kata, the language of the instruction; the language of the instruction or the conversation never changes this.
  2. Use `REPLY_LANGUAGE_RULE` in the Kumite and chat system prompts and `KATA_LANGUAGE_RULE` in the author system prompt (removing the "short command" sentence). `authorPrompt` already lists `existingQuestions` and the Kata; label that section so the rule can refer to it.
  3. `live.test.ts`: add a Russian Kumite and a Russian chat message on the English `card`, and assert the output contains Cyrillic (`/[а-яё]/i`). Add an English `add-cards` instruction on an existing English Kata given in Russian, and assert the proposal's question has no Cyrillic.
- **Verify:** `mise run check` is green; prompt tests assert each system prompt contains its rule constant and the author prompt still lists existing questions; the owner runs `DOJO_LIVE=1 pnpm --filter @dojo/sensei-claude test` once by hand.

### Stage 4: Cancel a pending Sensei request end to end

- **Goal:** an aborted web request aborts the Sensei's query on the server.
- **Depends on:** Stage 2.
- **Touches:** `packages/core/src/sensei/port.ts`, `packages/core/src/testing/fake-sensei.ts`, `packages/sensei-claude/src/claude-sensei.ts`, `apps/server/src/abort.ts` (new), `apps/server/src/routes/sensei.ts`, `apps/server/test/sensei.test.ts`, `apps/server/test/helpers.ts` (if a listening server helper is needed), `apps/web/src/api/client.ts`.
- **Steps:**
  1. Port: `signal?: AbortSignal` on `KumiteInput` and `ChatInput`.
  2. `ClaudeSensei.run` takes `signal?`. When it is already aborted, or aborts during the query, abort the local controller and throw `SenseiError('aborted', 'The learner left the Card')`. A timeout still throws `'timeout'`, so record which one fired.
  3. `abortOnDisconnect(reply)` in `apps/server/src/abort.ts` (see Interfaces); the kumite and chat routes pass its signal.
  4. `FakeSensei`: `hold()` returning a release function, and calls record the `signal`, so a test can observe the abort.
  5. Web client: `senseiKumite`/`senseiChat` accept and forward `signal`.
- **Verify:** `mise run check` is green. Server test: a held chat on a listening test server, aborted from `fetch`, leaves the `FakeSensei` call's `signal.aborted === true`. A completed request does not abort its signal (guards the `writableFinished` check).

### Stage 5: ComposeField everywhere dictation is offered

- **Goal:** one input with the microphone and the submit arrow inside, auto-grow, Cmd/Ctrl+Enter.
- **Depends on:** Stage 1 (it touches the renamed `AnswerSheet`); independent of Stages 2–4.
- **Touches:** `apps/web/src/components/ComposeField.tsx` (new), `apps/web/src/lib/use-auto-grow.ts` (new), `apps/web/src/features/dictation/{useDictationField.ts,DictationInline.tsx,DictationMessages.tsx}` (new; replace `DictationButton.tsx`), `apps/web/src/features/training/{AnswerSheet,FollowUpSheet}.tsx`, `apps/web/src/features/sensei/AuthoringSheet.tsx`, `apps/web/src/components/QuickNoteButton.tsx`, `apps/web/test/{dictation,inbox,authoring,answer}.test.tsx`.
- **Steps:**
  1. Move `DictationControl`'s logic (availability, hints, `canStart`, `note`, `limitReached`) into `useDictationField({ kataId, disabled, onText })`. It always calls `useDictation` and returns `null` when Kobzar is absent. `DictationInline` renders mic / stop + "Recording m:ss" + Cancel / "Waiting for the text…" / Retry as compact icon buttons, with the same accessible names as today (`Dictate`, `Stop dictation`, `Cancel dictation`, `Retry dictation`). `DictationMessages` renders the errors, the limit notice and the note.
  2. `useAutoGrow(ref, value, minRows)`: resets the height, then sets it to `min(scrollHeight, 0.4 × viewport height)` and toggles `overflow-y` accordingly. It re-measures on `value` change and on `visualViewport` `resize`.
  3. `ComposeField` per Interfaces, built on `Field` (label, error, ARIA wiring) and `controlClass`. The arrow is an icon `Button` (`ArrowUpIcon`) with `aria-label={submitLabel}`, disabled unless `canSubmit && !disabled`.
  4. Replace the Textarea + DictationButton + submit button in `AnswerSheet` (label "Your answer", submit "Check with the Sensei"), `FollowUpSheet` ("Your question", "Send"), `AuthoringSheet` ("Instruction", "Ask the Sensei"; keep `SenseiWaiting` under the field while busy) and `QuickNoteButton` ("Note", "Save note"). The Quick note drops its own `onKeyDown`.
  5. Delete `DictationButton.tsx`; fix imports.
- **Verify:** `mise run check` is green; all existing dictation, inbox and authoring tests pass with at most a changed query (same names). New web tests:
  - Cmd+Enter submits a Quick note.
  - Enter adds a newline and does not submit.
  - The arrow is disabled on an empty field.
  - With no Kobzar there is no `Dictate` button, but the arrow is there.

  Manual: on a phone the field starts at two lines, grows, and caps at about 40% of the visible height.

### Stage 6: The Chat on the Card's screen (Ask the Sensei)

- **Goal:** Ask the Sensei opens the Chat inline below the question; `FollowUpSheet` is gone; the per-Card state is scoped by `CardStep`.
- **Depends on:** Stages 2, 4 and 5.
- **Touches:** `apps/web/src/features/training/{CardStep.tsx,ChatPanel.tsx,useCardChat.ts}` (new), `apps/web/src/features/training/ResultBar.tsx` (export `RESULT_LABEL`), `apps/web/src/lib/use-keyboard-inset.ts` (new), `apps/web/src/components/Shell.tsx`, `apps/web/index.html`, `apps/web/src/screens/TrainingScreen.tsx`, `apps/web/test/fake-server.ts`, `apps/web/test/{answer,dictation}.test.tsx`; delete `features/training/FollowUpSheet.tsx`.
- **Steps:**
  1. `CardStep` gets everything per-Card from `TrainingScreen` (question, buttons, revealed area, `AuthoringSheet`, delete error). `TrainingScreen` renders `<CardStep key={`${training.state.shown}:${current.card}`} … />`; the key changes on Next, End, Skip and Drop, also when a failed Card comes back.
  2. `useCardChat` per Interfaces, in `'chat'` mode only for now. It aborts on unmount and swallows the abort.
  3. `ChatPanel`: `<ol aria-label="Chat">` with learner bubbles (plain text, `whitespace-pre-wrap`) and Sensei replies (`Markdown`). The pending message shows as the last learner bubble, with `SenseiWaiting` ("The Sensei is thinking…") under it. An error shows as `ErrorText` with a `Retry` button. The `ComposeField` ("Your message", submit "Send", `minRows={1}`) sits in a `sticky bottom-[calc(var(--keyboard-inset,0px)+env(safe-area-inset-bottom))]` wrapper with the page background. When a reply arrives, scroll its `<li>` into view with `{ block: 'start' }` and `scroll-mt` matching the sticky header.
  4. In the revealed area, the order is: `ChatPanel` when open, otherwise an "Ask the Sensei" button (disabled with the reason when the Sensei is unavailable); then `CardAnswer` (reference answer, explanation, best practice, source); then Fix this Card / Save chat as Card / Delete; then `ResultBar` and Next, in normal flow (not sticky, no `mt-auto`).
  5. `useKeyboardInset()` is called by `ChatPanel`. Add `interactive-widget=resizes-content` to the viewport meta.
  6. `Shell` gets `quickNote?: boolean` (default true); `CardStep` lifts "Chat open" to `TrainingScreen` through a callback so the Shell hides the floating Quick note button while the Chat input is on screen, because it would cover the arrow.
  7. `FakeDojo.hold()` (see Testing Strategy). Move the follow-up tests from the sheet to the inline Chat.
- **Verify:** `mise run check` is green. Web tests:
  - After Know, Ask the Sensei shows the Chat on the screen (no dialog role), and replies appear in order in the `Chat` list.
  - While held, "The Sensei is thinking…" shows under the latest message.
  - A 503 keeps the text in the input and shows the reason with Retry, and Retry resends it.
  - Next during a held reply sends the request aborted, shows the next Card with no Chat, and records the Rep normally.
  - The reply's element receives `scrollIntoView` (spy on `Element.prototype.scrollIntoView`).
  - "Save chat as Card" sends `context.chat` with the opening.

### Stage 7: Kumite opens the Chat

- **Goal:** the Kumite button, Cancel, the first message graded as the Kumite, and the verdict as the first turns; `AnswerSheet` is gone.
- **Depends on:** Stage 6.
- **Touches:** `apps/web/src/features/training/{CardStep,ChatPanel,useCardChat,CardView}.tsx/.ts`, `apps/web/test/{answer,dictation,training}.test.tsx` (rename `answer.test.tsx` → `kumite.test.tsx`); delete `features/training/AnswerSheet.tsx`.
- **Steps:**
  1. Question area: a full-width primary "Kumite" button with an icon (`SwordsIcon` from lucide), disabled with `title` and the visible reason when the Sensei is unavailable. Under it, a three-column row of small outline buttons: Don't know, Skip, Know.
  2. Tapping Kumite hides the four buttons and shows `ChatPanel` in `'kumite'` mode (ComposeField label "Your Kumite", submit "Send", autofocus) with a Cancel. Cancel shows while no Kumite verdict exists and nothing is pending; it restores the four buttons and keeps nothing.
  3. `useCardChat` in `'kumite'` mode: `send` calls `api.senseiKumite` with the signal, waiting label "The Sensei is reading your Kumite…". On success it calls `onKumite` → `training.kumiteChecked(result, notes, kumite)` and clears the draft; the Card is revealed and the hook continues in `'chat'` mode with `chatOpeningOf`. On failure the draft stays, with the reason and Retry, and no Rep is recorded.
  4. `ChatPanel` renders a Kumite opening as the first two items: the learner's Kumite bubble, then the Sensei's verdict item (`aria-label="Sensei verdict"`) with the `RESULT_LABEL` text as a badge and the notes as `Markdown` when not empty (just the label for a clean Pass). A self-graded opening renders nothing in the list.
  5. `CardAnswer` loses its `checked` prop and the "Your answer" / "Sensei notes" sections.
  6. Tests: rewrite `openAnswerSheet` in `dictation.test.tsx` as `openKumite`. Move the Answer tests to `kumite.test.tsx`.
- **Verify:** `mise run check` is green. Web tests:
  - Kumite only opens the input and sends nothing.
  - Cancel brings back the four buttons.
  - The Kumite request goes to `/api/sensei/kumite`; afterwards the Chat lists the Kumite, then the verdict with "Pass with notes" and the notes, and the Result bar has Pass with notes pressed.
  - A clean Pass shows only the label.
  - A follow-up sends the opening with the Kumite and verdict.
  - A failed Kumite keeps the text, offers Retry, and Next is not shown; after Cancel + Know + Next the only Rep is Pass.
  - Changing the Result bar after a Kumite commits the changed Result.
  - Kumite is disabled with the reason when the Sensei is unhealthy.
  - Dictation into the Kumite input still works with the Kata's hints.

  **Manual checklist** (owner, phone over LAN):
  - iOS Safari and Android Chrome: the stuck input stays above the keyboard while typing.
  - The input grows to about 40%, then scrolls inside.
  - A long reply is scrolled to its first line, under the header.
  - Next and the Result bar are only at the end of the page.
  - VoiceOver reads the Chat list in order, and the microphone and arrow announce their names.

### Stage 8: Comments without SPEC, PLAN or ADR references

- **Goal:** comments describe the code on their own.
- **Depends on:** none; land last to avoid conflicts.
- **Touches:** the files listed under Current State (re-grep).
- **Steps:**
  1. `git grep -nE "SPEC|PLAN|ADR|req\. ?[0-9]|story [0-9]" -- apps packages`.
  2. Rewrite each comment so it keeps its meaning without the reference (for example, "Removes the Card file; its Reps stay in the log, which is never rewritten.").
  3. Leave `README.md`'s pointer to `docs/` alone.
- **Verify:** the grep above returns nothing; `mise run check` is green.

## Risks and Rollback

- **The sticky input behind the iOS keyboard.** Detect with the manual checklist in Stage 7. Back out by reverting `use-keyboard-inset.ts` and its wrapper style; the input then sits in normal flow at the end of the Chat, which is usable, just not stuck.
- **The sticky input inside `ChatPanel` scrolls away** once the learner scrolls below the Chat to the reference answer. This is intended: it keeps the input next to the conversation and keeps Next unreachable by accident. If the owner wants it pinned for the whole page, move the wrapper to the end of `CardStep`; that is a layout-only change.
- **Hiding the Quick note button during the Chat** removes a quick capture point while chatting. Alternative if the owner objects: offset the button above the input with a CSS variable for the input's height.
- **A false abort on the server** if the disconnect detection fires on a normal request (the `request.raw` `'close'` trap). This is guarded by the Stage 4 test, which asserts a completed request is not aborted. Rollback: stop passing `signal` from the routes; the web abort still works.
- **The Sensei ignores the language rules.** Prompt tests cannot catch it; the live test and real use will. Fix by tightening the wording; this does not touch the contract.
- **The contract change in Stage 2** breaks an open web tab still running the old bundle (its chat requests get 400). This is acceptable for a single-user tool; reload the page.
- Every stage is one commit; reverting a stage's commit restores the previous green state, except that Stages 6 and 7 must be reverted together with anything that builds on them.

## Out of Scope

- Streaming Sensei replies, or showing partial text.
- Cancelling authoring requests (`/api/sensei/author`) or the health check.
- Storing a Chat, Chat history, or restoring a Chat after reload.
- A language setting, a language field in `kata.md`, or translating the interface.
- Choosing or pinning the Sensei's model.
- Inputs without dictation (search, Kata settings, Settings sheet) and the generic `Textarea`/`Input` components, which stay as they are.
- Any change to Kobzar's contract, `useDictation`, `appendDictated`, the Rep format or `data/`.
- Deleting this SPEC and PLAN; that happens after the work ships, by the owner.
