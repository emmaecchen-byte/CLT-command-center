import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Camera,
  Cpu,
  FileSearch,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Video,
  Wrench,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { canAccessPath, roleTitle } from '../../auth/permissions'
import type { UserRole } from '../../auth/types'
import { useLayoutNav } from './LayoutNavContext'

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors'

type NavDef = { to: string; label: string; icon: LucideIcon; roles: UserRole[] }

const homeNav: NavDef[] = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, roles: ['qc', 'management', 'engineer'] },
]

const liveNav: NavDef[] = [
  {
    to: '/live/motors',
    label: 'Live · Motor QC',
    icon: Cpu,
    roles: ['qc', 'management', 'engineer'],
  },
  {
    to: '/live/people',
    label: 'Live · People',
    icon: Users,
    roles: ['qc', 'management', 'engineer'],
  },
]

const opsNav: NavDef[] = [
  {
    to: '/history',
    label: 'History',
    icon: FileSearch,
    roles: ['qc', 'management', 'engineer'],
  },
  {
    to: '/alarms',
    label: 'Alarm management',
    icon: AlertTriangle,
    roles: ['qc', 'management', 'engineer'],
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    roles: ['management', 'engineer'],
  },
  {
    to: '/diagnostics',
    label: 'Camera diagnostics',
    icon: Video,
    roles: ['management', 'engineer'],
  },
  {
    to: '/admin',
    label: 'Admin / Config',
    icon: Settings,
    roles: ['management', 'engineer'],
  },
]

const stationLinks: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/station/st-a1', label: 'Rotor Press A1', icon: Wrench },
  { to: '/station/st-b2', label: 'Stator Wind B2', icon: Camera },
  { to: '/station/st-c3', label: 'Final Assembly C3', icon: Camera },
  { to: '/station/st-d4', label: 'Encoder D4', icon: Camera },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const { closeNav } = useLayoutNav()
  if (!user) return null

  const filter = (items: NavDef[]) =>
    items.filter((i) => i.roles.includes(user.role))

  const showStations = canAccessPath(user.role, '/station/st-a1')

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-panel)]">
      <div className="border-b border-[var(--color-border)] px-4 py-4">
        <div className="flex items-center gap-2 text-[var(--color-accent)]">
          <Activity className="size-5" aria-hidden />
          <span className="font-semibold tracking-tight text-slate-900">
            CLT Command
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Motor Mfg · YOLO QC</p>
        <p className="mt-2 rounded-md bg-slate-100 px-2 py-1.5 text-[10px] leading-snug text-slate-600 ring-1 ring-slate-200">
          <span className="font-semibold text-slate-800">
            {roleTitle(user.role)}
          </span>
          <br />
          <span className="text-slate-500">{user.displayName}</span>
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        {filter(homeNav).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => closeNav()}
            className={({ isActive }) =>
              clsx(
                linkBase,
                isActive
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
              )
            }
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </NavLink>
        ))}
        <div className="my-2 border-t border-[var(--color-border)]" />
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Live cameras
        </p>
        {filter(liveNav).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => closeNav()}
            className={({ isActive }) =>
              clsx(
                linkBase,
                isActive
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
              )
            }
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </NavLink>
        ))}
        {filter(opsNav).length > 0 && (
          <>
            <div className="my-2 border-t border-[var(--color-border)]" />
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Operations
            </p>
            {filter(opsNav).map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => closeNav()}
                className={({ isActive }) =>
                  clsx(
                    linkBase,
                    isActive
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
                  )
                }
              >
                <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                {label}
              </NavLink>
            ))}
          </>
        )}
        {showStations && (
          <>
            <div className="my-2 border-t border-[var(--color-border)]" />
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Stations
            </p>
            {stationLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => closeNav()}
                className={({ isActive }) =>
                  clsx(
                    linkBase,
                    isActive
                      ? 'bg-slate-200 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="border-t border-[var(--color-border)] p-3">
        <button
          type="button"
          onClick={() => {
            closeNav()
            logout()
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-800"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  )
}
