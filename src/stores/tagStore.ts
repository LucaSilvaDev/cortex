import { create } from 'zustand'
import { supabase, toTag, type TagRow } from '@/lib/supabase'
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
    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('order')
    set({ tags: (data as TagRow[] ?? []).map(toTag), isLoaded: true })
  },

  create: async (workspaceId, name, color) => {
    const now = Date.now()
    const { data: { user } } = await supabase.auth.getUser()
    const row: TagRow = {
      id: generateId(),
      workspace_id: workspaceId,
      user_id: user!.id,
      name,
      color,
      order: get().tags.length,
      created_at: now,
      updated_at: now,
    }
    await supabase.from('tags').insert(row)
    const tag = toTag(row)
    set((s) => ({ tags: [...s.tags, tag] }))
    return tag
  },

  update: async (id, data) => {
    const now = Date.now()
    await supabase.from('tags').update({ ...data, updated_at: now }).eq('id', id)
    set((state) => ({
      tags: state.tags.map((t) => t.id === id ? { ...t, ...data, updatedAt: now } : t),
    }))
  },

  remove: async (id) => {
    await supabase.from('tags').delete().eq('id', id)
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }))
  },
}))
