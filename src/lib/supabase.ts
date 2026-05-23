import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

// ─── Row types (DB snake_case) ────────────────────────────────────────

export interface WorkspaceRow {
  id: string; user_id: string; name: string; icon: string; color: string
  description: string | null; order: number; created_at: number; updated_at: number
}
export interface FolderRow {
  id: string; workspace_id: string; user_id: string; parent_id: string | null
  name: string; icon: string | null; order: number; created_at: number; updated_at: number
}
export interface PageRow {
  id: string; workspace_id: string; user_id: string; folder_id: string | null
  title: string; content: string; icon: string | null; cover_image: string | null
  tags: string[]; is_published: boolean; is_pinned: boolean | null
  order: number; created_at: number; updated_at: number
}
export interface TagRow {
  id: string; workspace_id: string; user_id: string; name: string
  color: string; order: number; created_at: number; updated_at: number
}
export interface FlashcardRow {
  id: string; workspace_id: string; user_id: string; page_id: string | null
  front: string; back: string; interval: number; repetitions: number
  ease_factor: number; due_date: number; created_at: number; updated_at: number
}

// ─── Converters ───────────────────────────────────────────────────────

import type { Workspace, Folder, Page, Tag, Flashcard } from '@/types/db'

export const toWorkspace = (r: WorkspaceRow): Workspace => ({
  id: r.id, name: r.name, icon: r.icon, color: r.color,
  description: r.description ?? undefined,
  order: r.order, createdAt: r.created_at, updatedAt: r.updated_at,
})

export const toFolder = (r: FolderRow): Folder => ({
  id: r.id, workspaceId: r.workspace_id, parentId: r.parent_id,
  name: r.name, icon: r.icon ?? undefined,
  order: r.order, createdAt: r.created_at, updatedAt: r.updated_at,
})

export const toPage = (r: PageRow): Page => ({
  id: r.id, workspaceId: r.workspace_id, folderId: r.folder_id,
  title: r.title, content: r.content, icon: r.icon ?? undefined,
  coverImage: r.cover_image ?? undefined, tags: r.tags,
  isPublished: r.is_published, isPinned: r.is_pinned ?? undefined,
  order: r.order, createdAt: r.created_at, updatedAt: r.updated_at,
})

export const toTag = (r: TagRow): Tag => ({
  id: r.id, workspaceId: r.workspace_id, name: r.name, color: r.color,
  order: r.order, createdAt: r.created_at, updatedAt: r.updated_at,
})

export const toFlashcard = (r: FlashcardRow): Flashcard => ({
  id: r.id, workspaceId: r.workspace_id, pageId: r.page_id ?? '',
  front: r.front, back: r.back, interval: r.interval,
  repetitions: r.repetitions, easeFactor: r.ease_factor,
  dueDate: r.due_date, createdAt: r.created_at, updatedAt: r.updated_at,
})
