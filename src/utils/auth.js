const USERS_KEY = 'sh_users'
const TECHNICIANS_KEY = 'sh_technicians'
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

export function getTechnicians() {
  try {
    return JSON.parse(localStorage.getItem(TECHNICIANS_KEY)) || []
  } catch {
    return []
  }
}

export function saveTechnicians(techs) {
  localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(techs))
}

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

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function signup(name, email, password, role = 'customer') {
  if (role === 'technician') {
    const techs = getTechnicians()
    const exists = techs.find(t => t.email.toLowerCase() === email.toLowerCase())
    if (exists) return { success: false, message: 'An account with this email already exists.' }

    const newTech = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      role: 'technician',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      bio: '',
      services: [],
      availability: 'Available',
      createdAt: new Date().toISOString()
    }
    techs.push(newTech)
    saveTechnicians(techs)
    const { password: _, ...safeTech } = newTech
    setCurrentUser(safeTech)
    return { success: true, user: safeTech }
  } else {
    const users = getUsers()
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (exists) return { success: false, message: 'An account with this email already exists.' }

    const newUser = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      role: 'customer',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    saveUsers(users)
    const { password: _, ...safeUser } = newUser
    setCurrentUser(safeUser)
    return { success: true, user: safeUser }
  }
}

export function login(email, password, role = 'customer') {
  const accounts = role === 'technician' ? getTechnicians() : getUsers()
  const user = accounts.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return { success: false, message: 'Invalid email or password.' }
  const { password: _, ...safeUser } = user
  const userWithRole = { ...safeUser, role }
  setCurrentUser(userWithRole)
  return { success: true, user: userWithRole }
}

export function updateProfile(profileData) {
  const currentUser = getCurrentUser()
  if (!currentUser) return { success: false, message: 'No user is logged in.' }

  if (currentUser.role === 'technician') {
    const techs = getTechnicians()
    const techIndex = techs.findIndex(t => t.id === currentUser.id)
    if (techIndex === -1) return { success: false, message: 'Technician not found.' }

    const updatedTech = {
      ...techs[techIndex],
      ...profileData
    }

    techs[techIndex] = updatedTech
    saveTechnicians(techs)

    const { password: _, ...safeTech } = updatedTech
    const techWithRole = { ...safeTech, role: 'technician' }
    setCurrentUser(techWithRole)

    return { success: true, user: techWithRole }
  } else {
    const users = getUsers()
    const userIndex = users.findIndex(u => u.id === currentUser.id)
    if (userIndex === -1) return { success: false, message: 'User not found.' }

    const updatedUser = {
      ...users[userIndex],
      ...profileData
    }

    users[userIndex] = updatedUser
    saveUsers(users)

    const { password: _, ...safeUser } = updatedUser
    const userWithRole = { ...safeUser, role: 'customer' }
    setCurrentUser(userWithRole)

    return { success: true, user: userWithRole }
  }
}
