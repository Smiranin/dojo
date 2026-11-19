import type {
  AuthorInput,
  AuthoringProposal,
  ChatInput,
  ChatOutput,
  HealthStatus,
  KumiteInput,
  KumiteOutput,
  Sensei,
} from '../sensei/port.js';

type Scripted<T> = T | Error;

export type FakeSenseiCall =
  | { method: 'kumite'; input: KumiteInput }
  | { method: 'chat'; input: ChatInput }
  | { method: 'author'; input: AuthorInput };

/**
 * A Sensei that answers from queues scripted by the test. An exhausted queue throws so a test
 * never passes on a silent default; an Error in the queue is thrown to simulate a failure.
 */
export class FakeSensei implements Sensei {
  health: HealthStatus = { ok: true };
  readonly calls: FakeSenseiCall[] = [];
  private readonly kumites: Scripted<KumiteOutput>[] = [];
  private readonly chats: Scripted<ChatOutput>[] = [];
  private readonly proposals: Scripted<AuthoringProposal>[] = [];
  private gate: Promise<void> | null = null;

  scriptKumite(...outputs: Scripted<KumiteOutput>[]): this {
    this.kumites.push(...outputs);
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

  /**
   * Makes every call wait after it was recorded until the returned function is called, so a
   * test can act while the Sensei is still working.
   */
  hold(): () => void {
    let release!: () => void;
    this.gate = new Promise((resolve) => {
      release = resolve;
    });
    return () => {
      this.gate = null;
      release();
    };
  }

  async healthCheck(): Promise<HealthStatus> {
    return this.health;
  }

  async kumite(input: KumiteInput): Promise<KumiteOutput> {
    this.calls.push({ method: 'kumite', input });
    await this.gate;
    return take(this.kumites, 'kumite');
  }

  async chat(input: ChatInput): Promise<ChatOutput> {
    this.calls.push({ method: 'chat', input });
    await this.gate;
    return take(this.chats, 'chat');
  }

  async author(input: AuthorInput): Promise<AuthoringProposal> {
    this.calls.push({ method: 'author', input });
    await this.gate;
    return take(this.proposals, 'author');
  }
}

/** Takes the next scripted output of a queue; throws a scripted Error or on an empty queue. */
function take<T>(queue: Scripted<T>[], method: string): T {
  const next = queue.shift();
  if (next === undefined) throw new Error(`FakeSensei has no scripted ${method} output left`);
  if (next instanceof Error) throw next;
  return next;
}
