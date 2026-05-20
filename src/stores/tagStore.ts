import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils/id'
import type { Tag } from '@/types/db'

interface TagState {
  tags: Tag[]
  isLoaded: boolean
  loadForWorkspace: (workspaceId: string) => Promise<void>
  create: (workspaceId: string, name: string, color: string) => Promise<Tag>
  update: (id: string, data: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useTagStore = create<TagState>()((set, get) => ({
  tags: [],
  isLoaded: false,

  loadForWorkspace: async (workspaceId) => {
    const tags = await db.tags.where('workspaceId').equals(workspaceId).sortBy('order')
    set({ tags, isLoaded: true })
  },

  create: async (workspaceId, name, color) => {
    const now = Date.now()
    const tag: Tag = {
      id: generateId(),
      workspaceId,
      name,
      color,
      order: get().tags.length,
      createdAt: now,
      updatedAt: now,
    }
    await db.tags.add(tag)
    set({ tags: [...get().tags, tag] })
    return tag
  },

  update: async (id, data) => {
    const now = Date.now()
    await db.tags.update(id, { ...data, updatedAt: now })
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...data, updatedAt: now } : t)),
    }))
  },

  remove: async (id) => {
    await db.tags.delete(id)
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }))
  },
}))
