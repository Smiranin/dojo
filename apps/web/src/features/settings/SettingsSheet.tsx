import { useState } from 'react';
import { Field } from '../../components/ui/field.js';
import { Select } from '../../components/ui/select.js';
import { Sheet, SheetContent } from '../../components/ui/sheet.js';
import {
  DICTATION_LANGUAGES,
  readDictationLanguage,
  writeDictationLanguage,
} from '../../lib/device-preferences.js';
import type { DictationLanguage } from '../dictation/kobzar-api.js';

export interface SettingsSheetProps {
  open: boolean;
  onClose(): void;
}

const LANGUAGE_LABEL: Record<DictationLanguage, string> = { ru: 'Russian', en: 'English' };

/** What the owner can change on this device; today only the language of dictation. */
export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const [language, setLanguage] = useState(readDictationLanguage);

  const choose = (value: string) => {
    const chosen = DICTATION_LANGUAGES.find((known) => known === value);
    if (chosen === undefined) return;
    writeDictationLanguage(chosen);
    setLanguage(chosen);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent title="Settings" description="Kept on this device only.">
        <Field label="Dictation language">
          <Select value={language} onChange={(event) => choose(event.target.value)}>
            {DICTATION_LANGUAGES.map((known) => (
              <option key={known} value={known}>
                {LANGUAGE_LABEL[known]}
              </option>
            ))}
          </Select>
        </Field>
      </SheetContent>
    </Sheet>
  );
}
