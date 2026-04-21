import { useState, useEffect } from 'react'

const CITIES = [
  'All', 'Lahore', 'Islamabad', 'Karachi', 'Rawalpindi',
  'Faisalabad', 'Peshawar', 'Multan', 'Quetta',
]

const GENDERS = ['All', 'Male', 'Female', 'Co-ed']

const AMENITIES = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'meals', label: 'Meals' },
  { value: 'ac', label: 'AC' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'study-room', label: 'Study Room' },
  { value: 'parking', label: 'Parking' },
  { value: 'security', label: 'Security' },
  { value: 'generator', label: 'Generator' },
]

export default function SearchFilters({ initialFilters = {}, onChange }) {
  const [filters, setFilters] = useState({
    q: '',
    city: 'All',
    gender: 'All',
    amenities: [],
    minPrice: '',
    maxPrice: '',
    ...initialFilters,
  })

  useEffect(() => {
    onChange(filters)
  }, [filters])

  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))

  const toggleAmenity = (value) => {
    setFilters((prev) => {
      const current = prev.amenities
      return {
        ...prev,
        amenities: current.includes(value)
          ? current.filter((a) => a !== value)
          : [...current, value],
      }
    })
  }

  const clearFilters = () =>
    setFilters({ q: '', city: 'All', gender: 'All', amenities: [], minPrice: '', maxPrice: '' })

  return (
    <div className="bg-white border border-border rounded-2xl p-5 space-y-5 sticky top-24">
      <div>
        <h3 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">Filters</h3>
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Search</label>
        <input
          type="text"
          placeholder="Hostel name..."
          value={filters.q}
          onChange={(e) => update('q', e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">City</label>
        <select
          value={filters.city}
          onChange={(e) => update('city', e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Gender</label>
        <div className="flex flex-col gap-1.5">
          {GENDERS.map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={filters.gender === g}
                onChange={() => update('gender', g)}
                className="accent-accent"
              />
              <span className="text-sm text-ink">{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Amenities</label>
        <div className="grid grid-cols-2 gap-1.5">
          {AMENITIES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities.includes(value)}
                onChange={() => toggleAmenity(value)}
                className="accent-accent rounded"
              />
              <span className="text-sm text-ink">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Price Range (PKR/mo)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full text-sm text-accent hover:text-accent-dark font-medium border border-accent/30 hover:border-accent rounded-lg py-2 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  )
}
