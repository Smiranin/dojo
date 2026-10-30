import type * as React from 'react';
import { cn } from '../../lib/utils.js';
import { controlClass, useFieldControl } from './field.js';

/** The native select, styled like every other control; the phone shows its own picker. */
function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(controlClass, 'h-10 text-sm', className)}
      {...useFieldControl(props)}
    />
  );
}

export { Select };
