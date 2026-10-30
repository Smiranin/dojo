import { XIcon } from 'lucide-react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import type * as React from 'react';
import { cn } from '../../lib/utils.js';

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

/** A bottom sheet: the one modal surface the phone UI uses for forms and pickers. */
function SheetContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { title: string; description?: string }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-0 z-50 bg-black/50" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'bg-background fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-xl flex-col gap-4 rounded-t-2xl md:max-w-3xl border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <SheetPrimitive.Title className="text-foreground font-semibold">
              {title}
            </SheetPrimitive.Title>
            {description ? (
              <SheetPrimitive.Description className="text-muted-foreground text-sm">
                {description}
              </SheetPrimitive.Description>
            ) : (
              <SheetPrimitive.Description className="sr-only">{title}</SheetPrimitive.Description>
            )}
          </div>
          <SheetPrimitive.Close
            className="rounded-md p-1 opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <XIcon className="size-5" />
          </SheetPrimitive.Close>
        </div>
        <div className="flex flex-col gap-4 overflow-x-hidden overflow-y-auto">{children}</div>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export { Sheet, SheetClose, SheetContent };
