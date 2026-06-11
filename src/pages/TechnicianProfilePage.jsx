import React, { useState, useEffect } from 'react'
import { getCurrentUser, updateProfile } from '../utils/auth'
import { categories } from '../data/services'
import './TechnicianProfilePage.css'

export default function TechnicianProfilePage() {
  const [tech, setTech] = useState(() => getCurrentUser())
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [form, setForm] = useState({
    phone: tech?.phone || '',
    address: tech?.address || '',
    city: tech?.city || '',
    state: tech?.state || '',
    pincode: tech?.pincode || '',
    bio: tech?.bio || '',
    services: tech?.services || [],
    availability: tech?.availability || 'Available'
  })

  // Sync profile updates from elsewhere
  useEffect(() => {
    function handleAuthChange() {
      const u = getCurrentUser()
      setTech(u)
      if (u) {
        setForm({
          phone: u.phone || '',
          address: u.address || '',
          city: u.city || '',
          state: u.state || '',
          pincode: u.pincode || '',
          bio: u.bio || '',
          services: u.services || [],
          availability: u.availability || 'Available'
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

  function handleServiceToggle(categoryName) {
    setForm(prev => {
      const selected = prev.services || []
      const updated = selected.includes(categoryName)
        ? selected.filter(s => s !== categoryName)
        : [...selected, categoryName]
      return { ...prev, services: updated }
    })
    setSuccessMsg('')
  }

  async function handleSubmit(e) {
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
        setTech(result.user)
        setSuccessMsg('Profile details updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to update profile details.')
    }
  }

  const joinDate = tech?.createdAt
    ? new Date(tech.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'Recently'

  return (
    <div className="tech-profile-page">
      <div className="profile-header-bg">
        <div className="container">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {tech?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{tech?.name}</h1>
              <p className="profile-email">📧 {tech?.email}</p>
              <p className="profile-joined">🛠️ Member since {joinDate} | Type: Technician</p>
            </div>
            <div className="profile-badge-val">
              <span className={`status-dot ${tech?.availability?.toLowerCase()}`}></span>
              {tech?.availability || 'Available'}
            </div>
          </div>
        </div>
      </div>

      <div className="container tech-profile-body">
        {successMsg && (
          <div className="toast-success">
            ✓ {successMsg}
          </div>
        )}

        <div className="tech-profile-grid">
          {/* Main info card */}
          <div className="tech-profile-section">
            <h2 className="profile-section-title">Personal & Contact Details</h2>
            
            {!isEditing ? (
              <div className="profile-info-card">
                <div className="info-row">
                  <span className="info-label">Phone Number</span>
                  <span className="info-val">{tech?.phone || 'Not Provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address</span>
                  <span className="info-val">{tech?.address || 'Not Provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">City</span>
                  <span className="info-val">{tech?.city || 'Not Provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">State</span>
                  <span className="info-val">{tech?.state || 'Not Provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Pincode</span>
                  <span className="info-val">{tech?.pincode || 'Not Provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Bio / Description</span>
                  <span className="info-val bio-text">{tech?.bio || 'No bio written yet. Add one in edit details.'}</span>
                </div>
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setIsEditing(true); setError(''); }} className="btn-outline">
                    ✏️ Edit Profile Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info-card" style={{ padding: '24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
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

                  <div className="profile-form-row">
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

                  <div className="form-group">
                    <label>Availability Status</label>
                    <select 
                      name="availability" 
                      value={form.availability} 
                      onChange={handleChange}
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Bio / Description</label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Describe your expertise, experience, and tools..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
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

          {/* Services offered list */}
          <div className="tech-services-section">
            <h2 className="profile-section-title">Services Offered</h2>
            <div className="tech-services-card">
              <p className="section-instruction">Select the categories of service you can deliver to customers:</p>
              
              <div className="categories-selection-list">
                {categories.map(cat => {
                  const isChecked = (form.services || []).includes(cat.name)
                  return (
                    <label key={cat.id} className={`cat-select-item ${isChecked ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleServiceToggle(cat.name)}
                        className="cat-checkbox"
                      />
                      <span className="cat-icon-span">{cat.icon}</span>
                      <div className="cat-details">
                        <span className="cat-name-span">{cat.name}</span>
                        <span className="cat-desc-span">Receive {cat.name} service requests</span>
                      </div>
                    </label>
                  )
                })}
              </div>

              <div className="services-save-row">
                <button onClick={handleSubmit} className="btn-primary">
                  Update Services List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
