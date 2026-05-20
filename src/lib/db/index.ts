import Dexie, { type Table } from 'dexie'
import type { Workspace, Folder, Page, Tag } from '@/types/db'
import { SCHEMA_VERSION, STORES } from './schema'

class CortexDB extends Dexie {
  workspaces!: Table<Workspace>
  folders!: Table<Folder>
  pages!: Table<Page>
  tags!: Table<Tag>

  constructor() {
    super('cortex')
    this.version(SCHEMA_VERSION).stores(STORES)
  }
}

export const db = new CortexDB()
