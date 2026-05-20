import * as Icons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

type IconsMap = Record<string, React.ComponentType<LucideProps> | undefined>

interface WorkspaceIconProps {
  name: string
  size?: number
  className?: string
}

export function WorkspaceIcon({ name, size = 16, className }: WorkspaceIconProps) {
  const Icon = (Icons as unknown as IconsMap)[name]
  if (!Icon) return <Icons.Folder size={size} className={className} />
  return <Icon size={size} className={className} />
}
