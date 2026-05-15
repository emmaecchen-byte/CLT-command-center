import { format } from 'date-fns'
import {
  Activity,
  ArrowLeft,
  Camera,
  Clock3,
  Image as ImageIcon,
  RefreshCw,
  Signal,
  Thermometer,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useLanguage, type Language } from '../i18n/LanguageContext'
import { dateFnsLocale, translateUi } from '../i18n/translateUi'

const rows = [
  {
    id: 'cam-1',
    station: 'Rotor Press A1',
    status: 'ok' as const,
    fps: 29.8,
    latencyMs: 42,
    alarmDisableResponseMs: 620,
    lastCalib: '2026-05-08T09:00:00',
    exposureOk: true,
  },
  {
    id: 'cam-4',
    station: 'Stator Wind B2',
    status: 'warn' as const,
    fps: 24.1,
    latencyMs: 118,
    alarmDisableResponseMs: 1840,
    lastCalib: '2026-05-01T16:30:00',
    exposureOk: false,
  },
  {
    id: 'cam-6',
    station: 'Final Assembly C3',
    status: 'down' as const,
    fps: 0,
    latencyMs: 0,
    alarmDisableResponseMs: 0,
    lastCalib: '2026-04-20T11:00:00',
    exposureOk: true,
  },
  {
    id: 'pcam-2',
    station: 'Light curtain',
    status: 'ok' as const,
    fps: 30,
    latencyMs: 38,
    alarmDisableResponseMs: 540,
    lastCalib: '2026-05-10T08:15:00',
    exposureOk: true,
  },
]

const responseHistory: Record<
  string,
  {
    sessionId: string
    alarmId: string
    at: string
    keyFrame: string
    signal: number[]
    detectMs: number
    publishMs: number
    ackMs: number
    disableMs: number
    totalMs: number
    result: 'target' | 'slow' | 'missed'
  }[]
> = {
  'cam-1': [
    {
      sessionId: 'sess-rp-a1-088',
      alarmId: 'alm-104',
      at: '2026-05-12T14:06:18',
      keyFrame: 'Press guard clear frame',
      signal: [18, 24, 36, 55, 71, 66, 40, 20],
      detectMs: 92,
      publishMs: 128,
      ackMs: 180,
      disableMs: 220,
      totalMs: 620,
      result: 'target',
    },
    {
      sessionId: 'sess-rp-a1-083',
      alarmId: 'alm-097',
      at: '2026-05-12T13:28:44',
      keyFrame: 'Operator clear of press zone',
      signal: [12, 18, 35, 62, 80, 72, 46, 16],
      detectMs: 88,
      publishMs: 104,
      ackMs: 165,
      disableMs: 205,
      totalMs: 562,
      result: 'target',
    },
  ],
  'cam-4': [
    {
      sessionId: 'sess-sw-b2-142',
      alarmId: 'alm-101',
      at: '2026-05-12T14:13:05',
      keyFrame: 'Torque gun absent violation frame',
      signal: [20, 34, 48, 64, 79, 82, 76, 58],
      detectMs: 260,
      publishMs: 310,
      ackMs: 520,
      disableMs: 750,
      totalMs: 1840,
      result: 'slow',
    },
    {
      sessionId: 'sess-sw-b2-139',
      alarmId: 'alm-099',
      at: '2026-05-12T13:52:11',
      keyFrame: 'Lead bundle occlusion frame',
      signal: [22, 29, 44, 61, 75, 70, 55, 32],
      detectMs: 210,
      publishMs: 240,
      ackMs: 410,
      disableMs: 610,
      totalMs: 1470,
      result: 'slow',
    },
    {
      sessionId: 'sess-sw-b2-133',
      alarmId: 'alm-094',
      at: '2026-05-12T12:47:33',
      keyFrame: 'Torque sequence recovered',
      signal: [16, 20, 38, 59, 69, 61, 36, 18],
      detectMs: 150,
      publishMs: 170,
      ackMs: 260,
      disableMs: 390,
      totalMs: 970,
      result: 'target',
    },
  ],
  'cam-6': [
    {
      sessionId: 'sess-fa-c3-076',
      alarmId: 'alm-103',
      at: '2026-05-12T13:58:00',
      keyFrame: 'No frame captured during heartbeat loss',
      signal: [64, 41, 18, 8, 0, 0, 0, 0],
      detectMs: 0,
      publishMs: 0,
      ackMs: 0,
      disableMs: 0,
      totalMs: 0,
      result: 'missed',
    },
  ],
  'pcam-2': [
    {
      sessionId: 'sess-lc-221',
      alarmId: 'alm-108',
      at: '2026-05-12T14:09:20',
      keyFrame: 'Zone clear after operator step-out',
      signal: [14, 20, 30, 54, 73, 70, 38, 14],
      detectMs: 72,
      publishMs: 96,
      ackMs: 150,
      disableMs: 222,
      totalMs: 540,
      result: 'target',
    },
  ],
}

const logLines = [
  '[14:02:01] ingest-1 frame drop burst 3x cam-4',
  '[14:01:44] calib-worker queued extrinsics for pcam-2',
  '[14:00:12] onnx runtime warm — model torque_seq v3.2',
  '[13:58:00] mqtt bridge ack line/1/station/b2/vision',
]

function averageResponseMs(history: (typeof responseHistory)[string]) {
  const values = history.map((item) => item.totalMs).filter((value) => value > 0)
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function responseStatusLabel(averageMs: number) {
  if (averageMs === 0) return 'missed'
  if (averageMs > 1200) return 'latency review'
  return 'on target'
}

function responseStatusClass(averageMs: number) {
  if (averageMs === 0) {
    return 'rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800'
  }
  if (averageMs > 1200) {
    return 'rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900'
  }
  return 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'
}

export function DiagnosticsPage() {
  const { language } = useLanguage()
  const locale = dateFnsLocale(language)
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Camera diagnostics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Engineering view for stream health, calibration freshness, and
          pipeline logs. Wire to your observability stack (Prometheus, Loki,
          etc.).
        </p>
      </header>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Camera className="size-4 text-[var(--color-accent)]" aria-hidden />
            Feed health
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Refresh probe
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-6 sm:pr-8">Camera</th>
                <th className="py-2 pr-6 sm:pr-8">Station</th>
                <th className="py-2 pr-6 sm:pr-8">Status</th>
                <th className="py-2 pr-6 sm:pr-8">FPS</th>
                <th className="py-2 pr-6 sm:pr-8">Latency</th>
                <th className="py-2 pr-6 sm:pr-8">Alarm disable response</th>
                <th className="py-2 pr-6 sm:pr-8">Exposure</th>
                <th className="py-2 pr-0">Last calibration</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--color-border)]/70"
                >
                  <td className="py-2.5 pr-6 font-mono text-xs text-slate-900 sm:pr-8">
                    {r.id}
                  </td>
                  <td className="py-2.5 pr-6 text-slate-700 sm:pr-8">
                    {translateUi(r.station, language)}
                  </td>
                  <td className="py-2.5 pr-6 sm:pr-8">
                    <span
                      className={
                        r.status === 'ok'
                          ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800'
                          : r.status === 'warn'
                            ? 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900'
                            : 'rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800'
                      }
                    >
                      {translateUi(r.status, language)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-6 font-mono text-slate-700 sm:pr-8">{r.fps}</td>
                  <td className="py-2.5 pr-6 font-mono text-slate-700 sm:pr-8">
                    {r.latencyMs
                      ? `${r.latencyMs} ${translateUi('ms', language)}`
                      : '—'}
                  </td>
                  <td className="py-2.5 pr-6 sm:pr-8">
                    <Link
                      to={`/diagnostics/response/${r.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] hover:ring-[var(--color-accent)]/30"
                    >
                      <Clock3 className="size-3.5" aria-hidden />
                      {r.alarmDisableResponseMs
                        ? `${r.alarmDisableResponseMs} ${translateUi('ms', language)}`
                        : translateUi('No response', language)}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-6 text-slate-700 sm:pr-8">
                    {r.exposureOk
                      ? translateUi('OK', language)
                      : translateUi('Review', language)}
                  </td>
                  <td className="py-2.5 pr-0 font-mono text-xs text-slate-600">
                    {format(new Date(r.lastCalib), 'MMM d HH:mm', { locale })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Thermometer className="size-4 text-[var(--color-accent)]" aria-hidden />
            Calibration queue
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
              <span>cam-4 — extrinsics drift &gt; 2 px</span>
              <span className="font-mono text-xs text-amber-800">Due</span>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
              <span>pcam-1 — scheduled weekly</span>
              <span className="font-mono text-xs text-slate-500">May 12</span>
            </li>
          </ul>
        </section>
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Activity className="size-4 text-[var(--color-accent)]" aria-hidden />
            Integration logs (sample)
          </h2>
          <pre className="mt-3 max-h-48 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
            {logLines.join('\n')}
          </pre>
        </section>
      </div>
    </div>
  )
}

export function DiagnosticsResponsePage() {
  const { cameraId } = useParams()
  const { language } = useLanguage()
  const locale = dateFnsLocale(language)
  const selectedRow = rows.find((row) => row.id === cameraId)

  if (!selectedRow) {
    return <Navigate to="/diagnostics" replace />
  }

  const selectedHistory = responseHistory[selectedRow.id] ?? []
  const selectedAverage = averageResponseMs(selectedHistory)

  return (
    <div className="space-y-6 pb-16">
      <Link
        to="/diagnostics"
        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to camera diagnostics
      </Link>

      <header className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              Alarm disable response history
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {selectedRow.id} · {translateUi(selectedRow.station, language)}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review the full response chain from key frame to signal display,
              acknowledgement, disable timing, and session outcome.
            </p>
          </div>
          <span className={responseStatusClass(selectedAverage)}>
            {responseStatusLabel(selectedAverage)}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--color-border)] pt-4 text-xs text-slate-500">
          <span>
            Average{' '}
            <span className="font-mono text-slate-700">
              {selectedAverage ? `${selectedAverage} ms` : 'no completed responses'}
            </span>
          </span>
          <span>
            Feed latency{' '}
            <span className="font-mono text-slate-700">
              {selectedRow.latencyMs ? `${selectedRow.latencyMs} ms` : '-'}
            </span>
          </span>
          <span>
            FPS <span className="font-mono text-slate-700">{selectedRow.fps}</span>
          </span>
          <span>
            Exposure{' '}
            <span className="font-mono text-slate-700">
              {selectedRow.exposureOk ? 'OK' : 'Review'}
            </span>
          </span>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {selectedHistory.map((session) => (
            <ResponseSession key={session.sessionId} session={session} locale={locale} language={language} />
          ))}
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <h2 className="text-sm font-semibold text-slate-900">Debug focus</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <p>
              Compare frame detect, signal publish, alarm acknowledgement, and
              final disable time across sessions.
            </p>
            <p>
              High disable response usually means the detection is stable, but
              acknowledgement or PLC/MQTT handoff is lagging.
            </p>
            <p className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500 ring-1 ring-slate-200">
              Target: &lt; 1000 ms · Review: 1000-2000 ms · Missed: no disable
              ack
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResponseSession({
  session,
  locale,
  language,
}: {
  session: (typeof responseHistory)[string][number]
  locale: ReturnType<typeof dateFnsLocale>
  language: Language
}) {
  const steps = [
    { label: 'Detect', value: session.detectMs },
    { label: 'Signal', value: session.publishMs },
    { label: 'Ack', value: session.ackMs },
    { label: 'Disable', value: session.disableMs },
  ]

  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate-500">
            {session.sessionId} ·{' '}
            {format(new Date(session.at), 'MMM d HH:mm:ss', { locale })}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-900">
            {session.alarmId} {translateUi('response chain', language)}
          </h3>
        </div>
        <span
          className={
            session.result === 'target'
              ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'
              : session.result === 'slow'
                ? 'rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900'
                : 'rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800'
          }
        >
          {session.totalMs ? `${session.totalMs} ms` : 'missed'}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
            <ImageIcon className="size-9 text-slate-400" aria-hidden />
            <span className="absolute left-2 top-2 rounded bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              Key frame
            </span>
          </div>
          <p className="p-2 text-xs text-slate-600">
            {translateUi(session.keyFrame, language)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Signal className="size-3.5" aria-hidden />
              Signal display
            </p>
            <div className="flex h-20 items-end gap-1 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
              {session.signal.map((value, index) => (
                <span
                  key={`${session.sessionId}-${index}`}
                  className="flex-1 rounded-t bg-[var(--color-accent)]/70"
                  style={{ height: `${Math.max(value, 4)}%` }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.label}
                className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
              >
                <p className="text-[10px] font-semibold uppercase text-slate-500">
                  {step.label}
                </p>
                <p className="mt-1 font-mono text-sm text-slate-900">
                  {step.value ? `${step.value} ms` : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
