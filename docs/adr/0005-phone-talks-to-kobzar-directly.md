# The Dojo on the phone talks to Kobzar directly, not through the Dojo's server

**Status:** accepted

Dictation in the Dojo is done by Kobzar, a separate speech-to-text service on the same Mac (see `../../Kobzar/adr/0002-standalone-service-with-thin-clients.md`). Everything else the phone needs goes through the Dojo's server, so the expected design was for the server to forward the recorded speech to Kobzar. The owner chose the direct path instead: the Dojo in the browser sends the recorded speech straight to Kobzar and adds the hints (the Kata and its Tags) itself. This keeps the Dojo's server out of audio entirely and makes the Dojo an ordinary Client of Kobzar, the same as any other.

## Considered Options

- **Phone to Kobzar directly** (chosen): one hop less, no audio handling in the Dojo's server, the Dojo uses Kobzar exactly as any other Client would.
- **Phone to the Dojo's server, which forwards to Kobzar**: the phone knows a single address and Kobzar needs no list of allowed sites, but the Dojo's server gains an audio path and a dependency it otherwise does not need.

## Consequences

- Kobzar needs its own HTTPS address inside the private network and must allow requests from the Dojo's address; the Dojo's address is entered in Kobzar's settings.
- The Dojo's server only tells the web app where Kobzar is; when no address is configured there is no microphone button at all.
- The private-network rule of ADR 0003 now covers two services: neither may be exposed publicly.
