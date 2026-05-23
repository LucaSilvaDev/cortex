import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, FileText, Flame, LayoutGrid, Plus } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { WorkspaceModal } from '@/features/workspaces/WorkspaceModal'
import { db } from '@/lib/db'
import type { Page, Workspace } from '@/types/db'
import { cn } from '@/lib/utils'

// ─── helpers ────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

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

function dayKey(ts: number) {
  return Math.floor(ts / DAY_MS)
}

function computeStreak(pages: Page[]): number {
  const today = dayKey(Date.now())
  const activeDays = new Set(pages.map((p) => dayKey(p.updatedAt)))
  let streak = 0
  for (let d = today; d >= today - 365; d--) {
    if (activeDays.has(d)) streak++
    else if (d < today) break   // today not yet edited → don't break streak
  }
  return streak
}

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const HEATMAP_WEEKS = 13

function buildHeatmap(pages: Page[]) {
  const today = new Date(); today.setHours(0,0,0,0)
  // Start from the Sunday of HEATMAP_WEEKS weeks ago
  const start = new Date(today)
  start.setDate(start.getDate() - today.getDay() - (HEATMAP_WEEKS - 1) * 7)

  const countMap = new Map<string, number>()
  pages.forEach((p) => {
    const d = new Date(p.updatedAt)
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    countMap.set(k, (countMap.get(k) ?? 0) + 1)
  })

  const weeks: Array<Array<{ date: Date; count: number; isToday: boolean; isFuture: boolean }>> = []
  const cur = new Date(start)
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const k = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`
      week.push({ date: new Date(cur), count: countMap.get(k) ?? 0, isToday: cur.toDateString() === today.toDateString(), isFuture: cur > today })
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

// ─── types ──────────────────────────────────────────────────────────────────

interface RecentPage extends Page {
  workspaceName: string
  workspaceColor: string
  workspaceIcon: string
}

// ─── animation ──────────────────────────────────────────────────────────────

const container = { hidden: {}, show: { transition: { staggerChildren: 0.055 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } } }

// ─── sub-components ─────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  iconColor: string
  iconBg: string
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-surface">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
        <Icon size={15} className={iconColor} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground/50 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function HeatmapChart({ weeks }: { weeks: ReturnType<typeof buildHeatmap> }) {
  // Month labels: find the first week each month appears
  const monthLabels: Array<{ label: string; col: number }> = []
  weeks.forEach((week, w) => {
    const m = week[0].date.getMonth()
    if (w === 0 || weeks[w - 1][0].date.getMonth() !== m) {
      monthLabels.push({ label: MONTHS_PT[m], col: w })
    }
  })

  return (
    <div className="p-4 rounded-xl border border-border bg-surface">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Atividade — {HEATMAP_WEEKS} semanas
      </p>

      {/* Month labels */}
      <div className="flex mb-1 pl-5">
        {weeks.map((_, w) => {
          const ml = monthLabels.find((m) => m.col === w)
          return (
            <div key={w} className="flex-1 min-w-0">
              {ml && <span className="text-[9px] text-muted-foreground/50">{ml.label}</span>}
            </div>
          )
        })}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 shrink-0">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} className="h-3 flex items-center justify-end">
              {(i === 1 || i === 3 || i === 5) && (
                <span className="text-[9px] text-muted-foreground/40 w-3 text-center">{d}</span>
              )}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5 flex-1">
          {weeks.map((week, w) => (
            <div key={w} className="flex flex-col gap-0.5 flex-1">
              {week.map((cell, d) => (
                <div
                  key={d}
                  title={`${cell.date.toLocaleDateString('pt-BR')}: ${cell.count} edição(ões)`}
                  className={cn(
                    'aspect-square rounded-[2px] min-w-[8px] max-w-[14px] transition-opacity',
                    cell.isFuture ? 'opacity-0 pointer-events-none' : '',
                    cell.isToday ? 'ring-1 ring-primary ring-offset-[1.5px] ring-offset-surface' : '',
                    cell.count === 0 ? 'bg-border' :
                    cell.count <= 2 ? 'bg-primary/25' :
                    cell.count <= 5 ? 'bg-primary/55' :
                    'bg-primary',
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[9px] text-muted-foreground/40">menos</span>
        {['bg-border','bg-primary/25','bg-primary/55','bg-primary'].map((c, i) => (
          <div key={i} className={cn('w-2.5 h-2.5 rounded-[2px]', c)} />
        ))}
        <span className="text-[9px] text-muted-foreground/40">mais</span>
      </div>
    </div>
  )
}

function FlashcardPanel({
  total,
  novos,
  emDia,
  pendentes,
}: {
  total: number
  novos: number
  emDia: number
  pendentes: number
}) {
  const segments = [
    { label: 'Pendentes', value: pendentes, color: 'bg-amber-500' },
    { label: 'Em dia', value: emDia, color: 'bg-emerald-500' },
    { label: 'Novos', value: novos, color: 'bg-primary/60' },
  ]

  return (
    <div className="flex flex-col h-full p-4 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Flashcards
        </p>
        <span className="text-xs text-muted-foreground tabular-nums">{total} total</span>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground/50 text-center">
            Crie flashcards nas notas<br />usando o comando /
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-border overflow-hidden flex gap-px">
            {segments.map((s) =>
              s.value > 0 ? (
                <motion.div
                  key={s.label}
                  className={cn('h-full', s.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.value / total) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ) : null,
            )}
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-1">
            {segments.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-sm', s.color)} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <span className="text-xs font-medium text-foreground tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WorkspaceCard({ workspace, pageCount, onClick }: { workspace: Workspace; pageCount: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="press-scale group relative flex flex-col justify-between h-24 p-4 rounded-xl border border-border bg-surface hover:border-primary/40 hover:bg-secondary/40 transition-all text-left overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: workspace.color }} />
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">{workspace.icon}</span>
        <span className="text-sm font-medium text-foreground truncate">{workspace.name}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <FileText size={11} />
        <span>{pageCount} {pageCount === 1 ? 'página' : 'páginas'}</span>
      </div>
    </button>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { workspaces, isLoaded, load, create, setActive } = useWorkspaceStore()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [allPages, setAllPages] = useState<Page[]>([])
  const [recentPages, setRecentPages] = useState<RecentPage[]>([])

  const { cards } = useFlashcardStore()

  useEffect(() => {
    if (!isLoaded) load()
  }, [isLoaded, load])

  useEffect(() => {
    if (!isLoaded || workspaces.length === 0) return

    const wsMap = new Map(workspaces.map((w) => [w.id, w]))

    db.pages.orderBy('updatedAt').reverse().toArray().then((pages) => {
      setAllPages(pages)
      const enriched: RecentPage[] = pages
        .filter((p) => wsMap.has(p.workspaceId))
        .slice(0, 8)
        .map((p) => {
          const ws = wsMap.get(p.workspaceId)!
          return { ...p, workspaceName: ws.name, workspaceColor: ws.color, workspaceIcon: ws.icon }
        })
      setRecentPages(enriched)
    })

    workspaces.forEach((ws) => {
      db.flashcards.where('workspaceId').equals(ws.id).toArray().then((fc) => {
        useFlashcardStore.setState((s) => ({
          cards: [...s.cards.filter((c) => c.workspaceId !== ws.id), ...fc],
          isLoaded: true,
        }))
      })
    })
  }, [isLoaded, workspaces])

  // ── derived stats ──
  const now = Date.now()
  const streak = useMemo(() => computeStreak(allPages), [allPages])
  const heatmap = useMemo(() => buildHeatmap(allPages), [allPages])

  const totalCards = cards.length
  const novos = cards.filter((c) => c.dueDate === 0).length
  const pendentes = cards.filter((c) => c.dueDate > 0 && c.dueDate <= now).length
  const emDia = cards.filter((c) => c.dueDate > now).length

  const pageCountMap = useMemo(() => {
    const m = new Map<string, number>()
    allPages.forEach((p) => m.set(p.workspaceId, (m.get(p.workspaceId) ?? 0) + 1))
    return m
  }, [allPages])

  const handleCreate = async (data: { name: string; color: string; icon: string }) => {
    const ws = await create(data)
    setActive(ws.id)
    navigate(`/w/${ws.id}`)
  }

  if (!isLoaded) return null

  return (
    <motion.div
      className="max-w-4xl mx-auto px-6 py-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3 mb-8">
        <img src="/cortex-icon-256.png" alt="Cortex" className="w-9 h-9 select-none" draggable={false} />
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">{greeting()}</h1>
          <p className="text-sm text-muted-foreground">O que você quer estudar hoje?</p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={FileText}
          label="Páginas criadas"
          value={allPages.length}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
        />
        <StatCard
          icon={LayoutGrid}
          label="Workspaces"
          value={workspaces.length}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-400"
        />
        <StatCard
          icon={BookOpen}
          label="Flashcards"
          value={totalCards}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          sub={pendentes > 0 ? `${pendentes} para revisar` : 'Tudo em dia'}
        />
        <StatCard
          icon={Flame}
          label="Dias seguidos"
          value={streak}
          iconBg={streak > 0 ? 'bg-orange-500/10' : 'bg-muted/30'}
          iconColor={streak > 0 ? 'text-orange-400' : 'text-muted-foreground'}
          sub={streak > 0 ? 'Continue assim!' : 'Edite uma nota hoje'}
        />
      </motion.div>

      {/* Heatmap */}
      <motion.div variants={item} className="mb-4">
        <HeatmapChart weeks={heatmap} />
      </motion.div>

      {/* Flashcard panel */}
      <motion.div variants={item} className="mb-8">
        <FlashcardPanel total={totalCards} novos={novos} emDia={emDia} pendentes={pendentes} />
      </motion.div>

      {/* Workspaces */}
      <motion.section variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Workspaces</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="press-scale flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Plus size={12} />
            Criar
          </button>
        </div>

        {workspaces.length === 0 ? (
          <button
            onClick={() => setModalOpen(true)}
            className="press-scale w-full flex flex-col items-center justify-center gap-2 py-10 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <Plus size={20} />
            <span className="text-sm">Criar primeiro workspace</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                pageCount={pageCountMap.get(ws.id) ?? 0}
                onClick={() => { setActive(ws.id); navigate(`/w/${ws.id}`) }}
              />
            ))}
            <button
              onClick={() => setModalOpen(true)}
              className="press-scale flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all text-xs"
            >
              <Plus size={16} />
              Novo
            </button>
          </div>
        )}
      </motion.section>

      {/* Recent pages */}
      {recentPages.length > 0 && (
        <motion.section variants={item}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Páginas recentes
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            {recentPages.map((page, i) => (
              <button
                key={page.id}
                onClick={() => navigate(`/w/${page.workspaceId}/p/${page.id}`)}
                className={cn(
                  'press-scale w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors text-left',
                  i > 0 && 'border-t border-border',
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: page.workspaceColor }} />
                <FileText size={13} className="text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm text-foreground truncate">
                  {page.title || 'Sem título'}
                </span>
                <span className="text-xs text-muted-foreground/50 shrink-0">
                  {page.workspaceIcon} {page.workspaceName}
                </span>
                <span className="text-xs text-muted-foreground/40 shrink-0 font-mono w-10 text-right">
                  {relativeTime(page.updatedAt)}
                </span>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      <WorkspaceModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} mode="create" />
    </motion.div>
  )
}
