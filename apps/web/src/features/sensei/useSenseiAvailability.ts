import { useDojoState } from '../../store/context.js';

export interface SenseiAvailability {
  available: boolean;
  /** Why the Sensei cannot be asked right now; empty when it can. */
  reason: string;
}

/** Sensei actions are disabled with a visible reason when the server or the Sensei is down. */
export function useSenseiAvailability(): SenseiAvailability {
  const state = useDojoState();
  if (state.connection === 'offline') {
    return { available: false, reason: 'The Dojo server is unreachable' };
  }
  if (state.senseiHealth === null) return { available: false, reason: 'Checking the Sensei…' };
  if (!state.senseiHealth.ok) {
    return { available: false, reason: `The Sensei is unavailable: ${state.senseiHealth.reason}` };
  }
  return { available: true, reason: '' };
}
