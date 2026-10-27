/** Keys that would make Claude Code bill an API key instead of using the login (req. 34). */
export const STRIPPED_KEYS = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN'] as const;

export interface SenseiEnv {
  env: Record<string, string>;
  /** The keys that were present and removed, for the start log. */
  removed: string[];
}

/** A copy of the process environment without the API-key paths; never an empty object. */
export function senseiEnv(processEnv: NodeJS.ProcessEnv): SenseiEnv {
  const env: Record<string, string> = {};
  const removed: string[] = [];
  for (const [key, value] of Object.entries(processEnv)) {
    if (value === undefined) continue;
    if ((STRIPPED_KEYS as readonly string[]).includes(key)) {
      removed.push(key);
      continue;
    }
    env[key] = value;
  }
  return { env, removed };
}
