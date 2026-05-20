import React from 'react'
import './TestimonialCard.css'

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-quote">"</div>
      <p className="testimonial-text">{testimonial.text}</p>
      <div className="testimonial-rating">
        {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
      </div>
      <div className="testimonial-author">
        <div className="author-avatar">{testimonial.avatar}</div>
        <div className="author-info">
          <span className="author-name">{testimonial.name}</span>
          <span className="author-city">📍 {testimonial.city}</span>
        </div>
      </div>
      <div className="testimonial-service">Booked: {testimonial.service}</div>
    </div>
  )
}
