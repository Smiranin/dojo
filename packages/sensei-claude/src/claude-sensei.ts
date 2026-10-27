import { query, type Options, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import {
  SenseiError,
  authoringProposalSchema,
  chatOutputSchema,
  checkOutputSchema,
  type AuthorInput,
  type AuthoringProposal,
  type ChatInput,
  type ChatOutput,
  type CheckInput,
  type CheckOutput,
  type HealthStatus,
  type Sensei,
} from '@dojo/core';
import { z } from 'zod';
import { senseiEnv } from './env.js';
import {
  AUTHOR_SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT,
  CHECK_SYSTEM_PROMPT,
  authorPrompt,
  chatPrompt,
  checkPrompt,
} from './prompts.js';
import { AUTHORING_JSON_SCHEMA, CHAT_JSON_SCHEMA, CHECK_JSON_SCHEMA } from './schemas.js';

/** One answer plus the StructuredOutput pseudo-tool and a few retries of it. */
export const SENSEI_MAX_TURNS = 6;
export const HEALTH_TIMEOUT_MS = 60_000;
const STDERR_TAIL_CHARS = 1_000;

export interface ClaudeSenseiOptions {
  timeoutMs: number;
  model?: string;
  /** Replaces `process.env` as the base environment (tests). The API-key paths are stripped. */
  env?: NodeJS.ProcessEnv;
  pathToClaudeCodeExecutable?: string;
  /** Called once per call with the env keys that were stripped, for the server log. */
  onEnvStripped?: (keys: string[]) => void;
}

/**
 * The Sensei on the Claude Agent SDK (ADR 0001): one `query()` per call, no tools, a JSON
 * schema for the answer, and the response validated with the same zod schema the server uses.
 * It never touches files; the server writes what the Sensei proposes.
 */
export class ClaudeSensei implements Sensei {
  private readonly env: Record<string, string>;

  constructor(private readonly options: ClaudeSenseiOptions) {
    const { env, removed } = senseiEnv(options.env ?? process.env);
    this.env = env;
    options.onEnvStripped?.(removed);
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      await this.run({
        systemPrompt: 'You are a connectivity check. Reply with the single word OK.',
        prompt: 'Reply with the single word OK.',
        timeoutMs: HEALTH_TIMEOUT_MS,
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error instanceof Error ? error.message : String(error) };
    }
  }

  check(input: CheckInput): Promise<CheckOutput> {
    return this.structured(
      CHECK_SYSTEM_PROMPT,
      checkPrompt(input),
      CHECK_JSON_SCHEMA,
      checkOutputSchema,
    );
  }

  chat(input: ChatInput): Promise<ChatOutput> {
    return this.structured(
      CHAT_SYSTEM_PROMPT,
      chatPrompt(input),
      CHAT_JSON_SCHEMA,
      chatOutputSchema,
    );
  }

  author(input: AuthorInput): Promise<AuthoringProposal> {
    return this.structured(
      AUTHOR_SYSTEM_PROMPT,
      authorPrompt(input),
      AUTHORING_JSON_SCHEMA,
      authoringProposalSchema,
    );
  }

  private async structured<T>(
    systemPrompt: string,
    prompt: string,
    jsonSchema: Record<string, unknown>,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const output = await this.run({
      systemPrompt,
      prompt,
      jsonSchema,
      timeoutMs: this.options.timeoutMs,
    });
    const parsed = schema.safeParse(output);
    if (!parsed.success) {
      throw new SenseiError(
        'invalid-output',
        `The Sensei's answer did not match the schema: ${z.prettifyError(parsed.error)}`,
      );
    }
    return parsed.data;
  }

  /** Runs one query to its result; resolves the structured output (or the text when no schema). */
  private async run(call: {
    systemPrompt: string;
    prompt: string;
    jsonSchema?: Record<string, unknown>;
    timeoutMs: number;
  }): Promise<unknown> {
    const abort = new AbortController();
    let stderrTail = '';
    const options: Options = {
      systemPrompt: call.systemPrompt,
      tools: [],
      permissionMode: 'default',
      persistSession: false,
      settingSources: [],
      maxTurns: SENSEI_MAX_TURNS,
      env: this.env,
      abortController: abort,
      stderr: (data) => {
        stderrTail = (stderrTail + data).slice(-STDERR_TAIL_CHARS);
      },
      ...(call.jsonSchema && { outputFormat: { type: 'json_schema', schema: call.jsonSchema } }),
      ...(this.options.model !== undefined && { model: this.options.model }),
      ...(this.options.pathToClaudeCodeExecutable !== undefined && {
        pathToClaudeCodeExecutable: this.options.pathToClaudeCodeExecutable,
      }),
    };
    const timer = setTimeout(() => abort.abort(), call.timeoutMs);
    try {
      for await (const message of query({
        prompt: call.prompt,
        options,
      }) as AsyncIterable<SDKMessage>) {
        if (message.type !== 'result') continue;
        if (message.subtype === 'success') {
          return call.jsonSchema ? message.structured_output : message.result;
        }
        const detail = message.errors.length > 0 ? message.errors.join('; ') : message.subtype;
        if (
          message.subtype === 'error_max_structured_output_retries' ||
          message.subtype === 'error_max_turns'
        ) {
          throw new SenseiError('invalid-output', `The Sensei gave no usable answer: ${detail}`);
        }
        throw new SenseiError('unavailable', `The Sensei failed: ${detail}`);
      }
      throw new SenseiError('unavailable', 'The Sensei ended without a result');
    } catch (error) {
      if (error instanceof SenseiError) throw error;
      if (abort.signal.aborted) {
        throw new SenseiError(
          'timeout',
          `The Sensei did not answer within ${call.timeoutMs / 1000} s`,
        );
      }
      const tail = stderrTail.trim();
      const message = error instanceof Error ? error.message : String(error);
      throw new SenseiError(
        'unavailable',
        `The Sensei could not start: ${message}${tail ? `\n${tail}` : ''}`,
      );
    } finally {
      clearTimeout(timer);
      abort.abort();
    }
  }
}
