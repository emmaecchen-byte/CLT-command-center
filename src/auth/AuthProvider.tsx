import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import type { AuthUser } from './types'
import { MOCK_ACCOUNTS } from './mockUsers'

const STORAGE_KEY = 'qc-command-center-auth'

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (parsed?.username && parsed?.role) return parsed
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  const login = useCallback((username: string, password: string) => {
    const u = username.trim().toLowerCase()
    const row = MOCK_ACCOUNTS.find(
      (a) => a.username.toLowerCase() === u && a.password === password,
    )
    if (!row) return false
    const next: AuthUser = {
      username: row.username,
      displayName: row.displayName,
      role: row.role,
    }
    setUser(next)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
