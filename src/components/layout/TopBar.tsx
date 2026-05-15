import { AlertTriangle, CircleDot, Languages, Menu, Video } from 'lucide-react'
import { plantMetrics } from '../../data/mock'
import type { PlantStatus } from '../../types'
import { useAuth } from '../../auth/useAuth'
import { roleTitle } from '../../auth/permissions'
import { useLanguage, type Language } from '../../i18n/LanguageContext'
import { useLayoutNav } from './LayoutNavContext'

function statusPill(status: PlantStatus) {
  const map = {
    running: {
      label: 'Running',
      className: 'bg-emerald-500/15 text-emerald-800 ring-emerald-600/35',
    },
    degraded: {
      label: 'Degraded',
      className: 'bg-amber-500/15 text-amber-900 ring-amber-600/35',
    },
    stopped: {
      label: 'Stopped',
      className: 'bg-red-500/15 text-red-800 ring-red-600/35',
    },
  }
  const s = map[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.className}`}
    >
      <CircleDot className="size-3" aria-hidden />
      {s.label}
    </span>
  )
}

const metricLabelClass = (language: Language) =>
  language === 'zh'
    ? 'whitespace-nowrap text-xs font-medium tracking-normal text-slate-500'
    : 'whitespace-nowrap text-xs font-medium uppercase tracking-wider text-slate-500'

export function TopBar() {
  const { user } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const { clickedOpen, hoverOpen, toggleClicked } = useLayoutNav()
  const { status, activeAlarms, camerasOnline, camerasTotal } = plantMetrics
  const navOpen = clickedOpen || hoverOpen
  const metricsAria =
    language === 'zh' ? '工厂概览：状态、警报与摄像头' : 'Plant summary metrics'
  return (
    <header
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      className="flex min-h-14 shrink-0 flex-col gap-2 border-b border-[var(--color-border)] bg-[var(--color-panel)] py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-3 sm:py-2 lg:px-6"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-row items-center gap-2 px-3 sm:px-0">
          <button
            type="button"
            onClick={toggleClicked}
            aria-expanded={navOpen}
            aria-controls="app-sidebar"
            className="shrink-0 rounded-lg p-2 text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            title="Menu"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <div
            className="topbar-metrics-scroll flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:min-h-0 sm:pr-1"
            role="region"
            aria-label={metricsAria}
          >
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className={metricLabelClass(language)}>
            Plant status
          </span>
          {statusPill(status)}
        </div>
        <div
          className="mx-4 h-6 w-px shrink-0 self-center bg-[var(--color-border)] sm:mx-5"
          aria-hidden
        />
        <div className="flex shrink-0 items-center gap-2">
          <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
          <span className={metricLabelClass(language)}>
            Active alarms
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums text-amber-700">
            {activeAlarms}
          </span>
        </div>
        <div
          className="mx-4 h-6 w-px shrink-0 self-center bg-[var(--color-border)] sm:mx-5"
          aria-hidden
        />
        <div className="flex shrink-0 items-center gap-2 pr-1">
          <Video className="size-4 shrink-0 text-[var(--color-accent)]" aria-hidden />
          <span className={metricLabelClass(language)}>
            Cameras online
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums text-slate-900">
            {camerasOnline}
            <span className="text-slate-400">/{camerasTotal}</span>
          </span>
        </div>
      </div>
      </div>
      </div>
      <div className="shrink-0 border-t border-[var(--color-border)] px-3 py-1 text-right sm:border-t-0 sm:border-l sm:border-[var(--color-border)] sm:py-0 sm:pl-4 lg:pl-6">
        <div className="flex items-center justify-end gap-3">
          <div>
            {user && (
              <p className="text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">{user.username}</span>
                <span className="text-slate-400"> · </span>
                <span>{roleTitle(user.role)}</span>
              </p>
            )}
            <p className="text-xs text-slate-500">Shift</p>
            <p className="text-sm font-medium text-slate-800">Day A · Line 1–2</p>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            data-no-translate
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
            aria-label={
              language === 'en'
                ? 'Translate page to Chinese'
                : 'Translate page to English'
            }
          >
            <Languages className="size-3.5" aria-hidden />
            {language === 'en' ? '中文' : 'English'}
          </button>
        </div>
      </div>
    </header>
  )
}
