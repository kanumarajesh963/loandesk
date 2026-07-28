import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash })

    const token = signToken(user._id)
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: (email || '').toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user._id)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
