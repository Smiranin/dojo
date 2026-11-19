# Dojo

A personal, mobile-first trainer for interview preparation: question-and-answer cards grouped by topic, reviewed with spaced repetition until known cold, with an LLM acting as coach. Content is domain-agnostic (React, Python, Node.js today; anything tomorrow).

## Language

**Dojo**:
The application itself: the place where training happens.
_Avoid_: App, site, trainer

**Kata**:
A set of Cards on one topic (for example `react`, `python`), together with the list of Tags its Cards may use. Katas are flat: there are no nested Katas; sub-topics are expressed with Tags. A Kata can be pinned (kept at the top) or archived (hidden and excluded from Due).
_Avoid_: Deck, topic, collection, course, folder

**Card**:
One question together with its reference answer, an explanation and, optionally, a best practice, a source and a Difficulty. The unit of learning and of authoring.
_Avoid_: Question, item, flashcard, entry

**Tag**:
One of the labels a Kata declares for grouping its Cards (for example `hooks`, `state-management`, `performance`). A Card carries zero or more Tags, only from its Kata's list; the list is maintained by the owner, never by the Sensei.
_Avoid_: Category, sub-topic, label, keyword

**Difficulty**:
How hard a Card is, set when the Card is written: easy, medium or hard. Used only to filter a Training; it never affects scheduling.
_Avoid_: Grade, level, weight, complexity

**Rep**:
One attempt to answer a Card, recorded as just the Card, its Result and a timestamp (no answer text). Reps are append-only: a Rep is never edited or deleted.
_Avoid_: Review, attempt, answer, try

**Result**:
The outcome of a Rep on a three-step scale: Fail, Pass with notes, Pass. Set by the user (Don't know, Know) or by the Sensei after a Kumite. The Result drives scheduling.
_Avoid_: Grade, score, rating, verdict, mark

**Belt**:
The mastery level of a Card derived from its Reps: New, Learning, Known. Also aggregated per Kata to show overall progress.
_Avoid_: Status, mastery, level, state

**Due**:
A Card whose next scheduled Rep date has arrived. The Dojo shows the Due count per Kata and offers a Training over all Due Cards.
_Avoid_: Pending, scheduled, overdue

**Training**:
One sitting of Reps, either over one Kata (Due Cards, or the whole Kata regardless of schedule) or over the Due Cards of every Kata.
_Avoid_: Session, run, quiz, practice, drill, sparring, mode

**Sensei**:
The LLM coach inside the Dojo. It checks each Kumite against the reference answer, talks with the learner in the Chat, and writes new Cards and Katas on request.
_Avoid_: LLM, AI, assistant, Claude, bot, model

**Kumite**:
The learner's own answer to a Card, written or spoken, which the Sensei checks and turns into a Result. It opens the Chat about that Card.
_Avoid_: Answer, attempt, check, sparring

**Chat**:
The conversation between the learner and the Sensei about one Card during a Training, opened by a Kumite (whose answer and notes are its first turns) or by asking the Sensei after Know or Don't know. It lasts only while the learner stays on that Card.
_Avoid_: Dialog, conversation, follow-up, thread

**Kobzar**:
The owner's separate speech-to-text service, which the Dojo uses to turn spoken words into text for its text fields. Not part of the Dojo; its own vocabulary lives in its own glossary.
_Avoid_: Dictation service, STT, Whisper, Pysar

**Inbox**:
A list of quick notes captured during Training or elsewhere ("ask about useLayoutEffect") that are not Cards yet and can later be turned into Cards.
_Avoid_: Drafts, notes, backlog, todo
