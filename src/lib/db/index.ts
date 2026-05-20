import Dexie, { type Table } from 'dexie'
import type { Workspace, Folder, Page, Tag, Flashcard } from '@/types/db'
import { SCHEMA_VERSION, STORES } from './schema'

class CortexDB extends Dexie {
  workspaces!: Table<Workspace>
  folders!: Table<Folder>
  pages!: Table<Page>
  tags!: Table<Tag>
  flashcards!: Table<Flashcard>

  constructor() {
    super('cortex')
    this.version(1).stores({
      workspaces: 'id, name, createdAt, updatedAt, order',
      folders: 'id, workspaceId, parentId, name, createdAt, updatedAt, order',
      pages: 'id, workspaceId, folderId, title, createdAt, updatedAt, order, *tags',
      tags: 'id, name, workspaceId, createdAt, updatedAt, order',
    })
    this.version(SCHEMA_VERSION).stores(STORES)
  }
}

export const db = new CortexDB()
