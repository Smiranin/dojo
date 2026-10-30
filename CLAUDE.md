# Dojo

A personal, mobile-first interview trainer: Katas hold Cards, Training runs Cards that are Due, a Rep records every Result, the Sensei (Claude on the owner's Claude Code login) checks answers and writes Cards. The vocabulary is in `README.md`; the SPEC, ADRs and the implementation plan live in `~/Projects/Docs/dojo/` (`features/dojo-mvp/SPEC.md`, `adr/`, `features/dojo-mvp/PLAN.md`). Use the glossary words in code, comments and docs.

## Layout

- `packages/core`: domain types, Markdown content format, scheduling, the Training reducer, the Sensei port and API schemas. Pure TypeScript, no Node-only imports (it is also bundled into the browser).
- `packages/sensei-claude`: the Sensei on the Claude Agent SDK. The only package that imports the SDK.
- `apps/server`: Fastify composition root; reads and writes `content/` and `data/`, watches them, streams change events, exposes the Sensei. Binds to `127.0.0.1` unless `DOJO_HOST` says otherwise.
- `apps/web`: the React app for the phone.
- `content/`: one folder per Kata, `kata.md` plus one `.md` per Card; the file format and the writing rules are in `content/README.md`, read it before writing or editing content. `data/`: `reps.jsonl` (append-only) and `inbox.json`.

## Commands

- `mise run setup`: install dependencies (Node and pnpm versions come from `mise.toml`).
- `mise run dev`: server on `127.0.0.1:4800` plus the Vite dev server. `DOJO_HOST=0.0.0.0 mise run dev:server` exposes the server on the LAN for a phone.
- `mise run check`: typecheck, lint, format check and tests. Must pass before every commit.
- `pnpm --filter @dojo/core test`: tests of one package.

## Hard rules

- The Sensei runs on the Claude Code login only: the server strips `ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN` from the environment it gives the SDK. Never add an API key path.
- The Sensei never deletes files and never commits to git. Deletes happen only on an explicit action from the learner; git stays manual.
- `data/reps.jsonl` is append-only; nothing rewrites it.
- Never bind the server to a public interface by default; `host` in `dojo.yaml` stays `127.0.0.1`.
- Do not install Tailscale on the work laptop; it belongs to the personal Mac only.

## Development Philosophy & Rules

### Mandatory Workflow: Design Before Implementation

**CRITICAL: Never jump straight to implementation. Always follow this sequence:**

#### 1. Problem Analysis Phase

When asked for a bug fix, new feature, or code change — **first analyze and understand:**

- What is the actual problem?
- What is the root cause?
- What are the constraints and requirements?

**Present analysis clearly and wait for confirmation before proceeding.**

#### 2. Design Phase

After problem analysis is confirmed, propose solutions:

**Always provide 2-3 solution options:**

- Option 1: [Approach A] — pros, cons, trade-offs
- Option 2: [Approach B] — pros, cons, trade-offs
- Option 3: [Approach C] — pros, cons, trade-offs (if applicable)

**Recommendation:** Clearly state which option you recommend and why.
**WAIT for approval before moving to implementation.**

#### 3. Implementation Phase

Only after design is approved:

- Analyze existing code patterns in the project
- Follow those patterns in implementation
- Present the implementation plan
- Wait for final approval before applying changes

### Anti-Patterns: What NOT to Do

**Never propose workarounds or "quick fixes" as the only solution:**

- No hardcoded values instead of proper configuration
- No monkey patching or overriding library internals
- No global state without justification
- No copy-pasted code instead of proper abstraction
- No ignoring errors or empty catch blocks
- No magic numbers/strings without named constants
- No "TODO: fix this later" in production code

A quick workaround may be **one of the options** (never the only one) if clearly labeled as "Quick workaround (not recommended)" with trade-offs explained.

### Code Quality Standards

**Error Handling:** Handle errors explicitly with meaningful messages. Never silently swallow exceptions.

**Code Patterns:** Analyze the existing codebase first. Follow established patterns. Maintain consistency with surrounding code.

**Code Duplication:** Avoid repeating code. Extract common logic. Apply DRY principle.

**Documentation:** Document "why" not "what". Add comments for non-obvious decisions. Use JSDoc where appropriate.

**Readability:** Descriptive names, focused functions, clarity over cleverness.

### Iterative Refinement

If feedback suggests the approach needs adjustment:

- Don't immediately implement a different solution
- First revise the design based on feedback
- Present updated design options
- Wait for approval before implementing

**Quality and correctness are more important than speed.**
