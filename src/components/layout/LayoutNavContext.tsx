import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/* eslint-disable react-refresh/only-export-components -- paired provider + hook */

type LayoutNavContextValue = {
  /** Tap-to-open drawer (mobile + desktop fallback) */
  clickedOpen: boolean
  /** Hover-open from menu rail (large screens, fine pointer) */
  hoverOpen: boolean
  setClickedOpen: (open: boolean) => void
  setHoverOpen: (open: boolean) => void
  toggleClicked: () => void
  closeNav: () => void
}

const LayoutNavContext = createContext<LayoutNavContextValue | null>(null)

export function LayoutNavProvider({ children }: { children: ReactNode }) {
  const [clickedOpen, setClickedOpen] = useState(false)
  const [hoverOpen, setHoverOpen] = useState(false)

  const toggleClicked = useCallback(() => {
    setClickedOpen((o) => !o)
  }, [])

  const closeNav = useCallback(() => {
    setClickedOpen(false)
    setHoverOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      clickedOpen,
      hoverOpen,
      setClickedOpen,
      setHoverOpen,
      toggleClicked,
      closeNav,
    }),
    [clickedOpen, hoverOpen, toggleClicked, closeNav],
  )

  return (
    <LayoutNavContext.Provider value={value}>{children}</LayoutNavContext.Provider>
  )
}

export function useLayoutNav() {
  const ctx = useContext(LayoutNavContext)
  if (!ctx) {
    throw new Error('useLayoutNav must be used within LayoutNavProvider')
  }
  return ctx
}
