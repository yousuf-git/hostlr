import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import PageTransition from '../../components/ui/PageTransition'
import Spinner from '../../components/ui/Spinner'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data) => {
      const isAdmin = data.email.includes('admin')
      const endpoint = isAdmin ? '/ap/auth/login' : '/up/auth/login'
      const res = await api.post(endpoint, data)
      return res.data
    },
    onSuccess: (data) => {
      login(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
      const role = data.user.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'owner') navigate('/owner/dashboard')
      else navigate('/browse')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        {/* Left branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col justify-between p-12">
          <Link to="/" className="font-display font-bold text-2xl text-white">
            HOSTLR<span className="text-accent">.</span>
          </Link>
          <div>
            <h2 className="font-display font-bold text-5xl text-white leading-tight mb-4">
              Your home<br />
              <span className="italic text-sand">away from home.</span>
            </h2>
            <p className="text-gray-400 text-lg">Find and reserve hostel seats across Pakistan.</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">© 2026 HOSTLR. All rights reserved.</p>
            <p className="text-gray-700 text-sm mt-1">
              Developed by{' '}
              <a href="https://yousuf-dev.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors underline underline-offset-2">
                M. Yousuf
              </a>
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <Link to="/" className="font-display font-bold text-2xl text-ink lg:hidden">
                HOSTLR<span className="text-accent">.</span>
              </Link>
              <h1 className="font-display font-bold text-3xl text-ink mt-4">Sign in</h1>
              <p className="text-muted mt-2">Welcome back. Enter your credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
                <input
                  type="email" required autoComplete="email"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={mutation.isPending}
                className="w-full py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {mutation.isPending ? <Spinner size="sm" /> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-muted text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-accent font-medium hover:underline">Create one</Link>
            </p>

            <div className="mt-8 p-4 bg-sand rounded-xl text-sm text-muted">
              <p className="font-medium text-ink mb-1">Demo credentials</p>
              <p>Admin: admin@hostlr.test / Admin@123</p>
              <p>Owner: owner1@hostlr.test / Owner@123</p>
              <p>Finder: finder1@hostlr.test / Finder@123</p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
