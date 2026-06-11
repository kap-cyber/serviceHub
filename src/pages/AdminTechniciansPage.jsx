import React, { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import './AdminPages.css'

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Selected technician for details view
  const [selectedTechId, setSelectedTechId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // 1. Listen to users to filter technicians
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list = []
      snap.forEach(docSnap => {
        const u = docSnap.data()
        if (u.role === 'technician') {
          list.push({ id: docSnap.id, ...u })
        }
      })
      setTechnicians(list)
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

  // Find selected technician
  const selectedTech = technicians.find(t => t.id === selectedTechId)

  // Find bookings assigned to this technician
  const techBookings = selectedTech
    ? bookings.filter(b => b.technicianId === selectedTech.id)
    : []

  // Filter technicians by search
  const filteredTechs = technicians.filter(t =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Actions
  async function handleApprovalStatus(techId, newStatus) {
    try {
      const userRef = doc(db, 'users', techId)
      await updateDoc(userRef, { approvalStatus: newStatus })
      setSuccess(`Technician status set to "${newStatus}"!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Failed to update approval status.')
      setTimeout(() => setError(''), 3000)
    }
  }

  async function handleToggleStatus(techId, currentStatus) {
    const newStatus = currentStatus === 'Disabled' ? 'Active' : 'Disabled'
    try {
      const userRef = doc(db, 'users', techId)
      await updateDoc(userRef, { status: newStatus })
      setSuccess(`Technician profile set to ${newStatus === 'Disabled' ? 'Disabled' : 'Enabled'}!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Failed to update status.')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="loader-wrapper" style={{ minHeight: '60vh' }}>
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="admin-technicians-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Technician Management</h1>
          <p className="section-subtitle">Approve, reject, enable, or disable technician profiles and review their service history</p>
        </div>
      </div>

      <div className="container admin-body">
        {success && <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>✓ {success}</div>}
        {error && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>⚠️ {error}</div>}

        {/* Search & Stats bar */}
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
            Pending: {technicians.filter(t => t.approvalStatus === 'Pending').length} | Total Technicians: {technicians.length}
          </div>
        </div>

        <div className="admin-split-layout">
          {/* Technicians List Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Technician Name</th>
                  <th>Email</th>
                  <th>Services Offered</th>
                  <th>Approval</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTechs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No technicians found.
                    </td>
                  </tr>
                ) : (
                  filteredTechs.map(t => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTechId(t.id)}
                      style={{ cursor: 'pointer', background: selectedTechId === t.id ? 'rgba(200, 149, 108, 0.08)' : '' }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--deep-brown)' }}>{t.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Joined: {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
                      </td>
                      <td>{t.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '180px' }}>
                          {(t.services || []).map((s, idx) => (
                            <span key={idx} style={{ fontSize: '0.75rem', background: 'var(--cream)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>
                              {s}
                            </span>
                          ))}
                          {(t.services || []).length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>None selected</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${(t.approvalStatus || 'Pending').toLowerCase()}`}>
                          {t.approvalStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${t.status === 'Disabled' ? 'disabled' : 'active'}`}>
                          {t.status === 'Disabled' ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell" onClick={(e) => e.stopPropagation()}>
                          {t.approvalStatus === 'Pending' && (
                            <>
                              <button onClick={() => handleApprovalStatus(t.id, 'Approved')} className="btn-icon success" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                Approve
                              </button>
                              <button onClick={() => handleApprovalStatus(t.id, 'Rejected')} className="btn-icon danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                Reject
                              </button>
                            </>
                          )}
                          {t.approvalStatus === 'Approved' && (
                            <button
                              onClick={() => handleToggleStatus(t.id, t.status)}
                              className={`btn-icon ${t.status === 'Disabled' ? 'success' : 'danger'}`}
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              {t.status === 'Disabled' ? 'Enable' : 'Disable'}
                            </button>
                          )}
                        </div>
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
              <span>🔧 Technician Details</span>
            </div>

            {!selectedTech ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                Select a technician from the list to view profile, approval controls, and assigned bookings.
              </p>
            ) : (
              <div className="admin-details-list">
                <div className="admin-details-row">
                  <span className="admin-details-label">Full Name</span>
                  <span className="admin-details-value">{selectedTech.name}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Email Address</span>
                  <span className="admin-details-value">{selectedTech.email}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Phone Number</span>
                  <span className="admin-details-value">{selectedTech.phone || 'Not Provided'}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Approval Status</span>
                  <span className="admin-details-value" style={{ fontWeight: 'bold' }}>
                    <span className={`admin-badge ${(selectedTech.approvalStatus || 'Pending').toLowerCase()}`}>
                      {selectedTech.approvalStatus || 'Pending'}
                    </span>
                  </span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Account Status</span>
                  <span className="admin-details-value">
                    <span className={`admin-badge ${selectedTech.status === 'Disabled' ? 'disabled' : 'active'}`}>
                      {selectedTech.status === 'Disabled' ? 'Disabled' : 'Active'}
                    </span>
                  </span>
                </div>

                <div className="admin-details-full">
                  <span className="admin-details-label">Professional Bio</span>
                  <span className="admin-details-value" style={{ textAlign: 'left', fontWeight: 'normal', maxWidth: '100%', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {selectedTech.bio || 'No bio written yet.'}
                  </span>
                </div>

                <div className="admin-details-full">
                  <span className="admin-details-label">Base Address</span>
                  <span className="admin-details-value" style={{ textAlign: 'left', fontWeight: 'normal', maxWidth: '100%', marginTop: '4px' }}>
                    {selectedTech.address ? (
                      <>
                        {selectedTech.address}<br />
                        {selectedTech.city}, {selectedTech.state} - {selectedTech.pincode}
                      </>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No address provided.</span>
                    )}
                  </span>
                </div>

                {/* Status Toggle Actions */}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleApprovalStatus(selectedTech.id, 'Approved')}
                    disabled={selectedTech.approvalStatus === 'Approved'}
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '10px 16px', background: selectedTech.approvalStatus === 'Approved' ? 'var(--border)' : '#388E3C', color: '#fff' }}
                  >
                    ✓ Approve Tech
                  </button>
                  <button
                    onClick={() => handleApprovalStatus(selectedTech.id, 'Rejected')}
                    disabled={selectedTech.approvalStatus === 'Rejected'}
                    className="btn-outline"
                    style={{ fontSize: '0.85rem', padding: '8px 16px', borderColor: selectedTech.approvalStatus === 'Rejected' ? 'var(--border)' : '#D32F2F', color: selectedTech.approvalStatus === 'Rejected' ? 'var(--text-muted)' : '#D32F2F' }}
                  >
                    ✕ Reject Tech
                  </button>
                </div>

                {/* Job Assignments */}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--deep-brown)', fontSize: '1.1rem', marginBottom: '12px' }}>
                    📋 Assigned Bookings ({techBookings.length})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {techBookings.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>This technician hasn't been assigned any jobs yet.</p>
                    ) : (
                      techBookings
                        .sort((a, b) => {
                          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                          return timeB - timeA
                        })
                        .map(b => (
                          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                            <div>
                              <strong style={{ color: 'var(--deep-brown)' }}>{b.serviceName}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer: {b.customerName || 'N/A'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {b.date} | {b.time}</div>
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
