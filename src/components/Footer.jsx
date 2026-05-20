import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">ServiceHub</span>
          </div>
          <p className="footer-tagline">
            Premium home services, delivered with care. Trusted by 1 lakh+ happy customers across India.
          </p>
          <div className="social-links">
            <a href="#" className="social-btn" aria-label="Facebook">f</a>
            <a href="#" className="social-btn" aria-label="Instagram">in</a>
            <a href="#" className="social-btn" aria-label="Twitter">tw</a>
            <a href="#" className="social-btn" aria-label="YouTube">yt</a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/bookings">My Bookings</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Our Services</h4>
          <ul className="footer-list">
            <li><Link to="/services">AC Repair</Link></li>
            <li><Link to="/services">Home Cleaning</Link></li>
            <li><Link to="/services">Electrician</Link></li>
            <li><Link to="/services">Plumbing</Link></li>
            <li><Link to="/services">Salon at Home</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="footer-contact">
            <li>
              <span className="contact-icon">📍</span>
              <span>123, MG Road, Bengaluru, Karnataka 560001</span>
            </li>
            <li>
              <span className="contact-icon">📞</span>
              <span>+91 98765 43210</span>
            </li>
            <li>
              <span className="contact-icon">✉️</span>
              <span>hello@servicehub.in</span>
            </li>
            <li>
              <span className="contact-icon">🕐</span>
              <span>Mon–Sun, 8 AM – 10 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright">© 2025 ServiceHub. All rights reserved. Built for MCA College Project.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
