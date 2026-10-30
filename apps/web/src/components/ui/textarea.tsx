import type * as React from 'react';
import { cn } from '../../lib/utils.js';
import { controlClass, useFieldControl } from './field.js';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(controlClass, 'flex min-h-24', className)}
      {...useFieldControl(props)}
    />
  );
}

export { Textarea };
