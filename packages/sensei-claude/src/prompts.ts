import type {
  AuthorInput,
  Card,
  ChatInput,
  ChatOpening,
  ChatTurn,
  Kata,
  KumiteInput,
  Result,
  SelfGrade,
} from '@dojo/core';

const EXISTING_QUESTIONS_HEADING = 'Questions already in the Kata';

export const REPLY_LANGUAGE_RULE =
  "Write in the language of the learner's latest message: the Kumite when you grade a Kumite, the learner's message in a Chat. Keep technical terms, API names and code in their original form. The language of the Card, of these instructions and of earlier messages does not matter.";

export const KATA_LANGUAGE_RULE = `Write every Card, and a new Kata's title and description, in the language the Kata is written in: judge it by the questions under "${EXISTING_QUESTIONS_HEADING}", else by the Kata's title and description. Only for a new Kata, use the language of the learner's instruction. The language of the instruction, the note or the conversation never changes this.`;

const RESULT_LABEL: Record<Result, string> = {
  fail: 'Fail',
  'pass-with-notes': 'Pass with notes',
  pass: 'Pass',
};

const SELF_GRADE_INSTRUCTION: Record<SelfGrade, string> = {
  know: 'The learner chose Know without answering: go deeper than the Card.',
  'dont-know': "The learner chose Don't know: explain from scratch.",
};

function renderCard(card: Card): string {
  const parts = [`## Question\n\n${card.question}`, `## Answer\n\n${card.answer}`];
  if (card.explanation) parts.push(`## Explanation\n\n${card.explanation}`);
  if (card.bestPractice) parts.push(`## Best practice\n\n${card.bestPractice}`);
  return parts.join('\n\n');
}

function renderKata(kata: Kata): string {
  return `Kata: ${kata.title}\nDescription: ${kata.description || '(none)'}\nAllowed Tags: ${kata.tags.join(', ') || '(none)'}`;
}

/** The learner's Kumite as a prompt section. */
function renderKumite(kumite: string): string {
  return `# Learner's Kumite\n\n${kumite}`;
}

/** The turns of a Chat in order, one paragraph per turn. */
function renderTurns(turns: ChatTurn[]): string {
  return turns
    .map((turn) => `**${turn.role === 'learner' ? 'Learner' : 'Sensei'}:** ${turn.text}`)
    .join('\n\n');
}

/** How a Chat began: the Kumite with the Sensei's verdict, or how the learner graded themselves. */
export function renderOpening(opening: ChatOpening): string {
  if (opening.kind === 'self-graded') {
    return `# How the Card was revealed\n\n${SELF_GRADE_INSTRUCTION[opening.choice]}`;
  }
  const verdict = [`Result: ${RESULT_LABEL[opening.result]}`];
  if (opening.notes.trim() !== '') verdict.push(opening.notes);
  return `${renderKumite(opening.kumite)}\n\n# Sensei's verdict\n\n${verdict.join('\n\n')}`;
}

export const KUMITE_SYSTEM_PROMPT = `You are the Sensei of a personal interview-training Dojo. The learner answered a Card's question from memory, in their own words, possibly in shorthand: this is their Kumite. Compare it with the reference answer and decide:
- "pass": the essentials are there and correct; wording and completeness beyond the essentials do not matter.
- "pass-with-notes": mostly right, but something worth remembering is missing, imprecise or slightly wrong.
- "fail": the core is wrong or missing.
Return "notes" as short Markdown that says exactly what was missing or wrong (bullet points, no praise); an empty string for a clean pass.
${REPLY_LANGUAGE_RULE}`;

/** The Card and the learner's Kumite, for grading. */
export function kumitePrompt(input: KumiteInput): string {
  return `# Card\n\n${renderCard(input.card)}\n\n${renderKumite(input.kumite)}`;
}

export const CHAT_SYSTEM_PROMPT = `You are the Sensei of a personal interview-training Dojo, answering a follow-up question about one Card. Be concrete and brief; use the Card's answer and explanation as the ground truth, and say so when the learner is right or wrong. Markdown is fine, including fenced code.
Before the conversation you see how the Chat began: the learner's Kumite with your verdict on it, or whether the learner chose Know or Don't know. That opening is part of the Chat. When the learner asks about your verdict or your notes, refer to those notes and to what the Kumite said, specifically.
${REPLY_LANGUAGE_RULE}`;

/** The Card, how the Chat began, the turns so far and the learner's new message. */
export function chatPrompt(input: ChatInput): string {
  const turns = renderTurns(input.chat.turns);
  return `# Card\n\n${renderCard(input.card)}\n\n${renderOpening(input.chat.opening)}\n\n# Conversation so far\n\n${turns || '(none)'}\n\n# Learner's message\n\n${input.message}`;
}

export const AUTHOR_SYSTEM_PROMPT = `You are the Sensei of a personal interview-training Dojo and you write its Cards. A Card is one interview question with:
- "question": the question as an interviewer would ask it (Markdown, one to three sentences).
- "answer": the reference answer: the essentials, precise, as a strong candidate would say it (Markdown).
- "explanation": optional background that makes the answer make sense.
- "bestPractice": optional practical advice for real code.
- "tags": only Tags from the Kata's allowed list; an empty list when none fits.
- "difficulty": "easy", "medium" or "hard".
- "slug": a short lower-case hyphenated file name for the question, e.g. "use-memo-when".
- "source": optional URL of the canonical documentation.
Never repeat a question that already exists in the Kata; cover different ground. Fenced code is welcome in answers and explanations.
When asked for a new Kata, also return "kata" with a lower-case hyphenated "id", a "title", a one-sentence "description" and the list of "tags" the Kata will use (lower-case hyphenated words); every Card's tags must come from that list.
${KATA_LANGUAGE_RULE}`;

export function authorPrompt(input: AuthorInput): string {
  const sections: string[] = [];
  const kind: Record<AuthorInput['kind'], string> = {
    'add-cards': 'Add Cards to the Kata below as the learner asks.',
    'new-kata': 'Create a new Kata with a first set of Cards as the learner asks.',
    'fix-card':
      'Rewrite the Card below according to the learner; return exactly one Card with the corrected content and the same slug.',
    'from-chat':
      'Turn the conversation below into one or more Cards that capture what the learner learned.',
    'from-inbox': "Turn the learner's note below into one or more Cards.",
  };
  sections.push(`# Task\n\n${kind[input.kind]}`);
  if (input.kata) sections.push(`# Kata\n\n${renderKata(input.kata)}`);
  if (input.target)
    sections.push(`# Card to fix (slug: ${input.target.slug})\n\n${renderCard(input.target)}`);
  if (input.context?.note) sections.push(`# Note\n\n${input.context.note}`);
  if (input.context?.chat) {
    sections.push(renderOpening(input.context.chat.opening));
    if (input.context.chat.turns.length > 0) {
      sections.push(`# Conversation\n\n${renderTurns(input.context.chat.turns)}`);
    }
  }
  if (input.existingQuestions.length > 0) {
    sections.push(
      `# ${EXISTING_QUESTIONS_HEADING} (do not repeat)\n\n${input.existingQuestions.map((q) => `- ${q}`).join('\n')}`,
    );
  }
  sections.push(`# Learner's instruction\n\n${input.instruction || '(none)'}`);
  return sections.join('\n\n');
}
