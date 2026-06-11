import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCurrentUser, logout, updateProfile } from '../utils/auth'
import { db } from '../firebase/config'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getCurrentUser())
  const [bookings, setBookings] = useState([])

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Sync user with auth changes
  useEffect(() => {
    function handleAuthChange() {
      const u = getCurrentUser()
      setUser(u)
      if (u) {
        setForm({
          phone: u.phone || '',
          address: u.address || '',
          city: u.city || '',
          state: u.state || '',
          pincode: u.pincode || ''
        })
      }
    }
    window.addEventListener('auth-state-change', handleAuthChange)
    return () => window.removeEventListener('auth-state-change', handleAuthChange)
  }, [])

  // Sync bookings with Firestore in real-time
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = []
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      setBookings(list)
    }, (err) => {
      console.error("Profile bookings fetch error:", err)
    })

    return () => unsubscribe()
  }, [user])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccessMsg('')
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      setError('Please enter a valid 6-digit pincode.')
      return
    }

    try {
      const result = await updateProfile(form)
      if (result.success) {
        setUser(result.user)
        setSuccessMsg('Profile updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to update profile.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length
  }

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'Recently'

  return (
    <div className="profile-page">
      <div className="profile-header-bg">
        <div className="container">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">📧 {user?.email}</p>
              <p className="profile-joined">🗓️ Member since {joinDate}</p>
            </div>
            <button onClick={handleLogout} className="logout-btn-profile">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container profile-body">
        {/* Stats */}
        <div className="profile-section">
          <h2 className="profile-section-title">Booking Statistics</h2>
          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <span className="ps-icon">📋</span>
              <div className="ps-num">{stats.total}</div>
              <div className="ps-label">Total Bookings</div>
            </div>
            <div className="profile-stat-card">
              <span className="ps-icon">⏳</span>
              <div className="ps-num">{stats.pending}</div>
              <div className="ps-label">Pending</div>
            </div>
            <div className="profile-stat-card">
              <span className="ps-icon">✅</span>
              <div className="ps-num">{stats.completed}</div>
              <div className="ps-label">Completed</div>
            </div>
            <div className="profile-stat-card">
              <span className="ps-icon">❌</span>
              <div className="ps-num">{stats.cancelled}</div>
              <div className="ps-label">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="profile-section">
          <h2 className="profile-section-title">Account Information</h2>
          <div className="profile-info-card">
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-val">{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email Address</span>
              <span className="info-val">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Account Type</span>
              <span className="info-val">Customer</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-val">{joinDate}</span>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="profile-section">
          <h2 className="profile-section-title">Personal Details</h2>
          {successMsg && <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '16px' }}>✓ {successMsg}</div>}
          
          {!isEditing ? (
            <div className="profile-info-card">
              <div className="info-row">
                <span className="info-label">Phone Number</span>
                <span className="info-val">{user?.phone || 'Not Provided'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address</span>
                <span className="info-val">{user?.address || 'Not Provided'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">City</span>
                <span className="info-val">{user?.city || 'Not Provided'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">State</span>
                <span className="info-val">{user?.state || 'Not Provided'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Pincode</span>
                <span className="info-val">{user?.pincode || 'Not Provided'}</span>
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => { setIsEditing(true); setError(''); }} className="btn-outline">
                  ✏️ Edit Details
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info-card" style={{ padding: '24px' }}>
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {error && <div className="auth-error" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="profile-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" onClick={() => { setIsEditing(false); setError(''); }} className="btn-ghost" style={{ borderRadius: 'var(--radius-full)' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="profile-section">
          <h2 className="profile-section-title">Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/bookings" className="quick-action-card">
              <span className="qa-icon">📋</span>
              <span className="qa-label">View All Bookings</span>
              <span className="qa-arrow">→</span>
            </Link>
            <Link to="/services" className="quick-action-card">
              <span className="qa-icon">🛠️</span>
              <span className="qa-label">Browse Services</span>
              <span className="qa-arrow">→</span>
            </Link>
            <Link to="/blog" className="quick-action-card">
              <span className="qa-icon">📰</span>
              <span className="qa-label">Read Blog</span>
              <span className="qa-arrow">→</span>
            </Link>
            <button onClick={handleLogout} className="quick-action-card logout-action">
              <span className="qa-icon">🚪</span>
              <span className="qa-label">Logout</span>
              <span className="qa-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
