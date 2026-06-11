import { auth as firebaseAuth, db } from '../firebase/config'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const SESSION_KEY = 'sh_session'

export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY)) || null
    if (user && !user.role) {
      user.role = 'customer'
    }
    return user
  } catch {
    return null
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export async function signup(name, email, password, role = 'customer') {
  try {
    // 1. Create authentication user
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    const firebaseUser = userCredential.user

    // 2. Create profile document in Firestore
    const profileData = {
      name,
      email: email.toLowerCase(),
      role,
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      bio: '',
      services: [],
      availability: role === 'technician' ? 'Available' : '',
      approvalStatus: role === 'technician' ? 'Pending' : '',
      status: 'Active',
      createdAt: new Date().toISOString()
    }
    await setDoc(doc(db, 'users', firebaseUser.uid), profileData)

    const sessionUser = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      ...profileData,
      activeRole: role
    }
    setCurrentUser(sessionUser)

    return { success: true, user: sessionUser }
  } catch (error) {
    console.error("Signup error details:", error)
    let message = 'An error occurred during registration.'
    if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email already exists.'
    } else if (error.code === 'auth/weak-password') {
      message = 'Password must be at least 6 characters.'
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.'
    }
    return { success: false, message }
  }
}

export async function login(email, password, role = 'customer') {
  try {
    // 1. Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    const firebaseUser = userCredential.user

    // 2. Get user document from Firestore to verify their role
    const userDocRef = doc(db, 'users', firebaseUser.uid)
    const docSnap = await getDoc(userDocRef)

    if (!docSnap.exists()) {
      await signOut(firebaseAuth)
      return { success: false, message: 'User profile not found.' }
    }

    const profileData = docSnap.data()
    const dbRole = profileData.role || ''

    // Determine if Customer profile exists
    const hasCustomerProfile = dbRole === 'customer' || dbRole === 'both' ||
                              (Array.isArray(dbRole) && dbRole.includes('customer')) ||
                              (profileData.roles && profileData.roles.includes('customer'))

    // Determine if Technician profile exists
    const hasTechnicianProfile = dbRole === 'technician' || dbRole === 'both' ||
                                (Array.isArray(dbRole) && dbRole.includes('technician')) ||
                                (profileData.roles && profileData.roles.includes('technician'))

    // Determine if Admin profile exists
    const hasAdminProfile = dbRole === 'admin' || dbRole === 'both' ||
                            (Array.isArray(dbRole) && dbRole.includes('admin')) ||
                            (profileData.roles && profileData.roles.includes('admin'))

    // Check Case 1: Customer tab selected
    if (role === 'customer' && !hasCustomerProfile) {
      await signOut(firebaseAuth)
      let msg = "This account is not registered as a Customer. Please switch to the correct tab."
      if (hasTechnicianProfile) {
        msg = "This account is registered as a Technician. Please switch to the Technician tab."
      } else if (hasAdminProfile) {
        msg = "This account is registered as an Admin. Please switch to the Admin tab."
      }
      return { success: false, message: msg }
    }

    // Check Case 2: Technician tab selected
    if (role === 'technician' && !hasTechnicianProfile) {
      await signOut(firebaseAuth)
      let msg = "This account is not registered as a Technician. Please switch to the correct tab."
      if (hasCustomerProfile) {
        msg = "This account is registered as a Customer. Please switch to the Customer tab."
      } else if (hasAdminProfile) {
        msg = "This account is registered as an Admin. Please switch to the Admin tab."
      }
      return { success: false, message: msg }
    }

    // Check Case 3: Admin tab selected
    if (role === 'admin' && !hasAdminProfile) {
      await signOut(firebaseAuth)
      return { success: false, message: "This account is not registered as an Admin." }
    }
    const sessionUser = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: profileData.name || '',
      email: firebaseUser.email || '',
      role: role, // Active role
      activeRole: role, // Store activeRole
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

    return { success: true, user: sessionUser }
  } catch (error) {
    console.error("Login error details:", error)
    let message = 'Invalid email or password.'
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = 'Invalid email or password.'
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Account temporarily disabled due to too many failed attempts. Try again later.'
    }
    return { success: false, message }
  }
}

export async function logout() {
  try {
    await signOut(firebaseAuth)
    localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error("Logout error details:", error)
    localStorage.removeItem(SESSION_KEY)
  }
}

export async function updateProfile(profileData) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return { success: false, message: 'No user is logged in.' }

    const userDocRef = doc(db, 'users', currentUser.uid)
    await updateDoc(userDocRef, profileData)

    const updatedUser = {
      ...currentUser,
      ...profileData
    }
    setCurrentUser(updatedUser)

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Update profile error details:", error)
    return { success: false, message: error.message || 'Error updating profile details.' }
  }
}

// Keep export variables so we don't break static import structures if any exist
export const getUsers = () => []
export const getTechnicians = () => []
export const saveUsers = () => {}
export const saveTechnicians = () => {}
