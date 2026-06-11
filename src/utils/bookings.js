import { db } from '../firebase/config'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  arrayUnion 
} from 'firebase/firestore'

const BOOKINGS_KEY = 'sh_bookings'

export async function getBookings() {
  try {
    const snap = await getDocs(collection(db, 'bookings'))
    const list = []
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() })
    })
    return list
  } catch (error) {
    console.error("Fetch bookings error details:", error)
    return []
  }
}

export async function getUserBookings(userId) {
  try {
    if (!userId) return []
    const q = query(collection(db, 'bookings'), where('userId', '==', userId))
    const snap = await getDocs(q)
    const list = []
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() })
    })
    return list
  } catch (error) {
    console.error("Fetch user bookings error details:", error)
    return []
  }
}

export async function getTechnicianBookings(techId) {
  try {
    if (!techId) return []
    const q = query(collection(db, 'bookings'), where('technicianId', '==', techId))
    const snap = await getDocs(q)
    const list = []
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() })
    })
    return list
  } catch (error) {
    console.error("Fetch tech bookings error details:", error)
    return []
  }
}

export async function saveBooking(booking) {
  try {
    const newBooking = {
      ...booking,
      status: 'Pending',
      createdAt: new Date().toISOString()
    }
    const docRef = await addDoc(collection(db, 'bookings'), newBooking)
    return { id: docRef.id, ...newBooking }
  } catch (error) {
    console.error("Save booking error details:", error)
    throw error
  }
}

export async function cancelBooking(bookingId) {
  try {
    const docRef = doc(db, 'bookings', bookingId)
    await updateDoc(docRef, { status: 'Cancelled' })
  } catch (error) {
    console.error("Cancel booking error details:", error)
  }
}

export async function updateBookingStatus(bookingId, status, techId = null, techName = null) {
  try {
    const docRef = doc(db, 'bookings', bookingId)
    const updateData = { status }
    if (techId) updateData.technicianId = techId
    if (techName) updateData.technicianName = techName
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Update booking status error details:", error)
  }
}

export async function rejectBookingForTechnician(bookingId, techId) {
  try {
    const docRef = doc(db, 'bookings', bookingId)
    await updateDoc(docRef, {
      rejectedBy: arrayUnion(techId)
    })
  } catch (error) {
    console.error("Reject booking error details:", error)
  }
}
