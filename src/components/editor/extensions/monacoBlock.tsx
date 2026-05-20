import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import MonacoEditor from '@monaco-editor/react'
import type { OnMount } from '@monaco-editor/react'
import { useState } from 'react'
import { Check, ChevronDown, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c', 'cpp',
  'csharp', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css',
  'json', 'yaml', 'markdown', 'bash', 'powershell', 'dockerfile',
]

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlock: {
      setCodeBlock: (attributes?: { language: string }) => ReturnType
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType
    }
  }
}

function LanguageSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (lang: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {value}
        <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute top-full left-0 z-20 mt-1 w-36 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
            <div className="max-h-48 overflow-y-auto py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { onChange(lang); setOpen(false) }}
                  className={cn(
                    'w-full px-3 py-1.5 text-xs text-left transition-colors hover:bg-secondary',
                    lang === value ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label="Copiar código"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

function MonacoBlockView({ node, updateAttributes, selected, editor, getPos }: NodeViewProps) {
  const language = (node.attrs.language as string) ?? 'javascript'
  const code = (node.attrs.code as string) ?? ''

  const handleMount: OnMount = (monacoEditor, monacoInstance) => {
    monacoEditor.addCommand(monacoInstance.KeyCode.Escape, () => {
      const pos = getPos()
      if (typeof pos !== 'number') return
      const endPos = pos + node.nodeSize
      editor.chain().insertContentAt(endPos, { type: 'paragraph' }).setTextSelection(endPos + 1).focus().run()
    })
  }

  return (
    <NodeViewWrapper contentEditable={false}>
      <div
        className={cn(
          'my-3 rounded-xl overflow-hidden border',
          selected ? 'border-primary/60' : 'border-border',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1e1e] border-b border-white/5">
          <LanguageSelector
            value={language}
            onChange={(lang) => updateAttributes({ language: lang })}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/20 select-none">Esc para sair</span>
            <CopyButton code={code} />
          </div>
        </div>

        {/* Monaco */}
        <div className="bg-[#1e1e1e]">
          <MonacoEditor
            height="180px"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={(value) => updateAttributes({ code: value ?? '' })}
            onMount={handleMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              fontSize: 13,
              fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              overviewRulerLanes: 0,
              renderLineHighlight: 'line',
              scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
            }}
          />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const MonacoBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      language: { default: 'javascript' },
      code: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-monaco-block]',
        getAttrs: (el) => ({
          language: (el as HTMLElement).getAttribute('data-language') ?? 'javascript',
          code: (el as HTMLElement).getAttribute('data-code') ?? '',
        }),
      },
    ]
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes({
        'data-monaco-block': '',
        'data-language': node.attrs.language,
        'data-code': node.attrs.code,
      }),
    ]
  },

  addCommands() {
    return {
      setCodeBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(MonacoBlockView)
  },
})
