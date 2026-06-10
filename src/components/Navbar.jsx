import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCurrentUser, logout } from '../utils/auth'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(getCurrentUser())
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setUser(getCurrentUser())
    setMenuOpen(false)
  }, [location])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleLogout() {
    logout()
    setUser(null)
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">ServiceHub</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          {user && user.role === 'technician' ? (
            <>
              <Link to="/tech/dashboard" className={isActive('/tech/dashboard')}>Dashboard</Link>
              <Link to="/tech/requests" className={isActive('/tech/requests')}>Job Requests</Link>
              <Link to="/tech/jobs" className={isActive('/tech/jobs')}>Assigned Jobs</Link>
              <Link to="/tech/profile" className={isActive('/tech/profile')}>Technician Profile</Link>
            </>
          ) : (
            <>
              <Link to="/" className={isActive('/')}>Home</Link>
              <Link to="/services" className={isActive('/services')}>Services</Link>
              <Link to="/blog" className={isActive('/blog')}>Blog</Link>
              {user && (
                <>
                  <Link to="/bookings" className={isActive('/bookings')}>My Bookings</Link>
                  <Link to="/profile" className={isActive('/profile')}>Profile</Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <span className="user-name">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-ghost logout-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>

        <button
          className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {user && user.role === 'technician' ? (
            <>
              <Link to="/tech/dashboard" className="mobile-link">📊 Dashboard</Link>
              <Link to="/tech/requests" className="mobile-link">📨 Job Requests</Link>
              <Link to="/tech/jobs" className="mobile-link">💼 Assigned Jobs</Link>
              <Link to="/tech/profile" className="mobile-link">👤 Technician Profile</Link>
              <button onClick={handleLogout} className="mobile-link mobile-logout">🚪 Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="mobile-link">🏠 Home</Link>
              <Link to="/services" className="mobile-link">🛠 Services</Link>
              <Link to="/blog" className="mobile-link">📝 Blog</Link>
              {user ? (
                <>
                  <Link to="/bookings" className="mobile-link">📋 My Bookings</Link>
                  <Link to="/profile" className="mobile-link">👤 Profile</Link>
                  <button onClick={handleLogout} className="mobile-link mobile-logout">🚪 Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-link">🔑 Login</Link>
                  <Link to="/signup" className="mobile-link mobile-signup">✨ Sign Up Free</Link>
                </>
              )}
            </>
          )}
        </div>
      )}
    </header>
  )
}
