import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '@/hooks/useWorkspace'
import { usePageStore } from '@/stores/pageStore'
import { cn } from '@/lib/utils'

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

// ─── Custom node ─────────────────────────────────────────────────────

interface PageNodeData {
  label: string
  icon?: string
  linkCount: number
}

function PageNode({ data, selected }: NodeProps & { data: PageNodeData }) {
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm',
          'bg-surface shadow-md transition-all duration-150',
          selected
            ? 'border-primary shadow-primary/20 shadow-lg'
            : 'border-border hover:border-primary/40',
        )}
        style={{ maxWidth: 180 }}
      >
        {data.icon ? (
          <span className="text-base leading-none shrink-0">{data.icon}</span>
        ) : (
          <span className="w-4 h-4 rounded-md bg-primary/20 shrink-0" />
        )}
        <span className="text-foreground truncate font-medium text-xs leading-snug">
          {data.label || 'Sem título'}
        </span>
        {data.linkCount > 0 && (
          <span className="ml-auto shrink-0 text-[10px] text-primary bg-primary/10 rounded-full px-1.5 py-0.5 font-mono">
            {data.linkCount}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  )
}

const nodeTypes = { page: PageNode }

// ─── Spiral layout ────────────────────────────────────────────────────

function spiralLayout(count: number): Array<{ x: number; y: number }> {
  if (count === 0) return []
  if (count === 1) return [{ x: 0, y: 0 }]
  const positions: Array<{ x: number; y: number }> = []
  const SPACING = 240
  const RINGS = Math.ceil(Math.sqrt(count))
  let placed = 0
  positions.push({ x: 0, y: 0 }); placed++
  for (let ring = 1; ring <= RINGS && placed < count; ring++) {
    const ringCount = ring * 6
    for (let i = 0; i < ringCount && placed < count; i++) {
      const angle = (i / ringCount) * Math.PI * 2
      positions.push({
        x: Math.cos(angle) * ring * SPACING,
        y: Math.sin(angle) * ring * SPACING,
      })
      placed++
    }
  }
  return positions
}

// ─── View ─────────────────────────────────────────────────────────────

export function GraphView() {
  const { activeWorkspace } = useWorkspace()
  const pages = usePageStore((s) => s.pages)
  const navigate = useNavigate()

  const { nodes, edges } = useMemo(() => {
    const positions = spiralLayout(pages.length)

    // Build edge map to count incoming links per page
    const incomingCount = new Map<string, number>()
    pages.forEach((page) => {
      parseLinks(page.content).forEach((targetId) => {
        if (pages.some((p) => p.id === targetId)) {
          incomingCount.set(targetId, (incomingCount.get(targetId) ?? 0) + 1)
        }
      })
    })

    const nodes: Node[] = pages.map((page, i) => ({
      id: page.id,
      type: 'page',
      data: {
        label: page.title || 'Sem título',
        icon: page.icon,
        linkCount: incomingCount.get(page.id) ?? 0,
      } as PageNodeData,
      position: positions[i] ?? { x: i * 220, y: 0 },
    }))

    const edgeSet = new Set<string>()
    const edges: Edge[] = []

    pages.forEach((page) => {
      parseLinks(page.content).forEach((targetId) => {
        const key = `${page.id}->${targetId}`
        if (!edgeSet.has(key) && pages.some((p) => p.id === targetId)) {
          edgeSet.add(key)
          edges.push({
            id: key,
            source: page.id,
            target: targetId,
            style: { stroke: 'var(--primary)', strokeWidth: 1.5, opacity: 0.5 },
            animated: false,
          })
        }
      })
    })

    return { nodes, edges }
  }, [pages])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const page = pages.find((p) => p.id === node.id)
      if (page) navigate(`/w/${page.workspaceId}/p/${page.id}`)
    },
    [pages, navigate],
  )

  if (!activeWorkspace) return null

  const isolated = pages.length - new Set(edges.flatMap((e) => [e.source, e.target])).size

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
        <span className="text-sm font-medium text-foreground">Grafo de conhecimento</span>
        <span className="text-xs text-muted-foreground">
          {pages.length} {pages.length === 1 ? 'página' : 'páginas'}
        </span>
        <span className="text-xs text-muted-foreground">
          · {edges.length} {edges.length === 1 ? 'link' : 'links'}
        </span>
        {isolated > 0 && (
          <span className="text-xs text-muted-foreground/50">
            · {isolated} isoladas
          </span>
        )}
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          onNodeClick={onNodeClick}
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
            nodeColor={(n) => (n.data as PageNodeData).linkCount > 0 ? 'var(--primary)' : 'var(--border)'}
            maskColor="rgba(0,0,0,0.25)"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
