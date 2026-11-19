import { ErrorText } from '../../components/ui/error-text.js';
import type { DictationField } from './useDictationField.js';

const LIMIT_NOTICE = 'Recording stopped at the five-minute limit.';

/** What dictation has to say under a text field: the limit notice, an error, or why it is off. */
export function DictationMessages({ field }: { field: DictationField }) {
  const { state } = field.dictation;
  return (
    <>
      {field.limitReached && <p className="text-muted-foreground text-xs">{LIMIT_NOTICE}</p>}
      {state.phase === 'failed' && <ErrorText>{state.message}</ErrorText>}
      {state.phase === 'idle' && state.message !== null && <ErrorText>{state.message}</ErrorText>}
      {field.note !== null && (state.phase === 'idle' || state.phase === 'failed') && (
        <p className="text-muted-foreground text-xs">{field.note}</p>
      )}
    </>
  );
}
