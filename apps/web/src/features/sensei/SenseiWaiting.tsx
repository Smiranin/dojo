import { LoaderCircleIcon } from 'lucide-react';

/** The Sensei can take several seconds; the learner sees that something is happening. */
export function SenseiWaiting({ label }: { label: string }) {
  return (
    <p role="status" className="text-muted-foreground flex items-center gap-2 text-sm">
      <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
      {label}
    </p>
  );
}
