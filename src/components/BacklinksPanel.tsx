import { Link2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBacklinks } from '@/hooks/useBacklinks'
import { cn } from '@/lib/utils'

interface BacklinksPanelProps {
  pageId: string
}

export function BacklinksPanel({ pageId }: BacklinksPanelProps) {
  const backlinks = useBacklinks(pageId)
  const navigate = useNavigate()

  if (backlinks.length === 0) return null

  return (
    <div className="mt-16 pt-6 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={13} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {backlinks.length} {backlinks.length === 1 ? 'backlink' : 'backlinks'}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {backlinks.map((page) => (
          <button
            key={page.id}
            onClick={() => navigate(`/w/${page.workspaceId}/p/${page.id}`)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-left w-full',
              'text-sm text-muted-foreground',
              'hover:bg-secondary/60 hover:text-foreground transition-colors',
            )}
          >
            <span className="truncate">{page.title || 'Sem título'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
