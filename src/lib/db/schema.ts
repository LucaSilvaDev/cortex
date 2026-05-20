export const SCHEMA_VERSION = 2

export const STORES = {
  workspaces: 'id, name, createdAt, updatedAt, order',
  folders: 'id, workspaceId, parentId, name, createdAt, updatedAt, order',
  pages: 'id, workspaceId, folderId, title, createdAt, updatedAt, order, *tags',
  tags: 'id, name, workspaceId, createdAt, updatedAt, order',
  flashcards: 'id, pageId, workspaceId, dueDate, createdAt, updatedAt',
} as const
