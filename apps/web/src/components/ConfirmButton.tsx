import { useState } from 'react';
import { Button } from './ui/button.js';

export interface ConfirmButtonProps {
  label: string;
  confirmLabel: string;
  onConfirm(): void;
  disabled?: boolean;
}

/** Two taps to do something destructive: the first arms, the second confirms (SPEC story 46). */
export function ConfirmButton({ label, confirmLabel, onConfirm, disabled }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setArmed(true)} disabled={disabled}>
        {label}
      </Button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setArmed(false)}>
        Cancel
      </Button>
    </span>
  );
}
