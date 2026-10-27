import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SenseiError, ProposalRejectedError } from '@dojo/core';
import { ZodError, z } from 'zod';

/** An expected failure with the HTTP status and the `{ reason, message, issues? }` body it maps to. */
export class HttpProblem extends Error {
  constructor(
    readonly status: number,
    readonly reason: string,
    message: string,
    readonly issues?: unknown,
  ) {
    super(message);
    this.name = 'HttpProblem';
  }
}

export class NotFoundError extends HttpProblem {
  constructor(what: string) {
    super(404, 'not-found', `${what} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpProblem {
  constructor(reason: string, message: string) {
    super(409, reason, message);
    this.name = 'ConflictError';
  }
}

export class InvalidBodyError extends HttpProblem {
  constructor(error: ZodError) {
    super(400, 'invalid-body', z.prettifyError(error), error.issues);
    this.name = 'InvalidBodyError';
  }
}

/** Parses a request body or params with a schema; a mismatch becomes a 400 with the issues. */
export function parseWith<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new InvalidBodyError(result.error);
  return result.data;
}

const SENSEI_STATUS: Record<SenseiError['reason'], number> = {
  unavailable: 503,
  timeout: 504,
  'invalid-output': 502,
  refused: 422,
  aborted: 499,
};

/** Maps every known error class to its JSON body; anything else is a 500 and is logged. */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof HttpProblem) {
        return reply.status(error.status).send({
          reason: error.reason,
          message: error.message,
          ...(error.issues !== undefined && { issues: error.issues }),
        });
      }
      if (error instanceof SenseiError) {
        return reply
          .status(SENSEI_STATUS[error.reason])
          .send({ reason: `sensei-${error.reason}`, message: error.message });
      }
      if (error instanceof ProposalRejectedError) {
        return reply.status(422).send({ reason: 'proposal-rejected', message: error.message });
      }
      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send({ reason: 'invalid-body', message: z.prettifyError(error), issues: error.issues });
      }
      const fastifyError = error as FastifyError;
      if (typeof fastifyError.statusCode === 'number' && fastifyError.statusCode < 500) {
        return reply
          .status(fastifyError.statusCode)
          .send({ reason: fastifyError.code ?? 'bad-request', message: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ reason: 'internal', message: error.message });
    },
  );
}
