import { z } from 'zod';

const days = z.number().int().positive();

/** The spaced-repetition rule, in days; `scheduleCard` says how each Result uses them. */
export const schedulingSettingsSchema = z.object({
  minDays: days.default(1),
  notesDays: days.default(3),
  firstPassDays: days.default(7),
  growth: z.number().positive().default(2),
  capDays: days.default(180),
  knownDays: days.default(21),
});
export type SchedulingSettings = z.infer<typeof schedulingSettingsSchema>;

export const senseiSettingsSchema = z.object({
  model: z.string().min(1).optional(),
  timeoutMs: z.number().int().positive().default(120_000),
});
export type SenseiSettings = z.infer<typeof senseiSettingsSchema>;

export const kobzarSettingsSchema = z.object({
  /** Where the phone finds Kobzar and calls it directly; absent means no microphone button. */
  url: z.url({ protocol: /^https?$/ }),
});
export type KobzarSettings = z.infer<typeof kobzarSettingsSchema>;

/** What the web needs to derive Due and Belt and to find Kobzar; served by `GET /api/settings`. */
export const settingsSchema = z.object({
  scheduling: schedulingSettingsSchema.prefault({}),
  sensei: senseiSettingsSchema.prefault({}),
  kobzar: kobzarSettingsSchema.optional(),
});
export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 4800;

/** The whole `dojo.yaml`: the shared settings plus what only the server uses. */
export const dojoConfigSchema = settingsSchema.extend({
  contentDir: z.string().min(1).default('./content'),
  dataDir: z.string().min(1).default('./data'),
  host: z.string().min(1).default(DEFAULT_HOST),
  port: z.number().int().min(1).max(65_535).default(DEFAULT_PORT),
});
export type DojoConfig = z.infer<typeof dojoConfigSchema>;

export function defaultSettings(): Settings {
  return settingsSchema.parse({});
}
