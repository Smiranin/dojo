import type {
  AppendResult,
  ChatOutput,
  ChatTurn,
  CheckOutput,
  ContentSnapshot,
  ErrorBody,
  HealthResponse,
  InboxNote,
  Kata,
  Rep,
  SenseiAuthorRequest,
  SenseiAuthorResponse,
  Settings,
} from '@dojo/core';

/** The request never reached the server (or the server went away mid-request). Retried. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('The Dojo server is unreachable');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

/** The server answered with an error body. Not retried. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: ErrorBody,
  ) {
    super(body.message || `Request failed with ${status}`);
    this.name = 'HttpError';
  }
}

/** The Sensei could not answer; the body's reason says why (503, 504, 502, 422). */
export class SenseiUnavailableError extends HttpError {
  constructor(status: number, body: ErrorBody) {
    super(status, body);
    this.name = 'SenseiUnavailableError';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return { reason: 'not-json', message: text };
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method ?? 'GET',
      headers,
      ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
      ...(options.signal && { signal: options.signal }),
    });
  } catch (error) {
    throw new NetworkError(error);
  }
  if (response.ok) return (await parseBody(response)) as T;
  const raw = (await parseBody(response)) as Partial<ErrorBody> | undefined;
  const body: ErrorBody = {
    reason: raw?.reason ?? 'unknown',
    message: raw?.message ?? `Request failed with ${response.status}`,
    ...(raw?.issues !== undefined && { issues: raw.issues }),
  };
  if (body.reason.startsWith('sensei-')) throw new SenseiUnavailableError(response.status, body);
  throw new HttpError(response.status, body);
}

/** Every call the web makes; one object so tests can substitute it whole. */
export interface DojoApi {
  health(): Promise<HealthResponse>;
  settings(): Promise<Settings>;
  content(): Promise<ContentSnapshot>;
  reps(): Promise<{ reps: Rep[] }>;
  postReps(reps: Rep[]): Promise<AppendResult>;
  inbox(): Promise<{ notes: InboxNote[] }>;
  postInbox(note: InboxNote): Promise<{ note: InboxNote }>;
  deleteInbox(id: string): Promise<void>;
  patchKata(kataId: string, flags: { pinned?: boolean; archived?: boolean }): Promise<Kata>;
  deleteCard(kataId: string, slug: string): Promise<void>;
  senseiCheck(cardId: string, answer: string): Promise<CheckOutput>;
  senseiChat(cardId: string, history: ChatTurn[], message: string): Promise<ChatOutput>;
  senseiAuthor(body: SenseiAuthorRequest): Promise<SenseiAuthorResponse>;
}

export const api: DojoApi = {
  health: () => request('/api/health'),
  settings: () => request('/api/settings'),
  content: () => request('/api/content'),
  reps: () => request('/api/reps'),
  postReps: (reps) => request('/api/reps', { method: 'POST', body: { reps } }),
  inbox: () => request('/api/inbox'),
  postInbox: (note) => request('/api/inbox', { method: 'POST', body: note }),
  deleteInbox: (id) => request(`/api/inbox/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  patchKata: (kataId, flags) => request(`/api/katas/${kataId}`, { method: 'PATCH', body: flags }),
  deleteCard: (kataId, slug) => request(`/api/cards/${kataId}/${slug}`, { method: 'DELETE' }),
  senseiCheck: (cardId, answer) =>
    request('/api/sensei/check', { method: 'POST', body: { cardId, answer } }),
  senseiChat: (cardId, history, message) =>
    request('/api/sensei/chat', { method: 'POST', body: { cardId, history, message } }),
  senseiAuthor: (body) => request('/api/sensei/author', { method: 'POST', body }),
};
