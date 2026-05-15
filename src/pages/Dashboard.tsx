import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Cpu,
  FileSearch,
  Gauge,
  LayoutDashboard,
  LineChart,
  Settings,
  Video,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { roleTitle } from '../auth/permissions'
import type { UserRole } from '../auth/types'
import { plantMetrics } from '../data/mock'

function Card({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string
  icon: typeof LayoutDashboard
  title: string
  desc: string
}) {
  return (
    <Link
      to={to}
      className="group flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-sm transition hover:border-[var(--color-accent)]/40 hover:shadow-md"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20 group-hover:bg-[var(--color-accent)]/15">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </div>
    </Link>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          {roleTitle(user.role)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Welcome, {user.displayName.split('(')[0].trim()}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Your navigation and home shortcuts are scoped to this role. Use the
          sidebar to open tools you are allowed to see.
        </p>
      </header>

      <RoleHome role={user.role} />
    </div>
  )
}

function RoleHome({ role }: { role: UserRole }) {
  switch (role) {
    case 'qc':
      return <QCHome />
    case 'management':
      return <ManagementHome />
    case 'engineer':
      return <EngineerHome />
    default:
      return null
  }
}

function QCHome() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Focus on disposition, evidence, and line context for motors on the
        floor.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          to="/alarms"
          icon={AlertTriangle}
          title="Alarm management"
          desc="Triage, acknowledge, and drill into rule violations and clips."
        />
        <Card
          to="/history"
          icon={FileSearch}
          title="History & evidence"
          desc="Motor audit trail, snapshots, and replay anchors for disputes."
        />
        <Card
          to="/live/motors"
          icon={Cpu}
          title="Motor QC live"
          desc="YOLO overlays on product cameras only."
        />
      </div>
    </div>
  )
}

function ManagementHome() {
  const { status, activeAlarms, camerasOnline, camerasTotal } = plantMetrics
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Production health at a glance — drill into analytics for trends and
        shift performance.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-500">
            Plant status
          </p>
          <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
            {status}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-500">
            Open alarms
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-amber-700">
            {activeAlarms}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-500">
            Cameras online
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900">
            {camerasOnline}/{camerasTotal}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-500">
            Lines
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">1–2 active</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          to="/analytics"
          icon={LineChart}
          title="Analytics & KPIs"
          desc="Alarm frequency, throughput, defects, and station comparison."
        />
        <Card
          to="/live/motors"
          icon={Gauge}
          title="Live production health"
          desc="Motor camera wall for situational awareness."
        />
        <Card
          to="/alarms"
          icon={AlertTriangle}
          title="Alarm management"
          desc="Open, triage, and review rule violations across teams."
        />
        <Card
          to="/history"
          icon={FileSearch}
          title="History & evidence"
          desc="Motor genealogy, station events, and linked evidence packages."
        />
        <Card
          to="/diagnostics"
          icon={Video}
          title="Camera diagnostics"
          desc="Stream health, FPS, exposure, and heartbeat by camera."
        />
        <Card
          to="/admin"
          icon={Settings}
          title="Admin / Config"
          desc="Calibration, thresholds, maintenance mode, and system config."
        />
        <Card
          to="/station/st-a1"
          icon={Wrench}
          title="Station dashboards"
          desc="Open per-station KPIs, event timelines, and camera context."
        />
      </div>
    </div>
  )
}

function EngineerHome() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Maintain vision pipeline health: feeds, calibration, and integration
        logs.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          to="/diagnostics"
          icon={Video}
          title="Camera diagnostics"
          desc="Heartbeat, FPS, exposure, and stream quality by camera ID."
        />
        <Card
          to="/admin"
          icon={Settings}
          title="Calibration & config"
          desc="Thresholds, maintenance mode, and calibration wizard entry."
        />
        <Card
          to="/history"
          icon={FileSearch}
          title="System & evidence logs"
          desc="Cross-reference alarms with stored artifacts and motor IDs."
        />
        <Card
          to="/live/motors"
          icon={Wrench}
          title="Live feeds (debug)"
          desc="Validate overlays and bbox stability on motor channels."
        />
        <Card
          to="/alarms"
          icon={AlertTriangle}
          title="Alarm management"
          desc="Inspect active violations and alarm-to-evidence links."
        />
        <Card
          to="/analytics"
          icon={LineChart}
          title="Analytics & KPIs"
          desc="Trend defects, throughput, station cycle time, and alarm volume."
        />
        <Card
          to="/station/st-a1"
          icon={Gauge}
          title="Station dashboards"
          desc="Inspect per-station KPIs, timelines, and line context."
        />
      </div>
    </div>
  )
}
