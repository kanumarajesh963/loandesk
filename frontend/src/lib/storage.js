// Local-storage data layer, scoped per logged-in user (see auth.js).
// Swap these functions for real fetch() calls to the backend/ API
// once you wire up auth + MongoDB (see backend/README section).

import { getCurrentUser } from './auth'

function keyFor(userId) {
  return `loandesk_agreements_${userId}`
}

function currentKey() {
  const user = getCurrentUser()
  if (!user) throw new Error('No user is logged in')
  return keyFor(user.id)
}

export function getAgreements() {
  const user = getCurrentUser()
  if (!user) return []
  const raw = localStorage.getItem(keyFor(user.id))
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function persist(list) {
  localStorage.setItem(currentKey(), JSON.stringify(list))
}

export function saveAgreement(agreement) {
  const list = getAgreements()
  list.unshift(agreement)
  persist(list)
  return agreement
}

export function updateAgreement(id, updater) {
  const list = getAgreements()
  const idx = list.findIndex(a => a.id === id)
  if (idx === -1) return null
  list[idx] = updater(list[idx])
  persist(list)
  return list[idx]
}

export function deleteAgreement(id) {
  const list = getAgreements().filter(a => a.id !== id)
  persist(list)
}

export function getAgreement(id) {
  return getAgreements().find(a => a.id === id) || null
}

export function recordPayment(agreementId, installmentId, { amount, note, proofImage } = {}) {
  return updateAgreement(agreementId, (agreement) => {
    const schedule = agreement.schedule.map(item => {
      if (item.id !== installmentId) return item
      const newAmountPaid = Math.min(item.amount, (item.amountPaid || 0) + (amount || 0))
      return {
        ...item,
        amountPaid: newAmountPaid,
        paid: newAmountPaid >= item.amount,
        paidDate: newAmountPaid >= item.amount ? new Date().toISOString() : item.paidDate
      }
    })
    const log = agreement.paymentLog || []
    log.unshift({
      id: crypto.randomUUID(),
      installmentId,
      date: new Date().toISOString(),
      amount: amount || 0,
      note: note || 'Payment recorded',
      proofImage: proofImage || null
    })
    return { ...agreement, schedule, paymentLog: log }
  })
}

// Kept for backward compatibility — marks an installment fully paid in one go.
export function markInstallmentPaid(agreementId, installmentId, note) {
  const agreement = getAgreement(agreementId)
  const item = agreement?.schedule.find(i => i.id === installmentId)
  if (!item) return null
  const remaining = item.amount - (item.amountPaid || 0)
  return recordPayment(agreementId, installmentId, { amount: remaining, note })
}

export function seedDemoData(generateSchedule) {
  const user = getCurrentUser()
  if (!user) return
  if (getAgreements().length > 0) return

  const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()
  const principal = 50000
  const interestRate = 8
  const tenureMonths = 6
  const schedule = generateSchedule({
    principal, annualRate: interestRate, months: tenureMonths, startDate, repaymentType: 'emi'
  })
  if (schedule[0]) {
    schedule[0].paid = true
    schedule[0].amountPaid = schedule[0].amount
    schedule[0].paidDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  }
  const demo = {
    id: crypto.randomUUID(),
    lenderName: user.name,
    borrowerName: 'Rahul Mehta',
    principal,
    interestRate,
    tenureMonths,
    repaymentType: 'emi',
    collateral: 'None',
    createdAt: new Date().toISOString(),
    startDate,
    paymentLog: [{ id: crypto.randomUUID(), installmentId: schedule[0].id, date: schedule[0].paidDate, amount: schedule[0].amount, note: 'Marked as paid' }],
    schedule
  }
  persist([demo])
}
