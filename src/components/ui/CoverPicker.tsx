import { useRef } from 'react'
import { ImagePlus, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const COVER_GRADIENTS = [
  'linear-gradient(135deg, #0a0a0f 0%, #1a1a40 50%, #0f2060 100%)',
  'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  'linear-gradient(135deg, #1a0a2e 0%, #6f0060 100%)',
  'linear-gradient(135deg, #200122, #6f0000)',
  'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
]

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1600
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX }
        else { width = Math.round((width / height) * MAX); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

interface CoverPickerProps {
  onSelect: (value: string) => void
  onRemove: () => void
  onClose: () => void
  hasExisting: boolean
}

export function CoverPicker({ onSelect, onRemove, onClose, hasExisting }: CoverPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    onSelect(b64)
  }

  return (
    <div className="cortex-popup absolute top-full left-0 mt-1.5 z-50 w-72 bg-surface border border-border rounded-xl shadow-xl shadow-black/30 p-3">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-semibold text-muted-foreground">Capa da página</p>
        <button onClick={onClose} className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {COVER_GRADIENTS.map((g, i) => (
          <button
            key={i}
            onClick={() => onSelect(g)}
            className="h-8 rounded-md border border-border/50 hover:scale-105 transition-transform"
            style={{ background: g }}
            title={`Gradiente ${i + 1}`}
          />
        ))}
      </div>

      <div className={cn('flex gap-2', hasExisting && 'border-t border-border pt-2.5 mt-0.5')}>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <ImagePlus size={12} />
          Imagem personalizada
        </button>
        {hasExisting && (
          <button
            onClick={onRemove}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-destructive/30 text-xs text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={12} />
            Remover
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
