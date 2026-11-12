// One dictation as a pure state machine; `useDictation` drives it. The recorded speech exists
// only inside `transcribing` and `failed`: leaving them drops it.

export type DictationState =
  /** `message`: why the last attempt did not record, e.g. the microphone was refused. */
  | { phase: 'idle'; message: string | null }
  | { phase: 'starting' }
  | { phase: 'recording'; startedAt: number }
  | { phase: 'transcribing'; recording: Blob; limitReached: boolean }
  | { phase: 'failed'; recording: Blob; message: string; limitReached: boolean };

export type DictationEvent =
  | { type: 'start' }
  | { type: 'started'; at: number }
  /** The microphone failed, before recording or while it. */
  | { type: 'start-failed'; message: string }
  | { type: 'stopped'; recording: Blob; limitReached: boolean }
  | { type: 'cancelled' }
  | { type: 'transcribed' }
  | { type: 'transcribe-failed'; message: string }
  | { type: 'retry' };

export const IDLE: DictationState = { phase: 'idle', message: null };

/** An event that does not apply to the current phase returns the state unchanged. */
export function dictationReducer(state: DictationState, event: DictationEvent): DictationState {
  switch (event.type) {
    case 'start':
      // Starting over from `failed` drops the old recorded speech.
      return state.phase === 'idle' || state.phase === 'failed' ? { phase: 'starting' } : state;
    case 'started':
      return state.phase === 'starting' ? { phase: 'recording', startedAt: event.at } : state;
    case 'start-failed':
      return state.phase === 'starting' || state.phase === 'recording'
        ? { phase: 'idle', message: event.message }
        : state;
    case 'stopped':
      return state.phase === 'recording'
        ? { phase: 'transcribing', recording: event.recording, limitReached: event.limitReached }
        : state;
    case 'cancelled':
      return state.phase === 'starting' || state.phase === 'recording' ? IDLE : state;
    case 'transcribed':
      return state.phase === 'transcribing' ? IDLE : state;
    case 'transcribe-failed':
      return state.phase === 'transcribing'
        ? {
            phase: 'failed',
            recording: state.recording,
            message: event.message,
            limitReached: state.limitReached,
          }
        : state;
    case 'retry':
      return state.phase === 'failed'
        ? { phase: 'transcribing', recording: state.recording, limitReached: state.limitReached }
        : state;
  }
}
