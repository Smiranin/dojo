import type { FastifyInstance } from 'fastify';
import type { HealthResponse } from '@dojo/core';
import type { ServerContext } from '../context.js';

export function registerHealthRoutes(app: FastifyInstance, ctx: ServerContext): void {
  app.get('/api/health', async (): Promise<HealthResponse> => {
    const sensei = await ctx.senseiHealth.get();
    return { ok: true, sensei, contentDir: ctx.content.contentDir, version: ctx.version };
  });

  app.get('/api/settings', async () => ctx.settings);
}
