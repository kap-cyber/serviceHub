import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCurrentUser, logout } from '../utils/auth'
import { getUserBookings } from '../utils/bookings'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const bookings = getUserBookings(user?.id)

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
