import type { FastifyReply, FastifyRequest } from 'fastify';
import type { SseEventName } from '@dojo/core';

export const HEARTBEAT_MS = 15_000;

interface Client {
  write(chunk: string): void;
  end(): void;
}

/**
 * Fans change notifications out to every `GET /api/events` client. There is no replay buffer
 * and no event id: a client that reconnects refetches everything, which is cheap here.
 */
export class EventHub {
  private readonly clients = new Set<Client>();

  constructor(private readonly heartbeatMs = HEARTBEAT_MS) {}

  get clientCount(): number {
    return this.clients.size;
  }

  /** Ends every open stream so the server can close; clients reconnect on their own. */
  closeAll(): void {
    for (const client of [...this.clients]) client.end();
    this.clients.clear();
  }

  publish(name: SseEventName, at = new Date()): void {
    const chunk = formatEvent(name, { at: at.toISOString() });
    for (const client of this.clients) client.write(chunk);
  }

  /** The Fastify handler of `GET /api/events`; resolves when the client goes away. */
  handle = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    reply.raw.write(': connected\n\n');
    const client: Client = {
      write: (chunk) => reply.raw.write(chunk),
      end: () => reply.raw.end(),
    };
    this.clients.add(client);
    const heartbeat = setInterval(() => reply.raw.write(': ping\n\n'), this.heartbeatMs);
    await new Promise<void>((resolve) => {
      request.raw.on('close', () => {
        clearInterval(heartbeat);
        this.clients.delete(client);
        resolve();
      });
    });
  };
}

export function formatEvent(name: string, data: unknown): string {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}
