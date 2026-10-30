import type * as React from 'react';
import { cn } from '../../lib/utils.js';
import { controlClass, useFieldControl } from './field.js';

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(controlClass, 'h-10', className)}
      {...useFieldControl(props)}
    />
  );
}

export { Input };
