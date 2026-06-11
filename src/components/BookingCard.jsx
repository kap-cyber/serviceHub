import React from 'react'
import { cancelBooking } from '../utils/bookings'
import './BookingCard.css'

export default function BookingCard({ booking, onUpdate }) {
  async function handleCancel() {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking(booking.id)
      if (onUpdate) onUpdate()
    }
  }

  const statusClass = {
    'Pending': 'status-pending',
    'Confirmed': 'status-confirmed',
    'Accepted': 'status-accepted',
    'In Progress': 'status-inprogress',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled'
  }[booking.status] || 'status-pending'

  return (
    <div className={`booking-card ${booking.status === 'Cancelled' ? 'booking-cancelled' : ''}`}>
      <div className="booking-image">
        <img src={booking.serviceImage} alt={booking.serviceName} loading="lazy" />
      </div>
      <div className="booking-info">
        <div className="booking-header">
          <h3 className="booking-service-name">{booking.serviceName}</h3>
          <span className={`booking-status ${statusClass}`}>{booking.status}</span>
        </div>
        <div className="booking-details">
          <div className="booking-detail">
            <span className="detail-icon">📅</span>
            <span>{booking.date}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-icon">⏰</span>
            <span>{booking.time}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-icon">📍</span>
            <span>{booking.address}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-icon">📞</span>
            <span>{booking.phone}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-icon">💰</span>
            <span>₹{booking.price}</span>
          </div>
          {booking.technicianName && (
            <div className="booking-detail">
              <span className="detail-icon">🛠️</span>
              <span>Tech: {booking.technicianName}</span>
            </div>
          )}
        </div>
        <div className="booking-id">Booking ID: #{booking.id}</div>
        {booking.status !== 'Cancelled' && booking.status !== 'Completed' && booking.status !== 'In Progress' && (
          <div className="booking-actions">
            <button onClick={handleCancel} className="cancel-btn">Cancel Booking</button>
          </div>
        )}
      </div>
    </div>
  )
}
