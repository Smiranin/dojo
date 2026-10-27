// Composition root: loads dojo.yaml, wires the stores and the Sensei, listens on host:port.
import { networkInterfaces } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ClaudeSensei } from '@dojo/sensei-claude';
import { buildApp } from './app.js';
import { loadSettings } from './settings.js';

const here = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(here, '../../..');
const DEFAULT_CONFIG = resolve(REPO_ROOT, 'dojo.yaml');
const WEB_DIST = resolve(REPO_ROOT, 'apps/web/dist');
const VERSION = '0.1.0';

/** Non-loopback IPv4 addresses, so the start log shows what to type on the phone. */
function lanAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((info) => info !== undefined && info.family === 'IPv4' && !info.internal)
    .map((info) => info!.address);
}

async function main(): Promise<void> {
  const configPath = process.env.DOJO_CONFIG ?? DEFAULT_CONFIG;
  const { config, contentDir, dataDir } = await loadSettings(configPath, process.env);
  const stripped: string[] = [];
  const sensei = new ClaudeSensei({
    timeoutMs: config.sensei.timeoutMs,
    ...(config.sensei.model !== undefined && { model: config.sensei.model }),
    onEnvStripped: (keys) => stripped.push(...keys),
  });
  const { app } = await buildApp({
    settings: { scheduling: config.scheduling, sensei: config.sensei },
    contentDir,
    dataDir,
    sensei,
    version: VERSION,
    webDist: WEB_DIST,
    logger: true,
  });
  await app.listen({ host: config.host, port: config.port });
  const urls =
    config.host === '0.0.0.0'
      ? lanAddresses().map((address) => `http://${address}:${config.port}`)
      : [`http://${config.host}:${config.port}`];
  app.log.info({ contentDir, dataDir, bind: `${config.host}:${config.port}` }, 'Dojo server up');
  for (const url of urls) app.log.info(`Open ${url}`);
  if (stripped.length > 0) {
    app.log.warn(
      `Removed ${stripped.join(', ')} from the Sensei environment: the Sensei runs on the Claude Code login only`,
    );
  }
  const health = await sensei.healthCheck();
  app.log.info(health.ok ? 'Sensei ready' : `Sensei unavailable: ${health.reason}`);

  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
