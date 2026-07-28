import { useState } from 'react'
import { HandCoins, Sparkles } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { login, signup } from '../lib/auth'

const DEMO_EMAIL = 'demo@loandesk.app'
const DEMO_PASSWORD = 'demo1234'
const DEMO_NAME = 'Demo User'

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-mist/60 focus-ring focus:border-teal/40 outline-none transition-colors'

export default function Login({ onAuthed }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const user = mode === 'login'
        ? login(form.email, form.password)
        : signup(form.name, form.email, form.password)
      onAuthed(user)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleDemoLogin() {
    setError('')
    try {
      const user = login(DEMO_EMAIL, DEMO_PASSWORD)
      onAuthed(user)
    } catch {
      // Demo account doesn't exist on this device/browser yet — create it.
      try {
        const user = signup(DEMO_NAME, DEMO_EMAIL, DEMO_PASSWORD)
        onAuthed(user)
      } catch (err) {
        setError(err.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal/20 border border-teal/30 flex items-center justify-center mb-3">
            <HandCoins size={24} className="text-teal" />
          </div>
          <h1 className="font-display font-bold text-2xl">LoanDesk</h1>
          <p className="text-mist text-sm mt-1">Your loans, your ledger, private to you.</p>
        </div>

        <GlassCard className="p-6 md:p-8">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="focus-ring w-full flex items-center justify-center gap-2 bg-gold/15 text-gold border border-gold/30 rounded-xl py-3 font-medium hover:bg-gold/20 transition-colors mb-5"
          >
            <Sparkles size={16} /> Try the demo — no signup needed
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-mist">or use your own account</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              className={`focus-ring flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-white/10 text-white' : 'text-mist'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError('') }}
              className={`focus-ring flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-white/10 text-white' : 'text-mist'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="text-sm text-mist mb-1.5 block">Name</span>
                <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Your name" required />
              </label>
            )}
            <label className="block">
              <span className="text-sm text-mist mb-1.5 block">Email</span>
              <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </label>
            <label className="block">
              <span className="text-sm text-mist mb-1.5 block">Password</span>
              <input type="password" className={inputClass} value={form.password} onChange={set('password')} placeholder="••••••••" required minLength={4} />
            </label>

            {error && (
              <p className="text-coral text-sm bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              className="focus-ring w-full bg-teal text-ink font-semibold rounded-xl py-3 hover:bg-teal/90 transition-colors"
            >
              {mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </GlassCard>

        <p className="text-center text-xs text-mist mt-6">
          Demo login: <code className="text-mist/80">demo@loandesk.app</code> / <code className="text-mist/80">demo1234</code> — or click the button above.
          Stored on this device only.
        </p>
      </div>
    </div>
  )
}
