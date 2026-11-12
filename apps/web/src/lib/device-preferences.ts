// Everything the Dojo keeps on the device; the only file that touches `localStorage`.
import type { DictationLanguage } from '../features/dictation/kobzar-api.js';

export const DEFAULT_DICTATION_LANGUAGE: DictationLanguage = 'ru';
export const DICTATION_LANGUAGES: readonly DictationLanguage[] = ['ru', 'en'];

const DICTATION_LANGUAGE_KEY = 'dojo.dictation.language';

/** The default when nothing is stored, the stored value is unknown or storage is unavailable. */
export function readDictationLanguage(): DictationLanguage {
  let stored: string | null;
  try {
    stored = localStorage.getItem(DICTATION_LANGUAGE_KEY);
  } catch {
    // Private mode or storage disabled: the Dojo works with the default.
    return DEFAULT_DICTATION_LANGUAGE;
  }
  return DICTATION_LANGUAGES.find((language) => language === stored) ?? DEFAULT_DICTATION_LANGUAGE;
}

export function writeDictationLanguage(language: DictationLanguage): void {
  try {
    localStorage.setItem(DICTATION_LANGUAGE_KEY, language);
  } catch (error) {
    // A stated degradation: without storage the choice lasts only for the current page.
    console.warn('The dictation language could not be saved on this device:', error);
  }
}
