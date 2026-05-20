const BOOKINGS_KEY = 'sh_bookings'

export function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || []
  } catch {
    return []
  }
}

export function getUserBookings(userId) {
  return getBookings().filter(b => b.userId === userId)
}

export function saveBooking(booking) {
  const bookings = getBookings()
  const newBooking = {
    ...booking,
    id: Date.now(),
    status: 'Pending',
    createdAt: new Date().toISOString()
  }
  bookings.push(newBooking)
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
  return newBooking
}

export function cancelBooking(bookingId) {
  const bookings = getBookings()
  const updated = bookings.map(b =>
    b.id === bookingId ? { ...b, status: 'Cancelled' } : b
  )
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated))
}
