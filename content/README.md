# Writing content

All content of the Dojo lives in this folder as Markdown files. One folder is one Kata. One file
inside it is one Card. Edit the files with any editor or with Claude Code; the Dojo picks up a
change within seconds, no restart needed.

```
content/
  react/                 ← a Kata
    kata.md              ← the Kata itself
    keys.md              ← one Card
    stale-closure.md     ← another Card
  python/
    kata.md
    gil.md
```

## Names

Folder and file names are slugs: lowercase letters, digits and hyphens, nothing else, at most 60
characters. The slug is the id of the Kata or the Card, so do not rename a file once it has Reps.
The Card `content/react/keys.md` has the id `react/keys`.

## A Kata

`kata.md` has a YAML front matter and a body. The Dojo reads only the front matter; the body is
for your own notes.

```md
---
title: React
description: Hooks, rendering, state management and performance.
tags: [hooks, rendering, state-management, performance]
pinned: true
archived: false
---

Notes for yourself. The Dojo ignores this part.
```

| Field         | Required | Meaning                                                                   |
| ------------- | -------- | ------------------------------------------------------------------------- |
| `title`       | yes      | The name shown in the Dojo.                                               |
| `description` | no       | One line under the title.                                                 |
| `tags`        | no       | The only Tags the Cards of this Kata may use. Keep this list by hand.     |
| `pinned`      | no       | `true` puts the Kata at the top of Home.                                  |
| `archived`    | no       | `true` hides the Kata from Home and from "Train all Due". Nothing is lost. |

## A Card

A Card is a `.md` file next to `kata.md`. It has a small front matter and sections with `##`
headings.

```md
---
difficulty: easy
tags: [rendering]
source: https://react.dev/learn/rendering-lists#why-does-react-need-keys
---

## Question

Why must list items have stable keys?

## Answer

Keys let React match elements between renders so state and DOM nodes follow the item instead of
the position.

## Explanation

Without a stable key React matches by position, so inserting at the top makes every item take the
state of its neighbour.

## Best practice

Use an id from the data. Use the index only for a static list that never reorders.
```

| Part                | Required | Meaning                                                                        |
| ------------------- | -------- | ------------------------------------------------------------------------------ |
| `difficulty`        | no       | `easy`, `medium` or `hard`. Only filters a Training; it never changes scheduling. |
| `tags`              | no       | Zero or more Tags from the Kata's list.                                        |
| `source`            | no       | A link shown under the answer.                                                 |
| `## Question`       | yes      | What the learner is asked. Markdown and code blocks are fine.                  |
| `## Answer`         | yes      | The reference answer. Short: the thing you must be able to say.                |
| `## Explanation`    | no       | Why the answer is right; shown after the answer.                               |
| `## Best practice`  | no       | What to do about it in real code.                                              |

Heading names are matched without regard to case. Other headings are kept in the file but the
Dojo does not show them.

## What good Cards look like

- One question, one idea. Split a Card that needs two answers.
- The answer is what you would say in an interview, two or three sentences at most. Put the long
  version into Explanation.
- Write questions the way an interviewer asks them, not as a textbook heading.
- Code goes in fenced blocks with a language: ```` ```tsx ````.

## When a file is wrong

The Dojo never crashes on content. A problem is reported in the content snapshot the server
serves (`GET /api/content`, field `issues`) and the Dojo does the safest thing:

- A Card without `## Question` or `## Answer` is not shown.
- A Tag that the Kata does not declare is dropped from the Card. Add it to `kata.md` first.
- A broken front matter (unclosed `---`, bad YAML) excludes that file.

## Check your files

After adding or editing files, run this from the repository root:

```sh
mise run content:check
```

It reads the folder with the same code the server uses, prints every problem with its file, and
exits with code 1 when there is one. The server does not need to be running. Fix what it lists,
then run it again until it reports `0 issues`.

## The Sensei writes here too

"Add Cards", "New Kata", "Fix this Card" and "Save chat as Card" in the Dojo write the same files
in the same format. The Sensei never deletes a file and never runs git; committing is yours.
