import { useState, useRef, useEffect } from 'react'
import { Plus, Tag, Check } from 'lucide-react'
import { useTagStore } from '@/stores/tagStore'
import { TagBadge } from './TagBadge'
import { cn } from '@/lib/utils'

const TAG_COLORS = [
  '#22d3ee', '#a78bfa', '#34d399', '#fb923c',
  '#f472b6', '#facc15', '#60a5fa', '#f87171',
]

interface TagPickerProps {
  workspaceId: string
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}

export function TagPicker({ workspaceId, selectedTagIds, onChange }: TagPickerProps) {
  const { tags, create } = useTagStore()
  const workspaceTags = tags.filter((t) => t.workspaceId === workspaceId)

  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(TAG_COLORS[0])
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function toggleTag(id: string) {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter((t) => t !== id))
    } else {
      onChange([...selectedTagIds, id])
    }
  }

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    const tag = await create(workspaceId, name, newColor)
    onChange([...selectedTagIds, tag.id])
    setNewName('')
    setNewColor(TAG_COLORS[0])
    setCreating(false)
  }

  const selected = workspaceTags.filter((t) => selectedTagIds.includes(t.id))

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-1.5">
      {selected.map((tag) => (
        <TagBadge
          key={tag.id}
          name={tag.name}
          color={tag.color}
          onRemove={() => toggleTag(tag.id)}
        />
      ))}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
          'text-muted-foreground border border-dashed border-border',
          'hover:text-foreground hover:border-muted-foreground transition-colors',
        )}
      >
        <Tag size={11} />
        Tags
      </button>

      {open && (
        <div className="cortex-popup absolute top-full left-0 mt-1.5 z-40 w-56 bg-surface border border-border rounded-lg shadow-xl shadow-black/30 overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1">
            {workspaceTags.length === 0 && !creating && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Nenhuma tag ainda.</p>
            )}
            {workspaceTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-1.5 text-left text-sm',
                  'hover:bg-secondary/60 transition-colors',
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 truncate text-foreground">{tag.name}</span>
                {selectedTagIds.includes(tag.id) && (
                  <Check size={13} className="text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>

          {creating ? (
            <div className="border-t border-border px-3 py-2 space-y-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleCreate()
                  if (e.key === 'Escape') setCreating(false)
                }}
                placeholder="Nome da tag…"
                className="w-full text-xs bg-transparent text-foreground placeholder:text-muted-foreground outline-none border-b border-border pb-1"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={cn(
                      'w-4 h-4 rounded-full transition-transform',
                      newColor === c && 'scale-125 ring-2 ring-offset-1 ring-offset-surface',
                    )}
                    style={{ backgroundColor: c, ['--tw-ring-color' as string]: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleCreate()}
                  className="flex-1 text-xs py-1 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Criar
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="flex-1 text-xs py-1 rounded bg-secondary text-foreground hover:opacity-90 transition-opacity"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground',
                'border-t border-border hover:text-foreground hover:bg-secondary/40 transition-colors',
              )}
            >
              <Plus size={12} />
              Nova tag
            </button>
          )}
        </div>
      )}
    </div>
  )
}
