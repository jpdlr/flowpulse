import type { EventSeverity, PulseEvent } from "./events";
import { isPulseEvent } from "./events";

const EVENTS_KEY = "flowpulse:events";
const SETTINGS_KEY = "flowpulse:settings";

export type FlowSettings = {
  running: boolean;
  severityFilter: EventSeverity | "all";
};

export function loadEvents(): PulseEvent[] {
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPulseEvent).slice(0, 200);
  } catch {
    return [];
  }
}

export function saveEvents(events: PulseEvent[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, 200)));
}

export function loadSettings(): FlowSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return { running: true, severityFilter: "all" };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FlowSettings>;
    const severity = parsed.severityFilter;
    return {
      running: typeof parsed.running === "boolean" ? parsed.running : true,
      severityFilter:
        severity === "info" || severity === "warn" || severity === "error" || severity === "all"
          ? severity
          : "all"
    };
  } catch {
    return { running: true, severityFilter: "all" };
  }
}

export function saveSettings(settings: FlowSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
