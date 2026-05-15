import { format, formatDistanceToNow, isWithinInterval } from 'date-fns'
import { clsx } from 'clsx'
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Clapperboard,
  FileSearch,
  Image as ImageIcon,
  Link2,
  ScrollText,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { canAccessPath } from '../auth/permissions'
import { useLanguage, type Language } from '../i18n/LanguageContext'
import { dateFnsLocale, translateUi } from '../i18n/translateUi'
import type {
  AuditEventKind,
  DefectRecord,
  EvidenceItem,
  MotorAuditEvent,
  ShiftRollup,
  StationLogEntry,
} from '../types/history'
import {
  auditTrailForMotor,
  defectsForMotor,
  evidenceForMotor,
  historyMotors,
  logsForStation,
  shiftRollups,
} from '../data/historyMock'

function kindStyle(k: AuditEventKind) {
  const map: Partial<Record<AuditEventKind, string>> = {
    alarm: 'bg-red-500/20 text-red-800 ring-red-600/35',
    vision_fail: 'bg-amber-500/15 text-amber-900 ring-amber-600/35',
    clear: 'bg-emerald-500/15 text-emerald-800 ring-emerald-600/35',
    qr_scan: 'bg-sky-500/15 text-sky-900 ring-sky-600/35',
    station_in: 'bg-violet-500/15 text-violet-800 ring-violet-600/30',
    vision_pass: 'bg-emerald-500/12 text-emerald-800 ring-emerald-600/25',
  }
  return map[k] ?? 'bg-slate-200 text-slate-600 ring-slate-300'
}

function isNearEvent(eventAt: string, rowAt: string, windowMs = 90_000) {
  return Math.abs(new Date(eventAt).getTime() - new Date(rowAt).getTime()) <= windowMs
}

function shiftForEvent(event: MotorAuditEvent) {
  const eventDate = new Date(event.at)
  return shiftRollups.find((shift) =>
    isWithinInterval(eventDate, {
      start: new Date(shift.startedAt),
      end: new Date(shift.endedAt),
    }),
  )
}

function dataForEvent({
  event,
  allEvidence,
  allDefects,
}: {
  event: MotorAuditEvent
  allEvidence: EvidenceItem[]
  allDefects: DefectRecord[]
}) {
  const evidenceIds = new Set(event.evidenceIds ?? [])
  const evidence = allEvidence.filter((item) => evidenceIds.has(item.id))
  const defects = allDefects.filter((defect) => {
    const sharesEvidence = defect.evidenceIds.some((id) => evidenceIds.has(id))
    const matchesEvent =
      defect.stationId === event.stationId && isNearEvent(event.at, defect.at)
    return sharesEvidence || matchesEvent
  })
  const logs = logsForStation(event.stationId).filter((log) => {
    if (log.motorId && log.motorId !== event.motorId) return false
    return isNearEvent(event.at, log.at)
  })

  return {
    evidence,
    defects,
    logs,
    shift: shiftForEvent(event),
  }
}

export function HistoryPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const locale = dateFnsLocale(language)
  const [searchParams] = useSearchParams()
  const [motorId, setMotorId] = useState(
    () => searchParams.get('motor') ?? 'MTR-88433',
  )

  const audit = useMemo(() => auditTrailForMotor(motorId), [motorId])
  const evidence = useMemo(() => evidenceForMotor(motorId), [motorId])
  const defects = useMemo(() => defectsForMotor(motorId), [motorId])
  const motorMeta = historyMotors.find((m) => m.motorId === motorId)
  const canViewStationDetail = user
    ? canAccessPath(user.role, '/station/st-a1')
    : false

  return (
    <div className="space-y-8 pb-16">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[var(--color-accent)]">
          <FileSearch className="size-5" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">
            History
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Investigation & genealogy
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Follow each motor through the event chain. Open an event to inspect
          only its station logs, screenshots, replay clips, defect records, and
          shift context on a focused detail screen.
        </p>
      </header>

      <section id="motor" className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Link2 className="size-5 text-[var(--color-accent)]" aria-hidden />
          Per-motor event chain
        </h2>
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <label className="text-sm text-slate-600">
            Motor ID or QR
            <select
              value={motorId}
              onChange={(e) => setMotorId(e.target.value)}
              className="mt-1 block min-w-[200px] rounded-lg border border-[var(--color-border)] bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
            >
              {historyMotors.map((m) => (
                <option key={m.motorId} value={m.motorId}>
                  {m.motorId} · {m.qrCode}
                </option>
              ))}
            </select>
          </label>
          {motorMeta && (
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>
                SKU <span className="text-slate-700">{motorMeta.sku}</span>
              </span>
              {motorMeta.customerLot && (
                <span>
                  Lot{' '}
                  <span className="font-mono text-slate-700">
                    {motorMeta.customerLot}
                  </span>
                </span>
              )}
              <span>
                Status{' '}
                <span className="uppercase text-amber-800">
                  {translateUi(motorMeta.status, language)}
                </span>
              </span>
              <span>
                Last seen{' '}
                <span className="font-mono text-slate-700">
                  {formatDistanceToNow(new Date(motorMeta.lastSeenAt), {
                    addSuffix: true,
                    locale,
                  })}
                </span>
              </span>
            </div>
          )}
          {motorMeta && canViewStationDetail && (
            <Link
              to={`/station/${motorMeta.lastStationId}`}
              className="ml-auto inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
            >
              Station detail
              <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Immutable event chain (demo data)
          </p>
          <ol className="relative mt-6 space-y-0 border-l border-[var(--color-border)] pl-6">
            {audit.map((event, i) => {
              const linkedData = dataForEvent({
                event,
                allEvidence: evidence,
                allDefects: defects,
              })
              return (
                <AuditRow
                  key={event.id}
                  event={event}
                  linkedData={linkedData}
                  isLast={i === audit.length - 1}
                  locale={locale}
                  language={language}
                />
              )
            })}
          </ol>
        </div>
      </section>
    </div>
  )
}

function AuditRow({
  event,
  linkedData,
  isLast,
  locale,
  language,
}: {
  event: MotorAuditEvent
  linkedData: {
    evidence: EvidenceItem[]
    defects: DefectRecord[]
    logs: StationLogEntry[]
    shift?: ShiftRollup
  }
  isLast: boolean
  locale: ReturnType<typeof dateFnsLocale>
  language: Language
}) {
  const linkedCount =
    linkedData.evidence.length +
    linkedData.defects.length +
    linkedData.logs.length +
    (linkedData.shift ? 1 : 0)

  return (
    <li className={clsx('relative pb-8', isLast && 'pb-0')}>
      <span
        className={clsx(
          'absolute -left-[25px] mt-1 size-3 rounded-full ring-4 ring-[var(--color-panel)]',
          kindStyle(event.kind),
        )}
      />
      <Link
        to={`/history/event/${event.id}?motor=${event.motorId}`}
        className="w-full rounded-xl border border-transparent p-3 text-left transition hover:border-[var(--color-border)] hover:bg-slate-50"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <time className="font-mono text-xs text-slate-500">
              {format(new Date(event.at), 'HH:mm:ss.SSS', { locale })}
            </time>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={clsx(
                  'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ring-1',
                  kindStyle(event.kind),
                )}
              >
                {translateUi(event.kind.replace(/_/g, ' '), language)}
              </span>
              <span className="text-sm font-medium text-slate-800">
                {translateUi(event.summary, language)}
              </span>
            </div>
            {event.detail && (
              <p className="mt-1 text-xs text-slate-500">
                {translateUi(event.detail, language)}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {linkedCount} linked
            <ChevronRight className="size-3.5" aria-hidden />
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-600 ring-1 ring-slate-200">
            {event.stationName}
          </span>
          {event.cameraId && (
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-600 ring-1 ring-slate-200">
              {event.cameraId}
            </span>
          )}
          {event.replayWindow && (
            <span className="text-slate-500">
              Replay{' '}
              <span className="font-mono text-slate-600">
                {format(new Date(event.replayWindow.start), 'HH:mm:ss', {
                  locale,
                })}
                -
                {format(new Date(event.replayWindow.end), 'HH:mm:ss', {
                  locale,
                })}
              </span>
            </span>
          )}
        </div>
      </Link>
    </li>
  )
}

export function HistoryEventPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const locale = dateFnsLocale(language)
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const motorId = searchParams.get('motor') ?? 'MTR-88433'
  const audit = useMemo(() => auditTrailForMotor(motorId), [motorId])
  const evidence = useMemo(() => evidenceForMotor(motorId), [motorId])
  const defects = useMemo(() => defectsForMotor(motorId), [motorId])
  const event = audit.find((item) => item.id === eventId)
  const motorMeta = historyMotors.find((m) => m.motorId === motorId)
  const canViewAlarms = user ? canAccessPath(user.role, '/alarms') : false

  if (!event) {
    return <Navigate to={`/history?motor=${motorId}`} replace />
  }

  const linkedData = dataForEvent({
    event,
    allEvidence: evidence,
    allDefects: defects,
  })

  return (
    <div className="space-y-6 pb-16">
      <Link
        to={`/history?motor=${motorId}`}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to event chain
      </Link>

      <header className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-slate-500">
              {format(new Date(event.at), 'yyyy-MM-dd HH:mm:ss.SSS', { locale })}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={clsx(
                  'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ring-1',
                  kindStyle(event.kind),
                )}
              >
                {translateUi(event.kind.replace(/_/g, ' '), language)}
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {translateUi(event.summary, language)}
              </h1>
            </div>
            {event.detail && (
              <p className="mt-2 text-sm text-slate-600">
                {translateUi(event.detail, language)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-600 ring-1 ring-slate-200">
              {event.motorId}
            </span>
            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-600 ring-1 ring-slate-200">
              {translateUi(event.stationName, language)}
            </span>
            {event.cameraId && (
              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-600 ring-1 ring-slate-200">
                {event.cameraId}
              </span>
            )}
          </div>
        </div>
        {motorMeta && (
          <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--color-border)] pt-4 text-xs text-slate-500">
            <span>
              SKU <span className="text-slate-700">{motorMeta.sku}</span>
            </span>
            {motorMeta.customerLot && (
              <span>
                Lot{' '}
                <span className="font-mono text-slate-700">
                  {motorMeta.customerLot}
                </span>
              </span>
            )}
            <span>
              Status{' '}
              <span className="uppercase text-amber-800">
                {translateUi(motorMeta.status, language)}
              </span>
            </span>
            {event.replayWindow && (
              <span>
                Replay{' '}
                <span className="font-mono text-slate-700">
                  {format(new Date(event.replayWindow.start), 'HH:mm:ss', {
                    locale,
                  })}
                  -
                  {format(new Date(event.replayWindow.end), 'HH:mm:ss', {
                    locale,
                  })}
                </span>
              </span>
            )}
          </div>
        )}
      </header>

      <EventDetails
        event={event}
        linkedData={linkedData}
        canViewAlarms={canViewAlarms}
        locale={locale}
      />
    </div>
  )
}

function EventDetails({
  event,
  linkedData,
  canViewAlarms,
  locale,
}: {
  event: MotorAuditEvent
  linkedData: {
    evidence: EvidenceItem[]
    defects: DefectRecord[]
    logs: StationLogEntry[]
    shift?: ShiftRollup
  }
  canViewAlarms: boolean
  locale: ReturnType<typeof dateFnsLocale>
}) {
  return (
    <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-elevated)] p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <EvidencePanel
          evidence={linkedData.evidence}
          canViewAlarms={canViewAlarms}
          locale={locale}
        />
        <div className="space-y-4">
          <StationLogsPanel logs={linkedData.logs} locale={locale} />
          <DefectsPanel defects={linkedData.defects} locale={locale} />
        </div>
      </div>
      <ShiftPanel shift={linkedData.shift} stationId={event.stationId} locale={locale} />
    </div>
  )
}

function EvidencePanel({
  evidence,
  canViewAlarms,
  locale,
}: {
  evidence: EvidenceItem[]
  canViewAlarms: boolean
  locale: ReturnType<typeof dateFnsLocale>
}) {
  const { language } = useLanguage()
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Camera className="size-4 text-[var(--color-accent)]" aria-hidden />
        Screenshots & video evidence
      </h3>
      {evidence.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white"
            >
              <div
                className="relative flex aspect-video items-center justify-center bg-slate-900"
                style={{
                  backgroundImage: `linear-gradient(135deg, oklch(0.22 0.05 ${
                    item.id.length * 37
                  }), oklch(0.14 0.02 260))`,
                }}
              >
                {item.type === 'clip' ? (
                  <Clapperboard className="size-10 text-slate-400" aria-hidden />
                ) : (
                  <ImageIcon className="size-10 text-slate-400" aria-hidden />
                )}
                <span className="absolute left-2 top-2 rounded bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                  {item.type === 'clip' ? 'Clip' : 'Snapshot'}
                </span>
                <span className="absolute bottom-2 right-2 rounded bg-slate-900/85 px-2 py-0.5 font-mono text-[10px] text-white/90">
                  {item.cameraId}
                </span>
              </div>
              <div className="space-y-2 p-3">
                <p className="text-sm font-medium text-slate-900">
                  {translateUi(item.label, language)}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  {format(new Date(item.at), 'yyyy-MM-dd HH:mm:ss', { locale })}
                  {item.durationSec != null && ` · ${item.durationSec}s`}
                </p>
                {item.relatedAlarmId &&
                  (canViewAlarms ? (
                    <Link
                      to={`/alarms?focus=${item.relatedAlarmId}`}
                      className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200"
                    >
                      {translateUi('Alarm', language)} {item.relatedAlarmId}
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-500 ring-1 ring-slate-200">
                      {item.relatedAlarmId}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState label="No linked screenshots or clips for this event." />
      )}
    </section>
  )
}

function StationLogsPanel({
  logs,
  locale,
}: {
  logs: StationLogEntry[]
  locale: ReturnType<typeof dateFnsLocale>
}) {
  const { language } = useLanguage()
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <ScrollText className="size-4 text-[var(--color-accent)]" aria-hidden />
        Per-station logs
      </h3>
      {logs.length > 0 ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border-b border-[var(--color-border)]/70 p-3 last:border-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-500">
                  {format(new Date(log.at), 'HH:mm:ss', { locale })}
                </span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1',
                    log.level === 'error' &&
                      'bg-red-500/15 text-red-800 ring-red-600/30',
                    log.level === 'warn' &&
                      'bg-amber-500/12 text-amber-900 ring-amber-600/30',
                    log.level === 'info' &&
                      'bg-slate-200 text-slate-600 ring-slate-300',
                  )}
                >
                  {translateUi(log.level, language)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">
                {translateUi(log.message, language)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {log.operator ?? translateUi('System', language)} ·{' '}
                {log.motorId ?? translateUi('station event', language)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState label="No station log rows near this timestamp." />
      )}
    </section>
  )
}

function DefectsPanel({
  defects,
  locale,
}: {
  defects: DefectRecord[]
  locale: ReturnType<typeof dateFnsLocale>
}) {
  const { language } = useLanguage()
  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-900">
        Timestamped defect records
      </h3>
      {defects.length > 0 ? (
        <div className="mt-3 space-y-2">
          {defects.map((defect) => (
            <div
              key={defect.id}
              className="rounded-lg border border-[var(--color-border)] bg-white p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-[var(--color-accent)]">
                  {defect.code}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 ring-1 ring-slate-200">
                  {translateUi(defect.severity, language)}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {format(new Date(defect.at), 'HH:mm:ss', { locale })}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">
                {translateUi(defect.description, language)}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                {translateUi('Evidence:', language)}{' '}
                {defect.evidenceIds.join(', ') || '-'} ·{' '}
                {translateUi('Cleared:', language)}{' '}
                {defect.clearedAt
                  ? format(new Date(defect.clearedAt), 'HH:mm:ss', { locale })
                  : '-'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState label="No defect record attached to this event." />
      )}
    </section>
  )
}

function ShiftPanel({
  shift,
  stationId,
  locale,
}: {
  shift?: ShiftRollup
  stationId: string
  locale: ReturnType<typeof dateFnsLocale>
}) {
  if (!shift) {
    return <EmptyState label="No shift analytics found for this event time." />
  }

  const stationCycle = shift.meanCycleSecByStation.find(
    (station) => station.stationId === stationId,
  )

  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Shift-level analytics
          </h3>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {shift.label} · {format(new Date(shift.startedAt), 'HH:mm', { locale })}
            -
            {format(new Date(shift.endedAt), 'HH:mm', { locale })}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <Metric label="Pass" value={shift.unitsPassed} tone="emerald" />
          <Metric label="Fail" value={shift.unitsFailed} tone="red" />
          <Metric label="Alarms" value={shift.alarmsOpened} tone="amber" />
          <Metric
            label="Cycle"
            value={stationCycle ? `${stationCycle.sec}s` : '-'}
            tone="slate"
          />
        </div>
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: 'emerald' | 'red' | 'amber' | 'slate'
}) {
  const color = {
    emerald: 'text-emerald-700',
    red: 'text-red-600',
    amber: 'text-amber-700',
    slate: 'text-slate-900',
  }[tone]

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase text-slate-500">
        {label}
      </p>
      <p className={clsx('mt-1 font-mono text-lg', color)}>{value}</p>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 ring-1 ring-slate-200">
      {label}
    </p>
  )
}
