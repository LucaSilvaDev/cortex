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

export const COVER_TECH = [
  // Matrix grid — grade de linhas cyan sobre azul escuro
  'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(34,211,238,.06) 28px,rgba(34,211,238,.06) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(34,211,238,.06) 28px,rgba(34,211,238,.06) 29px),linear-gradient(135deg,#050c18 0%,#071828 100%)',
  // Binary columns — listras verticais como colunas de 0s e 1s
  'repeating-linear-gradient(90deg,rgba(34,211,238,.08) 0px,rgba(34,211,238,.08) 1px,transparent 1px,transparent 14px),repeating-linear-gradient(0deg,rgba(34,211,238,.03) 0px,rgba(34,211,238,.03) 1px,transparent 1px,transparent 26px),linear-gradient(180deg,#050c14 0%,#070f1c 100%)',
  // Circuit neon — brilhos cyan + roxo simulando circuito
  'radial-gradient(ellipse at 15% 50%,rgba(34,211,238,.22) 0%,transparent 55%),radial-gradient(ellipse at 85% 20%,rgba(124,58,237,.22) 0%,transparent 55%),linear-gradient(135deg,#04060e 0%,#090b1c 100%)',
  // Hacker green — brilho verde Matrix
  'radial-gradient(ellipse at 50% 0%,rgba(34,197,94,.25) 0%,transparent 60%),radial-gradient(ellipse at 50% 100%,rgba(16,185,129,.12) 0%,transparent 60%),linear-gradient(180deg,#030f07 0%,#051209 100%)',
  // Terminal scanlines — linhas horizontais como tela CRT
  'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(34,211,238,.04) 3px,rgba(34,211,238,.04) 4px),linear-gradient(135deg,#040810 0%,#07101a 100%)',
  // Deep void — gradiente radial roxo escuro, estilo espaço
  'radial-gradient(ellipse at 50% 50%,rgba(124,58,237,.25) 0%,rgba(34,211,238,.06) 45%,transparent 70%),linear-gradient(135deg,#030408 0%,#07080f 100%)',
  // Rust/orange — para quem usa Rust ou JS
  'radial-gradient(ellipse at 30% 40%,rgba(249,115,22,.2) 0%,transparent 60%),radial-gradient(ellipse at 75% 70%,rgba(234,88,12,.15) 0%,transparent 55%),linear-gradient(135deg,#0e0602 0%,#130a04 100%)',
  // Python blue+yellow
  'radial-gradient(ellipse at 30% 50%,rgba(59,130,246,.2) 0%,transparent 55%),radial-gradient(ellipse at 70% 50%,rgba(234,179,8,.15) 0%,transparent 55%),linear-gradient(135deg,#04080e 0%,#080c04 100%)',
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

      <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1.5">Tech</p>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {COVER_TECH.map((g, i) => (
          <button
            key={i}
            onClick={() => onSelect(g)}
            className="h-10 rounded-md border border-border/50 hover:scale-105 transition-transform"
            style={{ background: g }}
            title={['Matrix Grid', 'Binary', 'Circuit Neon', 'Hacker Green', 'Terminal', 'Deep Void', 'Rust', 'Python'][i]}
          />
        ))}
      </div>

      <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1.5">Cores</p>
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
