import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { BookOpen, Check, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { useParams } from 'react-router-dom'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flashcardBlock: {
      setFlashcardBlock: (attrs?: { front: string; back: string; cardId: string }) => ReturnType
    }
  }
}

function FlashcardBlockView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const front = (node.attrs.front as string) ?? ''
  const back = (node.attrs.back as string) ?? ''
  const cardId = (node.attrs.cardId as string) ?? ''

  const [editing, setEditing] = useState(!front && !back)
  const [localFront, setLocalFront] = useState(front)
  const [localBack, setLocalBack] = useState(back)
  const frontRef = useRef<HTMLTextAreaElement>(null)

  const { add, update, remove } = useFlashcardStore()
  const { pageId, workspaceId } = useParams<{ pageId?: string; workspaceId?: string }>()

  // Sync with flashcard store when card content changes externally
  useEffect(() => {
    setLocalFront(front)
    setLocalBack(back)
  }, [front, back])

  useEffect(() => {
    if (editing) frontRef.current?.focus()
  }, [editing])

  async function applyEdit() {
    let cid = cardId
    if (!cid && (localFront.trim() || localBack.trim())) {
      // First save: create the card record in the DB
      const wsId = workspaceId ?? ''
      const pgId = pageId ?? ''
      if (wsId && pgId) {
        const card = await add({ pageId: pgId, workspaceId: wsId, front: localFront, back: localBack })
        cid = card.id
      }
    } else if (cid) {
      await update(cid, { front: localFront, back: localBack })
    }
    updateAttributes({ front: localFront, back: localBack, cardId: cid })
    setEditing(false)
  }

  async function handleDelete() {
    if (cardId) await remove(cardId)
    deleteNode()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      applyEdit()
    }
  }

  return (
    <NodeViewWrapper contentEditable={false}>
      <div className={cn(
        'my-3 rounded-xl border overflow-hidden',
        editing ? 'border-primary/50' : 'border-border',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-primary/8 border-b border-border">
          <div className="flex items-center gap-2">
            <BookOpen size={13} className="text-primary shrink-0" />
            <span className="text-xs font-medium text-primary/80">Flashcard</span>
          </div>
          <div className="flex items-center gap-1">
            {editing ? (
              <span className="text-xs text-muted-foreground/40 select-none mr-1">Ctrl+Enter para salvar</span>
            ) : null}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Editar"
              >
                <Pencil size={12} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remover"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {editing ? (
          <div className="divide-y divide-border">
            {/* Front edit */}
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Frente</p>
              <textarea
                ref={frontRef}
                value={localFront}
                onChange={(e) => setLocalFront(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Pergunta ou conceito…"
                spellCheck
                className="w-full bg-transparent text-sm text-foreground resize-none focus:outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            {/* Back edit */}
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Verso</p>
              <textarea
                value={localBack}
                onChange={(e) => setLocalBack(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Resposta, definição ou explicação…"
                spellCheck
                className="w-full bg-transparent text-sm text-foreground resize-none focus:outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="flex justify-end px-3 py-2">
              <button
                onMouseDown={(e) => { e.preventDefault(); applyEdit() }}
                className="press-scale flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Check size={11} />
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div
            className="divide-y divide-border cursor-pointer group"
            onClick={() => setEditing(true)}
          >
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Frente</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{front || <span className="text-muted-foreground/40 italic">Sem conteúdo</span>}</p>
            </div>
            <div className="px-4 py-3 bg-secondary/20">
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Verso</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{back || <span className="text-muted-foreground/40 italic">Sem conteúdo</span>}</p>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const FlashcardBlock = Node.create({
  name: 'flashcardBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      front: { default: '' },
      back: { default: '' },
      cardId: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-flashcard-block]', getAttrs: (el) => ({
      front: (el as HTMLElement).getAttribute('data-front') ?? '',
      back: (el as HTMLElement).getAttribute('data-back') ?? '',
      cardId: (el as HTMLElement).getAttribute('data-card-id') ?? '',
    }) }]
  },

  renderHTML({ node }) {
    return ['div', mergeAttributes({
      'data-flashcard-block': '',
      'data-front': node.attrs.front,
      'data-back': node.attrs.back,
      'data-card-id': node.attrs.cardId,
    })]
  },

  addCommands() {
    return {
      setFlashcardBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(FlashcardBlockView)
  },
})
