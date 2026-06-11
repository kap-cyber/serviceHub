import { db } from './config'
import { collection, getDocs, getDoc, doc } from 'firebase/firestore'
import { services as staticServices, categories as staticCategories } from '../data/services'
import { blogs as staticBlogs } from '../data/blogs'

// Helper to check if credentials are valid
export function isFirebaseConfigured() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  return apiKey && 
         apiKey !== 'your_api_key_here' && 
         apiKey.trim() !== '' && 
         projectId && 
         projectId !== 'your_project_id' && 
         projectId.trim() !== ''
}

// Helper to wrap promises in a timeout so they never hang
async function withTimeout(promise, ms = 4000) {
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Firebase operation timed out'))
    }, ms)
  })
  try {
    const res = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId)
    return res
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function fetchCategories() {
  if (!isFirebaseConfigured()) {
    console.warn("Firebase not configured. Falling back to static categories.")
    return staticCategories
  }
  try {
    const snap = await withTimeout(getDocs(collection(db, 'categories')), 4000)
    const list = []
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() })
    })
    if (list.length === 0) {
      return staticCategories
    }
    return list.sort((a, b) => Number(a.id) - Number(b.id))
  } catch (error) {
    console.error("Firestore fetchCategories error (falling back to static categories):", error)
    return staticCategories
  }
}

export async function fetchServices() {
  if (!isFirebaseConfigured()) {
    console.warn("Firebase not configured. Falling back to static services.")
    return [...staticServices].sort((a, b) => a.id - b.id)
  }

  try {
    const snap = await withTimeout(getDocs(collection(db, 'services')), 4000)
    const list = []
    snap.forEach(docSnap => {
      list.push({ ...docSnap.data() })
    })

    if (list.length === 0) {
      console.warn("Firestore services empty. Falling back to static services.")
      return [...staticServices].sort((a, b) => a.id - b.id)
    }

    return list.sort((a, b) => a.id - b.id)
  } catch (error) {
    console.error("Firestore fetchServices error (falling back to static services):", error)
    return [...staticServices].sort((a, b) => a.id - b.id)
  }
}

export async function fetchBlogs() {
  if (!isFirebaseConfigured()) {
    console.warn("Firebase not configured. Falling back to static blogs.")
    return [...staticBlogs].sort((a, b) => a.id - b.id)
  }

  try {
    const snap = await withTimeout(getDocs(collection(db, 'blogs')), 4000)
    const list = []
    snap.forEach(docSnap => {
      list.push({ ...docSnap.data() })
    })

    if (list.length === 0) {
      console.warn("Firestore blogs empty. Falling back to static blogs.")
      return [...staticBlogs].sort((a, b) => a.id - b.id)
    }

    return list.sort((a, b) => a.id - b.id)
  } catch (error) {
    console.error("Firestore fetchBlogs error (falling back to static blogs):", error)
    return [...staticBlogs].sort((a, b) => a.id - b.id)
  }
}

export async function fetchServiceById(id) {
  if (!isFirebaseConfigured()) {
    const localService = staticServices.find(s => String(s.id) === String(id))
    return localService || null
  }

  try {
    const docRef = doc(db, 'services', String(id))
    const docSnap = await withTimeout(getDoc(docRef), 4000)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    // Fallback to static if not found in Firestore
    const localService = staticServices.find(s => String(s.id) === String(id))
    return localService || null
  } catch (error) {
    console.error(`Firestore fetchServiceById (${id}) error (falling back to static):`, error)
    const localService = staticServices.find(s => String(s.id) === String(id))
    return localService || null
  }
}

export async function fetchBlogById(id) {
  if (!isFirebaseConfigured()) {
    const localBlog = staticBlogs.find(b => String(b.id) === String(id))
    return localBlog || null
  }

  try {
    const docRef = doc(db, 'blogs', String(id))
    const docSnap = await withTimeout(getDoc(docRef), 4000)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    // Fallback to static if not found in Firestore
    const localBlog = staticBlogs.find(b => String(b.id) === String(id))
    return localBlog || null
  } catch (error) {
    console.error(`Firestore fetchBlogById (${id}) error (falling back to static):`, error)
    const localBlog = staticBlogs.find(b => String(b.id) === String(id))
    return localBlog || null
  }
}
