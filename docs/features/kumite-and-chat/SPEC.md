# Kumite and Chat

**ADRs:** none
**Status:** draft

## Problem Statement

During a Training I answer a Card in my own words, the Sensei checks it and leaves notes, and then I want to ask more about them. Today that breaks in three ways:

- The Sensei always writes in the language of the Card. When I answer or ask in Russian, I still get English back.
- The answer check and the follow-up questions are two separate things. The follow-up opens in a separate sheet with an empty conversation, so I do not see my answer and the Sensei's notes next to my question, and the Sensei does not see them either. It does not feel like one conversation, and I get confused about where I am.
- Dictation inputs are a text box with the microphone and the submit button under it, which takes space and does not look like the chat inputs I am used to.

## Goal and Success Criteria

Answering a Card and talking about it with the Sensei is one continuous conversation on the Card's screen, in my language.

1. When I write a Kumite or a Chat message in Russian, the Sensei replies in Russian; when I write in English, it replies in English. Technical terms may stay in English.
2. After a Kumite, my answer, the Sensei's Result and notes, and every follow-up question and reply are visible together on the Card's screen, in order, without opening anything.
3. A follow-up reply of the Sensei takes my Kumite and its notes into account (for example, "why was my point about X wrong?" gets a specific answer).
4. Cards written by the Sensei stay in the language of their Kata, whatever language I used in the instruction or the Chat.
5. Every input with dictation has the microphone and the submit button inside the field and grows with its text.

## Solution

On a Card's question I see one prominent **Kumite** button and, below it, three small ones: Don't know, Skip, Know. Tapping Kumite opens the Chat on the Card's screen: an input sticks to the bottom of the screen, and a Cancel brings the four buttons back as long as I have not sent anything. What I send first is my answer: the Sensei checks it, the Card is revealed, and the conversation reads top to bottom: my answer, the Sensei's verdict (the Result and its notes), then whatever I ask next and the Sensei's replies. The reference answer, explanation and best practice follow below, then the Card actions, the Result bar and Next.

When I tap Know or Don't know instead, the Card is revealed as today and an **Ask the Sensei** button opens the same Chat; the Sensei knows which of the two I chose. Skip goes on to the next Card, as today.

The Sensei answers in the language of my latest message. The Chat lasts while I stay on the Card; Next drops it.

The input of the Chat, of the Sensei's authoring sheet and of the Quick note are one and the same kind of field: one or two lines high at first, growing as I type, with the microphone and the submit arrow inside it.

## User Stories

1. As a learner, I want the Sensei to write its notes on my Kumite in the language I wrote the Kumite in, so that I can answer in Russian and read the feedback in Russian.
2. As a learner, I want the Sensei to reply in the Chat in the language of my latest message, so that I can switch languages mid-conversation.
3. As a learner, I want technical terms to stay in their original form in a Russian reply, so that I learn the words I will use in an English interview.
4. As a learner, I want Cards written by the Sensei to be in the language of their Kata even when I gave the instruction in Russian, so that my Katas stay in one language.
5. As a learner, I want "Save chat as Card" to produce a Card in the Kata's language even when the Chat was in Russian, so that saved Cards fit their Kata.
6. As a learner, I want one prominent Kumite button on a Card's question, so that answering in my own words is the obvious main action.
7. As a learner, I want Don't know, Skip and Know as smaller buttons under Kumite, so that quick self-grading stays one tap away.
8. As a learner, I want tapping Kumite to only open the input and not send anything, so that I can think before answering.
9. As a learner, I want to cancel a Kumite before I sent anything, so that I can still choose Don't know, Skip or Know.
10. As a learner, I want my first message after Kumite to be checked as my answer, so that answering and talking are one flow.
11. As a learner, I want my answer and the Sensei's verdict to stay on the screen as the first turns of the Chat, so that I see what I am asking about.
12. As a learner, I want the Sensei's verdict to show the Result as a label above its notes, so that I see the outcome at a glance.
13. As a learner, I want a clean Pass to show just the Pass label, so that an empty note does not look like an error.
14. As a learner, I want to still change the Result with the Result bar after a Kumite, so that I can overrule the Sensei.
15. As a learner, I want my follow-up questions and the Sensei's replies to appear on the Card's screen right after the verdict, so that the whole conversation is visible in one place.
16. As a learner, I want the Sensei to know my Kumite and its notes when I ask a follow-up question, so that it can explain what exactly I got wrong.
17. As a learner, I want the Chat input to stick to the bottom of the screen while the Chat is open, so that I can write without scrolling to it.
18. As a learner, I want the reference answer, explanation and best practice to stay on the Card's screen below the Chat, so that I can compare with them.
19. As a learner, I want Next and the Result bar at the end of the page and not stuck to the bottom, so that I do not tap Next by accident while chatting.
20. As a learner, I want an Ask the Sensei button on a Card I revealed with Know or Don't know, so that I can still ask about it.
21. As a learner, I want Ask the Sensei to open the same Chat on the Card's screen, not a separate sheet, so that there is one way to talk to the Sensei.
22. As a learner, I want the Sensei to know whether I chose Know or Don't know, so that it explains from scratch or goes deeper accordingly.
23. As a learner, I want to see that the Sensei is thinking under my latest message, so that I know my message was sent.
24. As a learner, I want a new reply to be scrolled to its beginning, so that I read a long reply from the top.
25. As a learner, I want my text to stay in the input and a reason with Retry to appear when the Sensei fails, so that I do not lose what I wrote.
26. As a learner, I want no Rep to be recorded while a Kumite has no Result yet, so that a failed check does not count.
27. As a learner, I want Next to drop the Chat and any reply still on its way without asking, so that moving on is one tap.
28. As a learner, I want "Save chat as Card" to include my Kumite and the verdict, so that the new Card captures what I got wrong.
29. As a learner, I want every input with dictation to have the microphone and the submit arrow inside the field, like common chat apps, so that inputs take less space.
30. As a learner, I want such an input to start one or two lines high and grow as I type, up to about 40% of the visible screen, then scroll inside, so that short and long texts both fit.
31. As a learner, I want Cmd/Ctrl+Enter to submit and Enter to start a new line, so that I can write multi-line answers on the phone and submit quickly on a keyboard.
32. As a learner, I want the authoring sheet and the Quick note to use the same input, so that every place where I write or dictate works the same way.
33. As a learner, I want the Kumite button to be greyed out with the reason when the Sensei is unavailable, as Answer is today, so that I know why I cannot use it.

## Requirements

### Functional

1. A Card's question shows a Kumite button, visually emphasised (full width, accent colour, icon), above a row of Don't know, Skip and Know.
2. Kumite opens the Chat on the Card's screen with an input stuck to the bottom of the screen and a Cancel that is available until the first message is sent; Cancel restores the four buttons.
3. The first message after Kumite is the learner's answer. The Sensei returns a Result (Fail, Pass with notes, Pass) and notes, as today; the Card is revealed and a Rep follows the existing Training rules.
4. The Chat shows, in order: the learner's answer, the Sensei's verdict (the Result as a label, then the notes; only the label for a clean Pass), then every further learner message and Sensei reply.
5. After the Chat come the reference answer, explanation, best practice and source, then Fix this Card, Save chat as Card (when the Chat has turns) and Delete, then the Result bar and Next.
6. On a Card revealed with Know or Don't know, an Ask the Sensei button opens the same Chat on the Card's screen; there is no separate Chat sheet any more.
7. Every Chat message to the Sensei carries the Card, the whole Chat so far (including the Kumite and its verdict when there was one) and, when the Chat was opened with Ask the Sensei, whether the learner chose Know or Don't know.
8. The Sensei writes Kumite notes and Chat replies in the language of the learner's latest message; technical terms may stay in their original form.
9. The Sensei writes Cards and Katas (every authoring kind, including Save chat as Card) in the language of the Kata, or for a new Kata in the language of the learner's instruction.
10. While the Sensei is working, a waiting indicator appears under the latest message; when a reply arrives, the screen scrolls to the beginning of that reply.
11. When a Kumite or a Chat message fails, the text stays in the input and the reason is shown with Retry; a failed Kumite records no Rep.
12. Next during a pending Sensei request cancels it without a prompt; the Chat is dropped when the Card changes, as today.
13. Save chat as Card passes the whole Chat, including the Kumite and its verdict.
14. One input is used wherever dictation is offered (the Chat, the authoring sheet, the Quick note): the microphone and the submit arrow are inside the field at its bottom right; the field starts one or two lines high and grows with its text up to 40% of the visible viewport height, then scrolls inside; Cmd/Ctrl+Enter submits and Enter inserts a new line. In the authoring sheet and the Quick note the arrow replaces their current submit buttons.
15. Kumite and Ask the Sensei are disabled with the reason shown when the Sensei is unavailable.

### Non-functional

1. Mobile first: the stuck input stays above the on-screen keyboard on iOS Safari and Android Chrome.
2. Accessibility: the microphone and submit icons have accessible names; the Chat is a list a screen reader can read in order; the Result label is text, not colour only.

## Constraints

- The Sensei stays stateless: each message carries the whole Chat; no Chat is stored on the server or in `data/`.
- `data/reps.jsonl` stays append-only; the Rep format does not change.
- The Sensei runs only on the Claude Code login; nothing in this work adds an API key path.
- Kobzar's contract and the dictation behaviour (what is sent to Kobzar, how dictated text is appended) do not change; only where the microphone sits changes.

## Out of Scope

- Choosing or pinning the Sensei's model (handled separately by the owner).
- Keeping a Chat after leaving its Card, or a history of Chats.
- Translating the Dojo's interface; buttons and labels stay in English.
- A language setting; the language always follows the learner's latest message.
- Inputs without dictation (search, Kata settings and the like).

## Open Questions

None.

## Further Notes

- This work also removes the references to the deleted MVP and voice-input SPEC and PLAN ("SPEC req. 31", "PLAN \"Scheduling\"" and the like) from code comments, keeping what each comment says on its own.
- This SPEC and its PLAN are deleted once the work ships; `docs/` keeps only `GLOSSARY.md` and `adr/` for good.
- Code uses the glossary words: the answer check becomes Kumite in names; `chat` stays.
