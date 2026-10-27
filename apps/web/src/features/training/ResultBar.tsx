import { RESULTS, type Result } from '@dojo/core';
import { cn } from '../../lib/utils.js';

const LABEL: Record<Result, string> = {
  fail: 'Fail',
  'pass-with-notes': 'Pass with notes',
  pass: 'Pass',
};

/** The three Results as one-tap toggles; the pending one is pressed. */
export function ResultBar({ value, onChange }: { value: Result; onChange: (r: Result) => void }) {
  return (
    <div role="group" aria-label="Result" className="grid grid-cols-3 gap-2">
      {RESULTS.map((result) => (
        <button
          key={result}
          type="button"
          aria-pressed={value === result}
          onClick={() => onChange(result)}
          className={cn(
            'rounded-md border px-2 py-3 text-sm font-medium',
            value === result
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background',
          )}
        >
          {LABEL[result]}
        </button>
      ))}
    </div>
  );
}
