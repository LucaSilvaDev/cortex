import { useNavigate } from 'react-router-dom'
import { WorkspacePicker } from '@/features/workspaces/WorkspacePicker'
import { SidebarTree } from './SidebarTree'
import { SidebarFooter } from './SidebarFooter'

interface SidebarProps {
  width: number
}

export function Sidebar({ width }: SidebarProps) {
  const navigate = useNavigate()

  return (
    <aside
      style={{ width }}
      className="flex flex-col h-full border-r border-border bg-surface backdrop-blur-xl shrink-0 overflow-hidden"
    >
      {/* Logo — click to go home */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 px-3 h-12 border-b border-border shrink-0 hover:bg-secondary/40 transition-colors w-full text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        title="Início"
      >
        <img
          src="/cortex-icon-256.png"
          alt="Cortex"
          className="w-6 h-6 select-none shrink-0"
          draggable={false}
        />
        <span className="text-sm font-semibold text-foreground tracking-tight">Cortex</span>
      </button>

      <WorkspacePicker />
      <div className="flex-1 overflow-hidden">
        <SidebarTree />
      </div>
      <SidebarFooter />
    </aside>
  )
}
