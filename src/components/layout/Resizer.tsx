import { useCallback, useRef } from 'react'
import { useUIStore } from '@/stores/uiStore'

const MIN_WIDTH = 180
const MAX_WIDTH = 480

export function Resizer() {
  const setSidebarWidth = useUIStore((s) => s.setSidebarWidth)
  const dragging = useRef(false)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return
        setSidebarWidth(Math.min(Math.max(ev.clientX, MIN_WIDTH), MAX_WIDTH))
      }

      const onUp = () => {
        dragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [setSidebarWidth],
  )

  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1 h-full cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors duration-150 shrink-0"
      aria-hidden="true"
    />
  )
}
