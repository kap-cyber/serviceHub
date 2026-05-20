const USERS_KEY = 'sh_users'
const SESSION_KEY = 'sh_session'

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function signup(name, email, password) {
  const users = getUsers()
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (exists) return { success: false, message: 'An account with this email already exists.' }

  const newUser = {
    id: Date.now(),
    name,
    email: email.toLowerCase(),
    password,
    createdAt: new Date().toISOString()
  }
  users.push(newUser)
  saveUsers(users)
  const { password: _, ...safeUser } = newUser
  setCurrentUser(safeUser)
  return { success: true, user: safeUser }
}

export function login(email, password) {
  const users = getUsers()
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return { success: false, message: 'Invalid email or password.' }
  const { password: _, ...safeUser } = user
  setCurrentUser(safeUser)
  return { success: true, user: safeUser }
}
