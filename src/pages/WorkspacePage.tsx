import { FileText, Plus } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { usePageStore } from '@/stores/pageStore'
import { useNavigate } from 'react-router-dom'
import { useWorkspaceStore } from '@/stores/workspaceStore'

export function WorkspacePage() {
  useWorkspace()

  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const { pages, createPage } = usePageStore()
  const navigate = useNavigate()

  const handleCreatePage = async () => {
    if (!activeWorkspaceId) return
    const page = await createPage({ workspaceId: activeWorkspaceId })
    navigate(`/w/${activeWorkspaceId}/p/${page.id}`)
  }

  const hasPages = pages.length > 0

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <FileText size={20} className="text-primary" />
      </div>
      <div>
        <p className="text-base font-medium text-foreground mb-1">
          {hasPages ? 'Selecione uma página' : 'Nenhuma página ainda'}
        </p>
        <p className="text-sm text-muted-foreground">
          {hasPages
            ? 'Escolha uma nota na sidebar ou crie uma nova'
            : 'Crie sua primeira nota neste workspace'}
        </p>
      </div>
      <button
        onClick={handleCreatePage}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus size={15} />
        Nova página
      </button>
    </div>
  )
}
