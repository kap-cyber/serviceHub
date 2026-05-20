import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { services, categories } from '../data/services'
import { testimonials } from '../data/testimonials'
import ServiceCard from '../components/ServiceCard'
import TestimonialCard from '../components/TestimonialCard'
import './HomePage.css'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const popularServices = services.filter(s => s.popular)

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/services?search=${encodeURIComponent(search.trim())}`)
    } else {
      navigate('/services')
    }
  }

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge">🏆 India's #1 Home Service Platform</div>
            <h1 className="hero-title">
              Premium Home Services,<br />
              <span className="hero-accent">At Your Doorstep</span>
            </h1>
            <p className="hero-subtitle">
              Trusted by 1 lakh+ happy customers. Verified professionals, guaranteed quality, zero hassle.
            </p>
            <form onSubmit={handleSearch} className="hero-search">
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search for AC repair, cleaning, electrician..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="btn-primary search-btn">Search</button>
            </form>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">1L+</span><span className="stat-label">Happy Customers</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Expert Professionals</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Services Available</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
              alt="Home services"
              className="hero-img"
            />
            <div className="hero-float-card">
              <span className="float-icon">✅</span>
              <div>
                <div className="float-title">Verified Professionals</div>
                <div className="float-sub">Background checked & trained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Find the right service for every need</p>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link to={`/services?category=${cat.name}`} key={cat.id} className="category-card">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-count">{cat.count} services</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="popular-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Most Booked Services</h2>
              <p className="section-subtitle">Trusted choices by thousands of customers</p>
            </div>
            <Link to="/services" className="btn-outline">View All Services</Link>
          </div>
          <div className="services-grid">
            {popularServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-section">
        <div className="container">
          <div className="section-header centered">
            <h2 className="section-title">Why Choose ServiceHub?</h2>
            <p className="section-subtitle">We don't just fix problems — we create experiences</p>
          </div>
          <div className="why-grid">
            {[
              { icon: '🛡️', title: 'Verified Experts', desc: 'All professionals undergo rigorous background checks, skill tests, and in-person training before joining.' },
              { icon: '💸', title: 'Upfront Pricing', desc: 'No hidden charges, no surprise bills. What you see is exactly what you pay.' },
              { icon: '⏱️', title: 'On-Time Guarantee', desc: 'We respect your time. Our professionals arrive within the scheduled slot, every time.' },
              { icon: '🔁', title: 'Re-Service Promise', desc: 'Not satisfied? We\'ll send another professional free of charge within 7 days.' },
              { icon: '🌿', title: 'Eco-Friendly', desc: 'We use green, biodegradable products that are safe for your family and the environment.' },
              { icon: '📱', title: 'Easy Booking', desc: 'Book in under 60 seconds. Track your service live and communicate directly with the professional.' }
            ].map((item, i) => (
              <div className="why-card" key={i}>
                <div className="why-icon">{item.icon}</div>
                <h3 className="why-title">{item.title}</h3>
                <p className="why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header centered">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real stories from real households across India</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* APP PROMO */}
      <section className="app-promo-section">
        <div className="container app-promo-inner">
          <div className="app-promo-content">
            <div className="promo-badge">📲 Download App</div>
            <h2 className="promo-title">Book Services On the Go</h2>
            <p className="promo-text">
              Get exclusive app-only deals, track your service professional in real-time, and manage all bookings from your phone.
            </p>
            <div className="promo-features">
              <span>✅ Live tracking</span>
              <span>✅ Push notifications</span>
              <span>✅ App-only discounts</span>
            </div>
            <div className="app-buttons">
              <button className="app-btn">
                <span className="app-btn-icon">🍎</span>
                <div><span className="app-btn-small">Download on</span><br /><span className="app-btn-large">App Store</span></div>
              </button>
              <button className="app-btn">
                <span className="app-btn-icon">🤖</span>
                <div><span className="app-btn-small">Get it on</span><br /><span className="app-btn-large">Google Play</span></div>
              </button>
            </div>
          </div>
          <div className="app-promo-image">
            <img
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80"
              alt="ServiceHub App"
            />
          </div>
        </div>
      </section>

    </div>
  )
}
