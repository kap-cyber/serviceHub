import React from 'react'
import { useNavigate } from 'react-router-dom'
import './BlogCard.css'

export default function BlogCard({ blog }) {
  const navigate = useNavigate()
  return (
    <div className="blog-card">
      <div className="blog-image">
        <img src={blog.image} alt={blog.title} loading="lazy" />
        <span className="blog-category">{blog.category}</span>
      </div>
      <div className="blog-body">
        <div className="blog-meta">
          <span className="blog-author">✍️ {blog.author}</span>
          <span className="blog-dot">·</span>
          <span className="blog-date">{blog.date}</span>
          <span className="blog-dot">·</span>
          <span className="blog-read">{blog.readTime}</span>
        </div>
        <h3 className="blog-title">{blog.title}</h3>
        <p className="blog-excerpt">{blog.excerpt}</p>
        <button className="blog-read-btn" onClick={() => navigate(`/blog/${blog.id}`)}>
          Read More <span>→</span>
        </button>
      </div>
    </div>
  )
}
