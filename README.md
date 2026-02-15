# FlowPulse

FlowPulse is a local observability playground that simulates service latency events in real time. It helps prototype dashboards, alert thresholds, and filtering UX without needing a production telemetry feed.

## Features

- Synthetic event stream with pause/resume
- Severity filtering (`info`, `warn`, `error`)
- Latency summary cards and bar visualization
- Clear/reset controls
- Tests + CI baseline

## Quick start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`
- `npm run typecheck`
- `npm test`
- `npm run build`

## License

MIT
