import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { WorkspaceIcon } from './WorkspaceIcon'
import { WORKSPACE_COLORS, WORKSPACE_ICON_NAMES } from './constants'
import { cn } from '@/lib/utils'
import type { Workspace } from '@/types/db'

interface SaveData {
  name: string
  color: string
  icon: string
}

interface WorkspaceModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: SaveData) => Promise<void>
  initial?: Pick<Workspace, 'name' | 'color' | 'icon'>
  mode?: 'create' | 'edit'
}

export function WorkspaceModal({
  open,
  onClose,
  onSave,
  initial,
  mode = 'create',
}: WorkspaceModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? WORKSPACE_COLORS[0])
  const [icon, setIcon] = useState(initial?.icon ?? 'BookOpen')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setColor(initial?.color ?? WORKSPACE_COLORS[0])
      setIcon(initial?.icon ?? 'BookOpen')
      setLoading(false)
    }
  }, [open, initial])

  const handleSave = async () => {
    if (!name.trim() || loading) return
    setLoading(true)
    try {
      await onSave({ name: name.trim(), color, icon })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Criar workspace' : 'Editar workspace'}
    >
      {/* Name */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
          }}
          placeholder="Meu workspace"
          autoFocus
          className={cn(
            'w-full px-3 py-2 rounded-lg text-sm',
            'bg-secondary border border-border',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'transition-colors duration-150',
          )}
        />
      </div>

      {/* Color */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Cor
        </label>
        <div className="flex flex-wrap gap-2">
          {WORKSPACE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                'w-7 h-7 rounded-full transition-all duration-150',
                'hover:scale-110',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
                color === c && 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110',
              )}
              style={{ backgroundColor: c }}
              aria-label={`Selecionar cor ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </div>
      </div>

      {/* Icon */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Ícone
        </label>
        <div className="flex flex-wrap gap-1.5">
          {WORKSPACE_ICON_NAMES.map((iconName) => (
            <button
              key={iconName}
              onClick={() => setIcon(iconName)}
              className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center',
                'text-muted-foreground hover:text-foreground hover:bg-secondary',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                icon === iconName && 'bg-primary/15 text-primary',
              )}
              aria-label={iconName}
              aria-pressed={icon === iconName}
            >
              <WorkspaceIcon name={iconName} size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium',
            'text-muted-foreground hover:text-foreground hover:bg-secondary',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || loading}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium',
            'bg-primary text-primary-foreground',
            'hover:opacity-90 active:opacity-80 transition-opacity duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          {loading ? 'Salvando…' : mode === 'create' ? 'Criar' : 'Salvar'}
        </button>
      </div>
    </Modal>
  )
}
