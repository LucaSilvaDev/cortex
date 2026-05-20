import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalloutType = 'info' | 'warn' | 'success' | 'danger'

const CALLOUT_CONFIG = {
  info: {
    border: 'border-l-blue-400',
    bg: 'bg-blue-400/8',
    text: 'text-blue-400',
    Icon: Info,
  },
  warn: {
    border: 'border-l-yellow-400',
    bg: 'bg-yellow-400/8',
    text: 'text-yellow-400',
    Icon: AlertTriangle,
  },
  success: {
    border: 'border-l-green-400',
    bg: 'bg-green-400/8',
    text: 'text-green-400',
    Icon: CheckCircle,
  },
  danger: {
    border: 'border-l-red-400',
    bg: 'bg-red-400/8',
    text: 'text-red-400',
    Icon: XCircle,
  },
} as const

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { type?: CalloutType }) => ReturnType
    }
  }
}

function CalloutView({ node }: NodeViewProps) {
  const type = (node.attrs.type as CalloutType) ?? 'info'
  const { border, bg, text, Icon } = CALLOUT_CONFIG[type]

  return (
    <NodeViewWrapper>
      <div
        className={cn(
          'flex gap-3 px-4 py-3 my-3 rounded-r-lg border-l-4',
          border,
          bg,
        )}
      >
        <Icon size={15} className={cn('shrink-0 mt-0.5', text)} />
        <NodeViewContent className="flex-1 min-w-0 text-sm" />
      </div>
    </NodeViewWrapper>
  )
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'paragraph+',

  addAttributes() {
    return {
      type: { default: 'info' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': node.attrs.type }), 0]
  },

  addCommands() {
    return {
      setCallout:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs,
            content: [{ type: 'paragraph' }],
          }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView)
  },
})
