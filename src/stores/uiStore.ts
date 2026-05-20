import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode } from '@/types'

interface UIState {
  theme: ThemeMode
  sidebarOpen: boolean
  sidebarWidth: number
  commandPaletteOpen: boolean
  shortcutsOpen: boolean
  focusMode: boolean
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  setCommandPaletteOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void
  toggleFocusMode: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarWidth: 260,
      commandPaletteOpen: false,
      shortcutsOpen: false,
      focusMode: false,

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      setShortcutsOpen: (open) => set({ shortcutsOpen: open }),

      toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
    }),
    {
      name: 'cortex-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        sidebarWidth: state.sidebarWidth,
      }),
    },
  ),
)
