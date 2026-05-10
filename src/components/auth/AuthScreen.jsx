import { useState } from 'react'
import { Logo } from '../ui/Logo'

export function AuthScreen({ onGuest, onEmailAuth, onGoogle }) {
  const [mode, setMode] = useState('landing') // 'landing' | 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await onEmailAuth(email, password, mode === 'signup')
      if (mode === 'signup') {
        setSuccess('Check your inbox for a confirmation link. Very exciting.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Do try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await onGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
      setLoading(false)
    }
  }

  if (mode === 'signin' || mode === 'signup') {
    return (
      <div className="flex flex-col min-h-dvh bg-cream px-6 py-10">
        <button
          onClick={() => { setMode('landing'); setError(''); setSuccess('') }}
          className="text-stone-dark font-body text-sm mb-8 self-start flex items-center gap-1 hover:text-ink transition-colors"
        >
          ← Back
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <Logo className="text-3xl mb-2" />
          <p className="font-body text-stone-dark mb-8 text-sm">
            {mode === 'signup' ? 'Create your account. No spam, ever.' : 'Welcome back. Ready to stop faff-ing?'}
          </p>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input-base"
              autoComplete="email"
            />
            <input
              type="password"
              placeholder={mode === 'signup' ? 'Choose a password' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-base"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />

            {error && (
              <p className="text-red-600 font-body text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-green-700 font-body text-sm bg-green-50 rounded-xl px-3 py-2">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center mt-2"
            >
              {loading ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }}
            className="mt-6 text-stone-dark font-body text-sm text-center hover:text-ink transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8 text-center">
        <Logo className="text-5xl mb-4" />
        <p className="font-display text-xl text-ink/70 italic mb-2">faff.app</p>
        <h1 className="font-display text-3xl font-semibold text-ink leading-tight mb-3 max-w-xs">
          Even &lsquo;nothing&rsquo; is a plan.
        </h1>
        <p className="font-body text-stone-dark text-base leading-relaxed max-w-sm">
          Cure your Sunday-afternoon decision fatigue. Swipe through activities tailored to your energy, budget, and vibe.
        </p>

        {/* Mood strip */}
        <div className="flex gap-3 mt-8 flex-wrap justify-center">
          {['☀️ Park walk', '🍺 Pub quiz', '📚 Read', '🧗 Bouldering', '🎲 Board games'].map(t => (
            <span key={t} className="bg-stone-light text-ink text-xs font-body px-3 py-1.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 safe-bottom flex flex-col gap-3 max-w-sm mx-auto w-full">
        <button
          onClick={() => setMode('signup')}
          className="btn-primary w-full text-center"
        >
          Get started
        </button>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-stone-light rounded-full px-6 py-3 font-body font-medium text-ink transition-all active:scale-95 hover:bg-stone-light/30"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          onClick={() => setMode('signin')}
          className="btn-ghost w-full text-center text-stone-dark"
        >
          Sign in
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-stone-light" />
          <span className="text-stone font-body text-xs">or</span>
          <div className="flex-1 h-px bg-stone-light" />
        </div>

        <button
          onClick={onGuest}
          className="text-stone-dark font-body text-sm text-center hover:text-ink transition-colors"
        >
          Continue as guest — no account needed
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
