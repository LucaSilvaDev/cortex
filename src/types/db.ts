export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
  order: number
}

export interface Workspace extends BaseEntity {
  name: string
  icon: string
  color: string
  description?: string
}

export interface Folder extends BaseEntity {
  workspaceId: string
  parentId: string | null
  name: string
  icon?: string
}

export interface Page extends BaseEntity {
  workspaceId: string
  folderId: string | null
  title: string
  content: string
  icon?: string
  coverImage?: string
  tags: string[]
  isPublished: boolean
}

export interface Tag extends BaseEntity {
  name: string
  color: string
  workspaceId: string
}
