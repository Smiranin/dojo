import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { readDictationLanguage } from '../../lib/device-preferences.js';
import { useKobzar } from '../../store/context.js';
import { dictationReducer, IDLE, type DictationState } from './dictation-machine.js';
import { KobzarError, type KobzarClient } from './kobzar-api.js';
import { KOBZAR_UNREACHABLE_REASON, type KobzarAvailability } from './kobzar-watch.js';
import { startRecording, type Recording } from './recorder.js';

/**
 * The Dojo stops this long before Kobzar's limit: Kobzar refuses anything longer than the
 * limit, and a recorder stopped at exactly the limit can produce a few milliseconds more.
 */
export const RECORDING_LIMIT_MARGIN_SECONDS = 2;
/** How often the elapsed time is looked at; finer than a second so the limit is not overrun. */
const ELAPSED_TICK_MS = 250;
const MS_PER_SECOND = 1_000;

export interface DictationInput {
  availability: KobzarAvailability;
  hints: string[];
  /** Never called with ''. */
  onText(text: string): void;
}

export interface DictationHandle {
  state: DictationState;
  /** Ticks once a second while recording. */
  elapsedSeconds: number;
  start(): void;
  stop(): void;
  cancel(): void;
  retry(): void;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Runs one dictation: drives the reducer, starts and stops the recorder, sends the recorded
 * speech to Kobzar, enforces the limit and cleans up on unmount. Knows nothing about the field.
 */
export function useDictation({ availability, hints, onText }: DictationInput): DictationHandle {
  const kobzar = useKobzar();
  const [state, dispatch] = useReducer(dictationReducer, IDLE);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const alive = useRef(false);
  const starting = useRef(false);
  const recording = useRef<Recording | null>(null);
  const request = useRef<AbortController | null>(null);
  // What the callbacks below need at the moment they run, not at the render that made them.
  const latest = useRef({ hints, onText, phase: state.phase });
  // The last Kobzar that was ready: Retry stays possible while the watch says "unavailable",
  // the owner decides when to give up.
  const ready = useRef<{ client: KobzarClient; maxRecordingSeconds: number } | null>(null);
  useEffect(() => {
    latest.current = { hints, onText, phase: state.phase };
    if (availability.kind === 'ready') ready.current = availability;
  });

  // Unmount (the sheet closed): release the microphone, abort the request, drop the speech.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      recording.current?.cancel();
      recording.current = null;
      request.current?.abort();
      request.current = null;
    };
  }, []);

  const transcribe = useCallback(
    (speech: Blob) => {
      const client = ready.current?.client;
      if (!client) {
        dispatch({ type: 'transcribe-failed', message: KOBZAR_UNREACHABLE_REASON });
        return;
      }
      const controller = new AbortController();
      request.current = controller;
      client
        .transcribe({
          recording: speech,
          // Read now, so a change in Settings applies to the next dictation with no wiring.
          language: readDictationLanguage(),
          hints: latest.current.hints,
          signal: controller.signal,
        })
        .then(
          (transcript) => {
            if (controller.signal.aborted) return;
            dispatch({ type: 'transcribed' });
            const text = transcript.text.trim();
            if (text !== '') latest.current.onText(text);
          },
          (error: unknown) => {
            if (controller.signal.aborted) return;
            dispatch({ type: 'transcribe-failed', message: messageOf(error) });
            // Kobzar went away or is restarting: let every button know now, not at the next poll.
            if (
              error instanceof KobzarError &&
              (error.code === 'unreachable' || error.code === 'not_ready')
            ) {
              void kobzar.check();
            }
          },
        );
    },
    [kobzar],
  );

  const finish = useCallback(
    (limitReached: boolean) => {
      const current = recording.current;
      if (!current) return;
      recording.current = null;
      current.stop().then(
        (speech) => {
          if (!alive.current) return;
          dispatch({ type: 'stopped', recording: speech, limitReached });
          transcribe(speech);
        },
        (error: unknown) => {
          if (alive.current) dispatch({ type: 'start-failed', message: messageOf(error) });
        },
      );
    },
    [transcribe],
  );

  const startedAt = state.phase === 'recording' ? state.startedAt : null;
  useEffect(() => {
    if (startedAt === null) return;
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAt) / MS_PER_SECOND);
      setElapsedSeconds(seconds);
      const max = ready.current?.maxRecordingSeconds;
      if (max !== undefined && seconds >= Math.max(1, max - RECORDING_LIMIT_MARGIN_SECONDS)) {
        finish(true);
      }
    }, ELAPSED_TICK_MS);
    return () => clearInterval(timer);
  }, [startedAt, finish]);

  const start = useCallback(() => {
    const { phase } = latest.current;
    if (starting.current || (phase !== 'idle' && phase !== 'failed')) return;
    starting.current = true;
    dispatch({ type: 'start' });
    startRecording().then(
      (started) => {
        starting.current = false;
        if (!alive.current) {
          started.cancel();
          return;
        }
        recording.current = started;
        setElapsedSeconds(0);
        dispatch({ type: 'started', at: Date.now() });
      },
      (error: unknown) => {
        starting.current = false;
        if (alive.current) dispatch({ type: 'start-failed', message: messageOf(error) });
      },
    );
  }, []);

  const stop = useCallback(() => finish(false), [finish]);

  const cancel = useCallback(() => {
    const current = recording.current;
    if (!current) return;
    recording.current = null;
    current.cancel();
    dispatch({ type: 'cancelled' });
  }, []);

  const retry = () => {
    if (state.phase !== 'failed') return;
    dispatch({ type: 'retry' });
    transcribe(state.recording);
  };

  return { state, elapsedSeconds, start, stop, cancel, retry };
}
