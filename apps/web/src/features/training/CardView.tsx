import type { Card } from '@dojo/core';
import { Markdown } from '../../components/Markdown.js';

export function CardQuestion({ card }: { card: Card }) {
  return (
    <section aria-label="Question" className="bg-card rounded-xl border p-4">
      <Markdown text={card.question} />
    </section>
  );
}

/** The reference answer with its explanation, best practice and source. */
export function CardAnswer({ card }: { card: Card }) {
  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Answer" className="bg-card rounded-xl border p-4">
        <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">Answer</h2>
        <Markdown text={card.answer} />
      </section>
      {card.explanation && (
        <section aria-label="Explanation" className="rounded-xl border p-4">
          <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
            Explanation
          </h2>
          <Markdown text={card.explanation} />
        </section>
      )}
      {card.bestPractice && (
        <section aria-label="Best practice" className="rounded-xl border p-4">
          <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
            Best practice
          </h2>
          <Markdown text={card.bestPractice} />
        </section>
      )}
      {card.source && (
        <a
          href={card.source}
          target="_blank"
          rel="noreferrer"
          className="text-primary text-sm underline"
        >
          Source
        </a>
      )}
    </div>
  );
}
