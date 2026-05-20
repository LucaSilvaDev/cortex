import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
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
    const cards = await db.flashcards.where('workspaceId').equals(workspaceId).toArray()
    set({ cards, isLoaded: true })
  },

  add: async (data) => {
    const now = Date.now()
    const card: Flashcard = {
      id: nanoid(),
      ...data,
      ...INITIAL_SM,
      createdAt: now,
      updatedAt: now,
    }
    await db.flashcards.add(card)
    set((s) => ({ cards: [...s.cards, card] }))
    return card
  },

  update: async (id, data) => {
    const updatedAt = Date.now()
    await db.flashcards.update(id, { ...data, updatedAt })
    set((s) => ({
      cards: s.cards.map((c) => (c.id === id ? { ...c, ...data, updatedAt } : c)),
    }))
  },

  remove: async (id) => {
    await db.flashcards.delete(id)
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }))
  },

  review: async (id, rating) => {
    const card = get().cards.find((c) => c.id === id)
    if (!card) return
    const next = applyReview(card, rating)
    const updatedAt = Date.now()
    await db.flashcards.update(id, { ...next, updatedAt })
    set((s) => ({
      cards: s.cards.map((c) => (c.id === id ? { ...c, ...next, updatedAt } : c)),
    }))
  },

  dueCards: (workspaceId) => {
    return get().cards.filter((c) => c.workspaceId === workspaceId && isDue(c))
  },
}))
