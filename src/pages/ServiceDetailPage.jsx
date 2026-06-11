import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import { fetchServiceById } from '../firebase/db'
import './ServiceDetailPage.css'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchServiceById(id).then(data => {
      if (active) {
        setService(data)
        setLoading(false)
      }
    }).catch(err => {
      console.error(err)
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="loader-wrapper" style={{ minHeight: '60vh' }}>
        <div className="loader"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="empty-state" style={{ padding: '120px 24px' }}>
        <div className="empty-icon">😕</div>
        <h3>Service Not Found</h3>
        <p>The service you're looking for doesn't exist.</p>
        <Link to="/services" className="btn-primary" style={{ marginTop: 16 }}>Browse Services</Link>
      </div>
    )
  }

  function handleBook() {
    if (!user) {
      navigate('/login')
    } else {
      navigate(`/booking/${service.id}`)
    }
  }

  return (
    <div className="service-detail-page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/services">Services</Link>
          <span>›</span>
          <span>{service.name}</span>
        </div>

        <div className="detail-grid">
          {/* LEFT */}
          <div className="detail-left">
            <div className="detail-image-wrap">
              <img src={service.image} alt={service.name} className="detail-img" />
              {service.popular && (
                <div className="detail-popular">⭐ Most Popular</div>
              )}
            </div>

            <div className="features-card">
              <h3 className="features-title">What's Included</h3>
              <ul className="features-list">
                {service.features.map((feature, i) => (
                  <li key={i} className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT */}
          <div className="detail-right">
            <div className="detail-header">
              <div className="detail-category-tag">{service.category}</div>
              <h1 className="detail-title">{service.name}</h1>
              <div className="detail-rating">
                <span className="stars">★★★★★</span>
                <span className="rating-num">{service.rating}</span>
                <span className="rating-reviews">({service.reviewCount?.toLocaleString()} reviews)</span>
              </div>
            </div>

            <p className="detail-desc">{service.longDescription}</p>

            <div className="detail-meta-grid">
              <div className="meta-item">
                <span className="meta-icon">⏱</span>
                <div>
                  <div className="meta-label">Duration</div>
                  <div className="meta-val">{service.duration}</div>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🛡️</span>
                <div>
                  <div className="meta-label">Warranty</div>
                  <div className="meta-val">30-day service warranty</div>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">✅</span>
                <div>
                  <div className="meta-label">Professional</div>
                  <div className="meta-val">Verified & trained</div>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">💳</span>
                <div>
                  <div className="meta-label">Payment</div>
                  <div className="meta-val">Pay after service</div>
                </div>
              </div>
            </div>

            <div className="available-slots">
              <h3 className="slots-title">Available Time Slots</h3>
              <div className="slots-grid">
                {service.slots.map((slot, i) => (
                  <div key={i} className="slot-chip">{slot}</div>
                ))}
              </div>
            </div>

            <div className="detail-cta">
              <div className="detail-price">
                <span className="detail-price-label">Starting at</span>
                <span className="detail-price-val">₹{service.price}</span>
              </div>
              <button onClick={handleBook} className="btn-primary book-cta-btn">
                Book Now
              </button>
            </div>

            <div className="trust-badges">
              <span>🔒 Secure Booking</span>
              <span>📞 24/7 Support</span>
              <span>🔁 Easy Reschedule</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
