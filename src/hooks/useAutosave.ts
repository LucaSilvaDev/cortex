import { useEffect, useRef, useState } from 'react'
import { usePageStore } from '@/stores/pageStore'

export type SaveStatus = 'idle' | 'saving' | 'saved'

export function useAutosave(
  pageId: string | undefined,
  title: string,
  content: string,
) {
  const updatePage = usePageStore((s) => s.updatePage)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const firstRunRef = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset dirty flag when page changes
  useEffect(() => {
    firstRunRef.current = true
    setStatus('idle')
  }, [pageId])

  useEffect(() => {
    // Skip the initial mount snapshot for this page
    if (firstRunRef.current) {
      firstRunRef.current = false
      return
    }
    if (!pageId) return

    if (timerRef.current) clearTimeout(timerRef.current)
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current)

    setStatus('saving')
    timerRef.current = setTimeout(async () => {
      await updatePage(pageId, { title, content })
      setStatus('saved')
      clearTimerRef.current = setTimeout(() => setStatus('idle'), 2000)
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pageId, title, content, updatePage])

  return { status }
}
