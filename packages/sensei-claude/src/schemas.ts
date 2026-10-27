import { authoringProposalSchema, chatOutputSchema, checkOutputSchema } from '@dojo/core';
import { z } from 'zod';

/** JSON schemas for the SDK's structured output, derived from the one zod definition in core. */
function jsonSchemaOf(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema, { target: 'draft-7', io: 'input' }) as Record<
    string,
    unknown
  >;
  // The SDK wants a bare schema object; the dialect marker is noise there.
  delete json.$schema;
  return json;
}

export const CHECK_JSON_SCHEMA = jsonSchemaOf(checkOutputSchema);
export const CHAT_JSON_SCHEMA = jsonSchemaOf(chatOutputSchema);
export const AUTHORING_JSON_SCHEMA = jsonSchemaOf(authoringProposalSchema);
