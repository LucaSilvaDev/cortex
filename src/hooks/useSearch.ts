import { useMemo } from 'react'
import MiniSearch from 'minisearch'
import { usePageStore } from '@/stores/pageStore'

interface TipTapNode {
  text?: string
  content?: TipTapNode[]
}

function extractText(node: TipTapNode): string {
  if (node.text) return node.text
  if (node.content) return node.content.map(extractText).join(' ')
  return ''
}

function pageBodyText(content: string): string {
  if (!content) return ''
  try {
    const doc = JSON.parse(content) as TipTapNode
    return extractText(doc)
  } catch {
    return ''
  }
}

export interface SearchResult {
  id: string
  title: string
  workspaceId: string
  folderId: string | null
  score: number
}

export function useSearch(query: string): SearchResult[] {
  const pages = usePageStore((s) => s.pages)

  const index = useMemo(() => {
    const ms = new MiniSearch<{ id: string; title: string; body: string; workspaceId: string; folderId: string | null }>({
      fields: ['title', 'body'],
      storeFields: ['title', 'workspaceId', 'folderId'],
      searchOptions: { boost: { title: 2 }, fuzzy: 0.2, prefix: true },
    })
    ms.addAll(
      pages.map((p) => ({
        id: p.id,
        title: p.title || 'Sem título',
        body: pageBodyText(p.content),
        workspaceId: p.workspaceId,
        folderId: p.folderId,
      })),
    )
    return ms
  }, [pages])

  return useMemo(() => {
    if (!query.trim()) return []
    return index.search(query).map((r) => ({
      id: r.id,
      title: r.title as string,
      workspaceId: r.workspaceId as string,
      folderId: r.folderId as string | null,
      score: r.score,
    }))
  }, [index, query])
}
