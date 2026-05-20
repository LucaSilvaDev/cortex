import { Extension } from '@tiptap/core'
import type { Editor, Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { createRoot, type Root } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Info,
  List,
  ListOrdered,
  Minus,
  Quote,
  Type,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────

interface SlashCommandItem {
  title: string
  description: string
  Icon: React.ComponentType<{ size?: number | string; className?: string; strokeWidth?: number | string }>
  keywords: string[]
  command: (editor: Editor, range: Range) => void
}

// ─── Commands list ───────────────────────────────────────────────────

const COMMANDS: SlashCommandItem[] = [
  {
    title: 'Parágrafo',
    description: 'Texto simples',
    Icon: Type,
    keywords: ['paragraph', 'text', 'normal', 'plain'],
    command: (e, r) => e.chain().focus().deleteRange(r).setParagraph().run(),
  },
  {
    title: 'Título 1',
    description: 'Cabeçalho grande',
    Icon: Heading1,
    keywords: ['h1', 'heading', 'title', 'big'],
    command: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 1 }).run(),
  },
  {
    title: 'Título 2',
    description: 'Cabeçalho médio',
    Icon: Heading2,
    keywords: ['h2', 'heading', 'subtitle'],
    command: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 2 }).run(),
  },
  {
    title: 'Título 3',
    description: 'Cabeçalho pequeno',
    Icon: Heading3,
    keywords: ['h3', 'heading', 'small'],
    command: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 3 }).run(),
  },
  {
    title: 'Lista',
    description: 'Lista com marcadores',
    Icon: List,
    keywords: ['bullet', 'ul', 'unordered', 'items'],
    command: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run(),
  },
  {
    title: 'Lista numerada',
    description: 'Lista ordenada',
    Icon: ListOrdered,
    keywords: ['numbered', 'ol', 'ordered'],
    command: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run(),
  },
  {
    title: 'Checklist',
    description: 'Lista de tarefas',
    Icon: CheckSquare,
    keywords: ['todo', 'task', 'check', 'checkbox'],
    command: (e, r) => e.chain().focus().deleteRange(r).toggleTaskList().run(),
  },
  {
    title: 'Citação',
    description: 'Bloco de citação',
    Icon: Quote,
    keywords: ['quote', 'blockquote', 'citation'],
    command: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run(),
  },
  {
    title: 'Divisor',
    description: 'Linha horizontal',
    Icon: Minus,
    keywords: ['divider', 'separator', 'hr', 'rule'],
    command: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run(),
  },
  {
    title: 'Bloco de código',
    description: 'Editor Monaco com syntax highlighting',
    Icon: Code2,
    keywords: ['code', 'snippet', 'programming', 'monaco'],
    command: (e, r) => e.chain().focus().deleteRange(r).setCodeBlock().run(),
  },
  {
    title: 'Callout Info',
    description: 'Nota informativa',
    Icon: Info,
    keywords: ['info', 'note', 'callout', 'blue'],
    command: (e, r) => e.chain().focus().deleteRange(r).setCallout({ type: 'info' }).run(),
  },
  {
    title: 'Callout Aviso',
    description: 'Atenção ou alerta',
    Icon: AlertTriangle,
    keywords: ['warning', 'warn', 'alert', 'yellow'],
    command: (e, r) => e.chain().focus().deleteRange(r).setCallout({ type: 'warn' }).run(),
  },
  {
    title: 'Callout Sucesso',
    description: 'Confirmação positiva',
    Icon: CheckCircle,
    keywords: ['success', 'tip', 'green', 'done'],
    command: (e, r) => e.chain().focus().deleteRange(r).setCallout({ type: 'success' }).run(),
  },
  {
    title: 'Callout Perigo',
    description: 'Aviso crítico',
    Icon: XCircle,
    keywords: ['danger', 'error', 'critical', 'red'],
    command: (e, r) => e.chain().focus().deleteRange(r).setCallout({ type: 'danger' }).run(),
  },
]

function filterCommands(query: string): SlashCommandItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return COMMANDS
  return COMMANDS.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q)),
  )
}

// ─── Module-level bridge (TipTap suggestion → React) ─────────────────

let keyDownHandler: ((event: KeyboardEvent) => boolean) | null = null

// ─── Popup component ─────────────────────────────────────────────────

interface SlashMenuPopupProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
  clientRect: (() => DOMRect | null) | null
}

function SlashMenuPopup({ items, command, clientRect }: SlashMenuPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedRef = useRef(0)
  const itemsRef = useRef(items)
  const commandRef = useRef(command)

  selectedRef.current = selectedIndex
  itemsRef.current = items
  commandRef.current = command

  useEffect(() => {
    setSelectedIndex(0)
  }, [items.length])

  useEffect(() => {
    keyDownHandler = (event: KeyboardEvent) => {
      const len = itemsRef.current.length
      if (len === 0) return false

      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % len)
        return true
      }
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i - 1 + len) % len)
        return true
      }
      if (event.key === 'Enter') {
        const item = itemsRef.current[selectedRef.current]
        if (item) {
          commandRef.current(item)
          return true
        }
        return false
      }
      if (event.key === 'Escape') {
        return true
      }
      return false
    }
    return () => {
      keyDownHandler = null
    }
  }, [])

  const rect = clientRect?.()
  if (!rect || items.length === 0) return null

  return (
    <div
      style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 999 }}
      className="w-72 bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
    >
      <div className="max-h-72 overflow-y-auto py-1.5">
        {items.map((item, i) => (
          <button
            key={item.title}
            onMouseDown={(e) => {
              e.preventDefault()
              command(item)
            }}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 text-left transition-colors',
              i === selectedIndex
                ? 'bg-primary/12 text-foreground'
                : 'text-foreground hover:bg-secondary/60',
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
                i === selectedIndex
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary/80 text-muted-foreground',
              )}
            >
              <item.Icon size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="px-3 py-1.5 border-t border-border">
        <p className="text-xs text-muted-foreground">↑↓ navegar · Enter selecionar · Esc fechar</p>
      </div>
    </div>
  )
}

// ─── TipTap Extension ────────────────────────────────────────────────

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        command: ({ editor, range, props }) => {
          props.command(editor as Editor, range)
        },
        items: ({ query }) => filterCommands(query),
        render: () => {
          let container: HTMLDivElement | null = null
          let root: Root | null = null

          return {
            onStart: (props) => {
              container = document.createElement('div')
              document.body.appendChild(container)
              root = createRoot(container)
              root.render(
                <SlashMenuPopup
                  items={props.items}
                  command={(item) => props.command(item)}
                  clientRect={props.clientRect ?? null}
                />,
              )
            },
            onUpdate: (props) => {
              root?.render(
                <SlashMenuPopup
                  items={props.items}
                  command={(item) => props.command(item)}
                  clientRect={props.clientRect ?? null}
                />,
              )
            },
            onKeyDown: ({ event }) => keyDownHandler?.(event) ?? false,
            onExit: () => {
              keyDownHandler = null
              root?.unmount()
              container?.remove()
              container = null
              root = null
            },
          }
        },
      }),
    ]
  },
})
