import { clsx } from 'clsx'
import { AlertTriangle } from 'lucide-react'
import type { ActiveAlarmSummary, Severity } from '../../types'

function severityColor(s: Severity) {
  switch (s) {
    case 'critical':
      return 'text-red-800 ring-red-600/40 bg-red-500/10'
    case 'high':
      return 'text-amber-900 ring-amber-600/35 bg-amber-500/10'
    case 'medium':
      return 'text-yellow-900 ring-yellow-600/30 bg-yellow-500/10'
    default:
      return 'text-sky-800 ring-sky-600/30 bg-sky-500/10'
  }
}

export function AlertPanel({
  alarms,
  onAcknowledge,
  variant = 'sidebar',
}: {
  alarms: ActiveAlarmSummary[]
  onAcknowledge?: (id: string) => void
  /** `dock` = compact strip for under the camera grid (full-width live view). */
  variant?: 'sidebar' | 'dock'
}) {
  const top = alarms[0]
  const dock = variant === 'dock'

  if (dock) {
    return (
      <div className="shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[var(--color-border)] px-4 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Alerts
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          {top ? (
            <>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Active
                </p>
                <p className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                  {top.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-slate-600">
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-xs font-semibold uppercase ring-1',
                      severityColor(top.severity),
                    )}
                  >
                    {top.severity}
                  </span>
                  <span>{top.station}</span>
                  <span className="font-mono text-slate-500">{top.time}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAcknowledge?.(top.id)}
                className="shrink-0 rounded-lg bg-[var(--color-accent)]/20 px-5 py-2.5 text-sm font-semibold text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/40 transition hover:bg-[var(--color-accent)]/30 sm:py-3"
              >
                Acknowledge
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">No active alarms.</p>
          )}
        </div>
        {alarms.length > 1 && (
          <div className="border-t border-[var(--color-border)] px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Queue
            </p>
            <ul className="mt-1.5 flex max-h-20 flex-wrap gap-x-4 gap-y-1 overflow-y-auto text-xs text-slate-600">
              {alarms.slice(1).map((a) => (
                <li key={a.id} className="flex shrink-0 gap-2">
                  <span className="max-w-[200px] truncate">{a.title}</span>
                  <span className="font-mono text-slate-400">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <AlertTriangle className="size-4 text-amber-600" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-900">Alert panel</h2>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {top ? (
          <>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Active alarm
              </p>
              <p className="mt-1 text-base font-semibold leading-snug text-slate-900">
                {top.title}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Severity
              </p>
              <span
                className={clsx(
                  'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase ring-1',
                  severityColor(top.severity),
                )}
              >
                {top.severity}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Station
              </p>
              <p className="mt-1 text-sm text-slate-800">{top.station}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Time
              </p>
              <p className="mt-1 font-mono text-sm text-slate-700">{top.time}</p>
            </div>
            <button
              type="button"
              onClick={() => onAcknowledge?.(top.id)}
              className="mt-auto w-full rounded-lg bg-[var(--color-accent)]/20 py-2.5 text-sm font-semibold text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/40 transition hover:bg-[var(--color-accent)]/30"
            >
              Acknowledge
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">No active alarms.</p>
        )}
      </div>
      {alarms.length > 1 && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Queue
          </p>
          <ul className="mt-2 space-y-2">
            {alarms.slice(1).map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-2 text-xs text-slate-600"
              >
                <span className="line-clamp-2">{a.title}</span>
                <span className="shrink-0 font-mono text-slate-500">
                  {a.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
