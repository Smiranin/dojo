import type {
  AuthorInput,
  AuthoringProposal,
  ChatInput,
  ChatOutput,
  CheckInput,
  CheckOutput,
  HealthStatus,
  Sensei,
} from '../sensei/port.js';

type Scripted<T> = T | Error;

export type FakeSenseiCall =
  | { method: 'check'; input: CheckInput }
  | { method: 'chat'; input: ChatInput }
  | { method: 'author'; input: AuthorInput };

/**
 * A Sensei that answers from queues scripted by the test. An exhausted queue throws so a test
 * never passes on a silent default; an Error in the queue is thrown to simulate a failure.
 */
export class FakeSensei implements Sensei {
  health: HealthStatus = { ok: true };
  readonly calls: FakeSenseiCall[] = [];
  private readonly checks: Scripted<CheckOutput>[] = [];
  private readonly chats: Scripted<ChatOutput>[] = [];
  private readonly proposals: Scripted<AuthoringProposal>[] = [];

  scriptCheck(...outputs: Scripted<CheckOutput>[]): this {
    this.checks.push(...outputs);
    return this;
  }

  scriptChat(...outputs: Scripted<ChatOutput>[]): this {
    this.chats.push(...outputs);
    return this;
  }

  scriptAuthor(...outputs: Scripted<AuthoringProposal>[]): this {
    this.proposals.push(...outputs);
    return this;
  }

  async healthCheck(): Promise<HealthStatus> {
    return this.health;
  }

  async check(input: CheckInput): Promise<CheckOutput> {
    this.calls.push({ method: 'check', input });
    return take(this.checks, 'check');
  }

  async chat(input: ChatInput): Promise<ChatOutput> {
    this.calls.push({ method: 'chat', input });
    return take(this.chats, 'chat');
  }

  async author(input: AuthorInput): Promise<AuthoringProposal> {
    this.calls.push({ method: 'author', input });
    return take(this.proposals, 'author');
  }
}

function take<T>(queue: Scripted<T>[], method: string): T {
  const next = queue.shift();
  if (next === undefined) throw new Error(`FakeSensei has no scripted ${method} output left`);
  if (next instanceof Error) throw next;
  return next;
}
