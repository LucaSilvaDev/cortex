import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, Plus, Tag } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { usePageStore } from '@/stores/pageStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTagStore } from '@/stores/tagStore'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { cn } from '@/lib/utils'

const DAY_MS = 86_400_000

function relativeTime(ts: number) {
  const d = Math.floor((Date.now() - ts) / DAY_MS)
  const h = Math.floor((Date.now() - ts) / 3_600_000)
  const m = Math.floor((Date.now() - ts) / 60_000)
  if (m < 2) return 'agora'
  if (m < 60) return `${m}min`
  if (h < 24) return `${h}h`
  if (d === 1) return 'ontem'
  if (d < 30) return `${d}d`
  return `${Math.floor(d / 30)}m`
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } } }

export function WorkspacePage() {
  useWorkspace()

  const { workspaces, activeWorkspaceId } = useWorkspaceStore()
  const { pages, createPage } = usePageStore()
  const { tags } = useTagStore()
  const { cards } = useFlashcardStore()
  const navigate = useNavigate()

  const workspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const wsTags = tags.filter((t) => t.workspaceId === activeWorkspaceId)
  const wsCards = cards.filter((c) => c.workspaceId === activeWorkspaceId)

  const recentPages = useMemo(
    () => [...pages].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6),
    [pages],
  )

  const tagPageCounts = useMemo(() => {
    const m = new Map<string, number>()
    pages.forEach((p) => p.tags.forEach((tid) => m.set(tid, (m.get(tid) ?? 0) + 1)))
    return m
  }, [pages])

  const handleCreatePage = async () => {
    if (!activeWorkspaceId) return
    const page = await createPage({ workspaceId: activeWorkspaceId })
    navigate(`/w/${activeWorkspaceId}/p/${page.id}`)
  }

  if (!workspace) return null

  const stats = [
    { label: 'Páginas', value: pages.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Tags', value: wsTags.length, icon: Tag, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Flashcards', value: wsCards.length, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <motion.div
      className="max-w-3xl mx-auto px-6 py-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Workspace header */}
      <motion.div variants={item} className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${workspace.color}18`, border: `1px solid ${workspace.color}30` }}
        >
          {workspace.icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground leading-tight truncate">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{workspace.description}</p>
          )}
        </div>
        <button
          onClick={handleCreatePage}
          className="press-scale ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Nova página
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', s.bg)}>
              <s.icon size={14} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground tabular-nums leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recent pages */}
      {recentPages.length > 0 && (
        <motion.section variants={item} className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Páginas recentes
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            {recentPages.map((page, i) => (
              <button
                key={page.id}
                onClick={() => navigate(`/w/${activeWorkspaceId}/p/${page.id}`)}
                className={cn(
                  'press-scale w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/40 transition-colors text-left',
                  i > 0 && 'border-t border-border',
                )}
              >
                {page.icon ? (
                  <span className="text-base leading-none shrink-0">{page.icon}</span>
                ) : (
                  <FileText size={14} className="text-muted-foreground shrink-0" />
                )}
                <span className="flex-1 text-sm text-foreground truncate">
                  {page.title || 'Sem título'}
                </span>
                {page.tags.length > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    {page.tags.slice(0, 2).map((tid) => {
                      const tag = wsTags.find((t) => t.id === tid)
                      return tag ? (
                        <span
                          key={tid}
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ backgroundColor: `${tag.color}25`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ) : null
                    })}
                  </div>
                )}
                <span className="text-xs text-muted-foreground/40 shrink-0 font-mono w-8 text-right">
                  {relativeTime(page.updatedAt)}
                </span>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Tags */}
      {wsTags.length > 0 && (
        <motion.section variants={item}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {wsTags.map((tag) => {
              const count = tagPageCounts.get(tag.id) ?? 0
              return (
                <div
                  key={tag.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm"
                  style={{
                    borderColor: `${tag.color}40`,
                    backgroundColor: `${tag.color}12`,
                    color: tag.color,
                  }}
                >
                  <span className="font-medium">{tag.name}</span>
                  <span className="opacity-60 text-xs">{count}</span>
                </div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* Empty state */}
      {pages.length === 0 && (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center cortex-float">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground mb-1">Nenhuma página ainda</p>
            <p className="text-sm text-muted-foreground">Crie sua primeira nota neste workspace</p>
          </div>
          <button
            onClick={handleCreatePage}
            className="press-scale flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Nova página
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
