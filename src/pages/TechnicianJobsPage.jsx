import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import { updateBookingStatus } from '../utils/bookings'
import { db } from '../firebase/config'
import { collection, onSnapshot } from 'firebase/firestore'
import { services } from '../data/services'
import './TechnicianJobsPage.css'

const JOBS_TABS = ['All', 'Active', 'Completed', 'Cancelled']

export default function TechnicianJobsPage() {
  const [tech, setTech] = useState(() => getCurrentUser())
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Active')
  const [message, setMessage] = useState('')

  // Sync profile update
  useEffect(() => {
    function handleAuthChange() {
      setTech(getCurrentUser())
    }
    window.addEventListener('auth-state-change', handleAuthChange)
    return () => window.removeEventListener('auth-state-change', handleAuthChange)
  }, [])

  // Listen to bookings collection in real-time
  useEffect(() => {
    const q = collection(db, 'bookings')
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = []
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      setBookings(list)
      setLoading(false)
    }, (error) => {
      console.error("Jobs page bookings fetch error:", error)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  function getServiceCategory(serviceId) {
    const s = services.find(item => item.id === serviceId)
    return s ? s.category : ''
  }

  // Filter bookings for this technician
  const techId = tech?.uid || tech?.id
  const techBookings = bookings.filter(b => b.technicianId === techId)

  const filteredJobs = techBookings.filter(job => {
    if (activeTab === 'All') return true
    if (activeTab === 'Active') return job.status === 'Accepted' || job.status === 'In Progress'
    return job.status === activeTab
  })

  // Sort by createdAt descending
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return timeB - timeA
  })

  async function handleStartJob(bookingId) {
    try {
      await updateBookingStatus(bookingId, 'In Progress')
      setMessage('🚀 Job started! Status updated to "In Progress".')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error(error)
      setMessage('Failed to start job.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleCompleteJob(bookingId) {
    try {
      await updateBookingStatus(bookingId, 'Completed')
      setMessage('🏁 Job completed! Great work.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error(error)
      setMessage('Failed to complete job.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleCancelJob(bookingId) {
    if (window.confirm('Are you sure you want to cancel this assigned job?')) {
      try {
        await updateBookingStatus(bookingId, 'Cancelled')
        setMessage('❌ Job has been cancelled.')
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        console.error(error)
        setMessage('Failed to cancel job.')
        setTimeout(() => setMessage(''), 3000)
      }
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
    <div className="tech-jobs-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">My Jobs</h1>
          <p className="section-subtitle">Manage and track your assigned service requests</p>
        </div>
      </div>

      <div className="container tech-jobs-body">
        {message && (
          <div className="toast-message">
            {message}
          </div>
        )}

        <div className="jobs-tabs">
          {JOBS_TABS.map(tab => {
            const count = tab === 'All' 
              ? techBookings.length 
              : tab === 'Active'
                ? techBookings.filter(b => b.status === 'Accepted' || b.status === 'In Progress').length
                : techBookings.filter(b => b.status === tab).length

            return (
              <button
                key={tab}
                className={`jobs-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span className="tab-count">{count}</span>
              </button>
            )
          })}
        </div>

        {sortedJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Jobs Found</h3>
            <p>You have no bookings under the "{activeTab}" filter.</p>
            {activeTab === 'Active' && (
              <Link to="/tech/requests" className="btn-primary" style={{ marginTop: 16 }}>Browse Requests</Link>
            )}
          </div>
        ) : (
          <div className="tech-jobs-list">
            {sortedJobs.map(job => (
              <div key={job.id} className="tech-job-card">
                <div className="job-card-image">
                  <img src={job.serviceImage} alt={job.serviceName} />
                  <span className={`status-tag ${job.status.toLowerCase().replace(' ', '-')}`}>{job.status}</span>
                </div>
                <div className="job-card-info">
                  <div className="job-card-header">
                    <div>
                      <span className="job-card-category">{getServiceCategory(job.serviceId)}</span>
                      <h3>{job.serviceName}</h3>
                    </div>
                    <span className="job-card-price">₹{job.price}</span>
                  </div>

                  <div className="job-card-meta">
                    <div className="meta-row">
                      <div className="meta-col">
                        <strong>📅 Scheduled Date</strong>
                        <span>{job.date}</span>
                      </div>
                      <div className="meta-col">
                        <strong>⏰ Time Slot</strong>
                        <span>{job.time}</span>
                      </div>
                    </div>
                    <div className="meta-row">
                      <div className="meta-col">
                        <strong>👤 Customer Name</strong>
                        <span>{job.customerName || 'Customer'}</span>
                      </div>
                      <div className="meta-col">
                        <strong>📞 Contact Number</strong>
                        <span><a href={`tel:${job.phone}`} className="phone-link">{job.phone}</a></span>
                      </div>
                    </div>
                    <div className="meta-full">
                      <strong>📍 Service Address</strong>
                      <span>{job.address}</span>
                    </div>
                    {job.notes && (
                      <div className="meta-full notes-box">
                        <strong>📝 Customer Notes</strong>
                        <span>"{job.notes}"</span>
                      </div>
                    )}
                  </div>

                  {/* Actions depending on status */}
                  {(job.status === 'Accepted' || job.status === 'In Progress') && (
                    <div className="job-card-actions">
                      <button 
                        onClick={() => handleCancelJob(job.id)}
                        className="btn-outline cancel-btn"
                        style={{ border: '1.5px solid #E53935', color: '#E53935' }}
                      >
                        Cancel Job
                      </button>
                      
                      {job.status === 'Accepted' && (
                        <button 
                          onClick={() => handleStartJob(job.id)}
                          className="btn-primary start-btn"
                        >
                          Start Job 🚀
                        </button>
                      )}

                      {job.status === 'In Progress' && (
                        <button 
                          onClick={() => handleCompleteJob(job.id)}
                          className="btn-primary complete-btn"
                          style={{ background: '#2E7D32' }}
                        >
                          Mark Completed ✅
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
