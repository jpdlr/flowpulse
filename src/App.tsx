import { useEffect, useMemo, useRef, useState } from "react";
import { makeRandomEvent, parseImportedEventsJson, summarize, type EventSeverity, type PulseEvent } from "./lib/events";
import { loadEvents, loadSettings, saveEvents, saveSettings } from "./lib/storage";
import "./styles/app.css";

export default function App() {
  const [running, setRunning] = useState(() => loadSettings().running);
  const [events, setEvents] = useState<PulseEvent[]>(() => loadEvents());
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | "all">(
    () => loadSettings().severityFilter
  );
  const [status, setStatus] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setEvents((current) => {
        const next = [makeRandomEvent(Date.now()), ...current];
        return next.slice(0, 60);
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    saveSettings({ running, severityFilter });
  }, [running, severityFilter]);

  const visible = useMemo(() => {
    if (severityFilter === "all") return events;
    return events.filter((event) => event.severity === severityFilter);
  }, [events, severityFilter]);

  const stats = useMemo(() => summarize(visible), [visible]);
  const maxLatency = Math.max(...visible.map((event) => event.latencyMs), 1);

  const exportEvents = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flowpulse-events.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Exported events to JSON.");
  };

  const clearEvents = () => {
    setEvents([]);
    setStatus("Cleared event history.");
  };

  const importEvents = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseImportedEventsJson(text);
      setEvents(parsed);
      setStatus(`Imported ${parsed.length} events.`);
    } catch (error) {
      setStatus(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        clearEvents();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        exportEvents();
        return;
      }

      if (!event.metaKey && !event.ctrlKey && !event.altKey && event.code === "Space") {
        event.preventDefault();
        setRunning((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="app">
      <header>
        <p className="eyebrow">FlowPulse</p>
        <h1>Latency Stream Playground</h1>
        <p className="subtitle">Synthetic service events for observability UI and alert workflow testing.</p>
      </header>

      <section className="toolbar card">
        <button type="button" onClick={() => setRunning((current) => !current)}>{running ? "Pause stream" : "Resume stream"}</button>
        <select aria-label="Severity filter" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as EventSeverity | "all")}>
          <option value="all">All severities</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
        <button type="button" className="ghost" onClick={clearEvents}>Clear</button>
        <button type="button" className="ghost" onClick={exportEvents}>Export JSON</button>
        <button type="button" className="ghost" onClick={() => importInputRef.current?.click()}>Import JSON</button>
        <input
          ref={importInputRef}
          className="hidden-input"
          type="file"
          accept=".json,application/json"
          onChange={(event) => void importEvents(event.target.files?.[0] ?? null)}
        />
      </section>
      <p className="hint">Shortcuts: `Space` pause/resume, `Cmd/Ctrl+K` clear, `Cmd/Ctrl+E` export.</p>
      {status ? <p className="status">{status}</p> : null}

      <section className="stats">
        <article className="card stat"><span>Visible events</span><strong>{stats.count}</strong></article>
        <article className="card stat"><span>Avg latency</span><strong>{stats.avgLatency} ms</strong></article>
        <article className="card stat"><span>Warnings</span><strong>{stats.bySeverity.warn}</strong></article>
        <article className="card stat"><span>Errors</span><strong>{stats.bySeverity.error}</strong></article>
      </section>

      <section className="card">
        <h2>Latency Bars</h2>
        <div className="bars" aria-label="Latency bars">
          {visible.slice(0, 20).map((event) => (
            <div key={event.id} className="bar-row">
              <span>{event.service}</span>
              <div className="track">
                <div className={`fill ${event.severity}`} style={{ width: `${Math.round((event.latencyMs / maxLatency) * 100)}%` }} />
              </div>
              <strong>{event.latencyMs} ms</strong>
            </div>
          ))}
          {visible.length === 0 ? <p className="empty">No events yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
