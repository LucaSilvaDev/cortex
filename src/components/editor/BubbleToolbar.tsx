import { BubbleMenu, type Editor } from '@tiptap/react'
import { Bold, Code, Italic, Link, Plus, RowsIcon, Strikethrough, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BubbleToolbarProps {
  editor: Editor
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  label: string
  children: React.ReactNode
}

function ToolbarButton({ active, label, children, ...props }: ToolbarButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex items-center justify-center w-7 h-7 rounded-md text-sm',
        'transition-colors duration-100',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        active
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
        props.className,
      )}
    >
      {children}
    </button>
  )
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL do link:', prev ?? '')
    if (url === null) return
    if (!url) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
  }

  return (
    <>
    {/* Table toolbar — shown when cursor is inside a table cell */}
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      tippyOptions={{ duration: 100, placement: 'top-start' }}
      shouldShow={({ editor }) => editor.isActive('table')}
    >
      <div className="flex items-center gap-0.5 px-1.5 py-1.5 bg-surface/95 backdrop-blur-xl border border-border rounded-lg shadow-xl shadow-black/30">
        <ToolbarButton label="Adicionar linha abaixo" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run() }}>
          <Plus size={12} />
          <RowsIcon size={11} />
        </ToolbarButton>
        <ToolbarButton label="Adicionar coluna à direita" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run() }}>
          <Plus size={12} />
          <span className="text-[10px] font-mono leading-none">col</span>
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-0.5" />
        <ToolbarButton label="Deletar linha" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run() }}>
          <Trash2 size={11} />
          <RowsIcon size={11} />
        </ToolbarButton>
        <ToolbarButton label="Deletar coluna" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run() }}>
          <Trash2 size={11} />
          <span className="text-[10px] font-mono leading-none">col</span>
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-0.5" />
        <ToolbarButton label="Deletar tabela" className="hover:text-destructive" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run() }}>
          <Trash2 size={12} />
        </ToolbarButton>
      </div>
    </BubbleMenu>

    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: 'top-start' }}
      shouldShow={({ editor, from, to }) => {
        if (from === to) return false
        return !editor.isActive('codeBlock') && !editor.isActive('callout') && !editor.isActive('table')
      }}
    >
      <div className="flex items-center gap-0.5 px-1.5 py-1.5 bg-surface/95 backdrop-blur-xl border border-border rounded-lg shadow-xl shadow-black/30">
        <ToolbarButton
          active={editor.isActive('bold')}
          label="Negrito"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
          }}
        >
          <Bold size={13} strokeWidth={2.5} />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive('italic')}
          label="Itálico"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
          }}
        >
          <Italic size={13} />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive('strike')}
          label="Tachado"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleStrike().run()
          }}
        >
          <Strikethrough size={13} />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive('code')}
          label="Código inline"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleCode().run()
          }}
        >
          <Code size={13} />
        </ToolbarButton>

        <div className="w-px h-4 bg-border mx-0.5" />

        <ToolbarButton
          active={editor.isActive('link')}
          label="Link"
          onMouseDown={(e) => {
            e.preventDefault()
            setLink()
          }}
        >
          <Link size={13} />
        </ToolbarButton>
      </div>
    </BubbleMenu>
    </>
  )
}
