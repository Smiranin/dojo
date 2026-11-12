import { describe, expect, it } from 'vitest';
import { defaultSettings, dojoConfigSchema } from '../src/index.js';

describe('settings schema', () => {
  it('fills every scheduling and sensei default from an empty document', () => {
    const settings = defaultSettings();

    expect(settings).toEqual({
      scheduling: {
        minDays: 1,
        notesDays: 3,
        firstPassDays: 7,
        growth: 2,
        capDays: 180,
        knownDays: 21,
      },
      sensei: { timeoutMs: 120_000 },
    });
  });

  it('binds to loopback on port 4800 unless the file says otherwise', () => {
    const fileWithOnlyAPort = { port: 5000 };

    const config = dojoConfigSchema.parse(fileWithOnlyAPort);

    expect(config.host).toBe('127.0.0.1');
    expect(config.port).toBe(5000);
    expect(config.contentDir).toBe('./content');
  });

  it('accepts an http or https address of Kobzar', () => {
    const fileWithKobzar = { kobzar: { url: 'https://mac.tailnet.ts.net:8443' } };

    const config = dojoConfigSchema.parse(fileWithKobzar);

    expect(config.kobzar).toEqual({ url: 'https://mac.tailnet.ts.net:8443' });
  });

  it('rejects an address of Kobzar that is not a URL or not http(s)', () => {
    const notAUrl = dojoConfigSchema.safeParse({ kobzar: { url: 'the mac' } });
    const wrongScheme = dojoConfigSchema.safeParse({ kobzar: { url: 'ftp://mac.tailnet.ts.net' } });

    expect(notAUrl.success).toBe(false);
    expect(wrongScheme.success).toBe(false);
  });

  it('rejects a non-positive interval', () => {
    const fileWithZeroMinDays = { scheduling: { minDays: 0 } };

    const result = dojoConfigSchema.safeParse(fileWithZeroMinDays);

    expect(result.success).toBe(false);
  });
});
