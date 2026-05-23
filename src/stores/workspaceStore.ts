import { create } from 'zustand'
import { supabase, toWorkspace, type WorkspaceRow } from '@/lib/supabase'
import { generateId } from '@/lib/utils/id'
import type { Workspace } from '@/types/db'

interface CreateWorkspaceInput {
  name: string
  icon: string
  color: string
  description?: string
}

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  isLoaded: boolean
  load: () => Promise<void>
  create: (input: CreateWorkspaceInput) => Promise<Workspace>
  update: (id: string, data: Partial<CreateWorkspaceInput>) => Promise<void>
  remove: (id: string) => Promise<void>
  setActive: (id: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoaded: false,

  load: async () => {
    const { data } = await supabase
      .from('workspaces')
      .select('*')
      .order('order')
    const workspaces = (data as WorkspaceRow[] ?? []).map(toWorkspace)
    set({ workspaces, isLoaded: true })
  },

  create: async (input) => {
    const now = Date.now()
    const { workspaces } = get()
    const { data: { user } } = await supabase.auth.getUser()
    const row: WorkspaceRow = {
      id: generateId(),
      user_id: user!.id,
      name: input.name,
      icon: input.icon,
      color: input.color,
      description: input.description ?? null,
      order: workspaces.length,
      created_at: now,
      updated_at: now,
    }
    await supabase.from('workspaces').insert(row)
    const workspace = toWorkspace(row)
    set({ workspaces: [...workspaces, workspace] })
    return workspace
  },

  update: async (id, data) => {
    const now = Date.now()
    await supabase.from('workspaces').update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.description !== undefined && { description: data.description }),
      updated_at: now,
    }).eq('id', id)
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, ...data, updatedAt: now } : w,
      ),
    }))
  },

  remove: async (id) => {
    await supabase.from('workspaces').delete().eq('id', id)
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
    }))
  },

  setActive: (id) => set({ activeWorkspaceId: id }),
}))
