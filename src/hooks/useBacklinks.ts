import { useMemo } from 'react'
import { usePageStore } from '@/stores/pageStore'
import type { Page } from '@/types/db'

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

function findWikiLinks(node: TipTapNode, targetId: string): boolean {
  if (node.type === 'wikiLink' && node.attrs?.pageId === targetId) return true
  return node.content?.some((child) => findWikiLinks(child, targetId)) ?? false
}

export function useBacklinks(pageId: string): Page[] {
  const pages = usePageStore((s) => s.pages)

  return useMemo(() => {
    return pages.filter((p) => {
      if (p.id === pageId || !p.content) return false
      try {
        const doc = JSON.parse(p.content) as TipTapNode
        return findWikiLinks(doc, pageId)
      } catch {
        return false
      }
    })
  }, [pages, pageId])
}
