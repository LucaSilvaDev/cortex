import { create } from 'zustand'
import { supabase, toPage, toFolder, type PageRow, type FolderRow } from '@/lib/supabase'
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

type PageUpdate = Partial<Pick<Page, 'title' | 'content' | 'icon' | 'coverImage' | 'order' | 'folderId' | 'tags' | 'isPinned'>>
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
    const [{ data: fData }, { data: pData }] = await Promise.all([
      supabase.from('folders').select('*').eq('workspace_id', workspaceId).order('order'),
      supabase.from('pages').select('*').eq('workspace_id', workspaceId).order('order'),
    ])
    set({
      folders: (fData as FolderRow[] ?? []).map(toFolder),
      pages: (pData as PageRow[] ?? []).map(toPage),
      workspaceId,
      isLoaded: true,
    })
  },

  createPage: async ({ workspaceId, folderId = null, title = '', content = '' }) => {
    const now = Date.now()
    const { pages } = get()
    const { data: { user } } = await supabase.auth.getUser()
    const row: PageRow = {
      id: generateId(),
      workspace_id: workspaceId,
      user_id: user!.id,
      folder_id: folderId,
      title,
      content,
      icon: null,
      cover_image: null,
      tags: [],
      is_published: false,
      is_pinned: null,
      order: pages.filter((p) => p.folderId === folderId).length,
      created_at: now,
      updated_at: now,
    }
    await supabase.from('pages').insert(row)
    const page = toPage(row)
    set({ pages: [...get().pages, page] })
    return page
  },

  updatePage: async (id, data) => {
    const now = Date.now()
    const dbData: Record<string, unknown> = { updated_at: now }
    if (data.title !== undefined) dbData.title = data.title
    if (data.content !== undefined) dbData.content = data.content
    if (data.icon !== undefined) dbData.icon = data.icon ?? null
    if (data.coverImage !== undefined) dbData.cover_image = data.coverImage ?? null
    if (data.order !== undefined) dbData.order = data.order
    if (data.folderId !== undefined) dbData.folder_id = data.folderId
    if (data.tags !== undefined) dbData.tags = data.tags
    if (data.isPinned !== undefined) dbData.is_pinned = data.isPinned
    await supabase.from('pages').update(dbData).eq('id', id)
    set((state) => ({
      pages: state.pages.map((p) => p.id === id ? { ...p, ...data, updatedAt: now } : p),
    }))
  },

  deletePage: async (id) => {
    await supabase.from('pages').delete().eq('id', id)
    set((state) => ({ pages: state.pages.filter((p) => p.id !== id) }))
  },

  createFolder: async ({ workspaceId, parentId = null, name = '' }) => {
    const now = Date.now()
    const { folders } = get()
    const { data: { user } } = await supabase.auth.getUser()
    const row: FolderRow = {
      id: generateId(),
      workspace_id: workspaceId,
      user_id: user!.id,
      parent_id: parentId,
      name,
      icon: null,
      order: folders.filter((f) => f.parentId === parentId).length,
      created_at: now,
      updated_at: now,
    }
    await supabase.from('folders').insert(row)
    const folder = toFolder(row)
    set({ folders: [...get().folders, folder] })
    return folder
  },

  updateFolder: async (id, data) => {
    const now = Date.now()
    const dbData: Record<string, unknown> = { updated_at: now }
    if (data.name !== undefined) dbData.name = data.name
    if (data.icon !== undefined) dbData.icon = data.icon ?? null
    if (data.order !== undefined) dbData.order = data.order
    if (data.parentId !== undefined) dbData.parent_id = data.parentId
    await supabase.from('folders').update(dbData).eq('id', id)
    set((state) => ({
      folders: state.folders.map((f) => f.id === id ? { ...f, ...data, updatedAt: now } : f),
    }))
  },

  deleteFolder: async (id) => {
    await supabase.from('pages').delete().eq('folder_id', id)
    await supabase.from('folders').delete().eq('id', id)
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      pages: state.pages.filter((p) => p.folderId !== id),
    }))
  },
}))
