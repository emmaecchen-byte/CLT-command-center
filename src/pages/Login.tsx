import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Activity, Languages, Lock, User } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { MOCK_ACCOUNTS } from '../auth/mockUsers'
import { useLanguage, type Language } from '../i18n/LanguageContext'

const fieldLabelClass = (language: Language) =>
  language === 'zh'
    ? 'mb-1 block text-xs font-semibold tracking-normal text-slate-500'
    : 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500'

const sectionTitleClass = (language: Language) =>
  language === 'zh'
    ? 'text-xs font-semibold tracking-normal text-slate-500'
    : 'text-xs font-semibold uppercase tracking-wider text-slate-500'

export function LoginPage() {
  const { user, login } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const ok = login(username, password)
    if (!ok) {
      setError('Unknown user or wrong password.')
      return
    }
    navigate(from.startsWith('/login') ? '/dashboard' : from, { replace: true })
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-slate-50">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={toggleLanguage}
          data-no-translate
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50"
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
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30">
            <Activity className="size-8" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            CLT Command Center
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in for a role-based dashboard. Demo passwords only.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="user"
                className={fieldLabelClass(language)}
              >
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="user"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none ring-0 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/25"
                  placeholder="e.g. qc"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="pass"
                className={fieldLabelClass(language)}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="pass"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/25"
                  placeholder="••••••"
                />
              </div>
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:opacity-90"
            >
              Sign in
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white/80 p-4">
          <p className={sectionTitleClass(language)}>
            Demo accounts
          </p>
          <ul className="mt-3 space-y-2 font-mono text-xs text-slate-700">
            {MOCK_ACCOUNTS.map((a) => (
              <li key={a.username} className="flex justify-between gap-2">
                <span className="text-[var(--color-accent)]">{a.username}</span>
                <span className="text-slate-500">{a.password}</span>
                <span className="shrink-0 text-slate-400">({a.role})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
