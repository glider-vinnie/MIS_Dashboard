import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  /* ── client-side validation ──────────────────────────── */
  const validate = () => {
    const next = {}
    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email address'
    }
    if (!password) {
      next.password = 'Password is required'
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  /* ── form submit ─────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      // Expected: { token, user: { name, role, zones[] } }
      login({ token: data.token, user: data.user })
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  /* ── UI ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg px-4">
      <div className="w-full max-w-md">
        {/* ── Brand ──────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/10 mb-4 ring-1 ring-accent-500/20">
            <svg
              className="w-8 h-8 text-accent-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            NGO MIS Dashboard
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Sign in to your account
          </p>
        </div>

        {/* ── Login Card ─────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-surface rounded-2xl p-8 shadow-2xl shadow-black/30 border border-surface-lighter/30"
        >
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                }}
                placeholder="you@organization.org"
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl bg-surface-light border text-text-primary placeholder-text-muted
                  focus:outline-none focus:ring-2 focus:border-transparent transition-all
                  ${errors.email
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-surface-lighter focus:ring-accent-500'
                  }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((p) => ({ ...p, password: '' }))
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-xl bg-surface-light border text-text-primary placeholder-text-muted
                  focus:outline-none focus:ring-2 focus:border-transparent transition-all
                  ${errors.password
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-surface-lighter focus:ring-accent-500'
                  }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 px-4 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 active:bg-accent-700
              text-white font-semibold transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
              shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="text-center text-text-muted text-sm mt-6">
            Forgot your password?{' '}
            <a href="#" className="text-accent-400 hover:text-accent-300 transition-colors">
              Reset it here
            </a>
          </p>
        </form>

        {/* Demo Mode */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              login({
                token: 'demo-token',
                user: {
                  name: 'Demo Admin',
                  role: 'admin',
                  zones: ['Delhi', 'Gurgaon', 'Pune', 'Nagpur', 'Mauda', 'Gadarwara', 'Bangalore', 'Kolkata', 'Garo', 'UPAY'],
                },
              })
              toast.success('Welcome to Demo Mode!')
              navigate('/dashboard')
            }}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-lighter/40 text-text-secondary
              hover:bg-surface-light hover:text-text-primary hover:border-accent-500/30
              font-medium text-sm transition-all duration-200 cursor-pointer
              flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            Enter Demo Mode
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-xs mt-8">
          © {new Date().getFullYear()} NGO MIS Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
