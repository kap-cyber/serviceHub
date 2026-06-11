import React, { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore'
import { fetchCategories } from '../firebase/db'
import './AdminPages.css'

export default function AdminServicesPage() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [editingId, setEditingId] = useState(null) // null = Add, string/number = Edit
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    longDescription: '',
    price: '',
    duration: '',
    image: '',
    popular: false,
    featuresInput: '',
    slotsInput: '09:00 AM, 11:00 AM, 01:00 PM, 03:00 PM, 05:00 PM',
    status: 'Active'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // 1. Fetch categories
    fetchCategories().then(data => setCategories(data))

    // 2. Listen to services in real-time
    const unsubscribe = onSnapshot(collection(db, 'services'), (snap) => {
      const list = []
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      setServices(list.sort((a, b) => Number(a.id) - Number(b.id)))
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
    setSuccess('')
  }

  function handleEditStart(service) {
    setEditingId(service.id)
    setForm({
      name: service.name || '',
      category: service.category || '',
      description: service.description || '',
      longDescription: service.longDescription || '',
      price: service.price || '',
      duration: service.duration || '',
      image: service.image || '',
      popular: service.popular || false,
      featuresInput: (service.features || []).join(', '),
      slotsInput: (service.slots || []).join(', '),
      status: service.status || 'Active'
    })
    setError('')
    setSuccess('')
  }

  function handleResetForm() {
    setEditingId(null)
    setForm({
      name: '',
      category: '',
      description: '',
      longDescription: '',
      price: '',
      duration: '',
      image: '',
      popular: false,
      featuresInput: '',
      slotsInput: '09:00 AM, 11:00 AM, 01:00 PM, 03:00 PM, 05:00 PM',
      status: 'Active'
    })
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.category || !form.price || !form.duration.trim() || !form.image.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    const priceNum = Number(form.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price.')
      return
    }

    // Process comma-separated strings
    const features = form.featuresInput
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0)
    const slots = form.slotsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const serviceId = editingId || String(Date.now())

    const serviceData = {
      id: Number(serviceId),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      longDescription: form.longDescription.trim() || form.description.trim(),
      price: priceNum,
      duration: form.duration.trim(),
      image: form.image.trim(),
      popular: form.popular,
      features,
      slots,
      status: form.status,
      rating: editingId ? (services.find(s => String(s.id) === String(editingId))?.rating || 4.7) : 5.0,
      reviewCount: editingId ? (services.find(s => String(s.id) === String(editingId))?.reviewCount || 10) : 1
    }

    try {
      await setDoc(doc(db, 'services', serviceId), serviceData)
      setSuccess(editingId ? 'Service updated successfully!' : 'Service created successfully!')
      handleResetForm()
    } catch (err) {
      console.error(err)
      setError('Failed to save service in database.')
    }
  }

  async function handleDelete(serviceId) {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', String(serviceId)))
        setSuccess('Service deleted successfully!')
        if (editingId === serviceId) {
          handleResetForm()
        }
      } catch (err) {
        console.error(err)
        setError('Failed to delete service.')
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
    <div className="admin-services-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Service Management</h1>
          <p className="section-subtitle">Create, update, and manage catalog services offered on the platform</p>
        </div>
      </div>

      <div className="container admin-body">
        {success && <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>✓ {success}</div>}
        {error && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>⚠️ {error}</div>}

        <div className="admin-split-layout">
          {/* Services List Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No services found in database.
                    </td>
                  </tr>
                ) : (
                  services.map(s => (
                    <tr key={s.id}>
                      <td>
                        <img src={s.image} alt={s.name} className="admin-table-img" />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--deep-brown)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{s.id}</div>
                      </td>
                      <td>
                        <span className="admin-badge pending" style={{ background: 'var(--cream)', border: '1px solid var(--border)' }}>
                          {s.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{s.price}</td>
                      <td>{s.duration}</td>
                      <td>
                        {s.popular ? (
                          <span className="admin-badge approved">★ Featured</span>
                        ) : (
                          <span className="admin-badge inactive" style={{ opacity: 0.6 }}>Standard</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button onClick={() => handleEditStart(s)} className="btn-icon">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="btn-icon danger">
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Form Card (Add/Edit) */}
          <div className="admin-card">
            <div className="admin-card-title">
              <span>{editingId ? '✏️ Edit Service' : '✨ Add New Service'}</span>
              {editingId && (
                <button onClick={handleResetForm} className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. AC Deep Cleaning"
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={form.category} onChange={handleInputChange} required>
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 499"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="form-group">
                  <label>Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 1-2 hours"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Brief Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Write a brief overview of the service..."
                  rows={2}
                  required
                />
              </div>

              <div className="form-group">
                <label>Long Description (optional)</label>
                <textarea
                  name="longDescription"
                  value={form.longDescription}
                  onChange={handleInputChange}
                  placeholder="Detailed explanation displayed on service details page..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Features / Bullet Points (comma-separated)</label>
                <textarea
                  name="featuresInput"
                  value={form.featuresInput}
                  onChange={handleInputChange}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Available Slots (comma-separated)</label>
                <input
                  type="text"
                  name="slotsInput"
                  value={form.slotsInput}
                  onChange={handleInputChange}
                  placeholder="09:00 AM, 11:00 AM, 01:00 PM"
                />
              </div>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="popular"
                  checked={form.popular}
                  onChange={handleInputChange}
                />
                <span>Featured Service (display on Homepage)</span>
              </label>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                {editingId ? 'Save Updates' : 'Publish Service'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
