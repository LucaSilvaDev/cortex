import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attrs: { src: string; alt?: string }) => ReturnType
    }
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1600
      const scale = Math.min(1, MAX / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    }
    img.src = url
  })
}

export async function insertImageFile(
  file: File,
  insertFn: (src: string) => void,
) {
  const src = await fileToBase64(file)
  insertFn(src)
}

function ImageBlockView({ node, selected, deleteNode }: NodeViewProps) {
  const src = node.attrs.src as string
  const alt = (node.attrs.alt as string) ?? ''

  return (
    <NodeViewWrapper contentEditable={false}>
      <div
        className={cn(
          'my-3 relative group rounded-xl overflow-hidden border transition-all',
          selected ? 'border-primary/60 shadow-md shadow-primary/10' : 'border-border',
        )}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="block max-w-full mx-auto select-none"
        />
        <button
          onClick={deleteNode}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
          aria-label="Remover imagem"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </NodeViewWrapper>
  )
}

export const ImageBlock = Node.create({
  name: 'imageBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'img[data-image-block]', getAttrs: (el) => ({
      src: (el as HTMLElement).getAttribute('src') ?? '',
      alt: (el as HTMLElement).getAttribute('alt') ?? '',
    }) }]
  },

  renderHTML({ node }) {
    return ['img', mergeAttributes({
      'data-image-block': '',
      src: node.attrs.src,
      alt: node.attrs.alt,
    })]
  },

  addCommands() {
    return {
      setImageBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView)
  },

  addProseMirrorPlugins() {
    const editor = this.editor

    return [
      new Plugin({
        key: new PluginKey('imageBlockHandler'),
        props: {
          handlePaste(_view, event) {
            const items = event.clipboardData?.items
            if (!items) return false
            for (const item of Array.from(items)) {
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile()
                if (!file) continue
                fileToBase64(file).then((src) => {
                  editor.chain().focus().setImageBlock({ src }).run()
                })
                return true
              }
            }
            return false
          },
          handleDrop(_view, event) {
            const files = event.dataTransfer?.files
            if (!files?.length) return false
            const images = Array.from(files).filter((f) => f.type.startsWith('image/'))
            if (!images.length) return false
            event.preventDefault()
            images.forEach((file) => {
              fileToBase64(file).then((src) => {
                editor.chain().focus().setImageBlock({ src }).run()
              })
            })
            return true
          },
        },
      }),
    ]
  },
})
