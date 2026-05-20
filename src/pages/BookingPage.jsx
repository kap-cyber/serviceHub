import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { services } from '../data/services'
import { getCurrentUser } from '../utils/auth'
import { saveBooking } from '../utils/bookings'
import './BookingPage.css'

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const service = services.find(s => s.id === parseInt(id))
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    date: '',
    time: '',
    address: '',
    phone: '',
    notes: ''
  })

  if (!service) {
    return (
      <div className="empty-state" style={{ padding: '120px 24px' }}>
        <div className="empty-icon">😕</div>
        <h3>Service Not Found</h3>
        <Link to="/services" className="btn-primary" style={{ marginTop: 16 }}>Browse Services</Link>
      </div>
    )
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.date) errs.date = 'Please select a date'
    if (!form.time) errs.time = 'Please select a time slot'
    if (!form.address.trim()) errs.address = 'Please enter your address'
    if (!form.phone.trim()) errs.phone = 'Please enter your phone number'
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errs.phone = 'Enter a valid 10-digit mobile number'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    saveBooking({
      userId: user.id,
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.image,
      price: service.price,
      date: form.date,
      time: form.time,
      address: form.address,
      phone: form.phone,
      notes: form.notes
    })

    setSuccess(true)
    setTimeout(() => navigate('/bookings'), 2500)
  }

  if (success) {
    return (
      <div className="booking-success">
        <div className="success-icon">🎉</div>
        <h2>Booking Confirmed!</h2>
        <p>Your booking for <strong>{service.name}</strong> has been placed successfully.</p>
        <p className="success-sub">Redirecting to My Bookings...</p>
        <div className="success-loader"></div>
      </div>
    )
  }

  return (
    <div className="booking-page">
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/services">Services</Link>
            <span>›</span>
            <Link to={`/services/${service.id}`}>{service.name}</Link>
            <span>›</span>
            <span>Book</span>
          </div>
          <h1 className="section-title">Book Service</h1>
          <p className="section-subtitle">Fill in the details to schedule your appointment</p>
        </div>
      </div>

      <div className="container booking-layout">
        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title">📅 Appointment Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Select Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={today}
                  className={errors.date ? 'input-error' : ''}
                />
                {errors.date && <span className="error-msg">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label>Select Time Slot *</label>
                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={errors.time ? 'input-error' : ''}
                >
                  <option value="">-- Choose a slot --</option>
                  {service.slots.map((slot, i) => (
                    <option key={i} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.time && <span className="error-msg">{errors.time}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">📍 Location Details</h3>

            <div className="form-group">
              <label>Full Address *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House/Flat No., Street, Area, City, Pincode"
                rows={3}
                className={errors.address ? 'input-error' : ''}
              />
              {errors.address && <span className="error-msg">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Special Instructions (optional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any specific requirements or notes for the professional..."
                rows={2}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary submit-btn">
            Confirm Booking — ₹{service.price}
          </button>
        </form>

        {/* Summary */}
        <div className="booking-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-service">
            <img src={service.image} alt={service.name} />
            <div>
              <div className="summary-service-name">{service.name}</div>
              <div className="summary-category">{service.category}</div>
            </div>
          </div>

          <div className="summary-details">
            <div className="summary-row">
              <span>Service Charge</span>
              <span>₹{service.price}</span>
            </div>
            <div className="summary-row">
              <span>Platform Fee</span>
              <span className="free-tag">FREE</span>
            </div>
            <div className="summary-row">
              <span>Convenience Fee</span>
              <span className="free-tag">FREE</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total Payable</span>
            <span className="total-val">₹{service.price}</span>
          </div>

          <div className="summary-note">
            💡 Payment is collected after the service is completed.
          </div>

          <div className="summary-info">
            <div className="info-item">⏱ Duration: {service.duration}</div>
            <div className="info-item">⭐ Rating: {service.rating}/5</div>
            <div className="info-item">✅ Verified Professional</div>
            <div className="info-item">🔄 30-day service warranty</div>
          </div>
        </div>
      </div>
    </div>
  )
}
