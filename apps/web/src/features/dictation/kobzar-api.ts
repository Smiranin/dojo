// The contract with Kobzar, the owner's speech-to-text service (ADR 0005). Written by hand from
// Kobzar's plan; this is the only file that knows Kobzar's routes and field names.

export type DictationLanguage = 'ru' | 'en';

export interface KobzarHealth {
  status: 'loading' | 'ready' | 'failed';
  maxRecordingSeconds: number;
  // version, defaultLanguage, languages, modes exist and are not used
}

/** `text` is '' when there was no speech; Kobzar's other fields are not used. */
export interface KobzarTranscript {
  text: string;
}

const KOBZAR_OWN_ERROR_CODES = [
  'invalid_request',
  'origin_not_allowed',
  'not_found',
  'recording_too_long',
  'unreadable_recording',
  'unsupported_mode',
  'busy',
  'not_ready',
  'recognition_failed',
  'internal_error',
] as const;

export type KobzarErrorCode =
  | (typeof KOBZAR_OWN_ERROR_CODES)[number]
  /** `fetch` threw or timed out; the Dojo's own code. */
  | 'unreachable'
  /** An answer that is not Kobzar's contract; the Dojo's own code. */
  | 'unexpected';

export class KobzarError extends Error {
  constructor(
    readonly code: KobzarErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = 'KobzarError';
    if (cause !== undefined) this.cause = cause;
  }
}

export interface TranscribeInput {
  recording: Blob;
  language: DictationLanguage;
  hints: string[];
  signal?: AbortSignal;
}

export interface KobzarClient {
  health(signal?: AbortSignal): Promise<KobzarHealth>;
  transcribe(input: TranscribeInput): Promise<KobzarTranscript>;
}

export const KOBZAR_HEALTH_TIMEOUT_MS = 5_000;
/** Kobzar's own recognition timeout is 120 s, plus the time a recording waits in its queue. */
export const KOBZAR_TRANSCRIBE_TIMEOUT_MS = 180_000;

const HEALTH_PATH = '/v1/health';
const TRANSCRIPTS_PATH = '/v1/transcripts';
const HEALTH_STATUSES: readonly string[] = ['loading', 'ready', 'failed'];
const UNREACHABLE_MESSAGE = 'Kobzar is unreachable.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** `fetch` with a time limit; a throw, a timeout and the caller's abort are all `unreachable`. */
async function send(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  signal: AbortSignal | undefined,
): Promise<Response> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, timeoutMs);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (cause) {
    throw new KobzarError('unreachable', UNREACHABLE_MESSAGE, cause);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

/** The JSON body of an answer; `undefined` when it has none, which the caller reports. */
async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/** Kobzar answers every failure with `{ error: { code, message } }`. */
function errorOf(status: number, body: unknown): KobzarError {
  const error = isRecord(body) ? body.error : undefined;
  const code = isRecord(error)
    ? KOBZAR_OWN_ERROR_CODES.find((known) => known === error.code)
    : undefined;
  if (!isRecord(error) || code === undefined) {
    return new KobzarError('unexpected', `Kobzar answered with an unexpected error (${status}).`);
  }
  const message = typeof error.message === 'string' ? error.message.trim() : '';
  return new KobzarError(code, message || `Kobzar refused the request: ${code}.`);
}

/** `recording.webm` or `recording.mp4`: Kobzar decodes by content and does not read the name. */
function recordingFileName(recording: Blob): string {
  return recording.type.includes('mp4') ? 'recording.mp4' : 'recording.webm';
}

export function createKobzarClient(baseUrl: string): KobzarClient {
  const base = baseUrl.replace(/\/+$/, '');
  return {
    async health(signal) {
      const response = await send(
        `${base}${HEALTH_PATH}`,
        { method: 'GET' },
        KOBZAR_HEALTH_TIMEOUT_MS,
        signal,
      );
      const body = await readJson(response);
      if (!response.ok) throw errorOf(response.status, body);
      if (
        !isRecord(body) ||
        typeof body.status !== 'string' ||
        !HEALTH_STATUSES.includes(body.status) ||
        typeof body.maxRecordingSeconds !== 'number'
      ) {
        throw new KobzarError('unexpected', 'Kobzar answered the health check in an unknown form.');
      }
      return {
        status: body.status as KobzarHealth['status'],
        maxRecordingSeconds: body.maxRecordingSeconds,
      };
    },

    async transcribe({ recording, language, hints, signal }) {
      const form = new FormData();
      form.append('recording', recording, recordingFileName(recording));
      form.append('language', language);
      if (hints.length > 0) form.append('hints', JSON.stringify(hints));
      // No Content-Type header: the browser adds it with the multipart boundary.
      const response = await send(
        `${base}${TRANSCRIPTS_PATH}`,
        { method: 'POST', body: form },
        KOBZAR_TRANSCRIBE_TIMEOUT_MS,
        signal,
      );
      const body = await readJson(response);
      if (!response.ok) throw errorOf(response.status, body);
      if (!isRecord(body) || typeof body.text !== 'string') {
        throw new KobzarError('unexpected', 'Kobzar answered without a text.');
      }
      return { text: body.text };
    },
  };
}
