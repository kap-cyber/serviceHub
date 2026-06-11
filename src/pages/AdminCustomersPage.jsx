import React, { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot } from 'firebase/firestore'
import './AdminPages.css'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Selected customer for detailed view
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // 1. Listen to users to filter customers
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list = []
      snap.forEach(docSnap => {
        const u = docSnap.data()
        if (u.role === 'customer') {
          list.push({ id: docSnap.id, ...u })
        }
      })
      setCustomers(list)
    }, (err) => console.error(err))

    // 2. Listen to bookings
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

    return () => {
      unsubscribeUsers()
      unsubscribeBookings()
    }
  }, [])

  // Find selected customer
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  // Find bookings by selected customer
  const customerBookings = selectedCustomer
    ? bookings.filter(b => b.userId === selectedCustomer.id)
    : []

  // Filter customers by search
  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="loader-wrapper" style={{ minHeight: '60vh' }}>
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="admin-customers-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Customer Management</h1>
          <p className="section-subtitle">View profiles, check contact information, and review customer booking histories</p>
        </div>
      </div>

      <div className="container admin-body">
        {/* Search bar */}
        <div className="admin-tabs-row" style={{ borderBottom: 'none' }}>
          <div className="sidebar-search" style={{ minWidth: '300px', width: '400px' }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, phone or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 32px', background: 'var(--cream)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', outline: 'none' }}
            />
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Total Customers: {customers.length}
          </div>
        </div>

        <div className="admin-split-layout">
          {/* Customers List Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      style={{ cursor: 'pointer', background: selectedCustomerId === c.id ? 'rgba(200, 149, 108, 0.08)' : '' }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--deep-brown)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Joined: {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone || 'Not Provided'}</td>
                      <td>{c.city || 'Not Provided'}</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCustomerId(c.id)
                          }}
                          className="btn-icon"
                        >
                          👁️ Details
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
              <span>👤 Customer Profile Details</span>
            </div>

            {!selectedCustomer ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                Select a customer from the list to view profile details and booking history.
              </p>
            ) : (
              <div className="admin-details-list">
                <div className="admin-details-row">
                  <span className="admin-details-label">Full Name</span>
                  <span className="admin-details-value">{selectedCustomer.name}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Email Address</span>
                  <span className="admin-details-value">{selectedCustomer.email}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Phone Number</span>
                  <span className="admin-details-value">{selectedCustomer.phone || 'Not Provided'}</span>
                </div>

                <div className="admin-details-full">
                  <span className="admin-details-label">Home Address</span>
                  <span className="admin-details-value" style={{ textAlign: 'left', fontWeight: 'normal', maxWidth: '100%', marginTop: '4px' }}>
                    {selectedCustomer.address ? (
                      <>
                        {selectedCustomer.address}<br />
                        {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}
                      </>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No address provided yet.</span>
                    )}
                  </span>
                </div>

                {/* Booking History list */}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--deep-brown)', fontSize: '1.1rem', marginBottom: '12px' }}>
                    📋 Booking History ({customerBookings.length})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {customerBookings.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>This customer hasn't booked any services yet.</p>
                    ) : (
                      customerBookings
                        .sort((a, b) => {
                          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                          return timeB - timeA
                        })
                        .map(b => (
                          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                            <div>
                              <strong style={{ color: 'var(--deep-brown)' }}>{b.serviceName}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.date} at {b.time}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <span style={{ fontWeight: 600 }}>₹{b.price}</span>
                              <span className={`admin-badge ${b.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
