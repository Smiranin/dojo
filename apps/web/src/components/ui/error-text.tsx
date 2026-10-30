import type * as React from 'react';
import { cn } from '../../lib/utils.js';

/** The one way an inline error is shown: announced to assistive tech, destructive colour. */
export function ErrorText({ className, ...props }: React.ComponentProps<'p'>) {
  return <p role="alert" className={cn('text-destructive text-sm', className)} {...props} />;
}
