import { describe, expect, it } from 'vitest';
import { AUTHORING_JSON_SCHEMA, CHAT_JSON_SCHEMA, CHECK_JSON_SCHEMA } from '../src/schemas.js';

describe('JSON schemas for the SDK', () => {
  it('are bare draft-7 objects with the required fields of the zod schemas', () => {
    expect(CHECK_JSON_SCHEMA).toMatchObject({
      type: 'object',
      required: ['result', 'notes'],
      properties: { result: { enum: ['fail', 'pass-with-notes', 'pass'] } },
    });
    expect(CHECK_JSON_SCHEMA).not.toHaveProperty('$schema');
    expect(CHAT_JSON_SCHEMA).toMatchObject({ type: 'object', required: ['reply'] });
    expect(AUTHORING_JSON_SCHEMA).toMatchObject({
      type: 'object',
      required: ['cards'],
      properties: { cards: { type: 'array' } },
    });
  });

  it('marks optional Card fields as not required', () => {
    const card = (AUTHORING_JSON_SCHEMA.properties as { cards: { items: { required: string[] } } })
      .cards.items;

    expect(card.required).toEqual(
      expect.arrayContaining(['slug', 'question', 'answer', 'tags', 'difficulty']),
    );
    expect(card.required).not.toContain('explanation');
  });
});
