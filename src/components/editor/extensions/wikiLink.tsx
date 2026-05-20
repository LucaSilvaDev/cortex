import { Node, mergeAttributes } from '@tiptap/core'
import type { Editor, Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { createRoot, type Root } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Module augmentation ─────────────────────────────────────────────

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: {
      insertWikiLink: (attrs: { pageId: string; label: string }) => ReturnType
    }
  }
}

// ─── Types ───────────────────────────────────────────────────────────

export interface WikiLinkPage {
  id: string
  title: string
  workspaceId: string
}

// ─── Node view ───────────────────────────────────────────────────────

function WikiLinkView({ node, extension }: NodeViewProps) {
  const label = node.attrs.label as string
  const pageId = node.attrs.pageId as string

  function handleClick() {
    const navigate = extension.options.onNavigate as ((pageId: string) => void) | undefined
    navigate?.(pageId)
  }

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md cursor-pointer select-none',
          'text-primary bg-primary/10 border border-primary/20',
          'hover:bg-primary/20 transition-colors text-sm font-medium',
        )}
        contentEditable={false}
        title={`Ir para: ${label}`}
      >
        <FileText size={11} className="shrink-0" />
        {label}
      </span>
    </NodeViewWrapper>
  )
}

// ─── Module-level keyboard bridge ────────────────────────────────────

let wikiKeyDownHandler: ((event: KeyboardEvent) => boolean) | null = null

// ─── Suggestion popup ────────────────────────────────────────────────

interface WikiPopupProps {
  items: WikiLinkPage[]
  command: (item: WikiLinkPage) => void
  clientRect: (() => DOMRect | null) | null
}

function WikiLinkPopup({ items, command, clientRect }: WikiPopupProps) {
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
    wikiKeyDownHandler = (event: KeyboardEvent) => {
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
        if (item) { commandRef.current(item); return true }
        return false
      }
      if (event.key === 'Escape') return true
      return false
    }
    return () => { wikiKeyDownHandler = null }
  }, [])

  const rect = clientRect?.()
  if (!rect) return null

  return (
    <div
      style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 999 }}
      className="w-64 bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
    >
      {items.length === 0 ? (
        <p className="px-3 py-3 text-sm text-muted-foreground">Nenhuma página encontrada</p>
      ) : (
        <div className="max-h-56 overflow-y-auto py-1.5">
          {items.map((item, i) => (
            <button
              key={item.id}
              onMouseDown={(e) => { e.preventDefault(); command(item) }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors',
                i === selectedIndex
                  ? 'bg-primary/12 text-foreground'
                  : 'text-foreground hover:bg-secondary/60',
              )}
            >
              <FileText size={13} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{item.title || 'Sem título'}</span>
            </button>
          ))}
        </div>
      )}
      <div className="px-3 py-1.5 border-t border-border">
        <p className="text-xs text-muted-foreground">↑↓ navegar · Enter selecionar · Esc fechar</p>
      </div>
    </div>
  )
}

// ─── TipTap extension ────────────────────────────────────────────────

export const WikiLink = Node.create({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return {
      pages: [] as WikiLinkPage[],
      onNavigate: null as ((pageId: string) => void) | null,
    }
  },

  addAttributes() {
    return {
      pageId: { default: '' },
      label: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-wiki-link]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-wiki-link': '' })]
  },

  addCommands() {
    return {
      insertWikiLink:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(WikiLinkView)
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<WikiLinkPage>({
        editor: this.editor,
        char: '[[',
        allowSpaces: true,
        allowedPrefixes: null,
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertWikiLink({ pageId: props.id, label: props.title || 'Sem título' })
            .run()
        },
        items: ({ query }) => {
          const pages = this.options.pages as WikiLinkPage[]
          const q = query.toLowerCase().trim()
          if (!q) return pages.slice(0, 8)
          return pages
            .filter((p) => (p.title || '').toLowerCase().includes(q))
            .slice(0, 8)
        },
        render: () => {
          let container: HTMLDivElement | null = null
          let root: Root | null = null

          return {
            onStart: (props) => {
              container = document.createElement('div')
              document.body.appendChild(container)
              root = createRoot(container)
              root.render(
                <WikiLinkPopup
                  items={props.items}
                  command={(item) => props.command(item)}
                  clientRect={props.clientRect ?? null}
                />,
              )
            },
            onUpdate: (props) => {
              root?.render(
                <WikiLinkPopup
                  items={props.items}
                  command={(item) => props.command(item)}
                  clientRect={props.clientRect ?? null}
                />,
              )
            },
            onKeyDown: ({ event }) => wikiKeyDownHandler?.(event) ?? false,
            onExit: () => {
              wikiKeyDownHandler = null
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
