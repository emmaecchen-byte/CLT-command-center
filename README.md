# CLT Command Center

A role-based React command center for motor manufacturing quality control. The
app models live camera monitoring, YOLO-style inspection overlays, alarm
triage, station evidence, analytics, camera diagnostics, and configuration
workflows for different plant roles.

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts
- lucide-react icons

## Getting Started

Install dependencies:

```sh
npm install
```

Run the local development server:

```sh
npm run dev
```

Create a production build:

```sh
npm run build
```

Lint the project:

```sh
npm run lint
```

## Demo Accounts

The app uses mocked authentication for local demos. Use any of the accounts
listed on the login screen. Available roles are:

- `qc`
- `management`
- `safety`
- `engineer`

Each role gets a scoped dashboard, navigation, and route access.

## Main Areas

- `Dashboard`: role-specific home shortcuts and status summaries.
- `Live Monitoring`: motor QC feeds and people/PPE feeds.
- `Alarm Management`: alarm triage and violation review.
- `History`: evidence and audit trail views.
- `Analytics`: production and quality KPI trends.
- `Diagnostics`: camera health and stream status.
- `Admin / Config`: calibration and configuration workflows.
- `Station Detail`: per-station KPIs, timeline, and evidence context.

## Project Structure

```txt
src/
  auth/          mocked users, auth provider, permissions, and hooks
  components/    shared layout, guards, and live-monitoring UI
  data/          mock plant, station, alarm, camera, and history data
  pages/         routed application screens
  types/         shared domain types
```

## Notes

- This is currently a frontend prototype backed by mock data.
- Role access is defined in `src/auth/permissions.ts`.
- Routes are declared in `src/App.tsx`.
