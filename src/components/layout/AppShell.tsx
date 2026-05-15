import { clsx } from 'clsx'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const { pathname } = useLocation()
  const isLive = pathname.startsWith('/live/')

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main
          className={clsx(
            'min-w-0 flex-1 overflow-auto',
            isLive ? 'p-3 sm:p-4' : 'p-6',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
