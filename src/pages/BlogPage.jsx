import React, { useState } from 'react'
import { blogs } from '../data/blogs'
import BlogCard from '../components/BlogCard'
import './BlogPage.css'

export default function BlogPage() {
  const [search, setSearch] = useState('')

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase()) ||
    b.excerpt.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="blog-page">
      <div className="page-header">
        <div className="container">
          <h1 className="section-title">Tips & Insights</h1>
          <p className="section-subtitle">Expert advice for a better, healthier home</p>
          <div className="blog-search-wrap">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="blog-search-input"
            />
          </div>
        </div>
      </div>

      <div className="container blog-container">
        <div className="blog-results-count">
          {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>No articles found</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
