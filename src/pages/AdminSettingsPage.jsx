import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout, updateProfile } from '../utils/auth'
import './AdminPages.css'

export default function AdminSettingsPage() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(() => getCurrentUser())
  
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    phone: admin?.phone || '',
    address: admin?.address || '',
    city: admin?.city || '',
    state: admin?.state || '',
    pincode: admin?.pincode || ''
  })
  
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Sync profile update
  useEffect(() => {
    function handleAuthChange() {
      const u = getCurrentUser()
      setAdmin(u)
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

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccessMsg('')
  }

  async function handleSaveSettings(e) {
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
        setAdmin(result.user)
        setSuccessMsg('Settings updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to update admin profile settings.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const joinDate = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'Recently'

  return (
    <div className="admin-settings-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Admin Settings</h1>
          <p className="section-subtitle">Manage your administrator account details, contact settings, and configuration</p>
        </div>
      </div>

      <div className="container admin-body" style={{ maxWidth: '700px' }}>
        {successMsg && <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', marginBottom: '16px' }}>✓ {successMsg}</div>}
        
        {/* Profile Card */}
        <div className="admin-card">
          <div className="admin-card-title">
            <span>⚙️ Account Information</span>
          </div>

          <div className="admin-details-list">
            <div className="admin-details-row">
              <span className="admin-details-label">Administrator Name</span>
              <span className="admin-details-value">{admin?.name}</span>
            </div>
            <div className="admin-details-row">
              <span className="admin-details-label">Email Address</span>
              <span className="admin-details-value">{admin?.email}</span>
            </div>
            <div className="admin-details-row">
              <span className="admin-details-label">Account Role</span>
              <span className="admin-details-value">
                <span className="admin-badge approved" style={{ textTransform: 'uppercase' }}>Administrator</span>
              </span>
            </div>
            <div className="admin-details-row">
              <span className="admin-details-label">Member Since</span>
              <span className="admin-details-value">{joinDate}</span>
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="admin-card">
          <div className="admin-card-title">
            <span>📞 Contact details</span>
          </div>

          {!isEditing ? (
            <div className="admin-details-list">
              <div className="admin-details-row">
                <span className="admin-details-label">Phone Number</span>
                <span className="admin-details-value">{admin?.phone || 'Not Provided'}</span>
              </div>
              <div className="admin-details-row">
                <span className="admin-details-label">Office Address</span>
                <span className="admin-details-value">{admin?.address || 'Not Provided'}</span>
              </div>
              <div className="admin-details-row">
                <span className="admin-details-label">City</span>
                <span className="admin-details-value">{admin?.city || 'Not Provided'}</span>
              </div>
              <div className="admin-details-row">
                <span className="admin-details-label">State</span>
                <span className="admin-details-value">{admin?.state || 'Not Provided'}</span>
              </div>
              <div className="admin-details-row">
                <span className="admin-details-label">Pincode</span>
                <span className="admin-details-value">{admin?.pincode || 'Not Provided'}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={() => { setIsEditing(true); setError(''); }} className="btn-outline">
                  ✏️ Edit Profile
                </button>
                <button onClick={handleLogout} className="btn-primary" style={{ background: '#C62828' }}>
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="admin-form">
              {error && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', marginBottom: '16px' }}>⚠️ {error}</div>}

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              <div className="form-group">
                <label>Office Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Office/Department street address"
                />
              </div>

              <div className="admin-form-row">
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
                  Save Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
