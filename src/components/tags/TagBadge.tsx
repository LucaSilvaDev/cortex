import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  name: string
  color: string
  onRemove?: () => void
  className?: string
}

export function TagBadge({ name, color, onRemove, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'border',
        className,
      )}
      style={{
        backgroundColor: color + '22',
        borderColor: color + '44',
        color,
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-full hover:opacity-70 transition-opacity"
          aria-label={`Remover tag ${name}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
