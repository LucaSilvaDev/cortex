import { useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  GripVertical,
  Pencil,
  Pin,
  Plus,
  Trash2,
} from 'lucide-react'
import { usePageStore } from '@/stores/pageStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { TemplateModal } from '@/components/TemplateModal'
import { cn } from '@/lib/utils'
import type { PageTemplate } from '@/lib/pageTemplates'
import type { Folder as FolderType, Page } from '@/types/db'

// ─── Sortable wrapper ────────────────────────────────────────────────

interface SortableItemProps {
  id: string
  children: (handleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'opacity-40 z-50' : ''}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  )
}

// ─── Inline rename input ─────────────────────────────────────────────

interface InlineRenameProps {
  value: string
  onChange: (v: string) => void
  onCommit: () => void
  onCancel: () => void
}

function InlineRename({ value, onChange, onCommit, onCancel }: InlineRenameProps) {
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); onCommit() }
        if (e.key === 'Escape') onCancel()
        e.stopPropagation()
      }}
      onClick={(e) => e.stopPropagation()}
      className="flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none border-b border-primary"
      placeholder="Sem título"
    />
  )
}

// ─── Page row ────────────────────────────────────────────────────────

interface PageRowProps {
  page: Page
  depth?: number
  activePage: boolean
  editingId: string | null
  editingValue: string
  onEditChange: (v: string) => void
  onCommitRename: (id: string, type: 'page') => void
  onCancelRename: () => void
  onStartRename: (id: string, name: string) => void
  onDelete: (page: Page) => void
  onPin: (page: Page) => void
  onNavigate: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

function PageRow({
  page,
  depth = 0,
  activePage,
  editingId,
  editingValue,
  onEditChange,
  onCommitRename,
  onCancelRename,
  onStartRename,
  onDelete,
  onPin,
  onNavigate,
  dragHandleProps,
}: PageRowProps) {
  const isEditing = editingId === page.id

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !isEditing && onNavigate(page.id)}
      onClick={() => !isEditing && onNavigate(page.id)}
      style={{ paddingLeft: 8 + depth * 16 }}
      className={cn(
        'flex items-center gap-1 h-8 rounded-md pr-1 group',
        'cursor-pointer transition-colors duration-100',
        activePage
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      {/* Drag handle */}
      <button
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-0.5 rounded cursor-grab active:cursor-grabbing shrink-0 focus-visible:opacity-100 focus-visible:outline-none"
        aria-label="Arrastar"
      >
        <GripVertical size={12} />
      </button>

      {page.icon ? (
        <span className="text-sm leading-none shrink-0 w-[14px] text-center">{page.icon}</span>
      ) : (
        <FileText size={14} className="shrink-0" />
      )}

      {isEditing ? (
        <InlineRename
          value={editingValue}
          onChange={onEditChange}
          onCommit={() => onCommitRename(page.id, 'page')}
          onCancel={onCancelRename}
        />
      ) : (
        <span className="flex-1 min-w-0 text-sm truncate">
          {page.title || 'Sem título'}
        </span>
      )}

      {!isEditing && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onPin(page) }}
            className={cn(
              'p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              page.isPinned ? 'text-primary opacity-100 !opacity-100' : 'hover:text-foreground',
            )}
            aria-label={page.isPinned ? 'Desafixar página' : 'Fixar página'}
            title={page.isPinned ? 'Desafixar' : 'Fixar no topo'}
          >
            <Pin size={11} className={page.isPinned ? 'fill-current' : ''} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onStartRename(page.id, page.title) }}
            className="p-0.5 rounded hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Renomear página"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(page) }}
            className="p-0.5 rounded hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Deletar página"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Folder row ──────────────────────────────────────────────────────

interface FolderRowProps {
  folder: FolderType
  pages: Page[]
  expanded: boolean
  activePageId: string | undefined
  editingId: string | null
  editingValue: string
  onEditChange: (v: string) => void
  onCommitRename: (id: string, type: 'page' | 'folder') => void
  onCancelRename: () => void
  onStartRename: (id: string, name: string) => void
  onToggle: () => void
  onDelete: (page: Page) => void
  onPin: (page: Page) => void
  onDeleteFolder: (folder: FolderType) => void
  onCreatePage: (folderId: string) => void
  onNavigate: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

function FolderRow({
  folder,
  pages,
  expanded,
  activePageId,
  editingId,
  editingValue,
  onEditChange,
  onCommitRename,
  onCancelRename,
  onStartRename,
  onToggle,
  onDelete,
  onPin,
  onDeleteFolder,
  onCreatePage,
  onNavigate,
  dragHandleProps,
}: FolderRowProps) {
  const isEditing = editingId === folder.id

  return (
    <div>
      {/* Folder header */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !isEditing && onToggle()}
        onClick={() => !isEditing && onToggle()}
        className="flex items-center gap-1 h-8 rounded-md pr-1 group cursor-pointer text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors duration-100"
      >
        {/* Drag handle */}
        <button
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-0.5 rounded cursor-grab active:cursor-grabbing shrink-0 focus-visible:opacity-100 focus-visible:outline-none"
          aria-label="Arrastar"
        >
          <GripVertical size={12} />
        </button>

        <ChevronRight
          size={13}
          className={cn('shrink-0 transition-transform duration-200', expanded && 'rotate-90')}
        />

        {expanded ? (
          <FolderOpen size={14} className="shrink-0" />
        ) : (
          <Folder size={14} className="shrink-0" />
        )}

        {isEditing ? (
          <InlineRename
            value={editingValue}
            onChange={onEditChange}
            onCommit={() => onCommitRename(folder.id, 'folder')}
            onCancel={onCancelRename}
          />
        ) : (
          <span className="flex-1 min-w-0 text-sm truncate">
            {folder.name || 'Nova pasta'}
          </span>
        )}

        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onCreatePage(folder.id) }}
              className="p-0.5 rounded hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Nova página na pasta"
            >
              <Plus size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onStartRename(folder.id, folder.name) }}
              className="p-0.5 rounded hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Renomear pasta"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder) }}
              className="p-0.5 rounded hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Deletar pasta"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="folder-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {pages.length > 0 ? (
              pages.map((page) => (
                <PageRow
                  key={page.id}
                  page={page}
                  depth={1}
                  activePage={activePageId === page.id}
                  editingId={editingId}
                  editingValue={editingValue}
                  onEditChange={onEditChange}
                  onCommitRename={onCommitRename}
                  onCancelRename={onCancelRename}
                  onStartRename={onStartRename}
                  onDelete={onDelete}
                  onPin={onPin}
                  onNavigate={onNavigate}
                />
              ))
            ) : (
              <div
                className="pl-10 py-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => onCreatePage(folder.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onCreatePage(folder.id)}
              >
                + Nova página
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main SidebarTree ────────────────────────────────────────────────

export function SidebarTree() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const { folders, pages, createPage, createFolder, updatePage, deletePage, updateFolder, deleteFolder } =
    usePageStore()
  const navigate = useNavigate()
  const location = useLocation()

  const activePageId = location.pathname.match(/\/p\/([^/]+)/)?.[1]

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [templateOpen, setTemplateOpen] = useState(false)
  const pendingFolderIdRef = useRef<string | null>(null)
  const pendingFocusId = useRef<string | null>(null)

  const rootFolders = folders.filter((f) => f.parentId === null).sort((a, b) => a.order - b.order)
  const rootPages = folders.length > 0 || pages.length > 0
    ? pages.filter((p) => p.folderId === null).sort((a, b) => a.order - b.order)
    : pages.sort((a, b) => a.order - b.order)

  // Combined root items for DnD (folders first by their order, then root pages)
  const rootItems = [
    ...rootFolders.map((f) => ({ id: f.id, kind: 'folder' as const, order: f.order })),
    ...rootPages.map((p) => ({ id: p.id, kind: 'page' as const, order: p.order })),
  ].sort((a, b) => a.order - b.order)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIdx = rootItems.findIndex((i) => i.id === active.id)
      const newIdx = rootItems.findIndex((i) => i.id === over.id)
      if (oldIdx === -1 || newIdx === -1) return

      const reordered = arrayMove(rootItems, oldIdx, newIdx)
      await Promise.all(
        reordered.map((item, i) =>
          item.kind === 'folder'
            ? updateFolder(item.id, { order: i })
            : updatePage(item.id, { order: i }),
        ),
      )
    },
    [rootItems, updateFolder, updatePage],
  )

  const startRename = (id: string, currentName: string) => {
    setEditingId(id)
    setEditingValue(currentName)
  }

  const commitRename = async (id: string, type: 'page' | 'folder') => {
    if (!editingValue.trim()) {
      setEditingId(null)
      return
    }
    if (type === 'page') await updatePage(id, { title: editingValue.trim() })
    else await updateFolder(id, { name: editingValue.trim() })
    setEditingId(null)
  }

  const cancelRename = () => setEditingId(null)

  const handleCreatePage = (folderId?: string) => {
    pendingFolderIdRef.current = folderId ?? null
    setTemplateOpen(true)
  }

  const handleTemplateSelect = async (template: PageTemplate) => {
    if (!activeWorkspaceId) return
    setTemplateOpen(false)
    const folderId = pendingFolderIdRef.current
    const page = await createPage({
      workspaceId: activeWorkspaceId,
      folderId,
      title: template.defaultTitle,
      content: template.id === 'blank' ? '' : JSON.stringify(template.content),
    })
    if (folderId) setExpandedFolders((prev) => new Set([...prev, folderId]))
    navigate(`/w/${activeWorkspaceId}/p/${page.id}`)
    pendingFocusId.current = page.id
    setTimeout(() => {
      setEditingId(page.id)
      setEditingValue(template.defaultTitle)
    }, 80)
  }

  const handleCreateFolder = async () => {
    if (!activeWorkspaceId) return
    const folder = await createFolder({ workspaceId: activeWorkspaceId })
    setExpandedFolders((prev) => new Set([...prev, folder.id]))
    setTimeout(() => {
      setEditingId(folder.id)
      setEditingValue('')
    }, 80)
  }

  const handlePin = async (page: Page) => {
    await updatePage(page.id, { isPinned: !page.isPinned })
  }

  const handleDeletePage = async (page: Page) => {
    if (!window.confirm(`Deletar "${page.title || 'Sem título'}"?`)) return
    await deletePage(page.id)
    if (activePageId === page.id) navigate(`/w/${activeWorkspaceId}`)
  }

  const handleDeleteFolder = async (folder: FolderType) => {
    const pageCount = pages.filter((p) => p.folderId === folder.id).length
    const msg = pageCount > 0
      ? `Deletar pasta "${folder.name || 'Nova pasta'}" e ${pageCount} página(s) dentro?`
      : `Deletar pasta "${folder.name || 'Nova pasta'}"?`
    if (!window.confirm(msg)) return
    await deleteFolder(folder.id)
  }

  if (!activeWorkspaceId) return null

  const isEmpty = rootItems.length === 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Páginas
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleCreateFolder}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Nova pasta"
          >
            <Folder size={13} />
          </button>
          <button
            onClick={() => handleCreatePage()}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Nova página"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 px-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center cortex-float">
            <FileText size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-1">Nenhuma página ainda</p>
            <p className="text-xs text-muted-foreground">
              Clique em{' '}
              <button
                onClick={() => handleCreatePage()}
                className="text-primary hover:underline focus-visible:outline-none"
              >
                + Nova página
              </button>{' '}
              para começar
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {/* Pinned pages section */}
          {pages.filter((p) => p.isPinned).length > 0 && (
            <div className="mb-2">
              <p className="px-1 py-1 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                Fixadas
              </p>
              {pages.filter((p) => p.isPinned).sort((a, b) => a.order - b.order).map((page) => (
                <PageRow
                  key={`pin-${page.id}`}
                  page={page}
                  activePage={activePageId === page.id}
                  editingId={editingId}
                  editingValue={editingValue}
                  onEditChange={setEditingValue}
                  onCommitRename={commitRename}
                  onCancelRename={cancelRename}
                  onStartRename={startRename}
                  onDelete={handleDeletePage}
                  onPin={handlePin}
                  onNavigate={(id) => navigate(`/w/${activeWorkspaceId}/p/${id}`)}
                />
              ))}
              <div className="h-px bg-border mx-1 my-1.5" />
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={rootItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {rootItems.map((item) =>
                item.kind === 'folder' ? (
                  <SortableItem key={item.id} id={item.id}>
                    {(handleProps) => {
                      const folder = rootFolders.find((f) => f.id === item.id)!
                      const folderPages = pages
                        .filter((p) => p.folderId === folder.id)
                        .sort((a, b) => a.order - b.order)
                      return (
                        <FolderRow
                          folder={folder}
                          pages={folderPages}
                          expanded={expandedFolders.has(folder.id)}
                          activePageId={activePageId}
                          editingId={editingId}
                          editingValue={editingValue}
                          onEditChange={setEditingValue}
                          onCommitRename={commitRename}
                          onCancelRename={cancelRename}
                          onStartRename={startRename}
                          onToggle={() =>
                            setExpandedFolders((prev) => {
                              const next = new Set(prev)
                              next.has(folder.id) ? next.delete(folder.id) : next.add(folder.id)
                              return next
                            })
                          }
                          onDelete={handleDeletePage}
                          onPin={handlePin}
                          onDeleteFolder={handleDeleteFolder}
                          onCreatePage={handleCreatePage}
                          onNavigate={(id) => navigate(`/w/${activeWorkspaceId}/p/${id}`)}
                          dragHandleProps={handleProps}
                        />
                      )
                    }}
                  </SortableItem>
                ) : (
                  <SortableItem key={item.id} id={item.id}>
                    {(handleProps) => {
                      const page = rootPages.find((p) => p.id === item.id)!
                      return (
                        <PageRow
                          page={page}
                          activePage={activePageId === page.id}
                          editingId={editingId}
                          editingValue={editingValue}
                          onEditChange={setEditingValue}
                          onCommitRename={commitRename}
                          onCancelRename={cancelRename}
                          onStartRename={startRename}
                          onDelete={handleDeletePage}
                          onPin={handlePin}
                          onNavigate={(id) => navigate(`/w/${activeWorkspaceId}/p/${id}`)}
                          dragHandleProps={handleProps}
                        />
                      )
                    }}
                  </SortableItem>
                ),
              )}
            </SortableContext>
          </DndContext>
        </div>
      )}

      <TemplateModal
        open={templateOpen}
        onSelect={handleTemplateSelect}
        onClose={() => setTemplateOpen(false)}
      />
    </div>
  )
}
