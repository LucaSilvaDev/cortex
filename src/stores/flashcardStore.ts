import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { supabase, toFlashcard, type FlashcardRow } from '@/lib/supabase'
import type { Flashcard } from '@/types/db'
import { applyReview, isDue, INITIAL_SM, type SMRating } from '@/lib/sm2'

interface FlashcardState {
  cards: Flashcard[]
  isLoaded: boolean
  load: (workspaceId: string) => Promise<void>
  add: (data: Pick<Flashcard, 'pageId' | 'workspaceId' | 'front' | 'back'>) => Promise<Flashcard>
  update: (id: string, data: Partial<Pick<Flashcard, 'front' | 'back'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  review: (id: string, rating: SMRating) => Promise<void>
  dueCards: (workspaceId: string) => Flashcard[]
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  cards: [],
  isLoaded: false,

  load: async (workspaceId) => {
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('workspace_id', workspaceId)
    set({ cards: (data as FlashcardRow[] ?? []).map(toFlashcard), isLoaded: true })
  },

  add: async (data) => {
    const now = Date.now()
    const { data: { user } } = await supabase.auth.getUser()
    const row: FlashcardRow = {
      id: nanoid(),
      workspace_id: data.workspaceId,
      user_id: user!.id,
      page_id: data.pageId || null,
      front: data.front,
      back: data.back,
      interval: INITIAL_SM.interval,
      repetitions: INITIAL_SM.repetitions,
      ease_factor: INITIAL_SM.easeFactor,
      due_date: INITIAL_SM.dueDate,
      created_at: now,
      updated_at: now,
    }
    await supabase.from('flashcards').insert(row)
    const card = toFlashcard(row)
    set((s) => ({ cards: [...s.cards, card] }))
    return card
  },

  update: async (id, data) => {
    const updatedAt = Date.now()
    await supabase.from('flashcards').update({ ...data, updated_at: updatedAt }).eq('id', id)
    set((s) => ({
      cards: s.cards.map((c) => c.id === id ? { ...c, ...data, updatedAt } : c),
    }))
  },

  remove: async (id) => {
    await supabase.from('flashcards').delete().eq('id', id)
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }))
  },

  review: async (id, rating) => {
    const card = get().cards.find((c) => c.id === id)
    if (!card) return
    const next = applyReview(card, rating)
    const updatedAt = Date.now()
    await supabase.from('flashcards').update({
      interval: next.interval,
      repetitions: next.repetitions,
      ease_factor: next.easeFactor,
      due_date: next.dueDate,
      updated_at: updatedAt,
    }).eq('id', id)
    set((s) => ({
      cards: s.cards.map((c) => c.id === id ? { ...c, ...next, updatedAt } : c),
    }))
  },

  dueCards: (workspaceId) => {
    return get().cards.filter((c) => c.workspaceId === workspaceId && isDue(c))
  },
}))
