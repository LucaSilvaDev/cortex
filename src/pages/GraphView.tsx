import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '@/hooks/useWorkspace'
import { usePageStore } from '@/stores/pageStore'

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

function extractWikiLinks(node: TipTapNode): string[] {
  const links: string[] = []
  if (node.type === 'wikiLink' && typeof node.attrs?.pageId === 'string') {
    links.push(node.attrs.pageId)
  }
  node.content?.forEach((child) => links.push(...extractWikiLinks(child)))
  return links
}

function parseLinks(content: string): string[] {
  if (!content) return []
  try {
    return extractWikiLinks(JSON.parse(content) as TipTapNode)
  } catch {
    return []
  }
}

export function GraphView() {
  const { activeWorkspace } = useWorkspace()
  const pages = usePageStore((s) => s.pages)
  const navigate = useNavigate()

  const { nodes, edges } = useMemo(() => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(pages.length)))
    const spacing = 200

    const nodes: Node[] = pages.map((page, i) => ({
      id: page.id,
      data: { label: page.title || 'Sem título' },
      position: {
        x: (i % cols) * spacing,
        y: Math.floor(i / cols) * spacing,
      },
      style: {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--foreground)',
        fontSize: '12px',
        padding: '8px 12px',
        cursor: 'pointer',
        maxWidth: '160px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    }))

    const edgeSet = new Set<string>()
    const edges: Edge[] = []

    pages.forEach((page) => {
      const targets = parseLinks(page.content)
      targets.forEach((targetId) => {
        const key = `${page.id}->${targetId}`
        if (!edgeSet.has(key) && pages.some((p) => p.id === targetId)) {
          edgeSet.add(key)
          edges.push({
            id: key,
            source: page.id,
            target: targetId,
            style: { stroke: 'var(--primary)', strokeWidth: 1.5, opacity: 0.6 },
            animated: false,
          })
        }
      })
    })

    return { nodes, edges }
  }, [pages])

  if (!activeWorkspace) return null

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border shrink-0">
        <span className="text-sm font-medium text-foreground">Grafo de conhecimento</span>
        <span className="text-xs text-muted-foreground ml-1">
          {pages.length} {pages.length === 1 ? 'página' : 'páginas'} · {edges.length} {edges.length === 1 ? 'link' : 'links'}
        </span>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          onNodeClick={(_, node) => {
            const page = pages.find((p) => p.id === node.id)
            if (page) navigate(`/w/${page.workspaceId}/p/${page.id}`)
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="var(--border)"
          />
          <Controls
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <MiniMap
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
            nodeColor="var(--primary)"
            maskColor="rgba(0,0,0,0.3)"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
