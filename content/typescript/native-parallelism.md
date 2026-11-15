---
difficulty: hard
tags: [compiler]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
---

## Question

How does the 7.0 compiler use multiple threads, and which flags control it?

## Answer

Parsing, type-checking and emit are parallel. Type-checking uses a number of workers (4 by default) set with `--checkers`, `--builders` controls parallel project-reference builds under `--build`, and `--singleThreaded` forces one thread for everything.

## Explanation

The 7.0 post: "The default number of type-checking workers is 4, but it can be configured with the new `--checkers` flag." Values above the default may "come at the cost of increased memory usage" and varying it "may surface order-dependent results". `--builders` and `--checkers` multiply: `--checkers 4 --builders 4` "allows up to 16 type-checkers to run at once". `--singleThreaded` "will not only cap the number of type-checking workers to 1, but also ensure parsing and emitting are done in a single thread." The first two flags are described as experimental. Watch mode uses a file watcher based on Parcel's.

## Best practice

Leave the defaults; reduce `--checkers` in memory-bound CI, use `--singleThreaded` when you need to reproduce a problem.
