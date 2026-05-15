import { format } from 'date-fns'
import { clsx } from 'clsx'
import {
  ArrowDown,
  ArrowUp,
  Filter,
  Play,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CameraTile } from '../components/live/CameraTile'
import { alarms, cameras } from '../data/mock'
import { useLanguage } from '../i18n/LanguageContext'
import { dateFnsLocale, translateUi } from '../i18n/translateUi'
import type { AlarmRow, AlarmStatus, Severity } from '../types'

type SortKey = 'time' | 'station' | 'type' | 'severity' | 'status' | 'assigned'

const severities: Severity[] = ['critical', 'high', 'medium', 'low']
const statuses: AlarmStatus[] = ['open', 'acknowledged', 'cleared']

function severityBadge(s: Severity) {
  const c = {
    critical: 'bg-red-500/15 text-red-800 ring-red-600/35',
    high: 'bg-amber-500/15 text-amber-900 ring-amber-600/35',
    medium: 'bg-yellow-500/12 text-yellow-900 ring-yellow-600/30',
    low: 'bg-sky-500/12 text-sky-900 ring-sky-600/30',
  }
  return c[s]
}

function statusBadge(s: AlarmStatus) {
  const c = {
    open: 'bg-rose-500/15 text-rose-800 ring-rose-600/30',
    acknowledged: 'bg-violet-500/15 text-violet-800 ring-violet-600/30',
    cleared: 'bg-emerald-500/12 text-emerald-800 ring-emerald-600/30',
  }
  return c[s]
}

export function AlarmManagementPage() {
  const { language } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortKey, setSortKey] = useState<SortKey>('time')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AlarmStatus | 'all'>('all')
  const [selected, setSelected] = useState<AlarmRow | null>(null)

  const focusId = searchParams.get('focus')
  const fromQuery = useMemo(
    () => (focusId ? (alarms.find((a) => a.id === focusId) ?? null) : null),
    [focusId],
  )
  const displayed = selected ?? fromQuery

  function closeDetail() {
    setSelected(null)
    if (searchParams.has('focus')) {
      const next = new URLSearchParams(searchParams)
      next.delete('focus')
      setSearchParams(next, { replace: true })
    }
  }

  const rows = useMemo(() => {
    let list = [...alarms]
    if (severityFilter !== 'all')
      list = list.filter((a) => a.severity === severityFilter)
    if (statusFilter !== 'all')
      list = list.filter((a) => a.status === statusFilter)
    list.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'time':
          cmp = new Date(a.time).getTime() - new Date(b.time).getTime()
          break
        case 'station':
          cmp = a.stationName.localeCompare(b.stationName)
          break
        case 'type':
          cmp = a.alarmType.localeCompare(b.alarmType)
          break
        case 'severity': {
          const order: Record<Severity, number> = {
            critical: 0,
            high: 1,
            medium: 2,
            low: 3,
          }
          cmp = order[a.severity] - order[b.severity]
          break
        }
        case 'status': {
          const order: Record<AlarmStatus, number> = {
            open: 0,
            acknowledged: 1,
            cleared: 2,
          }
          cmp = order[a.status] - order[b.status]
          break
        }
        case 'assigned':
          cmp = (a.assignedTo ?? '').localeCompare(b.assignedTo ?? '')
          break
        default:
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [sortKey, sortDir, severityFilter, statusFilter])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'time' ? 'desc' : 'asc')
    }
  }

  const cam = displayed
    ? cameras.find((c) => c.id === displayed.cameraId)
    : undefined

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Alarm management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sortable, filterable alarm log. Select a row for snapshot, rule,
          motor/QR, replay context, and acknowledge workflow.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="size-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Filters
          </span>
        </div>
        <select
          className="rounded-lg border border-[var(--color-border)] bg-slate-50 px-3 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
          value={severityFilter}
          onChange={(e) =>
            setSeverityFilter(e.target.value as Severity | 'all')
          }
        >
          <option value="all">All severities</option>
          {severities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-[var(--color-border)] bg-slate-50 px-3 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as AlarmStatus | 'all')
          }
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_min(420px,100%)]">
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-slate-500">
                  {(
                    [
                      ['time', 'Time'],
                      ['station', 'Station'],
                      ['type', 'Alarm type'],
                      ['severity', 'Severity'],
                      ['status', 'Status'],
                      ['assigned', 'Assigned to'],
                    ] as const
                  ).map(([key, label]) => (
                    <th key={key} className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        {label}
                        {sortKey === key &&
                          (sortDir === 'asc' ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          ))}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className={clsx(
                      'cursor-pointer border-b border-[var(--color-border)]/60 transition hover:bg-slate-50',
                      displayed?.id === row.id && 'bg-[var(--color-accent)]/10',
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700">
                      {format(new Date(row.time), 'MMM d HH:mm', {
                        locale: dateFnsLocale(language),
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {translateUi(row.stationName, language)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {translateUi(row.alarmType, language)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-semibold uppercase ring-1',
                          severityBadge(row.severity),
                        )}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1',
                          statusBadge(row.status),
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.assignedTo ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside
          className={clsx(
            'flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-elevated)] transition',
            !displayed && 'items-center justify-center p-8 text-center',
          )}
        >
          {!displayed ? (
            <p className="text-sm text-slate-500">
              Click an alarm to open the detail panel.
            </p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] p-4">
                <div>
                  <p className="font-mono text-[10px] uppercase text-slate-500">
                    {displayed.id}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {translateUi(displayed.alarmType, language)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {translateUi(displayed.stationName, language)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  aria-label="Close panel"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Snapshot (mock)
                  </p>
                  <div className="mt-2 overflow-hidden rounded-lg border border-[var(--color-border)]">
                    {cam ? (
                      <CameraTile camera={cam} showConfidence size="compact" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-slate-100 text-sm text-slate-500">
                        No camera mapping
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Rule violated
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {translateUi(displayed.ruleViolated, language)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">
                      Motor
                    </p>
                    <p className="mt-0.5 font-mono text-slate-800">
                      {displayed.motorId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">
                      QR
                    </p>
                    <p className="mt-0.5 font-mono text-slate-800">
                      {displayed.qrCode}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Timestamps
                  </p>
                  <ul className="mt-2 space-y-1.5 font-mono text-xs">
                    {displayed.timeline.map((e) => (
                      <li
                        key={e.t + e.label}
                        className="flex gap-2 text-slate-700"
                      >
                        <span className="shrink-0 text-slate-500">{e.t}</span>
                        <span
                          className={clsx(
                            e.kind === 'error' && 'text-red-700',
                            e.kind === 'warn' && 'text-amber-800',
                            e.kind === 'ok' && 'text-emerald-700',
                          )}
                        >
                          {translateUi(e.label, language)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Camera replay
                  </p>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-xs font-medium text-slate-900 ring-1 ring-slate-300 hover:bg-slate-200"
                  >
                    <Play className="size-3.5" aria-hidden />
                    {language === 'zh'
                      ? `打开 ${displayed.cameraId} 的视频片段`
                      : `Open clip for ${displayed.cameraId}`}
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Comments / log
                  </p>
                  <div className="mt-2 space-y-3 rounded-lg border border-[var(--color-border)] bg-slate-100 p-3">
                    {displayed.comments.length === 0 ? (
                      <p className="text-xs text-slate-500">No entries yet.</p>
                    ) : (
                      displayed.comments.map((c, i) => (
                        <div key={i} className="text-sm text-slate-700">
                          <p>
                            <span className="font-medium text-slate-900">
                              {translateUi('Alarm acknowledged by:', language)}{' '}
                            </span>
                            {c.author}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {c.time}
                          </p>
                          {c.reason && (
                            <p className="mt-2 text-xs text-slate-600">
                              <span className="font-medium text-slate-700">
                                {translateUi('Reason:', language)}{' '}
                              </span>
                              {translateUi(c.reason, language)}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--color-border)] p-4">
                <button
                  type="button"
                  className="w-full rounded-lg bg-[var(--color-accent)]/25 py-2.5 text-sm font-semibold text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/35"
                >
                  Acknowledge
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
