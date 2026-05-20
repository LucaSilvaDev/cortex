import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Resizer } from './Resizer'
import { CommandPalette } from '@/components/CommandPalette'
import { ShortcutsModal } from '@/components/ShortcutsModal'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const theme = useUIStore((s) => s.theme)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const sidebarWidth = useUIStore((s) => s.sidebarWidth)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen)
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)
  const shortcutsOpen = useUIStore((s) => s.shortcutsOpen)
  const { isLoaded, load } = useWorkspaceStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (!isLoaded) load()
  }, [isLoaded, load])

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable

      // Ctrl+K / Cmd+K — command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      // Escape — close any open overlay
      if (e.key === 'Escape') {
        if (commandPaletteOpen) { setCommandPaletteOpen(false); return }
        if (shortcutsOpen) { setShortcutsOpen(false); return }
      }

      if (inInput) return

      // ? — shortcuts modal
      if (e.key === '?') {
        setShortcutsOpen(true)
        return
      }

      // Alt+T — toggle theme
      if (e.altKey && e.key === 't') {
        e.preventDefault()
        toggleTheme()
        return
      }

      // Alt+S — toggle sidebar
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        toggleSidebar()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, shortcutsOpen, setCommandPaletteOpen, setShortcutsOpen, toggleTheme, toggleSidebar])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {sidebarOpen && (
        <>
          <Sidebar width={sidebarWidth} />
          <Resizer />
        </>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      <CommandPalette />
      <ShortcutsModal />
    </div>
  )
}
