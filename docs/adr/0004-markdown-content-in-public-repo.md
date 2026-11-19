# Keep content as Markdown files in the public `dojo` repository, one file per Card

**Status:** accepted

Cards are Markdown files with front matter, one per Card, in a folder per Kata, committed to the same public repository as the application. The owner writes most content outside the Dojo (editor, Claude Code), and the Sensei writes the same files from inside it, so the content format must be the one a person would write by hand: Markdown gives code blocks and formatting for free, and one file per Card means additions never conflict. The repository is public, so the content is public too; the owner accepts this because the content is interview questions, not secrets. Changing the format later means migrating every Card, which is why this is recorded.

## Considered Options

- **Markdown with front matter, one file per Card** (chosen): human- and LLM-friendly, conflict-free additions, git history per Card.
- **One Markdown or YAML file per Kata**: fewer files, but concurrent additions and edits collide and large files are awkward on a phone diff.
- **JSON**: easy to parse, unpleasant to write by hand, no natural place for formatted answers.
- **Separate content repository**: keeps content private or shareable, but adds a second place to sync for no current benefit.

## Consequences

- The Rep log and Inbox are personal data and live next to the content; they are not secret but should not be assumed private either.
- A later move to a private content repository or to non-Markdown storage is a migration of every Card plus the Sensei's writing instructions.
