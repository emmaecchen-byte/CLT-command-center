import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { canAccessPath } from '../auth/permissions'
import { useAuth } from '../auth/useAuth'
import { AlertPanel } from '../components/live/AlertPanel'
import { CameraTile } from '../components/live/CameraTile'
import type { CameraMonitorKind } from '../types'
import {
  activeAlarmsSummary,
  alarms,
  camerasMotor,
  camerasPeople,
} from '../data/mock'

const copy: Record<
  CameraMonitorKind,
  { title: string; blurb: string; otherPath: string; otherLabel: string }
> = {
  motor: {
    title: 'Live · Motor QC',
    blurb:
      'Product-only views: rotor, wind, encoder, and assembly YOLO overlays (classes, process steps, confidence). Use the people view for operator cameras.',
    otherPath: '/live/people',
    otherLabel: 'Switch to people monitoring',
  },
  people: {
    title: 'Live · People monitoring',
    blurb:
      'Operator presence, PPE, zones, and ergonomics — separate from motor QC so product detections are not mixed with person models.',
    otherPath: '/live/motors',
    otherLabel: 'Switch to motor QC',
  },
}

function gridClassFor(kind: CameraMonitorKind) {
  /* Fewer columns = wider tiles and taller 16:9 previews. */
  if (kind === 'motor')
    return 'grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-2 xl:gap-6'
  return 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6'
}

export function LiveMonitoringPage({ kind }: { kind: CameraMonitorKind }) {
  const { user } = useAuth()
  const [panelAlarms, setPanelAlarms] = useState(activeAlarmsSummary)
  const summaryList = useMemo(() => panelAlarms, [panelAlarms])
  const feeds = kind === 'motor' ? camerasMotor : camerasPeople
  const meta = copy[kind]

  function acknowledgeFirst() {
    if (!panelAlarms.length) return
    setPanelAlarms((prev) => prev.slice(1))
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {meta.title}
          </h1>
          <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-slate-500 sm:line-clamp-none">
            {meta.blurb}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {user && canAccessPath(user.role, meta.otherPath) && (
            <Link
              to={meta.otherPath}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 hover:text-slate-900"
            >
              {meta.otherLabel}
            </Link>
          )}
          {user && canAccessPath(user.role, '/alarms') && (
            <Link
              to={`/alarms?focus=${alarms[0]?.id ?? ''}`}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 hover:text-slate-900"
            >
              Open alarm desk
            </Link>
          )}
        </div>
      </div>

      {/* Cameras use full content width; alerts dock underneath so tiles stay wide. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div
          className={`min-h-0 flex-1 ${gridClassFor(kind)} auto-rows-min pb-1`}
        >
          {feeds.map((c) => (
            <CameraTile key={c.id} camera={c} showConfidence />
          ))}
        </div>
        <AlertPanel
          alarms={summaryList}
          onAcknowledge={acknowledgeFirst}
          variant="dock"
        />
      </div>
    </div>
  )
}
