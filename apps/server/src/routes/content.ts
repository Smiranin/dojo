import type { FastifyInstance } from 'fastify';
import { kataFlagsPatchSchema } from '@dojo/core';
import { z } from 'zod';
import type { ServerContext } from '../context.js';
import { parseWith } from '../errors.js';

const kataParams = z.object({ kataId: z.string() });
const cardParams = z.object({ kataId: z.string(), slug: z.string() });

export function registerContentRoutes(app: FastifyInstance, ctx: ServerContext): void {
  app.get('/api/content', async () => ctx.content.snapshot());

  app.patch('/api/katas/:kataId', async (request) => {
    const { kataId } = parseWith(kataParams, request.params);
    const flags = parseWith(kataFlagsPatchSchema, request.body);
    return ctx.content.patchKataFlags(kataId, flags);
  });

  app.delete('/api/cards/:kataId/:slug', async (request, reply) => {
    const { kataId, slug } = parseWith(cardParams, request.params);
    await ctx.content.deleteCard(kataId, slug);
    return reply.status(204).send();
  });
}
