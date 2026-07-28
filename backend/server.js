import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import agreementRoutes from './routes/agreements.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/agreements', agreementRoutes)

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`LoanDesk API running on port ${PORT}`))
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message)
    console.log('Starting server without DB — some routes will fail until MONGO_URI is set.')
    app.listen(PORT, () => console.log(`LoanDesk API running on port ${PORT} (no DB)`))
  })
