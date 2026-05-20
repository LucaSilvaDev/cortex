import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, X } from 'lucide-react'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { nextIntervals, formatInterval, type SMRating } from '@/lib/sm2'
import { cn } from '@/lib/utils'
import type { Flashcard } from '@/types/db'

interface ReviewModalProps {
  open: boolean
  onClose: () => void
}

const RATINGS: { label: string; rating: SMRating; color: string; kbd: string }[] = [
  { label: 'De novo', rating: 0, color: 'bg-destructive/90 hover:bg-destructive text-white', kbd: '1' },
  { label: 'Difícil',  rating: 1, color: 'bg-orange-500/90 hover:bg-orange-500 text-white',   kbd: '2' },
  { label: 'Bom',      rating: 2, color: 'bg-emerald-600/90 hover:bg-emerald-600 text-white',  kbd: '3' },
  { label: 'Fácil',   rating: 3, color: 'bg-primary/90 hover:bg-primary text-primary-foreground', kbd: '4' },
]

function CardFace({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{title}</p>
      <p className="text-lg text-foreground whitespace-pre-wrap leading-relaxed">{content || <span className="text-muted-foreground/40 italic">Sem conteúdo</span>}</p>
    </div>
  )
}

function ReviewSession({ cards, onClose }: { cards: Flashcard[]; onClose: () => void }) {
  const { review } = useFlashcardStore()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const card = cards[index]

  const intervals = useMemo(() => card ? nextIntervals(card) : null, [card])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!revealed) { setRevealed(true); return }
        handleRate(2)  // "Bom" on Enter
      }
      if (revealed) {
        if (e.key === '1') handleRate(0)
        if (e.key === '2') handleRate(1)
        if (e.key === '3') handleRate(2)
        if (e.key === '4') handleRate(3)
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  async function handleRate(rating: SMRating) {
    await review(card.id, rating)
    const next = index + 1
    setReviewed((r) => r + 1)
    if (next >= cards.length) {
      setDone(true)
    } else {
      setIndex(next)
      setRevealed(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <BookOpen size={28} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Sessão concluída!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {reviewed} {reviewed === 1 ? 'card revisado' : 'cards revisados'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="press-scale px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Fechar
        </button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            Card {index + 1} de {cards.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(((index) / cards.length) * 100)}%
          </span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(index / cards.length) * 100}%` }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 px-6 py-4 flex flex-col min-h-0">
        <div className="flex-1 rounded-xl border border-border overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.div
                key={`front-${index}`}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CardFace title="Frente" content={card.front} />
              </motion.div>
            ) : (
              <motion.div
                key={`back-${index}`}
                className="absolute inset-0 bg-secondary/20"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CardFace title="Verso" content={card.back} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="press-scale w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
          >
            Revelar resposta
            <span className="ml-2 text-xs text-muted-foreground opacity-60">Espaço</span>
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.rating}
                onClick={() => handleRate(r.rating)}
                className={cn(
                  'press-scale flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-colors',
                  r.color,
                )}
              >
                <span>{r.label}</span>
                {intervals && (
                  <span className="opacity-70 font-mono">{formatInterval(intervals[r.rating])}</span>
                )}
                <span className="opacity-50 text-[10px]">{r.kbd}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ReviewModal({ open, onClose }: ReviewModalProps) {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const { cards, isLoaded, load, dueCards } = useFlashcardStore()

  useEffect(() => {
    if (open && activeWorkspaceId && !isLoaded) {
      load(activeWorkspaceId)
    }
  }, [open, activeWorkspaceId, isLoaded, load])

  // Reload when workspace changes
  useEffect(() => {
    if (activeWorkspaceId) {
      useFlashcardStore.setState({ isLoaded: false })
      load(activeWorkspaceId)
    }
  }, [activeWorkspaceId])

  const due = activeWorkspaceId ? dueCards(activeWorkspaceId) : []

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-lg h-[560px] bg-surface border border-border rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Revisão de Flashcards</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0">
              {!isLoaded ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Carregando…</p>
                </div>
              ) : due.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Nenhum card para revisar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cards.length === 0
                        ? 'Crie flashcards nas suas notas com o comando /'
                        : 'Todos os cards estão em dia. Volte mais tarde!'}
                    </p>
                  </div>
                </div>
              ) : (
                <ReviewSession cards={due} onClose={onClose} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
