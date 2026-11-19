import { ArrowUpIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { appendDictated } from '../features/dictation/append.js';
import { DictationInline } from '../features/dictation/DictationInline.js';
import { DictationMessages } from '../features/dictation/DictationMessages.js';
import { useDictationField } from '../features/dictation/useDictationField.js';
import { useAutoGrow } from '../lib/use-auto-grow.js';
import { cn } from '../lib/utils.js';
import { Button } from './ui/button.js';
import { Field, useFieldControl, type ControlWiring } from './ui/field.js';

export interface ComposeFieldProps {
  /** The accessible name of the text field; the label itself is visually hidden. */
  label: string;
  value: string;
  onChange(value: string): void;
  /** Called by the arrow and by Cmd/Ctrl+Enter, only when `canSubmit` and not `disabled`. */
  onSubmit(): void;
  /** The accessible name of the arrow: 'Send', 'Ask the Sensei', 'Save note', … */
  submitLabel: string;
  canSubmit: boolean;
  /** The parent is busy; blocks typing, the microphone and the arrow. */
  disabled?: boolean;
  /** The Kata whose title and Tags help Kobzar recognise a dictation. */
  kataId?: string | undefined;
  placeholder?: string;
  autoFocus?: boolean;
  error?: string | null;
  /** How many lines high the field starts. */
  minRows?: 1 | 2;
}

/**
 * The text field wherever the learner writes or dictates: it grows with its text, holds the
 * microphone and the submit arrow inside its border, submits on Cmd/Ctrl+Enter and keeps Enter
 * for a new line. It knows nothing about what is submitted.
 */
export function ComposeField({
  label,
  value,
  onChange,
  onSubmit,
  submitLabel,
  canSubmit,
  disabled = false,
  kataId,
  placeholder,
  autoFocus,
  error = null,
  minRows = 2,
}: ComposeFieldProps) {
  // A dictation lands after the render that started it; it appends to the text as it is then.
  const latestValue = useRef(value);
  useEffect(() => {
    latestValue.current = value;
  });
  const appendText = useCallback(
    (dictated: string) => onChange(appendDictated(latestValue.current, dictated)),
    [onChange],
  );
  const dictation = useDictationField({ kataId, disabled, onText: appendText });
  const submittable = canSubmit && !disabled;

  const submitOnShortcut = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    if (submittable) onSubmit();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Field label={label} hideLabel error={error}>
        <div
          className={cn(
            'border-input bg-background flex items-end gap-1 rounded-md border py-1 pr-1 pl-3',
            'focus-within:border-ring focus-within:ring-ring focus-within:ring-1 focus-within:ring-inset',
            error && 'border-destructive',
            disabled && 'opacity-50',
          )}
        >
          <ComposeTextarea
            value={value}
            onChange={onChange}
            onKeyDown={submitOnShortcut}
            disabled={disabled}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={minRows}
          />
          <div className="flex shrink-0 items-center gap-1">
            {dictation && <DictationInline field={dictation} />}
            <Button
              type="button"
              size="icon"
              aria-label={submitLabel}
              className="size-8 rounded-full"
              disabled={!submittable}
              onClick={onSubmit}
            >
              <ArrowUpIcon />
            </Button>
          </div>
        </div>
      </Field>
      {dictation && <DictationMessages field={dictation} />}
    </div>
  );
}

interface ComposeTextareaProps {
  value: string;
  onChange(value: string): void;
  onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void;
  disabled: boolean;
  placeholder: string | undefined;
  autoFocus: boolean | undefined;
  rows: number;
}

/** The borderless, growing textarea inside a ComposeField, wired to the Field around it. */
function ComposeTextarea({ value, onChange, ...props }: ComposeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoGrow(ref, value);
  const wiring = useFieldControl<ControlWiring>({});
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="placeholder:text-muted-foreground min-w-0 flex-1 resize-none bg-transparent py-1.5 text-base outline-none disabled:cursor-not-allowed"
      {...props}
      {...wiring}
    />
  );
}
