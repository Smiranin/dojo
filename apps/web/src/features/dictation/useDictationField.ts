import { useDojoState, useKobzarAvailability } from '../../store/context.js';
import { kataOf } from '../../store/derive.js';
import { kataHints } from './hints.js';
import { isRecordingSupported, RECORDING_UNSUPPORTED_MESSAGE } from './recorder.js';
import { useDictation, type DictationHandle } from './useDictation.js';

export interface DictationFieldInput {
  /** Receives the dictated text; the field appends it with appendDictated. Never called with ''. */
  onText(text: string): void;
  /** The Kata whose title and Tags go to Kobzar as hints; absent where no Kata is known. */
  kataId?: string | undefined;
  /** The field's own reason to block input, e.g. the Sensei is working. */
  disabled?: boolean | undefined;
}

export interface DictationField {
  dictation: DictationHandle;
  /** The microphone can be tapped now. */
  canStart: boolean;
  /** Why the microphone cannot be tapped; a dictation already running is not interrupted by it. */
  note: string | null;
  /** The last recording was stopped by the limit, not by the learner. */
  limitReached: boolean;
}

/**
 * Dictation for one text field: Kobzar's availability, the Kata's hints and whether the
 * microphone can be tapped. Null when Kobzar is not configured, so the field shows no
 * microphone at all.
 */
export function useDictationField({
  onText,
  kataId,
  disabled = false,
}: DictationFieldInput): DictationField | null {
  const availability = useKobzarAvailability();
  const dojo = useDojoState();
  const kata = kataId === undefined ? undefined : (kataOf(dojo, kataId) ?? undefined);
  const dictation = useDictation({ availability, hints: kataHints(kata), onText });
  if (availability.kind === 'absent') return null;

  const { state } = dictation;
  const supported = isRecordingSupported();
  const note = !supported
    ? RECORDING_UNSUPPORTED_MESSAGE
    : availability.kind === 'unavailable'
      ? availability.reason
      : null;
  return {
    dictation,
    canStart: supported && availability.kind === 'ready' && !disabled,
    note,
    limitReached:
      (state.phase === 'transcribing' || state.phase === 'failed') && state.limitReached,
  };
}
