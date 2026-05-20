import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { useNavigate } from 'react-router-dom'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import { usePageStore } from '@/stores/pageStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { Callout } from './extensions/callout'
import { MonacoBlock } from './extensions/monacoBlock'
import { SlashCommandExtension } from './extensions/slashCommand'
import { WikiLink } from './extensions/wikiLink'
import { BubbleToolbar } from './BubbleToolbar'

interface EditorProps {
  pageId: string
  initialContent: string
  onChange: (content: string) => void
}

export function Editor({ pageId, initialContent, onChange }: EditorProps) {
  const navigate = useNavigate()
  const pages = usePageStore((s) => s.pages)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)

  const wikiPages = pages.map((p) => ({
    id: p.id,
    title: p.title || 'Sem título',
    workspaceId: p.workspaceId,
  }))

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Escreva algo, ou pressione / para comandos…',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Typography,
      Callout,
      MonacoBlock,
      SlashCommandExtension,
      WikiLink.configure({
        pages: wikiPages,
        onNavigate: (targetPageId: string) => {
          const page = pages.find((p) => p.id === targetPageId)
          if (page) navigate(`/w/${page.workspaceId}/p/${targetPageId}`)
          else if (activeWorkspaceId) navigate(`/w/${activeWorkspaceId}/p/${targetPageId}`)
        },
      }),
    ],
    content: initialContent ? (JSON.parse(initialContent) as object) : undefined,
    editorProps: {
      attributes: {
        class: 'cortex-editor focus:outline-none',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  // Keep WikiLink pages list in sync without recreating the editor
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.extensionManager.extensions
      .find((e) => e.name === 'wikiLink')
      ?.configure({ pages: wikiPages })
  }, [editor, wikiPages])

  // Reload content when navigating between pages
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const content = initialContent ? (JSON.parse(initialContent) as object) : null
    editor.commands.setContent(content ?? { type: 'doc', content: [{ type: 'paragraph' }] }, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  return (
    <div className="relative">
      {editor && <BubbleToolbar editor={editor} />}
      <EditorContent editor={editor} className="min-h-[60vh]" />
    </div>
  )
}
