import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/core'
import { List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TocItem {
  level: number
  text: string
  id: string
}

function extractHeadings(editor: Editor): TocItem[] {
  const items: TocItem[] = []
  editor.state.doc.forEach((node) => {
    if (node.type.name === 'heading') {
      const text = node.textContent
      if (text.trim()) {
        items.push({
          level: node.attrs.level as number,
          text,
          id: text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        })
      }
    }
  })
  return items
}

function scrollToHeading(editor: Editor, text: string) {
  let found = false
  editor.state.doc.descendants((node, pos) => {
    if (found) return false
    if (node.type.name === 'heading' && node.textContent === text) {
      found = true
      const domNode = editor.view.nodeDOM(pos) as HTMLElement | null
      domNode?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

interface TableOfContentsProps {
  editor: Editor | null
}

export function TableOfContents({ editor }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!editor) return
    const update = () => setHeadings(extractHeadings(editor))
    update()
    editor.on('update', update)
    return () => { editor.off('update', update) }
  }, [editor])

  if (headings.length < 2) return null

  return (
    <div className="fixed right-4 top-16 z-30">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Sumário"
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg border',
          'transition-all duration-150 shadow-sm',
          open
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-secondary',
        )}
        aria-label="Sumário"
      >
        <List size={14} />
      </button>

      {/* Panel */}
      {open && (
        <div className="cortex-popup absolute right-0 top-10 w-56 bg-surface border border-border rounded-lg shadow-lg shadow-black/20 py-2">
          <p className="px-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Sumário
          </p>
          <nav>
            {headings.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  if (editor) scrollToHeading(editor, h.text)
                }}
                className={cn(
                  'flex w-full text-left px-3 py-1 text-sm truncate',
                  'hover:bg-secondary/60 transition-colors',
                  h.level === 1 && 'font-medium text-foreground',
                  h.level === 2 && 'pl-5 text-foreground/80',
                  h.level === 3 && 'pl-7 text-muted-foreground text-xs',
                )}
              >
                {h.text}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
