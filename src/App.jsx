import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import BookingPage from './pages/BookingPage'
import MyBookingsPage from './pages/MyBookingsPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import TechnicianDashboardPage from './pages/TechnicianDashboardPage'
import TechnicianRequestsPage from './pages/TechnicianRequestsPage'
import TechnicianJobsPage from './pages/TechnicianJobsPage'
import TechnicianProfilePage from './pages/TechnicianProfilePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminServicesPage from './pages/AdminServicesPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AdminBookingsPage from './pages/AdminBookingsPage'
import AdminCustomersPage from './pages/AdminCustomersPage'
import AdminTechniciansPage from './pages/AdminTechniciansPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './routes/ProtectedRoute'
import { initAuthListener } from './firebase/authListener'
import { seedDatabase } from './firebase/seeder'

export default function App() {
  useEffect(() => {
    // Seed database if collections are empty
    seedDatabase().catch(console.error)

    // Initialize real-time authentication session synchronizer
    const unsubscribe = initAuthListener()
    return () => unsubscribe()
  }, [])

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          
          {/* Customer Only Routes */}
          <Route path="/booking/:id" element={
            <ProtectedRoute allowedRole="customer"><BookingPage /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute allowedRole="customer"><MyBookingsPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRole="customer"><ProfilePage /></ProtectedRoute>
          } />

          {/* Technician Only Routes */}
          <Route path="/tech/dashboard" element={
            <ProtectedRoute allowedRole="technician"><TechnicianDashboardPage /></ProtectedRoute>
          } />
          <Route path="/tech/requests" element={
            <ProtectedRoute allowedRole="technician"><TechnicianRequestsPage /></ProtectedRoute>
          } />
          <Route path="/tech/jobs" element={
            <ProtectedRoute allowedRole="technician"><TechnicianJobsPage /></ProtectedRoute>
          } />
          <Route path="/tech/profile" element={
            <ProtectedRoute allowedRole="technician"><TechnicianProfilePage /></ProtectedRoute>
          } />

          {/* Admin Only Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRole="admin"><AdminDashboardPage /></ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute allowedRole="admin"><AdminServicesPage /></ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRole="admin"><AdminCategoriesPage /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRole="admin"><AdminBookingsPage /></ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute allowedRole="admin"><AdminCustomersPage /></ProtectedRoute>
          } />
          <Route path="/admin/technicians" element={
            <ProtectedRoute allowedRole="admin"><AdminTechniciansPage /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRole="admin"><AdminSettingsPage /></ProtectedRoute>
          } />

          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
