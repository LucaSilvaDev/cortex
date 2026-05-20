import { WorkspacePicker } from '@/features/workspaces/WorkspacePicker'
import { SidebarTree } from './SidebarTree'

interface SidebarProps {
  width: number
}

export function Sidebar({ width }: SidebarProps) {
  return (
    <aside
      style={{ width }}
      className="flex flex-col h-full border-r border-border bg-surface shrink-0 overflow-hidden"
    >
      <WorkspacePicker />
      <div className="flex-1 overflow-hidden">
        <SidebarTree />
      </div>
    </aside>
  )
}
