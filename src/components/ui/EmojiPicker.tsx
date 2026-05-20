import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const EMOJIS = [
  '📚','📖','📝','✏️','🖊️','📓','📔','📒','📕','📗','📘','📙','📃','📄','📋','📑',
  '💻','🖥️','⌨️','🖱️','📱','💾','💿','🖨️','📡','🔌','📲','⌚','🔋',
  '⚙️','🔧','🔨','🛠️','🔩','🔬','🔭','⚗️','🧪','🧫','🧬','🧮','📐','📏','🧲',
  '✅','❌','⚠️','💡','🔑','🔒','📌','📍','🏷️','🔗','📎','📏','🗂️','🗃️','🗄️',
  '⭐','💫','✨','🌟','🔥','💧','⚡','☁️','🌙','☀️','🌍','🌈','❄️','🌊',
  '🌱','🌿','🍃','🌳','🌲','🍀','🌾','🌻','🌸','🍁',
  '🚀','🛸','🛩️','🚂','⛵','🏎️','🚁',
  '🎯','🎨','🎭','🎬','🎮','🎲','🎸','🎵','🏆','🥇','🎓','🏫','🏛️','🏗️',
  '👨‍💻','👩‍💻','🧑‍🎓','🧑‍🏫','🧑‍🔬','🤖','👾','🦾','👁️','🧠','💪',
  '💎','👑','🗝️','⚔️','🛡️','🗺️','🧭','🌐','🏴','🚩',
  '1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','🔢','#️⃣','*️⃣','🔤','🅰️','🅱️',
  '➡️','⬆️','⬇️','⬅️','🔄','🔃','🔀','↩️','↪️','🔁','🔂',
  '💬','💭','📢','📣','🔔','🔕','📩','📨','📧','📫',
  '🗓️','📅','⏰','⏱️','⌛','⏳','📆','🗑️',
  '🍕','☕','🧋','🍎','🍊','🧃','🫖','🍇',
  '😀','😎','🤔','🧐','😤','🥳','🤯','😴','💀','👻',
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const filtered = query
    ? EMOJIS.filter((_, i) => String(i).includes(query) || true).filter((e) =>
        e.includes(query),
      )
    : EMOJIS

  return (
    <div
      ref={ref}
      className="cortex-popup absolute z-50 top-full mt-1 left-0 w-72 bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
    >
      <div className="p-2 border-b border-border">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar emoji…"
          className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 text-foreground"
        />
      </div>
      <div className="grid grid-cols-10 gap-0.5 p-2 max-h-52 overflow-y-auto">
        {filtered.map((emoji, i) => (
          <button
            key={i}
            onClick={() => { onSelect(emoji); onClose() }}
            className="flex items-center justify-center w-7 h-7 rounded-md text-lg hover:bg-secondary/80 transition-colors leading-none"
          >
            {emoji}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-10 text-xs text-muted-foreground text-center py-4">Nenhum resultado</p>
        )}
      </div>
    </div>
  )
}
