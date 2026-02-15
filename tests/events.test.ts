import { describe, expect, it } from "vitest";
import { makeRandomEvent, summarize } from "../src/lib/events";

describe("event helpers", () => {
  it("builds deterministic event from seed", () => {
    const event = makeRandomEvent(1700000000000);
    expect(event.id).toBe("evt-1700000000000");
    expect(event.latencyMs).toBeGreaterThan(0);
  });

  it("summarizes latency and severities", () => {
    const summary = summarize([
      { id: "1", service: "api", latencyMs: 120, severity: "info", ts: "2026-01-01" },
      { id: "2", service: "api", latencyMs: 340, severity: "warn", ts: "2026-01-01" },
      { id: "3", service: "api", latencyMs: 560, severity: "error", ts: "2026-01-01" }
    ]);
    expect(summary.count).toBe(3);
    expect(summary.avgLatency).toBe(340);
    expect(summary.bySeverity.error).toBe(1);
  });
});
