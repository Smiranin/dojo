import type { FastifyInstance } from 'fastify';
import { inboxNoteSchema } from '@dojo/core';
import { z } from 'zod';
import type { ServerContext } from '../context.js';
import { parseWith } from '../errors.js';

const idParams = z.object({ id: z.string().min(1) });

export function registerInboxRoutes(app: FastifyInstance, ctx: ServerContext): void {
  app.get('/api/inbox', async () => ({ notes: await ctx.inbox.list() }));

  app.post('/api/inbox', async (request) => {
    const note = parseWith(inboxNoteSchema, request.body);
    return { note: await ctx.inbox.add(note) };
  });

  app.delete('/api/inbox/:id', async (request, reply) => {
    const { id } = parseWith(idParams, request.params);
    await ctx.inbox.remove(id);
    return reply.status(204).send();
  });
}
