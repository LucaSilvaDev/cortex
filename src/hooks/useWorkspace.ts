import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { usePageStore } from '@/stores/pageStore'
import { useTagStore } from '@/stores/tagStore'

export function useWorkspace() {
  const { workspaceId } = useParams<{ workspaceId?: string }>()
  const { workspaces, activeWorkspaceId, isLoaded, load, setActive } = useWorkspaceStore()
  const { loadForWorkspace, workspaceId: loadedWsId } = usePageStore()
  const { loadForWorkspace: loadTags, isLoaded: tagsLoaded } = useTagStore()

  useEffect(() => {
    if (!isLoaded) load()
  }, [isLoaded, load])

  useEffect(() => {
    if (!workspaceId) return
    setActive(workspaceId)
    if (workspaceId !== loadedWsId) {
      loadForWorkspace(workspaceId)
      void loadTags(workspaceId)
    }
  }, [workspaceId, loadedWsId, setActive, loadForWorkspace, loadTags])

  // load tags on first mount if workspace already loaded but tags aren't
  useEffect(() => {
    if (!workspaceId || tagsLoaded) return
    void loadTags(workspaceId)
  }, [workspaceId, tagsLoaded, loadTags])

  const activeWorkspace =
    workspaces.find((w) => w.id === (workspaceId ?? activeWorkspaceId)) ?? null

  return { workspaces, activeWorkspace, isLoaded }
}
