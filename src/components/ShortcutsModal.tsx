import { X } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const SHORTCUTS = [
  {
    group: 'Geral',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Abrir paleta de comandos' },
      { keys: ['?'], description: 'Ver atalhos de teclado' },
      { keys: ['Alt', 'T'], description: 'Alternar tema claro/escuro' },
      { keys: ['Alt', 'S'], description: 'Alternar sidebar' },
    ],
  },
  {
    group: 'Editor',
    items: [
      { keys: ['/'], description: 'Menu de comandos (slash)' },
      { keys: ['Ctrl', 'B'], description: 'Negrito' },
      { keys: ['Ctrl', 'I'], description: 'Itálico' },
      { keys: ['Ctrl', 'U'], description: 'Sublinhado' },
      { keys: ['Ctrl', 'Shift', 'S'], description: 'Tachado' },
      { keys: ['Ctrl', '`'], description: 'Código inline' },
      { keys: ['Ctrl', 'Z'], description: 'Desfazer' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Refazer' },
    ],
  },
  {
    group: 'Formatação de bloco',
    items: [
      { keys: ['# ', 'Espaço'], description: 'Título H1' },
      { keys: ['## ', 'Espaço'], description: 'Título H2' },
      { keys: ['### ', 'Espaço'], description: 'Título H3' },
      { keys: ['- ', 'Espaço'], description: 'Lista com marcadores' },
      { keys: ['1. ', 'Espaço'], description: 'Lista numerada' },
      { keys: ['[ ] ', 'Espaço'], description: 'Checklist' },
      { keys: ['> ', 'Espaço'], description: 'Citação' },
      { keys: ['---'], description: 'Divisor horizontal' },
    ],
  },
]

function Kbd({ children }: { children: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'px-1.5 py-0.5 min-w-[1.5rem]',
        'text-xs font-mono text-muted-foreground',
        'bg-secondary border border-border rounded',
      )}
    >
      {children}
    </kbd>
  )
}

export function ShortcutsModal() {
  const open = useUIStore((s) => s.shortcutsOpen)
  const setOpen = useUIStore((s) => s.setShortcutsOpen)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Atalhos de teclado"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-lg mx-4 max-h-[80vh] flex flex-col bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Atalhos de teclado</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-6">
          {SHORTCUTS.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                {group.group}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.description} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-foreground">{item.description}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
                          <Kbd>{key}</Kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
