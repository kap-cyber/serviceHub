import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import { getBookings, updateBookingStatus, rejectBookingForTechnician } from '../utils/bookings'
import { services } from '../data/services'
import './TechnicianRequestsPage.css'

export default function TechnicianRequestsPage() {
  const [tech, setTech] = useState(() => getCurrentUser())
  const [bookings, setBookings] = useState(() => getBookings())
  const [message, setMessage] = useState('')

  useEffect(() => {
    setTech(getCurrentUser())
    setBookings(getBookings())
  }, [])

  function refresh() {
    setBookings(getBookings())
  }

  function getServiceCategory(serviceId) {
    const s = services.find(item => item.id === serviceId)
    return s ? s.category : ''
  }

  // Filter requests matching technician's chosen categories
  const techServices = tech?.services || []
  
  const pendingRequests = bookings.filter(b => 
    b.status === 'Pending' && 
    techServices.includes(getServiceCategory(b.serviceId)) &&
    !(b.rejectedBy || []).includes(tech?.id)
  )

  function handleAccept(bookingId, serviceName) {
    updateBookingStatus(bookingId, 'Accepted', tech.id, tech.name)
    setMessage(`🎉 You accepted the job: ${serviceName}!`)
    refresh()
    setTimeout(() => setMessage(''), 3000)
  }

  function handleReject(bookingId) {
    rejectBookingForTechnician(bookingId, tech.id)
    setMessage('Job request declined.')
    refresh()
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="tech-requests-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Job Requests</h1>
          <p className="section-subtitle">Incoming service requests matching your skills</p>
        </div>
      </div>

      <div className="container tech-requests-body">
        {message && (
          <div className="toast-message">
            {message}
          </div>
        )}

        {techServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛠️</div>
            <h3>No Service Categories Selected</h3>
            <p>Please update your services offered in the Profile tab to view matching job requests.</p>
            <Link to="/tech/profile" className="btn-primary" style={{ marginTop: 16 }}>Go to Profile</Link>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📨</div>
            <h3>No Incoming Requests</h3>
            <p>You're all caught up! New customer bookings matching your services will appear here.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {pendingRequests.map(req => (
              <div key={req.id} className="request-card">
                <div className="request-image">
                  <img src={req.serviceImage} alt={req.serviceName} />
                  <span className="category-tag">{getServiceCategory(req.serviceId)}</span>
                </div>
                <div className="request-info">
                  <div className="request-header">
                    <h3>{req.serviceName}</h3>
                    <span className="price-tag">₹{req.price}</span>
                  </div>

                  <div className="request-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span>{req.date}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">⏰</span>
                      <span>{req.time}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span>{req.address}</span>
                    </div>
                    {req.notes && (
                      <div className="meta-item notes">
                        <span className="meta-icon">📝</span>
                        <span>"{req.notes}"</span>
                      </div>
                    )}
                  </div>

                  <div className="request-actions">
                    <button 
                      onClick={() => handleReject(req.id)}
                      className="btn-outline reject-btn"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleAccept(req.id, req.serviceName)}
                      className="btn-primary accept-btn"
                    >
                      Accept Job
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
