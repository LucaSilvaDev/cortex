import { BookOpen, GitFork, Hash, HelpCircle, Moon, Search, Sun } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTagStore } from '@/stores/tagStore'
import { TagBadge } from '@/components/tags/TagBadge'
import { usePageStore } from '@/stores/pageStore'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { ReviewModal } from '@/components/flashcards/ReviewModal'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function FooterButton({
  icon: Icon,
  label,
  onClick,
  active,
  kbd,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string; strokeWidth?: number | string }>
  label: string
  onClick: () => void
  active?: boolean
  kbd?: string
}) {
  return (
    <button
      onClick={onClick}
      title={kbd ? `${label} (${kbd})` : label}
      aria-label={label}
      className={cn(
        'press-scale flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm',
        'transition-colors duration-150',
        active
          ? 'bg-primary/12 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      )}
    >
      <Icon size={15} className="shrink-0" />
      <span className="flex-1 text-left truncate">{label}</span>
      {kbd && (
        <kbd className="text-xs opacity-40 font-mono shrink-0">{kbd}</kbd>
      )}
    </button>
  )
}

export function SidebarFooter() {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const { tags } = useTagStore()
  const { pages } = usePageStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { workspaceId: routeWsId } = useParams<{ workspaceId?: string }>()

  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const { dueCards, cards, isLoaded, load } = useFlashcardStore()

  const wsId = routeWsId ?? activeWorkspaceId
  const isGraph = location.pathname.endsWith('/graph')
  const workspaceTags = tags.filter((t) => t.workspaceId === wsId)
  const dueCount = wsId ? dueCards(wsId).length : 0

  function handleGraphToggle() {
    if (!wsId) return
    navigate(isGraph ? `/w/${wsId}` : `/w/${wsId}/graph`)
  }

  function handleTagFilter(tagId: string) {
    // Navigate to workspace with tag filter — for now just goes to workspace
    // (tag filtering in the tree is a future enhancement)
    if (wsId) navigate(`/w/${wsId}`)
  }

  return (
    <>
    <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
    <div className="shrink-0 border-t border-border px-2 py-2 space-y-0.5">
      <FooterButton
        icon={Search}
        label="Buscar"
        onClick={() => setCommandPaletteOpen(true)}
        kbd="Ctrl K"
      />

      {wsId && (
        <FooterButton
          icon={GitFork}
          label="Grafo de conhecimento"
          onClick={handleGraphToggle}
          active={isGraph}
        />
      )}

      {workspaceTags.length > 0 && (
        <div>
          <button
            onClick={() => setTagsExpanded((v) => !v)}
            className={cn(
              'press-scale flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm',
              'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            )}
          >
            <Hash size={15} className="shrink-0" />
            <span className="flex-1 text-left">Tags</span>
            <span className="text-xs opacity-40">{workspaceTags.length}</span>
          </button>

          {tagsExpanded && (
            <div className="mt-1 px-3 pb-1 flex flex-wrap gap-1.5">
              {workspaceTags.map((tag) => {
                const count = pages.filter((p) => p.tags.includes(tag.id)).length
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagFilter(tag.id)}
                    title={`${count} página${count !== 1 ? 's' : ''}`}
                  >
                    <TagBadge name={`${tag.name} ${count}`} color={tag.color} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <FooterButton
        icon={theme === 'dark' ? Sun : Moon}
        label={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        onClick={toggleTheme}
        kbd="Alt T"
      />

      {wsId && (
        <button
          onClick={() => setReviewOpen(true)}
          title="Revisar flashcards"
          aria-label="Revisar flashcards"
          className={cn(
            'press-scale flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm',
            'transition-colors duration-150',
            'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
        >
          <BookOpen size={15} className="shrink-0" />
          <span className="flex-1 text-left truncate">Revisar</span>
          {dueCount > 0 && (
            <span className="text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none shrink-0">
              {dueCount}
            </span>
          )}
        </button>
      )}

      <FooterButton
        icon={HelpCircle}
        label="Atalhos de teclado"
        onClick={() => setShortcutsOpen(true)}
        kbd="?"
      />
    </div>
    </>
  )
}
