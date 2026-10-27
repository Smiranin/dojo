import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { dojoConfigSchema, type DojoConfig } from '@dojo/core';
import { parse } from 'yaml';
import { z } from 'zod';

export interface LoadedSettings {
  config: DojoConfig;
  /** Absolute, resolved against the directory of `dojo.yaml`. */
  contentDir: string;
  dataDir: string;
}

export class SettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsError';
  }
}

/** Loads `dojo.yaml`; `DOJO_HOST` and `DOJO_PORT` in `env` override the file. */
export async function loadSettings(
  path: string,
  env: Record<string, string | undefined>,
): Promise<LoadedSettings> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    throw new SettingsError(`Cannot read ${path}: ${(error as Error).message}`);
  }
  const raw: unknown = parse(text) ?? {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new SettingsError(`${path} must be a YAML mapping`);
  }
  const overrides: Record<string, unknown> = {};
  if (env.DOJO_HOST) overrides.host = env.DOJO_HOST;
  if (env.DOJO_PORT) {
    const port = Number(env.DOJO_PORT);
    if (!Number.isInteger(port))
      throw new SettingsError(`DOJO_PORT is not a number: ${env.DOJO_PORT}`);
    overrides.port = port;
  }
  const parsed = dojoConfigSchema.safeParse({ ...(raw as Record<string, unknown>), ...overrides });
  if (!parsed.success) throw new SettingsError(`${path}: ${z.prettifyError(parsed.error)}`);
  const base = dirname(resolve(path));
  return {
    config: parsed.data,
    contentDir: resolve(base, parsed.data.contentDir),
    dataDir: resolve(base, parsed.data.dataDir),
  };
}
