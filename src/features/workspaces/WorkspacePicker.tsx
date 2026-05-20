import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { WorkspaceIcon } from './WorkspaceIcon'
import { WorkspaceModal } from './WorkspaceModal'
import { cn } from '@/lib/utils'
import type { Workspace } from '@/types/db'

export function WorkspacePicker() {
  const { workspaces, activeWorkspaceId, create, update, remove, setActive } =
    useWorkspaceStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Workspace | null>(null)

  const active = workspaces.find((w) => w.id === activeWorkspaceId)

  const handleSelect = (ws: Workspace) => {
    setActive(ws.id)
    navigate(`/w/${ws.id}`)
    setDropdownOpen(false)
  }

  const handleCreate = async (data: { name: string; color: string; icon: string }) => {
    const ws = await create(data)
    setActive(ws.id)
    navigate(`/w/${ws.id}`)
  }

  const handleEdit = async (data: { name: string; color: string; icon: string }) => {
    if (!editTarget) return
    await update(editTarget.id, data)
  }

  const handleDelete = async (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Deletar workspace "${ws.name}"?\nTodas as páginas serão apagadas.`)) return
    await remove(ws.id)
    if (activeWorkspaceId === ws.id) navigate('/')
    setDropdownOpen(false)
  }

  const openEdit = (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTarget(ws)
    setModalOpen(true)
    setDropdownOpen(false)
  }

  const openCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
    setDropdownOpen(false)
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 w-full px-3 h-12 border-b border-border',
          'hover:bg-secondary/40 transition-colors duration-150',
          'focus-visible:outline-none',
        )}
      >
        {active ? (
          <>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: active.color + '28' }}
            >
              <WorkspaceIcon name={active.icon} size={14} className="shrink-0" />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground truncate text-left">
              {active.name}
            </span>
          </>
        ) : (
          <span className="flex-1 text-sm text-muted-foreground text-left">
            Selecionar workspace
          </span>
        )}
        <ChevronDown
          size={13}
          className={cn(
            'text-muted-foreground transition-transform duration-200 shrink-0',
            dropdownOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setDropdownOpen(false)}
            aria-hidden="true"
          />
          <div
            className={cn(
              'cortex-popup',
              'absolute top-full left-0 right-0 z-20',
              'bg-surface border-x border-b border-border rounded-b-lg',
              'shadow-xl shadow-black/30',
              'py-1 max-h-72 overflow-y-auto',
            )}
          >
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(ws)}
                onClick={() => handleSelect(ws)}
                className="flex items-center gap-2 px-3 py-2 group hover:bg-secondary/60 cursor-pointer transition-colors"
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: ws.color + '28' }}
                >
                  <WorkspaceIcon name={ws.icon} size={12} />
                </div>
                <span className="flex-1 text-sm text-foreground truncate">
                  {ws.name}
                </span>
                {ws.id === activeWorkspaceId && (
                  <Check size={12} className="text-primary shrink-0" />
                )}
                <button
                  onClick={(e) => openEdit(ws, e)}
                  className={cn(
                    'opacity-0 group-hover:opacity-100 p-0.5 rounded',
                    'text-muted-foreground hover:text-foreground transition-opacity',
                    'focus-visible:outline-none focus-visible:opacity-100',
                  )}
                  aria-label="Editar workspace"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => handleDelete(ws, e)}
                  className={cn(
                    'opacity-0 group-hover:opacity-100 p-0.5 rounded',
                    'text-muted-foreground hover:text-destructive transition-opacity',
                    'focus-visible:outline-none focus-visible:opacity-100',
                  )}
                  aria-label="Deletar workspace"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {workspaces.length > 0 && <div className="h-px bg-border my-1" />}

            <button
              onClick={openCreate}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <Plus size={14} />
              Criar workspace
            </button>
          </div>
        </>
      )}

      {/* Modals */}
      <WorkspaceModal
        open={modalOpen && editTarget === null}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        mode="create"
      />
      <WorkspaceModal
        open={modalOpen && editTarget !== null}
        onClose={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        onSave={handleEdit}
        initial={editTarget ?? undefined}
        mode="edit"
      />
    </div>
  )
}
