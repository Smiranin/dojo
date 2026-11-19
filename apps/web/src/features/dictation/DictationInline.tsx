import { LoaderCircleIcon, MicIcon, RotateCcwIcon, SquareIcon, XIcon } from 'lucide-react';
import { Button } from '../../components/ui/button.js';
import type { DictationField } from './useDictationField.js';

const SECONDS_PER_MINUTE = 60;

/** `m:ss`, the way a phone's recorder shows it. */
function formatElapsed(seconds: number): string {
  const rest = String(seconds % SECONDS_PER_MINUTE).padStart(2, '0');
  return `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${rest}`;
}

/**
 * The dictation controls inside a text field: the microphone, or while recording the elapsed
 * time with Stop and Cancel, or while Kobzar transcribes a short status; Retry after a failure.
 */
export function DictationInline({ field }: { field: DictationField }) {
  const { dictation, canStart } = field;
  const { state } = dictation;

  if (state.phase === 'recording') {
    return (
      <>
        <p role="status" className="px-1 text-sm whitespace-nowrap tabular-nums">
          Recording {formatElapsed(dictation.elapsedSeconds)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cancel dictation"
          className="size-8"
          onClick={dictation.cancel}
        >
          <XIcon />
        </Button>
        <Button
          type="button"
          size="icon"
          aria-label="Stop dictation"
          className="size-8 rounded-full"
          onClick={dictation.stop}
        >
          <SquareIcon />
        </Button>
      </>
    );
  }
  if (state.phase === 'transcribing') {
    return (
      <p
        role="status"
        className="text-muted-foreground flex items-center gap-1.5 px-1 text-xs whitespace-nowrap"
      >
        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
        Waiting for the text…
      </p>
    );
  }
  return (
    <>
      {state.phase === 'failed' && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Retry dictation"
          className="size-8"
          onClick={dictation.retry}
        >
          <RotateCcwIcon />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Dictate"
        className="size-8"
        disabled={!canStart || state.phase === 'starting'}
        onClick={dictation.start}
      >
        <MicIcon />
      </Button>
    </>
  );
}
