import type { HealthStatus, Sensei } from '@dojo/core';

export const HEALTH_TTL_MS = 60_000;

/** Caches the Sensei health so `/api/health` polling never spends a model call per request. */
export class SenseiHealthCache {
  private cached: { status: HealthStatus; at: number } | null = null;
  private inFlight: Promise<HealthStatus> | null = null;

  constructor(
    private readonly sensei: Sensei,
    private readonly ttlMs = HEALTH_TTL_MS,
    private readonly now: () => number = Date.now,
  ) {}

  async get(): Promise<HealthStatus> {
    if (this.cached && this.now() - this.cached.at < this.ttlMs) return this.cached.status;
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.sensei
      .healthCheck()
      .catch((error: unknown): HealthStatus => ({
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      }))
      .then((status) => {
        this.cached = { status, at: this.now() };
        this.inFlight = null;
        return status;
      });
    return this.inFlight;
  }
}
