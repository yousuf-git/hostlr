import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Home, Eye, EyeOff } from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import PageTransition from '../../components/ui/PageTransition'
import Spinner from '../../components/ui/Spinner'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'finder', phone: '' })
  const [showPassword, setShowPassword] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/up/auth/register', data)
      return res.data
    },
    onSuccess: (data) => {
      login(data.user, data.token)
      toast.success('Account created!')
      navigate(data.user.role === 'owner' ? '/owner/dashboard' : '/browse')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed.'),
  })

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col justify-between p-12">
          <Link to="/" className="font-display font-bold text-2xl text-white">
            HOSTLR<span className="text-accent">.</span>
          </Link>
          <div>
            <h2 className="font-display font-bold text-5xl text-white leading-tight mb-4">
              Join HOSTLR<br />
              <span className="italic text-sand">today.</span>
            </h2>
            <p className="text-gray-400 text-lg">Find hostels or list your property across Pakistan.</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">© 2026 HOSTLR</p>
            <p className="text-gray-700 text-sm mt-1">
              Developed by{' '}
              <a href="https://yousuf-dev.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors underline underline-offset-2">
                M. Yousuf
              </a>
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="mb-8">
              <Link to="/" className="font-display font-bold text-2xl text-ink lg:hidden">
                HOSTLR<span className="text-accent">.</span>
              </Link>
              <h1 className="font-display font-bold text-3xl text-ink mt-4">Create account</h1>
              <p className="text-muted mt-2">Get started in minutes.</p>
            </div>

            {/* Role toggle */}
            <div className="flex bg-sand rounded-xl p-1 mb-6">
              {['finder', 'owner'].map(r => (
                <button key={r} type="button"
                  onClick={() => setForm(p => ({ ...p, role: r }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition capitalize ${form.role === r ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {r === 'finder' ? <Search size={14} /> : <Home size={14} />}
                    {r === 'finder' ? 'Looking for hostel' : 'I own a hostel'}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Usman Ali', required: true },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com', required: true },
                { label: 'Phone (optional)', key: 'phone', type: 'tel', placeholder: '+92 300 1234567', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-ink mb-1.5">{f.label}</label>
                  <input
                    type={f.type} required={f.required} placeholder={f.placeholder}
                    value={form[f.key]} onChange={set(f.key)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
              ))}
              
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required placeholder="Min. 8 characters"
                    value={form.password} onChange={set('password')}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
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
                className="w-full py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 mt-2"
              >
                {mutation.isPending ? <Spinner size="sm" /> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-muted text-sm mt-6">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-accent font-medium hover:underline">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
