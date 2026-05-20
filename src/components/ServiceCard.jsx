import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import './ServiceCard.css'

export default function ServiceCard({ service }) {
  const navigate = useNavigate()
  const user = getCurrentUser()

  function handleBook() {
    if (!user) {
      navigate('/login')
    } else {
      navigate(`/booking/${service.id}`)
    }
  }

  return (
    <div className="service-card">
      <div className="service-card-image">
        <img src={service.image} alt={service.name} loading="lazy" />
        {service.popular && <span className="popular-badge">⭐ Popular</span>}
        <div className="category-tag">{service.category}</div>
      </div>
      <div className="service-card-body">
        <h3 className="service-name">{service.name}</h3>
        <p className="service-desc">{service.description}</p>
        <div className="service-meta">
          <div className="rating">
            <span className="stars">★★★★★</span>
            <span className="rating-val">{service.rating}</span>
            <span className="review-count">({service.reviewCount?.toLocaleString()})</span>
          </div>
          <div className="duration-badge">⏱ {service.duration}</div>
        </div>
        <div className="service-card-footer">
          <div className="price-block">
            <span className="price-label">Starting at</span>
            <span className="price-val">₹{service.price}</span>
          </div>
          <div className="card-actions">
            <Link to={`/services/${service.id}`} className="btn-ghost view-btn">Details</Link>
            <button onClick={handleBook} className="btn-primary">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}
