import { Router } from 'express'
import Agreement from '../models/Agreement.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

function calculateEMI(principal, annualRate, months) {
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  return Math.round(emi)
}

function buildSchedule({ principal, interestRate, tenureMonths, startDate, repaymentType }) {
  const start = new Date(startDate)
  const schedule = []

  if (repaymentType === 'lump_sum') {
    const due = new Date(start)
    due.setMonth(due.getMonth() + tenureMonths)
    const interest = principal * (interestRate / 100) * (tenureMonths / 12)
    schedule.push({ installment: 1, dueDate: due, amount: Math.round(principal + interest) })
    return schedule
  }

  const emi = calculateEMI(principal, interestRate, tenureMonths)
  for (let i = 1; i <= tenureMonths; i++) {
    const due = new Date(start)
    due.setMonth(due.getMonth() + i)
    schedule.push({ installment: i, dueDate: due, amount: emi })
  }
  return schedule
}

// Create a new agreement
router.post('/', async (req, res) => {
  try {
    const { lenderName, borrowerName, principal, interestRate, tenureMonths, repaymentType, collateral, startDate } = req.body

    if (!borrowerName || !principal || !tenureMonths || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const schedule = buildSchedule({ principal, interestRate: interestRate || 0, tenureMonths, startDate, repaymentType })

    const agreement = await Agreement.create({
      lender: req.userId,
      lenderName,
      borrowerName,
      principal,
      interestRate: interestRate || 0,
      tenureMonths,
      repaymentType,
      collateral,
      startDate,
      schedule
    })

    res.status(201).json(agreement)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create agreement' })
  }
})

// List agreements for the logged-in user (as lender)
router.get('/', async (req, res) => {
  const agreements = await Agreement.find({ lender: req.userId }).sort({ createdAt: -1 })
  res.json(agreements)
})

// Get a single agreement
router.get('/:id', async (req, res) => {
  const agreement = await Agreement.findOne({ _id: req.params.id, lender: req.userId })
  if (!agreement) return res.status(404).json({ error: 'Agreement not found' })
  res.json(agreement)
})

// Record a payment against an installment (supports partial amounts)
router.patch('/:id/installments/:installmentId/pay', async (req, res) => {
  const agreement = await Agreement.findOne({ _id: req.params.id, lender: req.userId })
  if (!agreement) return res.status(404).json({ error: 'Agreement not found' })

  const installment = agreement.schedule.id(req.params.installmentId)
  if (!installment) return res.status(404).json({ error: 'Installment not found' })

  const amount = Number(req.body.amount) || (installment.amount - installment.amountPaid)
  installment.amountPaid = Math.min(installment.amount, installment.amountPaid + amount)
  installment.paid = installment.amountPaid >= installment.amount
  if (installment.paid) installment.paidDate = new Date()

  agreement.paymentLog.unshift({
    installmentId: installment._id,
    amount,
    proofImage: req.body.proofImage || null,
    note: req.body.note || 'Payment recorded'
  })

  await agreement.save()
  res.json(agreement)
})

// Delete an agreement
router.delete('/:id', async (req, res) => {
  const result = await Agreement.deleteOne({ _id: req.params.id, lender: req.userId })
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Agreement not found' })
  res.status(204).send()
})

export default router
