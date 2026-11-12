export interface FakeMediaOptions {
  /** `denied` makes `getUserMedia` reject the way a browser does when the owner says no. */
  permission?: 'granted' | 'denied';
}

export interface FakeMedia {
  /** Microphone tracks stopped so far; every recording must stop its one track. */
  tracksStopped(): number;
  recordersStarted(): number;
  uninstall(): void;
}

/** What the fake microphone "hears"; its size is what Kobzar receives. */
export const FAKE_SPEECH = 'fake recorded speech';
const FAKE_MIME_TYPE = 'audio/webm';

/**
 * Gives jsdom a microphone: `navigator.mediaDevices.getUserMedia` and a `MediaRecorder` that
 * supports `audio/webm`, emits one `dataavailable` and then `stop`. Without it jsdom has
 * neither API, which is exactly the "browser cannot record" case.
 */
export function installFakeMedia({ permission = 'granted' }: FakeMediaOptions = {}): FakeMedia {
  let tracksStopped = 0;
  let recordersStarted = 0;

  class FakeMediaRecorder extends EventTarget {
    static isTypeSupported(type: string): boolean {
      return type === FAKE_MIME_TYPE;
    }
    readonly mimeType: string;
    state: 'inactive' | 'recording' = 'inactive';

    constructor(_stream: unknown, options: { mimeType?: string } = {}) {
      super();
      this.mimeType = options.mimeType ?? FAKE_MIME_TYPE;
    }

    start(): void {
      this.state = 'recording';
      recordersStarted += 1;
    }

    stop(): void {
      this.state = 'inactive';
      queueMicrotask(() => {
        const data = new Blob([FAKE_SPEECH], { type: this.mimeType });
        this.dispatchEvent(Object.assign(new Event('dataavailable'), { data }));
        this.dispatchEvent(new Event('stop'));
      });
    }
  }

  const getUserMedia = async () => {
    if (permission === 'denied') throw new DOMException('Permission denied', 'NotAllowedError');
    const track = {
      stop() {
        tracksStopped += 1;
      },
    };
    return { getTracks: () => [track] };
  };

  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });
  Object.defineProperty(globalThis, 'MediaRecorder', {
    configurable: true,
    value: FakeMediaRecorder,
  });

  return {
    tracksStopped: () => tracksStopped,
    recordersStarted: () => recordersStarted,
    uninstall() {
      Reflect.deleteProperty(navigator, 'mediaDevices');
      Reflect.deleteProperty(globalThis, 'MediaRecorder');
    },
  };
}
