import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils/id'
import type { Folder, Page } from '@/types/db'

interface CreatePageInput {
  workspaceId: string
  folderId?: string | null
  title?: string
  content?: string
}

interface CreateFolderInput {
  workspaceId: string
  parentId?: string | null
  name?: string
}

type PageUpdate = Partial<Pick<Page, 'title' | 'content' | 'icon' | 'order' | 'folderId' | 'tags'>>
type FolderUpdate = Partial<Pick<Folder, 'name' | 'icon' | 'order' | 'parentId'>>

interface PageState {
  folders: Folder[]
  pages: Page[]
  workspaceId: string | null
  isLoaded: boolean
  loadForWorkspace: (workspaceId: string) => Promise<void>
  createPage: (input: CreatePageInput) => Promise<Page>
  updatePage: (id: string, data: PageUpdate) => Promise<void>
  deletePage: (id: string) => Promise<void>
  createFolder: (input: CreateFolderInput) => Promise<Folder>
  updateFolder: (id: string, data: FolderUpdate) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
}

export const usePageStore = create<PageState>()((set, get) => ({
  folders: [],
  pages: [],
  workspaceId: null,
  isLoaded: false,

  loadForWorkspace: async (workspaceId) => {
    const [folders, pages] = await Promise.all([
      db.folders.where('workspaceId').equals(workspaceId).sortBy('order'),
      db.pages.where('workspaceId').equals(workspaceId).sortBy('order'),
    ])
    set({ folders, pages, workspaceId, isLoaded: true })
  },

  createPage: async ({ workspaceId, folderId = null, title = '', content = '' }) => {
    const now = Date.now()
    const { pages } = get()
    const siblings = pages.filter((p) => p.folderId === folderId)
    const page: Page = {
      id: generateId(),
      workspaceId,
      folderId,
      title,
      content,
      tags: [],
      isPublished: false,
      order: siblings.length,
      createdAt: now,
      updatedAt: now,
    }
    await db.pages.add(page)
    set({ pages: [...get().pages, page] })
    return page
  },

  updatePage: async (id, data) => {
    const now = Date.now()
    await db.pages.update(id, { ...data, updatedAt: now })
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: now } : p,
      ),
    }))
  },

  deletePage: async (id) => {
    await db.pages.delete(id)
    set((state) => ({ pages: state.pages.filter((p) => p.id !== id) }))
  },

  createFolder: async ({ workspaceId, parentId = null, name = '' }) => {
    const now = Date.now()
    const { folders } = get()
    const siblings = folders.filter((f) => f.parentId === parentId)
    const folder: Folder = {
      id: generateId(),
      workspaceId,
      parentId,
      name,
      order: siblings.length,
      createdAt: now,
      updatedAt: now,
    }
    await db.folders.add(folder)
    set({ folders: [...get().folders, folder] })
    return folder
  },

  updateFolder: async (id, data) => {
    const now = Date.now()
    await db.folders.update(id, { ...data, updatedAt: now })
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, ...data, updatedAt: now } : f,
      ),
    }))
  },

  deleteFolder: async (id) => {
    await db.transaction('rw', [db.folders, db.pages], async () => {
      await db.folders.delete(id)
      await db.pages.where('folderId').equals(id).delete()
    })
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      pages: state.pages.filter((p) => p.folderId !== id),
    }))
  },
}))
