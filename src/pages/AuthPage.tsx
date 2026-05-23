import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

export function AuthPage() {
  const { signIn, signUp } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) setError(err)
    } else {
      const err = await signUp(email, password)
      if (err) setError(err)
      else setInfo('Conta criada! Verifique seu e-mail para confirmar.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <img src="/cortex-icon-256.png" alt="Cortex" className="w-8 h-8" />
          <span className="text-xl font-bold text-foreground tracking-tight">Cortex</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl shadow-black/20">
          <h1 className="text-lg font-semibold text-foreground mb-1">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            {mode === 'login'
              ? 'Acesse suas notas de qualquer dispositivo.'
              : 'Comece a construir seu segundo cérebro.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={cn(
                  'w-full px-3 py-2 rounded-lg border border-border bg-background',
                  'text-sm text-foreground placeholder:text-muted-foreground/40',
                  'outline-none focus:border-primary transition-colors',
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  'w-full px-3 py-2 rounded-lg border border-border bg-background',
                  'text-sm text-foreground placeholder:text-muted-foreground/40',
                  'outline-none focus:border-primary transition-colors',
                )}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            {info && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setInfo(null) }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login'
                ? 'Não tem conta? Criar agora'
                : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
