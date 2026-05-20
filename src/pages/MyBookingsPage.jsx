import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserBookings } from '../utils/bookings'
import { getCurrentUser } from '../utils/auth'
import BookingCard from '../components/BookingCard'
import './MyBookingsPage.css'

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function MyBookingsPage() {
  const user = getCurrentUser()
  const [activeTab, setActiveTab] = useState('All')
  const [bookings, setBookings] = useState(() => getUserBookings(user?.id))

  function refresh() {
    setBookings(getUserBookings(user?.id))
  }

  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter(b => b.status === activeTab)

  const sortedFiltered = [...filtered].sort((a, b) => b.id - a.id)

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">My Bookings</h1>
          <p className="section-subtitle">View and manage all your service appointments</p>
        </div>
      </div>

      <div className="container bookings-container">
        <div className="bookings-stats">
          <div className="stat-card">
            <span className="stat-icon">📋</span>
            <div>
              <div className="stat-num">{bookings.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <div>
              <div className="stat-num">{bookings.filter(b => b.status === 'Pending').length}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div>
              <div className="stat-num">{bookings.filter(b => b.status === 'Confirmed').length}</div>
              <div className="stat-label">Confirmed</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏁</span>
            <div>
              <div className="stat-num">{bookings.filter(b => b.status === 'Completed').length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        <div className="status-tabs">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              className={`status-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab !== 'All' && (
                <span className="tab-count">
                  {bookings.filter(b => b.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {sortedFiltered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>{activeTab === 'All' ? 'No bookings yet' : `No ${activeTab} bookings`}</h3>
            <p>{activeTab === 'All' ? 'Book your first service and it will appear here.' : `You have no bookings with "${activeTab}" status.`}</p>
            {activeTab === 'All' && (
              <Link to="/services" className="btn-primary" style={{ marginTop: 16 }}>Browse Services</Link>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {sortedFiltered.map(booking => (
              <BookingCard key={booking.id} booking={booking} onUpdate={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
