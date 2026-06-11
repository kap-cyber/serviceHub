import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login, getCurrentUser } from '../utils/auth'
import './AuthPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  if (getCurrentUser()) {
    navigate('/', { replace: true })
    return null
  }

  const [form, setForm] = useState({ email: '', password: '' })
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await login(form.email, form.password, role)
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true })
        } else if (result.user.role === 'technician') {
          navigate('/tech/dashboard', { replace: true })
        } else {
          navigate(from, { replace: true })
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
          alt="ServiceHub"
        />
        <div className="auth-overlay">
          <div className="auth-promo">
            <span className="auth-logo-icon">◈</span>
            <h2 className="auth-promo-title">ServiceHub</h2>
            <p>Premium home services at your fingertips</p>
          </div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <Link to="/" className="auth-back">← Back to Home</Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your ServiceHub account</p>
          </div>

          <div className="role-selector">
            <button
              type="button"
              className={`role-tab-btn ${role === 'customer' ? 'active' : ''}`}
              onClick={() => { setRole('customer'); setError(''); }}
            >
              👤 Customer
            </button>
            <button
              type="button"
              className={`role-tab-btn ${role === 'technician' ? 'active' : ''}`}
              onClick={() => { setRole('technician'); setError(''); }}
            >
              🛠️ Technician
            </button>
            <button
              type="button"
              className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError(''); }}
            >
              🔑 Admin
            </button>
          </div>

          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-demo-box">
            <p className="demo-title">✨ Demo Credentials</p>
            <p className="demo-info">Create an account via Sign Up, then log in here.</p>
          </div>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
