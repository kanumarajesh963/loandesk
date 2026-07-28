// Local, demo-grade multi-user auth. Good enough for trying the app with
// several people on the same device/browser, each with a private list of
// agreements. NOT secure for production — passwords are only lightly
// obscured, not properly hashed. Swap this for the real backend/ API
// (JWT + bcrypt, already scaffolded there) before deploying for real use.

const USERS_KEY = 'loandesk_users_v1'
const SESSION_KEY = 'loandesk_session_v1'

function obscure(password) {
  return btoa(unescape(encodeURIComponent(password)))
}

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function persistUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function signup(name, email, password) {
  const users = getUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some(u => u.email === normalizedEmail)) {
    throw new Error('An account with this email already exists')
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordObscured: obscure(password)
  }

  users.push(user)
  persistUsers(users)
  localStorage.setItem(SESSION_KEY, user.id)
  return { id: user.id, name: user.name, email: user.email }
}

export function login(email, password) {
  const users = getUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const user = users.find(u => u.email === normalizedEmail)

  if (!user || user.passwordObscured !== obscure(password)) {
    throw new Error('Incorrect email or password')
  }

  localStorage.setItem(SESSION_KEY, user.id)
  return { id: user.id, name: user.name, email: user.email }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser() {
  const userId = localStorage.getItem(SESSION_KEY)
  if (!userId) return null
  const user = getUsers().find(u => u.id === userId)
  if (!user) return null
  return { id: user.id, name: user.name, email: user.email }
}
