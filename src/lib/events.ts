export type EventSeverity = "info" | "warn" | "error";

export type PulseEvent = {
  id: string;
  service: string;
  latencyMs: number;
  severity: EventSeverity;
  ts: string;
};

export function makeRandomEvent(seed = Date.now()): PulseEvent {
  const services = ["api", "worker", "billing", "hooks"] as const;
  const service = services[seed % services.length];
  const latencyMs = 50 + (seed % 650);
  const severity: EventSeverity = latencyMs > 500 ? "error" : latencyMs > 280 ? "warn" : "info";
  return {
    id: `evt-${seed}`,
    service,
    latencyMs,
    severity,
    ts: new Date(seed).toISOString()
  };
}

export function summarize(events: PulseEvent[]) {
  const count = events.length;
  const avgLatency = count ? Math.round(events.reduce((sum, event) => sum + event.latencyMs, 0) / count) : 0;
  const bySeverity = {
    info: events.filter((event) => event.severity === "info").length,
    warn: events.filter((event) => event.severity === "warn").length,
    error: events.filter((event) => event.severity === "error").length
  };
  return { count, avgLatency, bySeverity };
}
