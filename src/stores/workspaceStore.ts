import { create } from 'zustand'
import { db } from '@/lib/db'
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
    const workspaces = await db.workspaces.orderBy('order').toArray()
    set({ workspaces, isLoaded: true })
  },

  create: async (input) => {
    const now = Date.now()
    const { workspaces } = get()
    const workspace: Workspace = {
      id: generateId(),
      name: input.name,
      icon: input.icon,
      color: input.color,
      description: input.description,
      order: workspaces.length,
      createdAt: now,
      updatedAt: now,
    }
    await db.workspaces.add(workspace)
    set({ workspaces: [...workspaces, workspace] })
    return workspace
  },

  update: async (id, data) => {
    const now = Date.now()
    await db.workspaces.update(id, { ...data, updatedAt: now })
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, ...data, updatedAt: now } : w,
      ),
    }))
  },

  remove: async (id) => {
    await db.transaction('rw', [db.workspaces, db.folders, db.pages], async () => {
      await db.workspaces.delete(id)
      await db.folders.where('workspaceId').equals(id).delete()
      await db.pages.where('workspaceId').equals(id).delete()
    })
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
    }))
  },

  setActive: (id) => set({ activeWorkspaceId: id }),
}))
