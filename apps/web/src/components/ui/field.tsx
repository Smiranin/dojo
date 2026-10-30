import { createContext, useContext, useId, type ReactNode } from 'react';
import type * as React from 'react';
import { cn } from '../../lib/utils.js';
import { ErrorText } from './error-text.js';

/**
 * Classes shared by every form control (Input, Textarea, Select). The focus state is drawn
 * inside the box: a recoloured border plus an inset ring. Nothing is painted outside the
 * element, so no scrolling or clipping parent can ever cut it off.
 */
export const controlClass =
  'border-input bg-background placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-base outline-none ' +
  'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset ' +
  'aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50';

interface FieldWiring {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
}

const FieldContext = createContext<FieldWiring | null>(null);

/** The attributes a Field hands to the control inside it; every control already accepts them. */
interface ControlWiring {
  id?: string | undefined;
  'aria-describedby'?: string | undefined;
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
}

/** Wires a control to the Field around it (id, description, invalid state), if there is one. */
export function useFieldControl<T extends ControlWiring>(props: T): T {
  const field = useContext(FieldContext);
  if (!field) return props;
  const wiring: ControlWiring = { id: props.id ?? field.controlId };
  if (field.describedBy !== undefined) wiring['aria-describedby'] = field.describedBy;
  if (field.invalid) wiring['aria-invalid'] = true;
  return { ...props, ...wiring };
}

export interface FieldProps {
  /** The accessible name of the control; also the visible label unless `hideLabel`. */
  label: string;
  /** Hide the label visually when the surrounding title already says it (a one-field sheet). */
  hideLabel?: boolean;
  hint?: string;
  error?: string | null;
  className?: string;
  children: ReactNode;
}

/**
 * A form group: label, one control, optional hint and error, with the spacing between them
 * owned here rather than by every form. The control inside picks up its id and ARIA wiring
 * through context, so forms never hand-write `aria-label` or `aria-describedby`.
 */
export function Field({ label, hideLabel = false, hint, error, className, children }: FieldProps) {
  const base = useId();
  const controlId = `${base}-control`;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext.Provider value={{ controlId, describedBy, invalid: Boolean(error) }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={controlId} className={cn('text-sm font-medium', hideLabel && 'sr-only')}>
          {label}
        </label>
        {children}
        {hint && (
          <p id={hintId} className="text-muted-foreground text-sm">
            {hint}
          </p>
        )}
        {error && <ErrorText id={errorId}>{error}</ErrorText>}
      </div>
    </FieldContext.Provider>
  );
}
