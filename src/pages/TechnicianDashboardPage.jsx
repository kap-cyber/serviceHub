import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser, updateProfile } from '../utils/auth'
import { getBookings } from '../utils/bookings'
import { services } from '../data/services'
import './TechnicianDashboardPage.css'

export default function TechnicianDashboardPage() {
  const [tech, setTech] = useState(() => getCurrentUser())
  const [bookings, setBookings] = useState(() => getBookings())

  // Refresh statistics and data
  useEffect(() => {
    setTech(getCurrentUser())
    setBookings(getBookings())
  }, [])

  function handleStatusChange(e) {
    const newStatus = e.target.value
    const result = updateProfile({ availability: newStatus })
    if (result.success) {
      setTech(result.user)
    }
  }

  // Helper to resolve service category
  function getServiceCategory(serviceId) {
    const s = services.find(item => item.id === serviceId)
    return s ? s.category : ''
  }

  // Filtering counts
  const techServices = tech?.services || []
  
  const techBookings = bookings.filter(b => b.technicianId === tech?.id)
  
  const totalJobs = techBookings.length
  
  const activeJobs = techBookings.filter(b => b.status === 'Accepted' || b.status === 'In Progress').length
  
  const completedJobs = techBookings.filter(b => b.status === 'Completed').length

  const pendingRequests = bookings.filter(b => 
    b.status === 'Pending' && 
    techServices.includes(getServiceCategory(b.serviceId)) &&
    !(b.rejectedBy || []).includes(tech?.id)
  )
  const pendingJobsCount = pendingRequests.length

  const recentActiveJobs = techBookings
    .filter(b => b.status === 'Accepted' || b.status === 'In Progress')
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)

  return (
    <div className="tech-dashboard-page">
      <div className="page-header">
        <div className="container">
          <div className="tech-header-layout">
            <div>
              <h1 className="section-title">Technician Dashboard</h1>
              <p className="section-subtitle">Welcome back, {tech?.name}! Manage your schedule and service requests.</p>
            </div>
            <div className="status-selector-wrap">
              <label>Availability Status:</label>
              <select 
                value={tech?.availability || 'Available'} 
                onChange={handleStatusChange}
                className="status-dropdown"
              >
                <option value="Available">🟢 Available</option>
                <option value="Busy">🟡 Busy</option>
                <option value="Offline">🔴 Offline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container tech-dashboard-body">
        {techServices.length === 0 && (
          <div className="setup-notice">
            <span className="notice-icon">⚠️</span>
            <div>
              <h3>Complete your Profile Setup</h3>
              <p>You haven't selected any service categories in your profile yet. Update your profile to start receiving relevant job requests.</p>
              <Link to="/tech/profile" className="btn-primary" style={{ marginTop: 8 }}>Go to Profile</Link>
            </div>
          </div>
        )}

        {/* Dashboard Statistics */}
        <div className="tech-stats-grid">
          <div className="tech-stat-card">
            <span className="ts-icon">💼</span>
            <div className="ts-num">{totalJobs}</div>
            <div className="ts-label">Total Jobs</div>
          </div>
          <div className="tech-stat-card highlight">
            <span className="ts-icon">📨</span>
            <div className="ts-num">{pendingJobsCount}</div>
            <div className="ts-label">Matching Requests</div>
          </div>
          <div className="tech-stat-card">
            <span className="ts-icon">⚡</span>
            <div className="ts-num">{activeJobs}</div>
            <div className="ts-label">Active Jobs</div>
          </div>
          <div className="tech-stat-card">
            <span className="ts-icon">✅</span>
            <div className="ts-num">{completedJobs}</div>
            <div className="ts-label">Completed Jobs</div>
          </div>
          <div className="tech-stat-card">
            <span className="ts-icon">🎯</span>
            <div className="ts-status-val">{tech?.availability || 'Available'}</div>
            <div className="ts-label">Current Status</div>
          </div>
        </div>

        {/* Recent Active Jobs */}
        <div className="tech-dashboard-section">
          <div className="section-header-row">
            <h2 className="tech-sub-title">Active Assigned Jobs</h2>
            <Link to="/tech/jobs" className="btn-outline">View All Jobs</Link>
          </div>

          {recentActiveJobs.length === 0 ? (
            <div className="empty-tech-card">
              <span className="empty-icon">📭</span>
              <h3>No Active Jobs</h3>
              <p>You have no active jobs assigned to you right now. Go to the Job Requests section to accept incoming requests.</p>
              <Link to="/tech/requests" className="btn-primary" style={{ marginTop: 16 }}>Browse Requests</Link>
            </div>
          ) : (
            <div className="tech-jobs-list">
              {recentActiveJobs.map(job => (
                <div key={job.id} className="tech-job-row-card">
                  <img src={job.serviceImage} alt={job.serviceName} className="job-img" />
                  <div className="job-details-main">
                    <div className="job-head">
                      <h3>{job.serviceName}</h3>
                      <span className={`job-status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="job-meta">
                      <span>📅 {job.date}</span>
                      <span>⏰ {job.time}</span>
                      <span>📍 {job.address}</span>
                      <span>📞 {job.phone}</span>
                      <span>💰 ₹{job.price}</span>
                    </div>
                  </div>
                  <div className="job-actions-btn">
                    <Link to="/tech/jobs" className="btn-outline">Manage Job</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
