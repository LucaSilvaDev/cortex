import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Moon,
  PanelLeft,
  Sun,
  X,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { usePageStore } from '@/stores/pageStore'
import { useSearch } from '@/hooks/useSearch'
import { cn } from '@/lib/utils'

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen)

  const { workspaces } = useWorkspaceStore()
  const { pages } = usePageStore()

  const [query, setQuery] = useState('')
  const searchResults = useSearch(query)

  const navigate = useNavigate()

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  function goToPage(pageId: string, workspaceId: string) {
    navigate(`/w/${workspaceId}/p/${pageId}`)
    setOpen(false)
  }

  const recentPages = pages
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6)

  const displayedPages = query.trim() ? searchResults : recentPages.map((p) => ({ ...p, score: 0 }))

  return (
    <AnimatePresence>
      {open && (
    <motion.div
      key="palette-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative w-full max-w-lg mx-4"
      >
        <Command
          className="bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          shouldFilter={false}
          loop
        >
          {/* Input */}
          <div className="flex items-center px-4 border-b border-border">
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Buscar páginas, comandos…"
              className={cn(
                'flex-1 h-12 bg-transparent text-foreground text-sm',
                'placeholder:text-muted-foreground outline-none',
              )}
              autoFocus
            />
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>

          <Command.List className="max-h-96 overflow-y-auto py-2">
            <Command.Empty className="px-4 py-8 text-sm text-muted-foreground text-center">
              Nenhum resultado para "{query}"
            </Command.Empty>

            {/* Pages */}
            {displayedPages.length > 0 && (
              <Command.Group
                heading={query.trim() ? 'Resultados' : 'Páginas recentes'}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {displayedPages.map((result) => {
                  const ws = workspaces.find((w) => w.id === result.workspaceId)
                  return (
                    <Command.Item
                      key={result.id}
                      value={result.id}
                      onSelect={() => goToPage(result.id, result.workspaceId)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 mx-1 rounded-lg cursor-pointer',
                        'text-sm text-foreground transition-colors',
                        'aria-selected:bg-primary/12 aria-selected:text-foreground',
                        'hover:bg-secondary/60',
                      )}
                    >
                      <FileText size={14} className="shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{result.title || 'Sem título'}</span>
                      {ws && (
                        <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {ws.name}
                        </span>
                      )}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}

            {/* Actions */}
            {!query.trim() && (
              <Command.Group
                heading="Ações"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                <Command.Item
                  value="toggle-theme"
                  onSelect={() => { toggleTheme(); setOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 mx-1 rounded-lg cursor-pointer',
                    'text-sm text-foreground transition-colors',
                    'aria-selected:bg-primary/12',
                    'hover:bg-secondary/60',
                  )}
                >
                  {theme === 'dark'
                    ? <Sun size={14} className="shrink-0 text-muted-foreground" />
                    : <Moon size={14} className="shrink-0 text-muted-foreground" />}
                  <span>Alternar tema ({theme === 'dark' ? 'claro' : 'escuro'})</span>
                  <kbd className="ml-auto text-xs text-muted-foreground font-mono">⌥T</kbd>
                </Command.Item>

                <Command.Item
                  value="toggle-sidebar"
                  onSelect={() => { toggleSidebar(); setOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 mx-1 rounded-lg cursor-pointer',
                    'text-sm text-foreground transition-colors',
                    'aria-selected:bg-primary/12',
                    'hover:bg-secondary/60',
                  )}
                >
                  <PanelLeft size={14} className="shrink-0 text-muted-foreground" />
                  <span>Alternar sidebar</span>
                  <kbd className="ml-auto text-xs text-muted-foreground font-mono">⌥S</kbd>
                </Command.Item>

                <Command.Item
                  value="shortcuts"
                  onSelect={() => { setShortcutsOpen(true); setOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 mx-1 rounded-lg cursor-pointer',
                    'text-sm text-foreground transition-colors',
                    'aria-selected:bg-primary/12',
                    'hover:bg-secondary/60',
                  )}
                >
                  <span className="text-muted-foreground text-sm leading-none shrink-0">⌨</span>
                  <span>Ver atalhos de teclado</span>
                  <kbd className="ml-auto text-xs text-muted-foreground font-mono">?</kbd>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>

          <div className="px-3 py-2 border-t border-border flex items-center gap-3">
            <span className="text-xs text-muted-foreground">↑↓ navegar</span>
            <span className="text-xs text-muted-foreground">↵ selecionar</span>
            <span className="text-xs text-muted-foreground">Esc fechar</span>
          </div>
        </Command>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
