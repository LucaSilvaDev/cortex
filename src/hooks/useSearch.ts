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
  snippet: string
  score: number
}

function extractSnippet(body: string, terms: string[]): string {
  if (!body) return ''
  const lower = body.toLowerCase()
  let bestIdx = -1
  for (const term of terms) {
    const idx = lower.indexOf(term.toLowerCase())
    if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) bestIdx = idx
  }
  if (bestIdx === -1) return body.slice(0, 100)
  const start = Math.max(0, bestIdx - 35)
  const end = Math.min(body.length, bestIdx + 90)
  return (start > 0 ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '')
}

export function useSearch(query: string): SearchResult[] {
  const pages = usePageStore((s) => s.pages)

  const { index, bodies } = useMemo(() => {
    const bodyMap: Record<string, string> = {}
    const ms = new MiniSearch<{ id: string; title: string; body: string; workspaceId: string; folderId: string | null }>({
      fields: ['title', 'body'],
      storeFields: ['title', 'workspaceId', 'folderId'],
      searchOptions: { boost: { title: 2 }, fuzzy: 0.2, prefix: true },
    })
    ms.addAll(
      pages.map((p) => {
        const body = pageBodyText(p.content)
        bodyMap[p.id] = body
        return { id: p.id, title: p.title || 'Sem título', body, workspaceId: p.workspaceId, folderId: p.folderId }
      }),
    )
    return { index: ms, bodies: bodyMap }
  }, [pages])

  return useMemo(() => {
    if (!query.trim()) return []
    return index.search(query).map((r) => {
      const terms = Object.keys(r.match)
      const body = bodies[r.id] ?? ''
      return {
        id: r.id,
        title: r.title as string,
        workspaceId: r.workspaceId as string,
        folderId: r.folderId as string | null,
        snippet: extractSnippet(body, terms),
        score: r.score,
      }
    })
  }, [index, bodies, query])
}
