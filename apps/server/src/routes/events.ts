import type { FastifyInstance } from 'fastify';
import type { ServerContext } from '../context.js';

export function registerEventRoutes(app: FastifyInstance, ctx: ServerContext): void {
  app.get('/api/events', ctx.events.handle);
}
