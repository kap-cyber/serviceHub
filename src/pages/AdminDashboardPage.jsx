import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../firebase/config'
import { collection, onSnapshot } from 'firebase/firestore'
import './AdminPages.css'

export default function AdminDashboardPage() {
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Listen to services
    const unsubscribeServices = onSnapshot(collection(db, 'services'), (snap) => {
      const list = []
      snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }))
      setServices(list)
    }, (err) => console.error(err))

    // 2. Listen to bookings
    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      const list = []
      snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }))
      setBookings(list)
    }, (err) => console.error(err))

    // 3. Listen to users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list = []
      snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }))
      setUsers(list)
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })

    return () => {
      unsubscribeServices()
      unsubscribeBookings()
      unsubscribeUsers()
    }
  }, [])

  // Calculate stats
  const totalServices = services.length
  const totalCustomers = users.filter(u => u.role === 'customer').length
  const totalTechnicians = users.filter(u => u.role === 'technician').length
  const totalBookings = bookings.length
  const completedBookings = bookings.filter(b => b.status === 'Completed').length
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length

  // Filter recent registrations
  const recentUsers = [...users]
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
    .slice(0, 5)

  // Filter recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
    .slice(0, 5)

  if (loading) {
    return (
      <div className="loader-wrapper" style={{ minHeight: '60vh' }}>
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">Platform-wide overview, metrics, and administration console</p>
        </div>
      </div>

      <div className="container admin-body">
        {/* Statistics Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="as-icon">🛠️</span>
            <div className="as-num">{totalServices}</div>
            <div className="as-label">Total Services</div>
          </div>
          <div className="admin-stat-card">
            <span className="as-icon">👤</span>
            <div className="as-num">{totalCustomers}</div>
            <div className="as-label">Total Customers</div>
          </div>
          <div className="admin-stat-card">
            <span className="as-icon">🔧</span>
            <div className="as-num">{totalTechnicians}</div>
            <div className="as-label">Total Technicians</div>
          </div>
          <div className="admin-stat-card highlight">
            <span className="as-icon">📋</span>
            <div className="as-num">{totalBookings}</div>
            <div className="as-label">Total Bookings</div>
          </div>
          <div className="admin-stat-card">
            <span className="as-icon">✅</span>
            <div className="as-num">{completedBookings}</div>
            <div className="as-label">Completed</div>
          </div>
          <div className="admin-stat-card">
            <span className="as-icon">⏳</span>
            <div className="as-num">{pendingBookings}</div>
            <div className="as-label">Pending</div>
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="admin-dashboard-grid">
          {/* Recent Bookings */}
          <div className="admin-card">
            <div className="admin-card-title">
              <span>📋 Recent Bookings</span>
              <Link to="/admin/bookings" className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>View All</Link>
            </div>
            <div className="recent-list">
              {recentBookings.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No bookings placed yet.</p>
              ) : (
                recentBookings.map(b => (
                  <div className="recent-item" key={b.id}>
                    <div className="recent-info">
                      <h4>{b.serviceName}</h4>
                      <p>Customer: {b.customerName || 'N/A'} | Scheduled: {b.date}</p>
                    </div>
                    <div className="recent-actions-cell" style={{ alignItems: 'center', gap: '12px' }}>
                      <span className={`admin-badge ${b.status.toLowerCase().replace(' ', '-')}`}>{b.status}</span>
                      <span className="recent-value">₹{b.price}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="admin-card">
            <div className="admin-card-title">
              <span>👥 Recent Registrations</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/admin/customers" className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Customers</Link>
                <Link to="/admin/technicians" className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Techs</Link>
              </div>
            </div>
            <div className="recent-list">
              {recentUsers.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No users registered yet.</p>
              ) : (
                recentUsers.map(u => (
                  <div className="recent-item" key={u.id}>
                    <div className="recent-info">
                      <h4>{u.name}</h4>
                      <p>{u.email}</p>
                    </div>
                    <div>
                      <span className={`admin-badge ${u.role === 'admin' ? 'active' : u.role === 'technician' ? 'pending' : 'completed'}`} style={{ minWidth: '85px', textAlign: 'center' }}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
