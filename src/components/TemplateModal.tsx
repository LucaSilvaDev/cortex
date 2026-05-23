import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { PAGE_TEMPLATES, type PageTemplate } from '@/lib/pageTemplates'
import { cn } from '@/lib/utils'

interface TemplateModalProps {
  open: boolean
  onSelect: (template: PageTemplate) => void
  onClose: () => void
}

export function TemplateModal({ open, onSelect, onClose }: TemplateModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 w-full max-w-lg"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Nova página</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Escolha um template para começar</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-4">
              {PAGE_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className={cn(
                    'flex flex-col items-start gap-1.5 p-3.5 rounded-lg border text-left',
                    'border-border bg-background/50',
                    'hover:border-primary/50 hover:bg-primary/5',
                    'transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <span className="text-xl leading-none">{template.icon}</span>
                  <span className="text-sm font-medium text-foreground">{template.name}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{template.description}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
