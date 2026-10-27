import {
  parseCardFile,
  parseKataFile,
  defaultSettings,
  type Card,
  type CheckOutput,
  type ContentIssue,
  type ContentSnapshot,
  type InboxNote,
  type Kata,
  type Rep,
  type SenseiAuthorResponse,
  type Settings,
} from '@dojo/core';
import { sampleContent, type FixtureFile } from '@dojo/core/testing';
import { http, HttpResponse, type HttpHandler } from 'msw';
import { setupServer } from 'msw/node';

/** Builds the snapshot the server would serve for a set of fixture files. */
export function snapshotOf(files: FixtureFile[]): ContentSnapshot {
  const katas: Kata[] = [];
  const cards: Card[] = [];
  const issues: ContentIssue[] = [];
  const kataFiles = files.filter((f) => f.path.endsWith('/kata.md'));
  for (const file of kataFiles) {
    const kataId = file.path.split('/')[0] as string;
    const parsed = parseKataFile(file.text, kataId);
    issues.push(...parsed.issues);
    if (!parsed.kata) continue;
    katas.push(parsed.kata);
    for (const cardFile of files) {
      if (!cardFile.path.startsWith(`${kataId}/`) || cardFile.path.endsWith('/kata.md')) continue;
      const slug = cardFile.path.slice(kataId.length + 1, -'.md'.length);
      const card = parseCardFile(cardFile.text, kataId, slug, parsed.kata.tags);
      issues.push(...card.issues);
      if (card.card) cards.push(card.card);
    }
  }
  return { revision: String(files.length), katas, cards, issues };
}

export interface RecordedRequest {
  method: string;
  url: string;
  body: unknown;
}

/** The server's state as msw serves it; tests mutate it and read the recorded requests. */
export class FakeDojo {
  snapshot: ContentSnapshot;
  settings: Settings = defaultSettings();
  reps: Rep[] = [];
  inbox: InboxNote[] = [];
  senseiOk = true;
  /** Scripted answers for the Sensei routes; an empty queue answers 503. */
  readonly checks: CheckOutput[] = [];
  readonly replies: string[] = [];
  readonly authored: SenseiAuthorResponse[] = [];
  readonly requests: RecordedRequest[] = [];

  constructor(files: FixtureFile[] = sampleContent()) {
    this.snapshot = snapshotOf(files);
  }

  handlers(): HttpHandler[] {
    const record = async (request: Request): Promise<unknown> => {
      let body: unknown;
      try {
        body = await request.clone().json();
      } catch {
        body = undefined;
      }
      this.requests.push({ method: request.method, url: new URL(request.url).pathname, body });
      return body;
    };
    return [
      http.get('/api/health', () =>
        HttpResponse.json({
          ok: true,
          sensei: this.senseiOk ? { ok: true } : { ok: false, reason: 'not logged in' },
          contentDir: '/tmp/content',
          version: 'test',
        }),
      ),
      http.get('/api/settings', () => HttpResponse.json(this.settings)),
      http.get('/api/content', () => HttpResponse.json(this.snapshot)),
      http.get('/api/reps', () => HttpResponse.json({ reps: this.reps })),
      http.post('/api/reps', async ({ request }) => {
        const body = (await record(request)) as { reps: Rep[] };
        const accepted: string[] = [];
        const duplicates: string[] = [];
        for (const rep of body.reps) {
          if (this.reps.some((r) => r.id === rep.id)) duplicates.push(rep.id);
          else {
            this.reps.push(rep);
            accepted.push(rep.id);
          }
        }
        return HttpResponse.json({ accepted, duplicates });
      }),
      http.get('/api/inbox', () => HttpResponse.json({ notes: this.inbox })),
      http.post('/api/inbox', async ({ request }) => {
        const note = (await record(request)) as InboxNote;
        if (!this.inbox.some((n) => n.id === note.id)) this.inbox.push(note);
        return HttpResponse.json({ note });
      }),
      http.delete('/api/inbox/:id', async ({ request, params }) => {
        await record(request);
        this.inbox = this.inbox.filter((n) => n.id !== params.id);
        return new HttpResponse(null, { status: 204 });
      }),
      http.patch('/api/katas/:kataId', async ({ request, params }) => {
        const flags = (await record(request)) as { pinned?: boolean; archived?: boolean };
        const kata = this.snapshot.katas.find((k) => k.id === params.kataId);
        if (!kata)
          return HttpResponse.json(
            { reason: 'not-found', message: 'Kata not found' },
            { status: 404 },
          );
        Object.assign(kata, flags);
        this.snapshot = { ...this.snapshot, revision: `${this.snapshot.revision}+` };
        return HttpResponse.json(kata);
      }),
      http.post('/api/sensei/check', async ({ request }) => {
        await record(request);
        const output = this.checks.shift();
        if (!output) {
          return HttpResponse.json(
            { reason: 'sensei-unavailable', message: 'no Sensei' },
            { status: 503 },
          );
        }
        return HttpResponse.json(output);
      }),
      http.post('/api/sensei/chat', async ({ request }) => {
        await record(request);
        const reply = this.replies.shift();
        if (!reply) {
          return HttpResponse.json(
            { reason: 'sensei-unavailable', message: 'no Sensei' },
            { status: 503 },
          );
        }
        return HttpResponse.json({ reply });
      }),
      http.post('/api/sensei/author', async ({ request }) => {
        await record(request);
        const response = this.authored.shift();
        if (!response) {
          return HttpResponse.json(
            { reason: 'sensei-unavailable', message: 'no Sensei' },
            { status: 503 },
          );
        }
        return HttpResponse.json(response);
      }),
      http.delete('/api/cards/:kataId/:slug', async ({ request, params }) => {
        await record(request);
        const id = `${params.kataId}/${params.slug}`;
        this.snapshot = { ...this.snapshot, cards: this.snapshot.cards.filter((c) => c.id !== id) };
        return new HttpResponse(null, { status: 204 });
      }),
    ];
  }
}

export const mswServer = setupServer();
