export const SCHEMA_VERSION = 1

export const STORES = {
  workspaces: 'id, name, createdAt, updatedAt, order',
  folders: 'id, workspaceId, parentId, name, createdAt, updatedAt, order',
  pages: 'id, workspaceId, folderId, title, createdAt, updatedAt, order, *tags',
  tags: 'id, name, workspaceId, createdAt, updatedAt, order',
} as const
