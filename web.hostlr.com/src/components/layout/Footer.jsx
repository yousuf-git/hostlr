import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <div className="flex items-center gap-0.5 mb-2">
              <span className="font-display font-bold text-xl text-white tracking-tight">HOSTLR</span>
              <span className="text-accent font-bold text-2xl leading-none mb-0.5">.</span>
            </div>
            <p className="text-sm text-white/50 max-w-xs">
              Find your home away from home. Quality hostels across Pakistan.
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Explore</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/browse" className="text-sm hover:text-white transition-colors">
                    Browse Hostels
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register" className="text-sm hover:text-white transition-colors">
                    For Owners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm cursor-default">About</span>
                </li>
                <li>
                  <span className="text-sm cursor-default">Contact</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} HOSTLR. All rights reserved.</p>
          <p className="text-xs text-white/40">
            Developed by{' '}
            <a href="https://yousuf-dev.com" target="_blank" rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors underline underline-offset-2">
              M. Yousuf
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
