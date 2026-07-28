// Loan math: EMI calculation + repayment schedule generator

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
      paid: false,
      paidDate: null
    })
  }
  return schedule
}

export function summarize(agreement) {
  const total = agreement.schedule.reduce((s, i) => s + i.amount, 0)
  const paid = agreement.schedule.filter(i => i.paid).reduce((s, i) => s + i.amount, 0)
  const outstanding = total - paid
  const overdue = agreement.schedule.some(
    i => !i.paid && new Date(i.dueDate) < new Date()
  )
  const closed = agreement.schedule.every(i => i.paid)
  const nextDue = agreement.schedule.find(i => !i.paid)

  let status = 'active'
  if (closed) status = 'closed'
  else if (overdue) status = 'overdue'

  return { total, paid, outstanding, status, nextDue }
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
