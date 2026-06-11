import { auth, db } from './config'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { getCurrentUser, setCurrentUser, logout as clearSession } from '../utils/auth'

export function initAuthListener() {
  let unsubscribeProfile = null

  return onAuthStateChanged(auth, async (firebaseUser) => {
    // Clean up existing snapshot listener
    if (unsubscribeProfile) {
      unsubscribeProfile()
      unsubscribeProfile = null
    }

    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid)
      
      // Keep local session updated in real-time when the Firestore profile changes
      unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const profileData = docSnap.data()
          const currentSessionUser = getCurrentUser()
          const currentActiveRole = currentSessionUser?.activeRole || currentSessionUser?.role || profileData.role || 'customer'

          const sessionUser = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: profileData.name || '',
            email: firebaseUser.email || '',
            role: currentActiveRole,
            activeRole: currentActiveRole,
            phone: profileData.phone || '',
            address: profileData.address || '',
            city: profileData.city || '',
            state: profileData.state || '',
            pincode: profileData.pincode || '',
            bio: profileData.bio || '',
            services: profileData.services || [],
            availability: profileData.availability || 'Available',
            createdAt: profileData.createdAt || '',
            approvalStatus: profileData.approvalStatus || '',
            status: profileData.status || ''
          }
          setCurrentUser(sessionUser)
          
          // Trigger a custom event to notify components that the user session has been updated
          window.dispatchEvent(new Event('auth-state-change'))
        }
      }, (error) => {
        console.error("Firestore user profile sync error:", error)
      })
    } else {
      clearSession()
      window.dispatchEvent(new Event('auth-state-change'))
    }
  })
}
