import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ChevronRight,
  Clock,
  Cpu,
  QrCode,
  User,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { canAccessPath, preferredLiveHub } from '../auth/permissions'
import { stationTimeline, stations } from '../data/mock'
import { useLanguage } from '../i18n/LanguageContext'
import { translateUi } from '../i18n/translateUi'

function opStatus(s: 'present' | 'break' | 'offline') {
  if (s === 'present')
    return 'bg-emerald-500/20 text-emerald-800 ring-emerald-600/35'
  if (s === 'break')
    return 'bg-amber-500/15 text-amber-900 ring-amber-600/35'
  return 'bg-slate-200 text-slate-500 ring-slate-300'
}

export function StationDetailPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { stationId } = useParams<{ stationId: string }>()
  const station = stations.find((s) => s.id === stationId)
  const events = station ? stationTimeline(station.id) : []

  if (!station) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center">
        <p className="text-slate-600">Station not found.</p>
        <Link
          to={user ? preferredLiveHub(user.role) : '/dashboard'}
          className="mt-4 inline-block text-[var(--color-accent)] hover:underline"
        >
          Back to live workspace
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-slate-500">{station.id}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {station.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{station.line}</p>
        </div>
        <Link
          to={user ? preferredLiveHub(user.role) : '/dashboard'}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200"
        >
          ← Live workspace
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={Cpu}
          label="Current motor"
          value={station.currentMotor ?? '—'}
          sub={translateUi(station.processStep, language)}
        />
        <Metric
          icon={Activity}
          label="Utilization"
          value={`${station.utilizationPct}%`}
          sub="rolling 2h window"
        />
        <Metric
          icon={Clock}
          label="Cycle time"
          value={`${station.cycleTimeSec}s`}
          sub="last completed cycle"
        />
        <Metric
          icon={User}
          label="Operator"
          value={station.operator.name}
          sub={
            <span
              className={clsx(
                'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1',
                opStatus(station.operator.status),
              )}
            >
              {translateUi(station.operator.status, language)}
            </span>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h2 className="text-sm font-semibold text-slate-900">Pass / fail</h2>
          <div className="mt-4 flex gap-8">
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500">
                Pass
              </p>
              <p className="mt-1 font-mono text-3xl font-semibold text-emerald-700">
                {station.passCount}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500">
                Fail
              </p>
              <p className="mt-1 font-mono text-3xl font-semibold text-red-600">
                {station.failCount}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500">
                Yield
              </p>
              <p className="mt-1 font-mono text-3xl font-semibold text-slate-900">
                {(
                  (100 * station.passCount) /
                  Math.max(1, station.passCount + station.failCount)
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <QrCode className="size-4 text-[var(--color-accent)]" aria-hidden />
            History
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Bind YOLO detections, torque events, and QR reads to this station
            ID for full motor genealogy. Example:{' '}
            <span className="font-mono text-slate-700">
              {station.currentMotor ?? 'MTR-…'}
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user && canAccessPath(user.role, '/history') ? (
              <>
                <Link
                  to="/history"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
                >
                  Open history hub
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
                {station.currentMotor && (
                  <Link
                    to={`/history?motor=${encodeURIComponent(station.currentMotor)}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-accent)]/15 px-3 py-2 text-xs font-semibold text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/35 hover:bg-[var(--color-accent)]/25"
                  >
                    Audit trail for this motor
                    <ChevronRight className="size-3.5" aria-hidden />
                  </Link>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-500">
                History tools are not enabled for your role.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Historical timeline
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Example narrative for demo station B2 — motor flow, scans, QC, and
          alarms.
        </p>
        <ol className="relative mt-6 space-y-0 border-l border-[var(--color-border)] pl-6">
          {events.map((e, i) => (
            <li key={e.id} className="relative pb-8 last:pb-0">
              <span
                className={clsx(
                  'absolute -left-[25px] mt-0.5 size-3 rounded-full ring-4 ring-[var(--color-panel)]',
                  e.kind === 'motor' && 'bg-[var(--color-accent)]',
                  e.kind === 'scan' && 'bg-sky-400',
                  e.kind === 'qc' && 'bg-emerald-400',
                  e.kind === 'alarm' && 'bg-red-500',
                  e.kind === 'clear' && 'bg-white',
                )}
              />
              <time className="font-mono text-xs text-slate-500">
                {new Date(e.at).toLocaleTimeString(
                  language === 'zh' ? 'zh-CN' : 'en-US',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}
              </time>
              <p className="mt-0.5 text-sm text-slate-800">
                {translateUi(e.label, language)}
              </p>
              {i < events.length - 1 && (
                <div className="absolute left-[-25px] top-4 h-full w-px bg-transparent" />
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub: ReactNode
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-elevated)] p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="size-4" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 font-mono text-lg font-semibold text-slate-900">{value}</p>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  )
}
