import { LoaderCircleIcon, MicIcon, SquareIcon } from 'lucide-react';
import { Button } from '../../components/ui/button.js';
import { ErrorText } from '../../components/ui/error-text.js';
import { useDojoState, useKobzarAvailability } from '../../store/context.js';
import { kataOf } from '../../store/derive.js';
import { kataHints } from './hints.js';
import type { KobzarAvailability } from './kobzar-watch.js';
import { isRecordingSupported, RECORDING_UNSUPPORTED_MESSAGE } from './recorder.js';
import { useDictation } from './useDictation.js';

export interface DictationButtonProps {
  /** Receives the dictated text; the parent appends it with appendDictated. Never called with ''. */
  onText(text: string): void;
  /** The Kata whose title and Tags go to Kobzar as hints; absent where no Kata is known. */
  kataId?: string | undefined;
  /** The parent's own reason to block input, e.g. the Sensei is working. */
  disabled?: boolean;
}

const LIMIT_NOTICE = 'Recording stopped at the five-minute limit.';
const SECONDS_PER_MINUTE = 60;

/** `m:ss`, the way a phone's recorder shows it. */
function formatElapsed(seconds: number): string {
  const rest = String(seconds % SECONDS_PER_MINUTE).padStart(2, '0');
  return `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${rest}`;
}

/**
 * The microphone control under a text field. Renders nothing when Kobzar is not configured,
 * so the parent's layout is exactly as it was without dictation.
 */
export function DictationButton(props: DictationButtonProps) {
  const availability = useKobzarAvailability();
  if (availability.kind === 'absent') return null;
  return <DictationControl availability={availability} {...props} />;
}

function DictationControl({
  availability,
  onText,
  kataId,
  disabled = false,
}: DictationButtonProps & { availability: KobzarAvailability }) {
  const dojo = useDojoState();
  const kata = kataId === undefined ? undefined : (kataOf(dojo, kataId) ?? undefined);
  const dictation = useDictation({ availability, hints: kataHints(kata), onText });
  const { state } = dictation;
  const supported = isRecordingSupported();
  // Why the button cannot be tapped; a dictation already running is not interrupted by it.
  const note = !supported
    ? RECORDING_UNSUPPORTED_MESSAGE
    : availability.kind === 'unavailable'
      ? availability.reason
      : null;
  const canStart = supported && availability.kind === 'ready' && !disabled;
  const limitReached =
    (state.phase === 'transcribing' || state.phase === 'failed') && state.limitReached;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-10 items-center gap-2">
        {state.phase === 'recording' ? (
          <>
            <Button type="button" size="icon" aria-label="Stop dictation" onClick={dictation.stop}>
              <SquareIcon />
            </Button>
            <p role="status" className="text-sm tabular-nums">
              Recording {formatElapsed(dictation.elapsedSeconds)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Cancel dictation"
              className="ml-auto"
              onClick={dictation.cancel}
            >
              Cancel
            </Button>
          </>
        ) : state.phase === 'transcribing' ? (
          <p role="status" className="text-muted-foreground flex items-center gap-2 text-sm">
            <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
            Waiting for the text…
          </p>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Dictate"
              disabled={!canStart || state.phase === 'starting'}
              onClick={dictation.start}
            >
              <MicIcon />
            </Button>
            {state.phase === 'failed' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-label="Retry dictation"
                onClick={dictation.retry}
              >
                Retry
              </Button>
            )}
          </>
        )}
      </div>
      {limitReached && <p className="text-muted-foreground text-xs">{LIMIT_NOTICE}</p>}
      {state.phase === 'failed' && <ErrorText>{state.message}</ErrorText>}
      {state.phase === 'idle' && state.message !== null && <ErrorText>{state.message}</ErrorText>}
      {note !== null && (state.phase === 'idle' || state.phase === 'failed') && (
        <p className="text-muted-foreground text-xs">{note}</p>
      )}
    </div>
  );
}
