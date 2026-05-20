export const WORKSPACE_COLORS = [
  '#22d3ee',
  '#a78bfa',
  '#f472b6',
  '#fb923c',
  '#4ade80',
  '#facc15',
  '#f87171',
  '#60a5fa',
  '#c084fc',
  '#34d399',
  '#e879f9',
  '#94a3b8',
] as const

export const WORKSPACE_ICON_NAMES = [
  'BookOpen',
  'Code',
  'Terminal',
  'Database',
  'Layers',
  'Globe',
  'Zap',
  'Star',
  'Cpu',
  'GitBranch',
  'FileText',
  'Package',
  'Folder',
  'Bookmark',
  'Pencil',
  'Rocket',
  'Shield',
  'Microscope',
  'Briefcase',
  'Archive',
] as const

export type WorkspaceColor = (typeof WORKSPACE_COLORS)[number]
export type WorkspaceIconName = (typeof WORKSPACE_ICON_NAMES)[number]
