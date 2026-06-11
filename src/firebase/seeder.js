import { db } from './config'
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'
import { services as defaultServices, categories as defaultCategories } from '../data/services'
import { blogs as defaultBlogs } from '../data/blogs'
import { isFirebaseConfigured } from './db'

export async function seedDatabase() {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured. Skipping seeding.')
    return
  }
  try {
    // Check if services collection is empty
    const servicesSnap = await getDocs(collection(db, 'services'))
    if (servicesSnap.empty) {
      console.log('Seeding default services into Firestore...')
      for (const service of defaultServices) {
        await setDoc(doc(db, 'services', String(service.id)), service)
      }
      console.log('Services seeded successfully!')
    } else {
      // Update AC Repair image if it holds the old broken 404 URL
      const acDoc = servicesSnap.docs.find(d => d.id === '1')
      if (acDoc) {
        const acData = acDoc.data()
        if (acData.image && acData.image.includes('1581094288338-2314dddb7ecc')) {
          console.log('Updating AC Repair image URL in Firestore...')
          await setDoc(doc(db, 'services', '1'), { image: 'https://images.unsplash.com/photo-1604754742629-3e5728249d73?w=600&q=80' }, { merge: true })
        }
      }
    }

    // Check if blogs collection is empty
    const blogsSnap = await getDocs(collection(db, 'blogs'))
    if (blogsSnap.empty) {
      console.log('Seeding default blogs into Firestore...')
      for (const blog of defaultBlogs) {
        await setDoc(doc(db, 'blogs', String(blog.id)), blog)
      }
      console.log('Blogs seeded successfully!')
    }

    // Check if categories collection is empty
    const categoriesSnap = await getDocs(collection(db, 'categories'))
    if (categoriesSnap.empty) {
      console.log('Seeding default categories into Firestore...')
      for (const cat of defaultCategories) {
        await setDoc(doc(db, 'categories', String(cat.id)), cat)
      }
      console.log('Categories seeded successfully!')
    }
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}
