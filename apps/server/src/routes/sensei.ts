import type { FastifyInstance } from 'fastify';
import {
  senseiAuthorRequestSchema,
  senseiChatRequestSchema,
  senseiKumiteRequestSchema,
  type Card,
} from '@dojo/core';
import { abortOnDisconnect } from '../abort.js';
import type { ServerContext } from '../context.js';
import { NotFoundError, parseWith } from '../errors.js';
import { applyProposal } from '../sensei/authoring.js';

/** The Card as it is on disk right now, so the Sensei never grades against a stale copy. */
export async function cardFromDisk(ctx: ServerContext, cardId: string): Promise<Card> {
  const snapshot = await ctx.content.snapshot();
  const card = snapshot.cards.find((c) => c.id === cardId);
  if (!card) throw new NotFoundError(`Card ${cardId}`);
  return card;
}

export function registerSenseiRoutes(app: FastifyInstance, ctx: ServerContext): void {
  app.post('/api/sensei/kumite', async (request, reply) => {
    const { cardId, kumite } = parseWith(senseiKumiteRequestSchema, request.body);
    const signal = abortOnDisconnect(reply);
    const card = await cardFromDisk(ctx, cardId);
    return ctx.sensei.kumite({ card, kumite, signal });
  });

  app.post('/api/sensei/chat', async (request, reply) => {
    const { cardId, chat, message } = parseWith(senseiChatRequestSchema, request.body);
    const signal = abortOnDisconnect(reply);
    const card = await cardFromDisk(ctx, cardId);
    return ctx.sensei.chat({ card, chat, message, signal });
  });

  app.post('/api/sensei/author', async (request) => {
    const body = parseWith(senseiAuthorRequestSchema, request.body);
    return applyProposal(ctx, body);
  });
}
