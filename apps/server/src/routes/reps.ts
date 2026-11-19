import type { FastifyInstance } from 'fastify';
import { repsBodySchema } from '@dojo/core';
import type { ServerContext } from '../context.js';
import { parseWith } from '../errors.js';

export function registerRepRoutes(app: FastifyInstance, ctx: ServerContext): void {
  app.get('/api/reps', async () => ({ reps: await ctx.reps.readAll() }));

  // A Rep for a Card that no longer exists is accepted: the log is history, not a copy of
  // the content.
  app.post('/api/reps', async (request) => {
    const { reps } = parseWith(repsBodySchema, request.body);
    return ctx.reps.append(reps);
  });
}
