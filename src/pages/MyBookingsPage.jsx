import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import BookingCard from '../components/BookingCard'
import { db } from '../firebase/config'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import './MyBookingsPage.css'

const STATUS_TABS = ['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled']

export default function MyBookingsPage() {
  const user = getCurrentUser()
  const [activeTab, setActiveTab] = useState('All')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

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
      setLoading(false)
    }, (error) => {
      console.error("onSnapshot error:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  function refresh() {
    // Real-time listener handles refresh automatically
  }

  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter(b => {
        if (activeTab === 'Accepted') return b.status === 'Accepted' || b.status === 'Confirmed'
        return b.status === activeTab
      })

  const sortedFiltered = [...filtered].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return timeB - timeA
  })

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader"></div>
      </div>
    )
  }

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
            <span className="stat-icon">🤝</span>
            <div>
              <div className="stat-num">{bookings.filter(b => b.status === 'Accepted' || b.status === 'Confirmed').length}</div>
              <div className="stat-label">Accepted</div>
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
                  {bookings.filter(b => {
                    if (tab === 'Accepted') return b.status === 'Accepted' || b.status === 'Confirmed'
                    return b.status === tab
                  }).length}
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
