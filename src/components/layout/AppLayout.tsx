import { useEffect, useRef, useState } from 'react'
import { Toaster } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { Minimize2 } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuthStore } from '@/stores/authStore'
import { AuthPage } from '@/pages/AuthPage'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Resizer } from './Resizer'
import { CommandPalette } from '@/components/CommandPalette'
import { ShortcutsModal } from '@/components/ShortcutsModal'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const theme = useUIStore((s) => s.theme)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const sidebarWidth = useUIStore((s) => s.sidebarWidth)
  const focusMode = useUIStore((s) => s.focusMode)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen)
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)
  const shortcutsOpen = useUIStore((s) => s.shortcutsOpen)
  const { isLoaded, load } = useWorkspaceStore()
  const { user, loading: authLoading, init } = useAuthStore()

  useEffect(() => { init() }, [init])

  const [transitioning, setTransitioning] = useState(false)
  const prevOpenRef = useRef(sidebarOpen)
  useEffect(() => {
    if (sidebarOpen !== prevOpenRef.current) {
      prevOpenRef.current = sidebarOpen
      setTransitioning(true)
      const t = setTimeout(() => setTransitioning(false), 320)
      return () => clearTimeout(t)
    }
  }, [sidebarOpen])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (user && !isLoaded) load()
  }, [user, isLoaded, load])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      if (e.key === 'Escape') {
        if (focusMode) { toggleFocusMode(); return }
        if (commandPaletteOpen) { setCommandPaletteOpen(false); return }
        if (shortcutsOpen) { setShortcutsOpen(false); return }
      }

      if (e.key === 'F11') {
        e.preventDefault()
        toggleFocusMode()
        return
      }

      if (inInput) return

      if (e.key === '?') { setShortcutsOpen(true); return }
      if (e.altKey && e.key === 't') { e.preventDefault(); toggleTheme(); return }
      if (e.altKey && e.key === 's') { e.preventDefault(); toggleSidebar(); return }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusMode, commandPaletteOpen, shortcutsOpen, setCommandPaletteOpen, setShortcutsOpen, toggleTheme, toggleSidebar, toggleFocusMode])

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <div className="flex h-screen w-full overflow-hidden text-foreground">
      {/* Sidebar — hidden in focus mode */}
      <AnimatePresence initial={false}>
        {!focusMode && (
          <motion.div
            initial={false}
            animate={{ width: sidebarOpen ? sidebarWidth : 0 }}
            className={cn(
              'overflow-hidden shrink-0',
              transitioning && 'transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            )}
          >
            <div style={{ width: sidebarWidth }} className="h-full">
              <Sidebar width={sidebarWidth} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!focusMode && sidebarOpen && <Resizer />}

      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar — hidden in focus mode */}
        <AnimatePresence initial={false}>
          {!focusMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Topbar />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Focus mode exit button */}
      <AnimatePresence>
        {focusMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={toggleFocusMode}
            title="Sair do modo foco (Esc ou F11)"
            className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/80 backdrop-blur-sm border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface transition-colors shadow-lg"
          >
            <Minimize2 size={13} />
            Sair do foco
          </motion.button>
        )}
      </AnimatePresence>

      <CommandPalette />
      <ShortcutsModal />

      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}
