import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, getCurrentUser } from '../utils/auth'
import './AuthPage.css'

export default function SignupPage() {
  const navigate = useNavigate()

  if (getCurrentUser()) {
    navigate('/', { replace: true })
    return null
  }

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [role, setRole] = useState('customer')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const result = await signup(form.name.trim(), form.email.trim(), form.password, role)
      if (result.success) {
        navigate(result.user.role === 'technician' ? '/tech/dashboard' : '/')
      } else {
        setErrors({ email: result.message })
      }
    } catch (err) {
      setErrors({ email: err.message || 'An error occurred during sign up.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <img
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"
          alt="ServiceHub"
        />
        <div className="auth-overlay">
          <div className="auth-promo">
            <span className="auth-logo-icon">◈</span>
            <h2 className="auth-promo-title">Join ServiceHub</h2>
            <p>Free account — Book in 60 seconds</p>
          </div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <Link to="/" className="auth-back">← Back to Home</Link>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join 1 lakh+ happy customers on ServiceHub</p>
          </div>

          <div className="role-selector">
            <button
              type="button"
              className={`role-tab-btn ${role === 'customer' ? 'active' : ''}`}
              onClick={() => { setRole('customer'); setErrors({}); }}
            >
              👤 Customer
            </button>
            <button
              type="button"
              className={`role-tab-btn ${role === 'technician' ? 'active' : ''}`}
              onClick={() => { setRole('technician'); setErrors({}); }}
            >
              🛠️ Technician
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={errors.confirm ? 'input-error' : ''}
              />
              {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
            </div>

            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="auth-terms">
            By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
