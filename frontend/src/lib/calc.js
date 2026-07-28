// Loan math: EMI calculation, schedule generation, late fees, summaries

const LATE_FEE_RATE_PER_MONTH = 0.02 // 2% of the overdue amount, per month late

export function calculateEMI(principal, annualRate, months) {
  if (!principal || !months) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  return Math.round(emi)
}

export function generateSchedule({ principal, annualRate, months, startDate, repaymentType }) {
  const start = new Date(startDate)
  const schedule = []

  if (repaymentType === 'lump_sum') {
    const due = new Date(start)
    due.setMonth(due.getMonth() + months)
    const interest = principal * (annualRate / 100) * (months / 12)
    schedule.push({
      id: crypto.randomUUID(),
      installment: 1,
      dueDate: due.toISOString(),
      amount: Math.round(principal + interest),
      amountPaid: 0,
      paid: false,
      paidDate: null
    })
    return schedule
  }

  const emi = calculateEMI(principal, annualRate, months)
  for (let i = 1; i <= months; i++) {
    const due = new Date(start)
    due.setMonth(due.getMonth() + i)
    schedule.push({
      id: crypto.randomUUID(),
      installment: i,
      dueDate: due.toISOString(),
      amount: emi,
      amountPaid: 0,
      paid: false,
      paidDate: null
    })
  }
  return schedule
}

// Whole months overdue, 0 if not yet due or already paid
export function monthsOverdue(item, asOf = new Date()) {
  if (item.paid) return 0
  const due = new Date(item.dueDate)
  if (due >= asOf) return 0
  const months = (asOf.getFullYear() - due.getFullYear()) * 12 + (asOf.getMonth() - due.getMonth())
  return Math.max(1, months)
}

// Late fee accrued on the remaining balance of an installment
export function lateFeeFor(item, asOf = new Date()) {
  const late = monthsOverdue(item, asOf)
  if (late === 0) return 0
  const remaining = item.amount - (item.amountPaid || 0)
  return Math.round(remaining * LATE_FEE_RATE_PER_MONTH * late)
}

export function summarize(agreement) {
  const schedule = agreement.schedule || []
  const total = schedule.reduce((s, i) => s + i.amount, 0)
  const paid = schedule.reduce((s, i) => s + (i.amountPaid || 0), 0)
  const lateFees = schedule.reduce((s, i) => s + lateFeeFor(i), 0)
  const outstanding = total - paid + lateFees

  const overdue = schedule.some(i => !i.paid && new Date(i.dueDate) < new Date())
  const closed = schedule.length > 0 && schedule.every(i => i.paid)
  const nextDue = schedule.find(i => !i.paid)

  let status = 'active'
  if (closed) status = 'closed'
  else if (overdue) status = 'overdue'

  return { total, paid, outstanding, lateFees, status, nextDue }
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function daysUntil(d) {
  const diff = new Date(d).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)
  return Math.round(diff / (1000 * 60 * 60 * 24))
}
