import type { AuthorInput, Card, ChatInput, CheckInput, Kata } from '@dojo/core';

const LANGUAGE_RULE =
  'Write everything you output in the language the Card is written in, whatever language these instructions or the learner use.';

function renderCard(card: Card): string {
  const parts = [`## Question\n\n${card.question}`, `## Answer\n\n${card.answer}`];
  if (card.explanation) parts.push(`## Explanation\n\n${card.explanation}`);
  if (card.bestPractice) parts.push(`## Best practice\n\n${card.bestPractice}`);
  return parts.join('\n\n');
}

function renderKata(kata: Kata): string {
  return `Kata: ${kata.title}\nDescription: ${kata.description || '(none)'}\nAllowed Tags: ${kata.tags.join(', ') || '(none)'}`;
}

export const CHECK_SYSTEM_PROMPT = `You are the Sensei of a personal interview-training Dojo. The learner answered a Card's question from memory, in their own words, possibly in shorthand. Compare their answer with the reference answer and decide:
- "pass": the essentials are there and correct; wording and completeness beyond the essentials do not matter.
- "pass-with-notes": mostly right, but something worth remembering is missing, imprecise or slightly wrong.
- "fail": the core is wrong or missing.
Return "notes" as short Markdown that says exactly what was missing or wrong (bullet points, no praise); an empty string for a clean pass.
${LANGUAGE_RULE}`;

export function checkPrompt(input: CheckInput): string {
  return `# Card\n\n${renderCard(input.card)}\n\n# Learner's answer\n\n${input.answer}`;
}

export const CHAT_SYSTEM_PROMPT = `You are the Sensei of a personal interview-training Dojo, answering a follow-up question about one Card. Be concrete and brief; use the Card's answer and explanation as the ground truth, and say so when the learner is right or wrong. Markdown is fine, including fenced code.
${LANGUAGE_RULE}`;

export function chatPrompt(input: ChatInput): string {
  const history = input.history
    .map((turn) => `**${turn.role === 'learner' ? 'Learner' : 'Sensei'}:** ${turn.text}`)
    .join('\n\n');
  return `# Card\n\n${renderCard(input.card)}\n\n# Conversation so far\n\n${history || '(none)'}\n\n# Learner's message\n\n${input.message}`;
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
Write in the language of the learner's instruction, or of the Kata when the instruction is a short command.`;

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
  if (input.context?.chat && input.context.chat.length > 0) {
    const chat = input.context.chat
      .map((turn) => `**${turn.role === 'learner' ? 'Learner' : 'Sensei'}:** ${turn.text}`)
      .join('\n\n');
    sections.push(`# Conversation\n\n${chat}`);
  }
  if (input.existingQuestions.length > 0) {
    sections.push(
      `# Questions already in the Kata (do not repeat)\n\n${input.existingQuestions.map((q) => `- ${q}`).join('\n')}`,
    );
  }
  sections.push(`# Learner's instruction\n\n${input.instruction || '(none)'}`);
  return sections.join('\n\n');
}
