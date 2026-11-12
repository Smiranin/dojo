import { delay, http, HttpResponse, type HttpHandler } from 'msw';

/** A scripted answer to one transcript request: the text, or one of Kobzar's errors. */
export type ScriptedTranscript = string | { status: number; code: string; message: string };

/** What Kobzar received in one transcript request, parsed from the multipart body. */
export interface ReceivedRecording {
  language: string | null;
  /** Empty when the request carried no `hints` field. */
  hints: string[];
  hintsSent: boolean;
  recordingSize: number;
  recordingType: string;
  recordingName: string;
}

/** Kobzar as msw serves it; tests set its health, script its answers and read what it received. */
export class FakeKobzar {
  readonly url = 'https://kobzar.test';
  /** `down` makes every request fail on the network, as when the Mac is asleep. */
  health: 'ready' | 'loading' | 'failed' | 'down' = 'ready';
  maxRecordingSeconds = 300;
  /** How long a transcript takes, so a test can see the waiting state. */
  transcriptDelayMs = 0;
  /** Scripted answers, first in first out; an empty queue answers `recognition_failed`. */
  readonly transcripts: ScriptedTranscript[] = [];
  readonly received: ReceivedRecording[] = [];

  handlers(): HttpHandler[] {
    return [
      http.get(`${this.url}/v1/health`, () => {
        if (this.health === 'down') return HttpResponse.error();
        return HttpResponse.json({
          status: this.health,
          version: 'test',
          defaultLanguage: 'ru',
          languages: ['ru', 'en'],
          modes: ['dictation'],
          maxRecordingSeconds: this.maxRecordingSeconds,
        });
      }),
      http.post(`${this.url}/v1/transcripts`, async ({ request }) => {
        if (this.health === 'down') return HttpResponse.error();
        const form = await request.formData();
        const recording = form.get('recording');
        if (!(recording instanceof File)) {
          return HttpResponse.json(
            { error: { code: 'invalid_request', message: 'No recording in the request.' } },
            { status: 400 },
          );
        }
        const hints = form.get('hints');
        this.received.push({
          language: form.get('language') as string | null,
          hints: typeof hints === 'string' ? (JSON.parse(hints) as string[]) : [],
          hintsSent: hints !== null,
          recordingSize: recording.size,
          recordingType: recording.type,
          recordingName: recording.name,
        });
        await delay(this.transcriptDelayMs);
        const answer = this.transcripts.shift() ?? {
          status: 500,
          code: 'recognition_failed',
          message: 'Kobzar could not recognise the speech.',
        };
        if (typeof answer === 'string') return HttpResponse.json({ text: answer });
        return HttpResponse.json(
          { error: { code: answer.code, message: answer.message } },
          { status: answer.status },
        );
      }),
    ];
  }
}
