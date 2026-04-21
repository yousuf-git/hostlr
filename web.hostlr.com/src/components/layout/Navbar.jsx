import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { disconnectSocket } from '../../api/socket'

const navLinks = {
  finder: [
    { label: 'My Reservations', href: '/me/reservations' },
    { label: 'Chats', href: '/me/chats' },
  ],
  owner: [
    { label: 'Dashboard', href: '/owner/dashboard' },
    { label: 'My Hostels', href: '/owner/hostels' },
    { label: 'Reservations', href: '/owner/reservations' },
    { label: 'Chats', href: '/owner/chats' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Hostels', href: '/admin/hostels' },
    { label: 'Reservations', href: '/admin/reservations' },
  ],
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function Navbar() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const links = user?.role ? navLinks[user.role] || [] : []

  const handleLogout = () => {
    disconnectSocket()
    logout()
    navigate('/')
    setDropdownOpen(false)
    setMobileOpen(false)
  }

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0.5">
            <span className="font-display font-bold text-xl text-ink tracking-tight">HOSTLR</span>
            <span className="text-accent font-bold text-2xl leading-none mb-0.5">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/browse" className="text-sm font-medium text-muted hover:text-ink transition-colors">
              Browse
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-accent'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!token ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-ink border border-border rounded-lg px-4 py-1.5 hover:border-ink transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/register"
                  className="text-sm font-medium bg-accent text-white rounded-lg px-4 py-1.5 hover:bg-accent-dark transition-colors"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-sm text-ink truncate">{user?.name}</p>
                      <span className="inline-block mt-1 text-xs bg-sand text-muted px-2 py-0.5 rounded-full capitalize">
                        {user?.role}
                      </span>
                    </div>
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="block px-4 py-2.5 text-sm text-ink hover:bg-sand transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="border-t border-border mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger */}
            <button
              className="md:hidden p-2 text-ink"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          <Link to="/browse" className="block py-2 text-sm font-medium text-ink">Browse</Link>
          {links.map((link) => (
            <Link key={link.href} to={link.href} className="block py-2 text-sm font-medium text-ink">
              {link.label}
            </Link>
          ))}
          {!token ? (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/auth/login" className="block text-center text-sm font-medium border border-border rounded-lg px-4 py-2">
                Log in
              </Link>
              <Link to="/auth/register" className="block text-center text-sm font-medium bg-accent text-white rounded-lg px-4 py-2">
                Sign up
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="block w-full text-left py-2 text-sm font-medium text-red-500 pt-2 border-t border-border mt-2"
            >
              Log out
            </button>
          )}
        </div>
      )}
    </header>
  )
}
