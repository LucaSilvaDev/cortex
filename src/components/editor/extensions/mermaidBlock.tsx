import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { Check, GitBranch, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import mermaid from 'mermaid'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaidBlock: {
      setMermaidBlock: (attrs?: { code: string }) => ReturnType
    }
  }
}

let mermaidReady = false
let renderSeq = 0

function ensureMermaid() {
  if (mermaidReady) return
  const dark = document.documentElement.classList.contains('dark')
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? 'dark' : 'neutral',
    securityLevel: 'loose',
    fontFamily: '"Inter", ui-sans-serif, sans-serif',
  })
  mermaidReady = true
}

async function renderMermaid(src: string): Promise<{ svg: string } | { error: string }> {
  ensureMermaid()
  try {
    const id = `mermaid-render-${++renderSeq}`
    const { svg } = await mermaid.render(id, src.trim())
    return { svg }
  } catch {
    return { error: 'Sintaxe inválida — verifique o diagrama' }
  }
}

function MermaidBlockView({ node, updateAttributes, selected, editor, getPos }: NodeViewProps) {
  const code = (node.attrs.code as string) ?? ''
  const [editing, setEditing] = useState(!code.trim())
  const [localCode, setLocalCode] = useState(code)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!code.trim()) return
    mermaidReady = false // re-init to pick up current theme
    renderMermaid(code).then((result) => {
      if ('svg' in result) { setSvg(result.svg); setError(null) }
      else { setError(result.error); setSvg('') }
    })
  }, [code])

  useEffect(() => {
    if (editing) {
      const ta = textareaRef.current
      if (!ta) return
      ta.focus()
      ta.setSelectionRange(ta.value.length, ta.value.length)
    }
  }, [editing])

  function applyEdit() {
    updateAttributes({ code: localCode })
    setEditing(false)
  }

  function exitToDoc() {
    const pos = getPos()
    if (typeof pos !== 'number') return
    const endPos = pos + node.nodeSize
    editor.chain().insertContentAt(endPos, { type: 'paragraph' }).setTextSelection(endPos + 1).focus().run()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      applyEdit()
      exitToDoc()
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      applyEdit()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = textareaRef.current!
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const next = localCode.substring(0, start) + '  ' + localCode.substring(end)
      setLocalCode(next)
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2 }, 0)
    }
  }

  const lineCount = localCode.split('\n').length

  return (
    <NodeViewWrapper contentEditable={false}>
      <div className={cn(
        'my-3 rounded-xl overflow-hidden border',
        selected ? 'border-primary/60' : 'border-border',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/40 border-b border-border">
          <div className="flex items-center gap-2">
            <GitBranch size={13} className="text-primary shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">Diagrama Mermaid</span>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <span className="text-xs text-muted-foreground/40 select-none">Ctrl+Enter aplicar · Esc sair</span>
            ) : (
              <button
                onClick={() => { setLocalCode(code); setEditing(true) }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Pencil size={11} />
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Edit mode */}
        {editing && (
          <div className="bg-surface">
            <textarea
              ref={textareaRef}
              value={localCode}
              onChange={(e) => setLocalCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              rows={Math.max(5, lineCount + 1)}
              placeholder={'flowchart LR\n  A --> B --> C'}
              className="w-full px-4 py-3 bg-transparent text-sm font-mono text-foreground resize-none focus:outline-none placeholder:text-muted-foreground/30"
            />
            <div className="flex justify-end px-3 pb-3">
              <button
                onMouseDown={(e) => { e.preventDefault(); applyEdit() }}
                className="press-scale flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Check size={11} />
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Preview mode */}
        {!editing && (
          <div
            className="px-6 py-5 flex justify-center cursor-pointer"
            onClick={() => { setLocalCode(code); setEditing(true) }}
          >
            {error ? (
              <p className="text-sm text-destructive py-4 text-center">{error}</p>
            ) : svg ? (
              <div
                className="mermaid-output w-full overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <p className="text-sm text-muted-foreground/40 py-4">Clique para editar o diagrama</p>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const MermaidBlock = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      code: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-mermaid-block]', getAttrs: (el) => ({ code: (el as HTMLElement).getAttribute('data-code') ?? '' }) }]
  },

  renderHTML({ node }) {
    return ['div', mergeAttributes({ 'data-mermaid-block': '', 'data-code': node.attrs.code })]
  },

  addCommands() {
    return {
      setMermaidBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlockView)
  },
})
