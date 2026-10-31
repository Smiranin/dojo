// `pnpm check:content [dir]`: validates a content folder without starting the server.
// Exit code 1 when any file has an issue, so an agent that writes Cards can rely on it.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkContent, formatReport } from './content/check-content.js';
import { loadSettings } from './settings.js';

const here = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_CONFIG = resolve(here, '../../../dojo.yaml');

async function main(): Promise<void> {
  const argument = process.argv[2];
  const contentDir = argument
    ? resolve(argument)
    : (await loadSettings(process.env.DOJO_CONFIG ?? DEFAULT_CONFIG, process.env)).contentDir;
  const report = await checkContent(contentDir);
  console.log(`Checked ${contentDir}`);
  console.log(formatReport(report));
  process.exitCode = report.issues.length === 0 ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
});
