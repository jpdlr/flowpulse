export type EventSeverity = "info" | "warn" | "error";

export type PulseEvent = {
  id: string;
  service: string;
  latencyMs: number;
  severity: EventSeverity;
  ts: string;
};

const validSeverities = new Set<EventSeverity>(["info", "warn", "error"]);

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

export function isPulseEvent(value: unknown): value is PulseEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<PulseEvent>;
  return (
    typeof event.id === "string" &&
    typeof event.service === "string" &&
    typeof event.latencyMs === "number" &&
    Number.isFinite(event.latencyMs) &&
    typeof event.severity === "string" &&
    validSeverities.has(event.severity as EventSeverity) &&
    typeof event.ts === "string"
  );
}

export function parseImportedEventsJson(input: string): PulseEvent[] {
  const parsed = JSON.parse(input) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Imported JSON must be an array.");
  }

  const events = parsed.filter(isPulseEvent);
  if (events.length === 0 && parsed.length > 0) {
    throw new Error("No valid events found in JSON file.");
  }

  return events.slice(0, 200);
}
