import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { usePageStore } from '@/stores/pageStore'

export function useAutosave(
  pageId: string | undefined,
  title: string,
  content: string,
) {
  const updatePage = usePageStore((s) => s.updatePage)
  const firstRunRef = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Always-fresh data ref so saveNow never goes stale
  const dataRef = useRef({ pageId, title, content })
  dataRef.current = { pageId, title, content }

  useEffect(() => {
    firstRunRef.current = true
  }, [pageId])

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false
      return
    }
    if (!pageId) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSave(), 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pageId, title, content])

  const doSave = useCallback(async () => {
    const { pageId, title, content } = dataRef.current
    if (!pageId) return
    await updatePage(pageId, { title, content })
    toast.success('Salvo', { id: 'autosave', duration: 1500 })
  }, [updatePage])

  // Stable reference — cancels pending autosave timer and saves immediately
  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    await doSave()
  }, [doSave])

  return { saveNow }
}
