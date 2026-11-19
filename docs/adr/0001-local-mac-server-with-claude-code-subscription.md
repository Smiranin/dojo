# Run the Dojo from a local server on the owner's Mac, with the Sensei on the Claude Code subscription

**Status:** accepted
**Amended:** 2026-10-27: offline mode dropped; see the first Consequence.

The Dojo is a single-user tool whose only expensive dependency is the Sensei (LLM). A static site on GitHub Pages with a per-token API key would be simpler to host, but the owner does not want to pay per token when a Claude Code subscription is already paid for, and wants a local server as a base for future personal tools. We therefore run a small server on the owner's Mac, reached from the phone over a private network, and the Sensei calls Claude Code under the owner's own login. The price is that the Dojo only works while the Mac is up and reachable. An offline mode (cached content, queued Reps) was part of the original design and was dropped on 2026-10-27 as not worth its complexity for a tool used over a private network to an always-on Mac.

## Considered Options

- **Local server on the Mac + Claude Code subscription** (chosen): no per-token cost, the server can write content files directly, reusable for later projects. Requires the Mac to be on and the phone to reach it.
- **Static site (GitHub Pages) + the owner's API key in the browser**: zero infrastructure, works anywhere, but pay-per-token and no way to write content from the phone without a GitHub token flow.
- **Static site + small hosted backend for the LLM and sync**: more moving parts than a one-person tool justifies.

## Consequences

- When the Mac is down or unreachable the Dojo is unavailable; it says so and retries. The phone keeps no cache and no queue across launches. A write that fails during a sitting is retried in memory and Reps carry device-generated ids so a retry never duplicates.
- Subscription use is permitted for "the unmodified Claude Code binary signed in with the owner's own subscription"; products for other people must use an API key. The Dojo must stay a personal tool and must not make scheduled or background Sensei calls.
- Whether the Claude Agent SDK picks up the subscription login is unverified; the Sensei integration is isolated behind one boundary so that it can fall back to the Claude Code command line under the same login without touching the rest of the app.
