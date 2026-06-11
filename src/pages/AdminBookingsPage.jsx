import React, { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { updateBookingStatus } from '../utils/bookings'
import './AdminPages.css'

const STATUS_TABS = ['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled']

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Selected booking for detailed view (sidebar)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  
  const [activeTab, setActiveTab] = useState('All')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // 1. Listen to all bookings in real-time
    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      const list = []
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      setBookings(list)
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })

    // 2. Listen to all users to filter out technicians for assignment
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list = []
      snap.forEach(docSnap => {
        const u = docSnap.data()
        if (u.role === 'technician' && u.approvalStatus === 'Approved') {
          list.push({ id: docSnap.id, ...u })
        }
      })
      setTechnicians(list)
    }, (err) => console.error(err))

    return () => {
      unsubscribeBookings()
      unsubscribeUsers()
    }
  }, [])

  // Find selected booking object
  const selectedBooking = bookings.find(b => b.id === selectedBookingId)

  // Status transitions
  async function handleStatusChange(bookingId, newStatus) {
    try {
      await updateBookingStatus(bookingId, newStatus)
      setSuccess(`Booking status updated to "${newStatus}"!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Failed to update booking status.')
      setTimeout(() => setError(''), 3000)
    }
  }

  // Assign technician
  async function handleAssignTechnician(bookingId, techId) {
    if (!techId) return
    const techObj = technicians.find(t => t.id === techId)
    if (!techObj) return

    try {
      const docRef = doc(db, 'bookings', bookingId)
      await updateDoc(docRef, {
        technicianId: techId,
        technicianName: techObj.name,
        status: 'Accepted'
      })
      setSuccess(`Assigned job to technician ${techObj.name}!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Failed to assign technician.')
      setTimeout(() => setError(''), 3000)
    }
  }

  // Filters
  const filteredBookings = activeTab === 'All'
    ? bookings
    : bookings.filter(b => b.status === activeTab)

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return timeB - timeA
  })

  if (loading) {
    return (
      <div className="loader-wrapper" style={{ minHeight: '60vh' }}>
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="admin-bookings-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Booking Management</h1>
          <p className="section-subtitle">Monitor, reschedule, assign technicians, or cancel service appointments</p>
        </div>
      </div>

      <div className="container admin-body">
        {success && <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>✓ {success}</div>}
        {error && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>⚠️ {error}</div>}

        {/* Status Tabs */}
        <div className="admin-tabs-row">
          <div className="admin-filter-tabs">
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span style={{ fontSize: '0.75rem', marginLeft: '5px', background: 'rgba(188,163,127,0.2)', padding: '2px 6px', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}>
                  {tab === 'All'
                    ? bookings.length
                    : bookings.filter(b => b.status === tab).length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-split-layout">
          {/* Bookings List Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings found.
                    </td>
                  </tr>
                ) : (
                  sortedBookings.map(b => (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      style={{ cursor: 'pointer', background: selectedBookingId === b.id ? 'rgba(200, 149, 108, 0.08)' : '' }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--deep-brown)' }}>{b.serviceName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{b.id?.substring(0, 8)}...</div>
                      </td>
                      <td>
                        <div>{b.customerName || 'Customer'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.phone}</div>
                      </td>
                      <td>
                        <div>{b.date}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.time}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{b.price}</td>
                      <td>
                        <span className={`admin-badge ${b.status.toLowerCase().replace(' ', '-')}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.technicianName ? (
                          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>🛠️ {b.technicianName}</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedBookingId(b.id)
                          }}
                          className="btn-icon"
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Details Sidebar Panel */}
          <div className="admin-card">
            <div className="admin-card-title">
              <span>📋 Appointment Details</span>
            </div>

            {!selectedBooking ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                Select a booking from the list to view full details and perform actions.
              </p>
            ) : (
              <div className="admin-details-list">
                <div className="admin-details-row">
                  <span className="admin-details-label">Booking ID</span>
                  <span className="admin-details-value" style={{ fontFamily: 'monospace' }}>#{selectedBooking.id}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Service</span>
                  <span className="admin-details-value">{selectedBooking.serviceName}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Total Paid/Payable</span>
                  <span className="admin-details-value" style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{selectedBooking.price}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Date</span>
                  <span className="admin-details-value">{selectedBooking.date}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Time Slot</span>
                  <span className="admin-details-value">{selectedBooking.time}</span>
                </div>

                <div className="admin-details-full">
                  <span className="admin-details-label">Customer Information</span>
                  <span className="admin-details-value" style={{ textAlign: 'left', fontWeight: 'normal', maxWidth: '100%', marginTop: '4px' }}>
                    👤 <strong>{selectedBooking.customerName || 'Customer'}</strong><br />
                    📞 <a href={`tel:${selectedBooking.phone}`} style={{ color: 'var(--accent)', fontWeight: 500 }}>{selectedBooking.phone}</a><br />
                    📍 {selectedBooking.address}
                  </span>
                </div>

                {selectedBooking.notes && (
                  <div className="admin-details-full">
                    <span className="admin-details-label">Special Instructions / Notes</span>
                    <span className="admin-details-value" style={{ textAlign: 'left', fontWeight: 'normal', maxWidth: '100%', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      "{selectedBooking.notes}"
                    </span>
                  </div>
                )}

                <div className="admin-details-row">
                  <span className="admin-details-label">Assigned Technician</span>
                  <span className="admin-details-value">
                    {selectedBooking.technicianName ? `🛠️ ${selectedBooking.technicianName}` : 'Unassigned'}
                  </span>
                </div>

                {/* Operations & Status Actions */}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px' }}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Change Status</label>
                    <select
                      value={selectedBooking.status}
                      onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}
                      className="sort-select"
                      style={{ width: '100%', padding: '10px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assign / Change Technician</label>
                    <select
                      value={selectedBooking.technicianId || ''}
                      onChange={(e) => handleAssignTechnician(selectedBooking.id, e.target.value)}
                      className="sort-select"
                      style={{ width: '100%', padding: '10px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                    >
                      <option value="">-- Select Technician to Assign --</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Tech)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBooking.status !== 'Cancelled' && selectedBooking.status !== 'Completed' && (
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'Cancelled')}
                      className="btn-outline cancel-btn"
                      style={{ width: '100%', justifyContent: 'center', borderColor: '#E53935', color: '#E53935', marginTop: '12px', padding: '10px' }}
                    >
                      Cancel Appointment 🚫
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
