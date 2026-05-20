import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkspace } from '@/hooks/useWorkspace'
import { usePageStore } from '@/stores/pageStore'
import { useUIStore } from '@/stores/uiStore'
import { useAutosave } from '@/hooks/useAutosave'
import { motion } from 'framer-motion'
import { Maximize2, Smile } from 'lucide-react'
import { Editor } from '@/components/editor/Editor'
import { TagPicker } from '@/components/tags/TagPicker'
import { BacklinksPanel } from '@/components/BacklinksPanel'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { registerSaveFn, registerPageDataFn } from '@/lib/savebridge'
import { cn } from '@/lib/utils'
import type { JSONContent } from '@tiptap/core'

function countWords(contentJson: string): number {
  try {
    const doc = JSON.parse(contentJson) as JSONContent
    const text = extractText(doc)
    return text.trim() ? text.trim().split(/\s+/).length : 0
  } catch {
    return 0
  }
}

function extractText(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(extractText).join(' ')
}

export function PageView() {
  useWorkspace()

  const { pageId } = useParams<{ pageId: string }>()
  const { pages, updatePage } = usePageStore()
  const { focusMode, toggleFocusMode } = useUIStore()
  const page = pages.find((p) => p.id === pageId)

  const [title, setTitle] = useState(page?.title ?? '')
  const [content, setContent] = useState(page?.content ?? '')
  const [tags, setTags] = useState(page?.tags ?? [])
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)

  useEffect(() => {
    setTitle(page?.title ?? '')
    setContent(page?.content ?? '')
    setTags(page?.tags ?? [])
  }, [pageId, page?.title, page?.content, page?.tags])

  function handleTagsChange(tagIds: string[]) {
    setTags(tagIds)
    if (pageId) void updatePage(pageId, { tags: tagIds })
  }

  function handleIconSelect(emoji: string) {
    if (pageId) void updatePage(pageId, { icon: emoji })
  }

  function handleIconRemove() {
    if (pageId) void updatePage(pageId, { icon: undefined })
    setEmojiPickerOpen(false)
  }

  const { saveNow } = useAutosave(pageId, title, content)

  useEffect(() => {
    registerSaveFn(saveNow)
    return () => registerSaveFn(null)
  }, [saveNow])

  useEffect(() => {
    registerPageDataFn(() => ({ title, content }))
    return () => registerPageDataFn(null)
  }, [title, content])

  const handleTitleBlur = () => {
    if (pageId && title !== page?.title) updatePage(pageId, { title })
  }

  const wordCount = useMemo(() => countWords(content), [content])

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Página não encontrada
      </div>
    )
  }

  return (
    <motion.div
      className={cn('mx-auto px-8 py-10', focusMode ? 'max-w-2xl' : 'max-w-3xl')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Focus mode toggle button */}
      {!focusMode && (
        <button
          onClick={toggleFocusMode}
          title="Modo foco (F11)"
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-secondary shadow-lg transition-all opacity-0 hover:opacity-100 focus:opacity-100 group"
          aria-label="Ativar modo foco"
        >
          <Maximize2 size={14} />
        </button>
      )}

      {/* Page icon */}
      <div className="relative inline-block mb-3">
        <button
          onClick={() => setEmojiPickerOpen((v) => !v)}
          className={cn(
            'group flex items-center justify-center rounded-xl transition-all',
            page.icon
              ? 'text-4xl w-14 h-14 hover:bg-secondary/50'
              : 'w-9 h-9 text-muted-foreground/30 hover:text-muted-foreground hover:bg-secondary/50',
          )}
          title="Definir ícone da página"
        >
          {page.icon ? (
            <span className="select-none leading-none">{page.icon}</span>
          ) : (
            <Smile size={18} />
          )}
        </button>

        {emojiPickerOpen && (
          <EmojiPicker
            onSelect={handleIconSelect}
            onClose={() => setEmojiPickerOpen(false)}
          />
        )}

        {page.icon && emojiPickerOpen && (
          <button
            onClick={handleIconRemove}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center hover:opacity-80"
          >
            ×
          </button>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            document.querySelector<HTMLElement>('.cortex-editor')?.focus()
          }
        }}
        placeholder="Sem título"
        className={cn(
          'w-full text-4xl font-bold text-foreground bg-transparent',
          'outline-none placeholder:text-muted-foreground/30',
          'mb-6',
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

      {/* Word count */}
      {wordCount > 0 && (
        <p className="mt-8 text-xs text-muted-foreground/40 text-right select-none">
          {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}
        </p>
      )}
    </motion.div>
  )
}
