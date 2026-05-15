import type { UserRole } from './types'

/** Path prefixes the role may open (pathname only, no query). */
const PATH_PREFIXES: Record<UserRole, string[]> = {
  qc: [
    '/dashboard',
    '/live/motors',
    '/live/people',
    '/alarms',
    '/history',
  ],
  management: [
    '/dashboard',
    '/live/motors',
    '/live/people',
    '/alarms',
    '/history',
    '/analytics',
    '/diagnostics',
    '/admin',
    '/station',
  ],
  engineer: [
    '/dashboard',
    '/live/motors',
    '/live/people',
    '/alarms',
    '/analytics',
    '/admin',
    '/diagnostics',
    '/station',
    '/history',
  ],
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  const raw = pathname.replace(/\/$/, '') || '/'
  const path = raw === '/' ? '/dashboard' : raw
  const prefixes = PATH_PREFIXES[role]
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`))
}

export function preferredLiveHub(role: UserRole): string {
  if (canAccessPath(role, '/live/motors')) return '/live/motors'
  if (canAccessPath(role, '/live/people')) return '/live/people'
  return '/dashboard'
}

export function roleTitle(role: UserRole): string {
  const m: Record<UserRole, string> = {
    qc: 'QC personnel',
    management: 'Management',
    engineer: 'Engineer',
  }
  return m[role]
}
