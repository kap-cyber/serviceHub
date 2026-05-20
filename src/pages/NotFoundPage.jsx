import React from 'react'
import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-inner">
        <div className="not-found-number">404</div>
        <div className="not-found-icon">🔍</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          Oops! The page you're looking for seems to have gone on a service call.
          Let us help you find what you need.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">Go to Home</Link>
          <Link to="/services" className="btn-outline">Browse Services</Link>
        </div>
        <div className="not-found-links">
          <span>Popular pages:</span>
          <Link to="/services">Services</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/bookings">My Bookings</Link>
        </div>
      </div>
    </div>
  )
}
