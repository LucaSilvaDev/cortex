import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { WorkspaceModal } from '@/features/workspaces/WorkspaceModal'
import { useState } from 'react'

export function HomePage() {
  const { workspaces, isLoaded, load, create, setActive } = useWorkspaceStore()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoaded) load()
  }, [isLoaded, load])

  useEffect(() => {
    if (isLoaded && workspaces.length > 0) {
      navigate(`/w/${workspaces[0].id}`, { replace: true })
    }
  }, [isLoaded, workspaces, navigate])

  const handleCreate = async (data: { name: string; color: string; icon: string }) => {
    const ws = await create(data)
    setActive(ws.id)
    navigate(`/w/${ws.id}`)
  }

  if (!isLoaded || workspaces.length > 0) return null

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">C</span>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Bem-vindo ao Cortex</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Seu segundo cérebro para devs. Crie um workspace para começar a organizar suas notas.
        </p>
      </div>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus size={16} />
        Criar workspace
      </button>

      <WorkspaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        mode="create"
      />
    </div>
  )
}
