import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkspace } from '@/hooks/useWorkspace'
import { usePageStore } from '@/stores/pageStore'
import { useAutosave } from '@/hooks/useAutosave'
import { Editor } from '@/components/editor/Editor'
import { TagPicker } from '@/components/tags/TagPicker'
import { BacklinksPanel } from '@/components/BacklinksPanel'
import { cn } from '@/lib/utils'

export function PageView() {
  useWorkspace()

  const { pageId } = useParams<{ pageId: string }>()
  const { pages, updatePage } = usePageStore()
  const page = pages.find((p) => p.id === pageId)

  const [title, setTitle] = useState(page?.title ?? '')
  const [content, setContent] = useState(page?.content ?? '')
  const [tags, setTags] = useState(page?.tags ?? [])

  // Reset local state when navigating to a different page
  useEffect(() => {
    setTitle(page?.title ?? '')
    setContent(page?.content ?? '')
    setTags(page?.tags ?? [])
  }, [pageId, page?.title, page?.content, page?.tags])

  function handleTagsChange(tagIds: string[]) {
    setTags(tagIds)
    if (pageId) void updatePage(pageId, { tags: tagIds })
  }

  const { status } = useAutosave(pageId, title, content)

  // Sync title to store on blur (for sidebar display)
  const handleTitleBlur = () => {
    if (pageId && title !== page?.title) {
      updatePage(pageId, { title })
    }
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Página não encontrada
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Save status */}
      <div className="flex justify-end mb-2 h-5">
        <span
          className={cn(
            'text-xs transition-opacity duration-300',
            status === 'idle' ? 'opacity-0' : 'opacity-100',
            status === 'saved' ? 'text-green-400' : 'text-muted-foreground',
          )}
        >
          {status === 'saving' && 'Salvando…'}
          {status === 'saved' && 'Salvo'}
        </span>
      </div>

      {/* Page title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            // Move focus to editor
            document.querySelector<HTMLElement>('.cortex-editor')?.focus()
          }
        }}
        placeholder="Sem título"
        className={cn(
          'w-full text-4xl font-bold text-foreground bg-transparent',
          'outline-none placeholder:text-muted-foreground/30',
          'mb-6 pb-0',
        )}
        aria-label="Título da página"
      />

      {/* Tags */}
      <div className="mb-6">
        <TagPicker
          workspaceId={page.workspaceId}
          selectedTagIds={tags}
          onChange={handleTagsChange}
        />
      </div>

      {/* Editor */}
      <Editor
        pageId={page.id}
        initialContent={content}
        onChange={setContent}
      />

      <BacklinksPanel pageId={page.id} />
    </div>
  )
}
