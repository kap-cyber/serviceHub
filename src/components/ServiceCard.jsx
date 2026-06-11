import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import './ServiceCard.css'

export default function ServiceCard({ service }) {
  const navigate = useNavigate()
  const user = getCurrentUser()
  
  // Professional default fallback service image
  const fallbackImage = 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80'
  const [imgSrc, setImgSrc] = useState(service?.image || fallbackImage)

  // Keep state in sync if the service image prop updates
  useEffect(() => {
    setImgSrc(service?.image || fallbackImage)
  }, [service?.image])

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
        <img 
          src={imgSrc} 
          alt={service?.name || 'Service image'} 
          loading="lazy" 
          onError={() => setImgSrc(fallbackImage)}
        />
        {service?.popular && <span className="popular-badge">⭐ Popular</span>}
        <div className="service-card-category">{service?.category}</div>
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
