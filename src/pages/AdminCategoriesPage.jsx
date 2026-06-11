import React, { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore'
import './AdminPages.css'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [editingId, setEditingId] = useState(null) // null = Add, string/number = Edit
  const [form, setForm] = useState({
    name: '',
    icon: '',
    count: 0
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Listen to categories in real-time
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snap) => {
      const list = []
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      setCategories(list.sort((a, b) => Number(a.id) - Number(b.id)))
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  function handleInputChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'count' ? Number(value) : value
    }))
    setError('')
    setSuccess('')
  }

  function handleEditStart(cat) {
    setEditingId(cat.id)
    setForm({
      name: cat.name || '',
      icon: cat.icon || '',
      count: cat.count || 0
    })
    setError('')
    setSuccess('')
  }

  function handleResetForm() {
    setEditingId(null)
    setForm({
      name: '',
      icon: '',
      count: 0
    })
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.icon.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    const categoryId = editingId || String(Date.now())

    const categoryData = {
      id: Number(categoryId),
      name: form.name.trim(),
      icon: form.icon.trim(),
      count: form.count || 0
    }

    try {
      await setDoc(doc(db, 'categories', categoryId), categoryData)
      setSuccess(editingId ? 'Category updated successfully!' : 'Category created successfully!')
      handleResetForm()
    } catch (err) {
      console.error(err)
      setError('Failed to save category in database.')
    }
  }

  async function handleDelete(catId) {
    if (window.confirm('Are you sure you want to delete this category? (Services using this category will remain, but the filter will be affected)')) {
      try {
        await deleteDoc(doc(db, 'categories', String(catId)))
        setSuccess('Category deleted successfully!')
        if (editingId === catId) {
          handleResetForm()
        }
      } catch (err) {
        console.error(err)
        setError('Failed to delete category.')
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
    <div className="admin-categories-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Category Management</h1>
          <p className="section-subtitle">Add, edit, or delete platform service categories and icons</p>
        </div>
      </div>

      <div className="container admin-body">
        {success && <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>✓ {success}</div>}
        {error && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>⚠️ {error}</div>}

        <div className="admin-split-layout">
          {/* Categories List */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Category Name</th>
                  <th>ID</th>
                  <th>Services Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No categories found in database.
                    </td>
                  </tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '1.8rem', width: '80px', textAlign: 'center' }}>
                        {c.icon}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--deep-brown)', fontSize: '1.05rem' }}>
                        {c.name}
                      </td>
                      <td>#{c.id}</td>
                      <td>{c.count} service{c.count !== 1 ? 's' : ''}</td>
                      <td>
                        <div className="admin-actions-cell">
                          <button onClick={() => handleEditStart(c)} className="btn-icon">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="btn-icon danger">
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
              <span>{editingId ? '✏️ Edit Category' : '✨ Add New Category'}</span>
              {editingId && (
                <button onClick={handleResetForm} className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Cleaning"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category Icon (Emoji) *</label>
                <input
                  type="text"
                  name="icon"
                  value={form.icon}
                  onChange={handleInputChange}
                  placeholder="e.g. 🧹"
                  maxLength={5}
                  required
                />
              </div>

              <div className="form-group">
                <label>Services Count (display label)</label>
                <input
                  type="number"
                  name="count"
                  value={form.count}
                  onChange={handleInputChange}
                  placeholder="e.g. 10"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                {editingId ? 'Save Updates' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
