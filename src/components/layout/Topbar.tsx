import { Check, ChevronRight, Download, FileText, GitFork, Loader2, Maximize2, PanelLeft, Printer, Save, Search, Sun, Moon } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { usePageStore } from '@/stores/pageStore'
import { invokeSave, getPageData, getPageHtml } from '@/lib/savebridge'
import { exportAsMarkdown } from '@/lib/markdownExport'
import { exportAsPdf } from '@/lib/pdfExport'
import { cn } from '@/lib/utils'

type SaveState = 'idle' | 'saving' | 'saved'

export function Topbar() {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const { workspaces, activeWorkspaceId } = useWorkspaceStore()
  const { folders, pages } = usePageStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { workspaceId: routeWorkspaceId, pageId } = useParams<{ workspaceId?: string; pageId?: string }>()
  const isGraphView = location.pathname.endsWith('/graph')

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exportOpen) return
    function onClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [exportOpen])

  function handleExportMarkdown() {
    const data = getPageData()
    if (!data) return
    exportAsMarkdown(data.title || 'Sem título', data.content)
    setExportOpen(false)
  }

  function handleExportPdf() {
    const data = getPageData()
    const html = getPageHtml()
    if (!data) return
    exportAsPdf(data.title || 'Sem título', html)
    setExportOpen(false)
  }

  async function handleSave() {
    if (saveState === 'saving') return
    setSaveState('saving')
    await invokeSave()
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  // Ctrl+S
  useEffect(() => {
    if (!pageId) return
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pageId, saveState])

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const activePage = pages.find((p) => p.id === pageId)
  const activeFolder = activePage?.folderId
    ? folders.find((f) => f.id === activePage.folderId)
    : null

  const crumbs: string[] = []
  if (activeWorkspace) crumbs.push(activeWorkspace.name)
  if (activeFolder) crumbs.push(activeFolder.name || 'Nova pasta')
  if (activePage) crumbs.push(activePage.title || 'Sem título')

  return (
    <header className="flex items-center h-12 px-3 border-b border-border bg-surface shrink-0 gap-1">
      <button
        onClick={toggleSidebar}
        className={cn(
          'p-1.5 rounded-md text-muted-foreground',
          'hover:text-foreground hover:bg-secondary',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label="Alternar sidebar"
      >
        <PanelLeft size={16} />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Localização atual" className="flex items-center flex-1 min-w-0 px-1 gap-1">
        {crumbs.length === 0 ? (
          <span className="text-sm text-muted-foreground">Cortex</span>
        ) : (
          crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={13} className="text-muted-foreground/50 shrink-0" />}
              <span
                className={cn(
                  'text-sm truncate',
                  i === crumbs.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground',
                )}
              >
                {crumb}
              </span>
            </span>
          ))
        )}
      </nav>

      {(routeWorkspaceId ?? activeWorkspaceId) && (
        <button
          onClick={() => {
            const wsId = routeWorkspaceId ?? activeWorkspaceId
            if (wsId) navigate(isGraphView ? `/w/${wsId}` : `/w/${wsId}/graph`)
          }}
          className={cn(
            'p-1.5 rounded-md transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isGraphView
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
          )}
          aria-label={isGraphView ? 'Voltar para notas' : 'Ver grafo de conhecimento'}
        >
          <GitFork size={16} />
        </button>
      )}

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className={cn(
          'hidden sm:flex items-center gap-2 px-2.5 h-7 rounded-md',
          'text-xs text-muted-foreground bg-secondary/60 border border-border',
          'hover:text-foreground hover:bg-secondary transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label="Abrir paleta de comandos"
      >
        <Search size={12} />
        <span>Buscar…</span>
        <kbd className="text-xs opacity-60">Ctrl K</kbd>
      </button>

      {/* Focus mode button — only on page views */}
      {pageId && (
        <button
          onClick={toggleFocusMode}
          title="Modo foco (F11)"
          className={cn(
            'p-1.5 rounded-md text-muted-foreground',
            'hover:text-foreground hover:bg-secondary',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label="Modo foco"
        >
          <Maximize2 size={16} />
        </button>
      )}

      {/* Export dropdown — only on page views */}
      {pageId && (
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            title="Exportar página"
            className={cn(
              'p-1.5 rounded-md text-muted-foreground',
              'hover:text-foreground hover:bg-secondary',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              exportOpen && 'text-foreground bg-secondary',
            )}
            aria-label="Exportar página"
          >
            <Download size={16} />
          </button>

          {exportOpen && (
            <div className="cortex-popup absolute right-0 top-full mt-1.5 w-44 bg-surface border border-border rounded-lg shadow-lg shadow-black/30 py-1 z-50">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary/60 transition-colors"
              >
                <FileText size={13} className="text-muted-foreground" />
                Markdown (.md)
              </button>
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary/60 transition-colors"
              >
                <Printer size={13} className="text-muted-foreground" />
                PDF / Imprimir
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save button — only on page views */}
      {pageId && (
        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          title="Salvar (Ctrl+S)"
          className={cn(
            'press-scale flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-medium',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            saveState === 'saved'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
          )}
          aria-label="Salvar página"
        >
          {saveState === 'saving' ? (
            <Loader2 size={12} className="animate-spin" />
          ) : saveState === 'saved' ? (
            <Check size={12} />
          ) : (
            <Save size={12} />
          )}
          <span>
            {saveState === 'saving' ? 'Salvando…' : saveState === 'saved' ? 'Salvo' : 'Salvar'}
          </span>
          {saveState === 'idle' && (
            <kbd className="text-[10px] opacity-40 font-mono">Ctrl+S</kbd>
          )}
        </button>
      )}

      <button
        onClick={toggleTheme}
        className={cn(
          'p-1.5 rounded-md text-muted-foreground',
          'hover:text-foreground hover:bg-secondary',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  )
}
