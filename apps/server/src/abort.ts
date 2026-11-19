import type { FastifyReply } from 'fastify';

/**
 * A signal that aborts when the client goes away before the reply was sent, so work nobody
 * will read can stop. It listens on the response: the request's own `close` fires as soon as
 * its body has been read, not when the client leaves.
 */
export function abortOnDisconnect(reply: FastifyReply): AbortSignal {
  const controller = new AbortController();
  reply.raw.once('close', () => {
    if (!reply.raw.writableFinished) controller.abort();
  });
  return controller.signal;
}
