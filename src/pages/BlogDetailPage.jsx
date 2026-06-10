import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogs } from '../data/blogs'
import './BlogDetailPage.css'

export default function BlogDetailPage() {
  const { id } = useParams()
  const blog = blogs.find(b => b.id === parseInt(id))

  if (!blog) {
    return (
      <div className="empty-state" style={{ padding: '120px 24px' }}>
        <div className="empty-icon">📰</div>
        <h3>Article Not Found</h3>
        <p>The article you're looking for doesn't exist.</p>
        <Link to="/blog" className="btn-primary" style={{ marginTop: 16 }}>Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="blog-detail-page">
      <div className="container">

        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/blog">Blog</Link>
          <span>›</span>
          <span>{blog.title}</span>
        </div>

        <div className="blog-detail-image-wrap">
          <img src={blog.image} alt={blog.title} className="blog-detail-img" loading="lazy" />
          <span className="blog-detail-cat-badge">{blog.category}</span>
        </div>

        <div className="blog-detail-header">
          <h1 className="blog-detail-title">{blog.title}</h1>
          <div className="blog-detail-meta">
            <span>✍️ {blog.author}</span>
            <span className="meta-dot">·</span>
            <span>{blog.date}</span>
            <span className="meta-dot">·</span>
            <span>🕐 {blog.readTime}</span>
          </div>
        </div>

        <div className="blog-detail-content">
          {blog.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <Link to="/blog" className="blog-back-link">← Back to All Articles</Link>

      </div>
    </div>
  )
}
