import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import PageTransition from '../../components/ui/PageTransition'
import SearchFilters from '../../components/hostel/SearchFilters'
import HostelCard from '../../components/hostel/HostelCard'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Home } from 'lucide-react'

const PAGE_SIZE = 12

function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-sand" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-sand rounded w-1/4" />
        <div className="h-5 bg-sand rounded w-3/4" />
        <div className="h-3 bg-sand rounded w-1/2" />
        <div className="h-4 bg-sand rounded w-1/3 mt-2" />
      </div>
    </div>
  )
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)

  const initialFilters = {
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || 'All',
    gender: searchParams.get('gender') || 'All',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  }
  const [filters, setFilters] = useState(initialFilters)

  // Sync filters → URL
  useEffect(() => {
    const params = {}
    if (filters.q) params.q = filters.q
    if (filters.city && filters.city !== 'All') params.city = filters.city
    if (filters.gender && filters.gender !== 'All') params.gender = filters.gender
    if (filters.amenities?.length) params.amenities = filters.amenities.join(',')
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    setSearchParams(params, { replace: true })
    setPage(1)
  }, [filters])

  const buildQuery = () => {
    const p = new URLSearchParams()
    if (filters.q) p.set('q', filters.q)
    if (filters.city && filters.city !== 'All') p.set('city', filters.city)
    if (filters.gender && filters.gender !== 'All') p.set('gender', filters.gender)
    if (filters.amenities?.length) p.set('amenities', filters.amenities.join(','))
    if (filters.minPrice) p.set('minPrice', filters.minPrice)
    if (filters.maxPrice) p.set('maxPrice', filters.maxPrice)
    p.set('page', page)
    p.set('limit', PAGE_SIZE)
    return p.toString()
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['browse-hostels', filters, page],
    queryFn: () => api.get(`/up/browse/hostels?${buildQuery()}`).then((r) => r.data),
    keepPreviousData: true,
  })

  const hostels = data?.hostels || data?.data || []
  const total = data?.total || hostels.length
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleFiltersChange = useCallback((f) => setFilters(f), [])

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
          <div className="mb-6">
            <h1 className="font-display font-bold text-3xl text-ink">Browse Hostels</h1>
            {!isLoading && (
              <p className="text-muted text-sm mt-1">
                {total} {total === 1 ? 'hostel' : 'hostels'} found
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <SearchFilters initialFilters={initialFilters} onChange={handleFiltersChange} />
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {isLoading || isFetching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : hostels.length === 0 ? (
                <EmptyState
                  icon={<Home size={48} />}
                  title="No hostels found"
                  description="Try adjusting your filters or browsing a different city."
                  action={
                    <button
                      onClick={() => setFilters({ q: '', city: 'All', gender: 'All', amenities: [], minPrice: '', maxPrice: '' })}
                      className="bg-accent text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-accent-dark transition-colors"
                    >
                      Clear filters
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {hostels.map((hostel) => (
                      <HostelCard key={hostel._id} hostel={hostel} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-2 text-sm font-medium border border-border rounded-lg disabled:opacity-40 hover:border-ink transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                              p === page
                                ? 'bg-accent text-white'
                                : 'border border-border hover:border-ink text-ink'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 text-sm font-medium border border-border rounded-lg disabled:opacity-40 hover:border-ink transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
