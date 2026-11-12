// The browser's microphone as one recording: getUserMedia plus MediaRecorder.

export type MicrophoneFailure = 'denied' | 'unsupported' | 'failed';

export const RECORDING_UNSUPPORTED_MESSAGE = 'Dictation needs the Dojo opened over HTTPS.';

const MICROPHONE_MESSAGE: Record<MicrophoneFailure, string> = {
  denied:
    "The browser has no permission to use the microphone. Allow it for the Dojo in the browser's settings.",
  unsupported: RECORDING_UNSUPPORTED_MESSAGE,
  failed: 'The microphone could not record. Try again.',
};

export class MicrophoneError extends Error {
  constructor(
    readonly failure: MicrophoneFailure,
    cause?: unknown,
  ) {
    super(MICROPHONE_MESSAGE[failure]);
    this.name = 'MicrophoneError';
    if (cause !== undefined) this.cause = cause;
  }
}

export interface Recording {
  /** Resolves with everything recorded; releases the microphone. */
  stop(): Promise<Blob>;
  /** Drops everything; releases the microphone. */
  cancel(): void;
}

/** In preference order; iOS supports only the last one. Kobzar decodes both with ffmpeg. */
export const RECORDING_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

/** `getUserMedia` rejects with these names when the owner or the browser's policy says no. */
const DENIED_ERROR_NAMES = ['NotAllowedError', 'SecurityError'];

/** False on a plain-HTTP page (no `mediaDevices`) and in a browser without `MediaRecorder`. */
export function isRecordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  );
}

/** Asks for a fresh microphone stream and starts recording it. Throws `MicrophoneError`. */
export async function startRecording(): Promise<Recording> {
  if (!isRecordingSupported()) throw new MicrophoneError('unsupported');
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (cause) {
    // Read the name without `instanceof`: a DOMException is not an Error in every runtime.
    const name =
      typeof cause === 'object' && cause !== null && 'name' in cause ? String(cause.name) : '';
    throw new MicrophoneError(DENIED_ERROR_NAMES.includes(name) ? 'denied' : 'failed', cause);
  }
  // Stopping every track turns the phone's microphone indicator off between dictations.
  const release = () => stream.getTracks().forEach((track) => track.stop());

  let recorder: MediaRecorder;
  try {
    const mimeType = RECORDING_MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
    recorder = new MediaRecorder(stream, mimeType === undefined ? {} : { mimeType });
    recorder.start();
  } catch (cause) {
    release();
    throw new MicrophoneError('failed', cause);
  }
  const chunks: Blob[] = [];
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  return {
    stop() {
      return new Promise<Blob>((resolve, reject) => {
        const finish = () => {
          release();
          // The recorder's actual type, which may differ from the one asked for.
          resolve(new Blob(chunks, { type: recorder.mimeType }));
        };
        if (recorder.state === 'inactive') {
          finish();
          return;
        }
        recorder.addEventListener('stop', finish, { once: true });
        recorder.addEventListener(
          'error',
          (event) => {
            release();
            reject(new MicrophoneError('failed', event));
          },
          { once: true },
        );
        recorder.stop();
      });
    },
    cancel() {
      chunks.length = 0;
      if (recorder.state !== 'inactive') recorder.stop();
      release();
    },
  };
}
