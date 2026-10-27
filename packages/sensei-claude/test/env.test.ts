import { describe, expect, it } from 'vitest';
import { senseiEnv } from '../src/env.js';

describe('senseiEnv', () => {
  it('removes the API-key paths, keeps the rest and names what it removed', () => {
    const processEnv = {
      PATH: '/usr/bin',
      HOME: '/Users/me',
      ANTHROPIC_API_KEY: 'sk-ant-secret',
      ANTHROPIC_AUTH_TOKEN: 'token',
      UNSET: undefined,
    };

    const { env, removed } = senseiEnv(processEnv);

    expect(env).toEqual({ PATH: '/usr/bin', HOME: '/Users/me' });
    expect(removed).toEqual(['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN']);
  });

  it('reports nothing removed when no key was set', () => {
    expect(senseiEnv({ PATH: '/usr/bin' }).removed).toEqual([]);
  });
});
