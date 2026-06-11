import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories } from '../data/services'
import ServiceCard from '../components/ServiceCard'
import { fetchServices } from '../firebase/db'
import './ServicesPage.css'

export default function ServicesPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [sortBy, setSortBy] = useState('popular')
  const [dbServices, setDbServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchServices().then(data => {
      if (active) {
        setDbServices(data)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  const filtered = dbServices
    .filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = selectedCategory === 'All' || s.category === selectedCategory
      return matchSearch && matchCategory
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      return b.popular - a.popular
    })

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="services-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">All Services</h1>
          <p className="section-subtitle">Professional home services at transparent prices</p>
        </div>
      </div>

      <div className="container services-layout">
        <aside className="services-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Search</h3>
            <div className="sidebar-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Category</h3>
            <div className="category-filters">
              <button
                className={`cat-filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                All Services
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Sort By</h3>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        <div className="services-main">
          <div className="services-top-bar">
            <p className="results-count">
              Showing <strong>{filtered.length}</strong> service{filtered.length !== 1 ? 's' : ''}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {search && ` for "${search}"`}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No services found</h3>
              <p>Try adjusting your search or category filter</p>
              <button
                className="btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => { setSearch(''); setSelectedCategory('All') }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="services-grid-main">
              {filtered.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
