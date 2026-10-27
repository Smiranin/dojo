import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadSettings, SettingsError } from '../src/settings.js';

describe('loadSettings', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'dojo-settings-'));
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it('resolves the folders against the file and lets the environment override host and port', async () => {
    const path = join(dir, 'dojo.yaml');
    await writeFile(path, 'contentDir: ./c\ndataDir: ./d\nhost: 127.0.0.1\nport: 4800\n');

    const loaded = await loadSettings(path, { DOJO_HOST: '0.0.0.0', DOJO_PORT: '5000' });

    expect(loaded.contentDir).toBe(join(dir, 'c'));
    expect(loaded.dataDir).toBe(join(dir, 'd'));
    expect(loaded.config.host).toBe('0.0.0.0');
    expect(loaded.config.port).toBe(5000);
  });

  it('keeps loopback when nothing overrides it', async () => {
    const path = join(dir, 'dojo.yaml');
    await writeFile(path, 'port: 4800\n');

    const loaded = await loadSettings(path, {});

    expect(loaded.config.host).toBe('127.0.0.1');
  });

  it('fails with the path and the field when the file is wrong', async () => {
    const path = join(dir, 'dojo.yaml');
    await writeFile(path, 'scheduling:\n  minDays: zero\n');

    await expect(loadSettings(path, {})).rejects.toThrow(SettingsError);
    await expect(loadSettings(join(dir, 'missing.yaml'), {})).rejects.toThrow(/Cannot read/);
  });
});
