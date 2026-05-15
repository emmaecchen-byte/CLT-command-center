import { clsx } from 'clsx'
import { Menu } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { LayoutNavProvider, useLayoutNav } from './LayoutNavContext'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

function AppShellBody() {
  const { pathname } = useLocation()
  const isLive = pathname.startsWith('/live/')
  const { clickedOpen, hoverOpen, setHoverOpen, toggleClicked, closeNav } =
    useLayoutNav()

  const showSidebar = clickedOpen || hoverOpen

  return (
    <div className="flex min-h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden bg-white">
      <TopBar />

      {clickedOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[35] cursor-default bg-black/45 lg:bg-black/20"
          aria-label="Close navigation"
          onClick={closeNav}
        />
      )}

      {/* One drawer: mobile = slide in/out; lg+ = narrow rail that expands on hover or click */}
      <aside
        id="app-sidebar"
        className={clsx(
          'fixed left-0 top-14 z-[40] flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-panel)] shadow-xl transition-[width,transform] duration-200 ease-out',
          'w-[min(18rem,88vw)] max-w-[100vw]',
          showSidebar ? 'translate-x-0' : '-translate-x-full max-lg:pointer-events-none',
          'lg:translate-x-0',
          showSidebar ? 'lg:w-[17rem]' : 'lg:w-12',
        )}
        onMouseEnter={() => {
          if (
            typeof window !== 'undefined' &&
            window.matchMedia('(hover: hover)').matches
          ) {
            setHoverOpen(true)
          }
        }}
        onMouseLeave={() => {
          if (!clickedOpen) setHoverOpen(false)
        }}
      >
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-row">
          <div className="hidden w-12 shrink-0 flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-panel)] pt-3 lg:flex">
            <button
              type="button"
              onClick={toggleClicked}
              aria-expanded={showSidebar}
              aria-controls="app-sidebar-nav"
              className="rounded-lg p-2 text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-100 hover:text-slate-900"
              title="Menu"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
          <div
            id="app-sidebar-nav"
            className={clsx(
              'flex min-h-0 min-w-0 flex-col overflow-y-auto transition-opacity duration-200 ease-out',
              'max-lg:w-full',
              showSidebar
                ? 'min-w-0 flex-1 opacity-100'
                : 'pointer-events-none w-0 flex-none overflow-hidden opacity-0',
            )}
          >
            <Sidebar />
          </div>
        </div>
      </aside>

      <main
        className={clsx(
          'min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto lg:pl-12',
          isLive ? 'p-2 sm:p-3 md:p-4' : 'p-3 sm:p-4 md:p-6',
        )}
      >
        <Outlet />
      </main>
    </div>
  )
}

export function AppShell() {
  return (
    <LayoutNavProvider>
      <AppShellBody />
    </LayoutNavProvider>
  )
}
