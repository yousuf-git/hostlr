import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Search, Armchair, MessageSquare } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import PageTransition from '../../components/ui/PageTransition'

gsap.registerPlugin(ScrollTrigger)

const CITIES = [
  { name: 'Lahore', img: 'https://images.unsplash.com/photo-1567942712661-82b9b407abbf?w=600&q=70' },
  { name: 'Islamabad', img: 'https://images.unsplash.com/photo-1590086783191-a0694c7d1e6e?w=600&q=70' },
  { name: 'Karachi', img: 'https://images.unsplash.com/photo-1610543949401-c73f49d12cd1?w=600&q=70' },
  { name: 'Rawalpindi', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&q=70' },
  { name: 'Peshawar', img: 'https://images.unsplash.com/photo-1576504739289-bbb9f15ab1f9?w=600&q=70' },
  { name: 'Multan', img: 'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=600&q=70' },
]

const FEATURES = [
  {
    icon: Search,
    title: 'Search & Browse',
    desc: 'Filter by city, gender, amenities, and price. Find the perfect hostel in minutes.',
  },
  {
    icon: Armchair,
    title: 'Reserve a Seat',
    desc: 'See real-time seat availability. Reserve instantly with a 2-day confirmation window.',
  },
  {
    icon: MessageSquare,
    title: 'Chat with Owner',
    desc: 'Ask questions, negotiate, and settle details directly with hostel owners in-app.',
  },
]

const STEPS = [
  { num: '01', text: 'Search hostels in your city' },
  { num: '02', text: 'Browse rooms and reserve a seat' },
  { num: '03', text: 'Chat with the owner to confirm' },
  { num: '04', text: 'Move in and feel at home!' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', { opacity: 0, y: 40, duration: 0.9, stagger: 0.15, ease: 'power3.out' })
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: '.features-section', start: 'top 80%' },
        opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: 'power2.out',
      })
      gsap.from('.step-item', {
        scrollTrigger: { trigger: '.steps-section', start: 'top 80%' },
        opacity: 0, x: -20, duration: 0.6, stagger: 0.12, ease: 'power2.out',
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />

        {/* Hero */}
        <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80"
              alt="Hostel"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-ink/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-2xl">
              <p className="hero-text text-accent font-medium text-sm uppercase tracking-widest mb-4">
                Pakistan's Hostel Finder
              </p>
              <h1 className="hero-text font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
                Find Your Home<br />
                <span className="italic text-sand">Away From Home.</span>
              </h1>
              <p className="hero-text text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
                Discover comfortable, affordable hostels across Pakistan. Search, reserve a seat, and move in, all in one place.
              </p>
              <div className="hero-text flex flex-wrap gap-3">
                <Link to="/browse" className="bg-accent text-white font-semibold px-7 py-3 rounded-xl hover:bg-accent-dark transition-colors text-base">
                  Browse Hostels
                </Link>
                <Link to="/auth/register" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/20 transition-colors text-base">
                  List Your Hostel
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-sand border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: '8+', label: 'Cities' },
                { value: '50+', label: 'Hostels' },
                { value: '2-Day', label: 'Reservation Window' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display font-bold text-3xl sm:text-4xl text-ink">{value}</p>
                  <p className="text-sm text-muted mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-ink mb-3">Everything you need</h2>
            <p className="text-muted text-lg max-w-lg mx-auto">
              We've made finding and reserving hostel accommodation as simple as possible.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="feature-card bg-white border border-border rounded-2xl p-7 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-accent" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-ink mb-2">{f.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="steps-section bg-sand py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-4xl text-ink mb-3">How It Works</h2>
              <p className="text-muted text-lg">From search to move-in in four easy steps.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {STEPS.map((step) => (
                <div key={step.num} className="step-item flex items-start gap-4 bg-white rounded-2xl border border-border p-6">
                  <span className="font-display font-bold text-3xl text-accent/30 leading-none flex-shrink-0">{step.num}</span>
                  <p className="font-medium text-ink text-base leading-relaxed pt-1">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-4xl text-ink mb-3">Browse by City</h2>
            <p className="text-muted text-lg">Hostels in every major city across Pakistan.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => navigate(`/browse?city=${city.name}`)}
                className="relative h-36 sm:h-44 rounded-2xl overflow-hidden group text-left"
              >
                <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70' }} />
                <div className="absolute inset-0 bg-ink/40 group-hover:bg-ink/50 transition-colors" />
                <span className="absolute bottom-3 left-4 font-display font-semibold text-white text-xl">{city.name}</span>
              </button>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  )
}
